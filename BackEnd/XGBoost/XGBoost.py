import sys
import joblib
sys.path.append(r"C:\ddddwoo\project\HotelBear")
from BackEnd.database import get_connection
import numpy as np
import pandas as pd
from geopy.geocoders import Nominatim
from geopy.extra.rate_limiter import RateLimiter
import re
from haversine import haversine
import matplotlib.pyplot as plt
import seaborn as sns

# 학습 모델 라이브러리
from sklearn.model_selection import train_test_split
from sklearn.ensemble import VotingRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from catboost import CatBoostRegressor

# db에서 데이터 로드 ------------------------------------------------
def load_data():
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM onlyhotellist")
        rows =cursor.fetchall()
    df = pd.DataFrame(rows)
    cursor.close()
    conn.close()
    return df

df = load_data()
# ---------------------------------------------------------------------



# 데이터 증폭단계 (3배 증폭)-----------------------------------------------
df['facility_count'] = df['facillity_list'].apply(lambda x: len(x.split(',')) if isinstance(x, str) else 0)

df = pd.get_dummies(df, columns=['area', 'type'], prefix=['area', 'type'])
id_cols = [col for col in df.columns if col not in ['low_week_price', 'low_weekend_price', 'event_price', 'name', 'facillity_list']]

df_melted = pd.melt(
    df,
    id_vars=id_cols,
    value_vars=['low_week_price', 'low_weekend_price', 'event_price'],
    var_name='price_type',
    value_name='target_price'
)

price_map = {'low_week_price':0, 'low_weekend_price':1, 'event_price':2}
df_melted['price_type'] = df_melted['price_type'].map(price_map)
df_melted['log_target_price'] = np.log1p(df_melted['target_price'])
final_df = df_melted.drop(columns=['price_type', 'target_price'])

# 결과물 출력력
print(f"전처리 전 데이터 개수: {len(df)}개")
print(f"전처리 후 데이터 개수: {len(final_df)}개 (3배 증폭 완료)")
print("\n--- 최종 데이터 컬럼 구성 ---")
print(final_df.columns.tolist())
# -------------------------------------------------------------------------



# 주소를 좌표로 변환하는 함수 -------------------------------------------------
geolocator = Nominatim(user_agent="hotel_price_predictor", timeout=10)
geocode = RateLimiter(geolocator.geocode, min_delay_seconds=1)

def clean_address(address):
    return re.sub(r'\([^)]*\)', '', address).strip()

def get_coordinates(address):
    # 1단계: 주소 정제 (괄호 제거)
    cleaned_addr = clean_address(address)
    
    try:
        location = geocode(cleaned_addr)
        if location:
            return location.latitude, location.longitude
        
        short_addr = " ".join(cleaned_addr.split()[:3])
        location = geocode(short_addr)
        if location:
            return location.latitude, location.longitude
            
        return None, None
    except Exception as e:
        print(f"⚠️ 에러 발생: {e}")
        return None, None

print("📍 주소를 좌표로 변환 중입니다... (잠시만 기다려주세요)")



# 중복된 주소만 따로 뽑아서 변환하면 시간을 훨씬 아낄 수 있습니다.
unique_addresses = final_df['address'].unique()
address_map = {}
for addr in unique_addresses:
    lat, lon = get_coordinates(addr)
    address_map[addr] = {'lat': lat, 'lon': lon}


final_df['latitude'] = final_df['address'].map(lambda x: address_map[x]['lat'])
final_df['longitude'] = final_df['address'].map(lambda x: address_map[x]['lon'])

final_df = final_df.dropna(subset=['latitude', 'longitude'])

print(f"✅ 변환 완료! 현재 데이터 개수: {len(final_df)}개")
# ----------------------------------------------------------


# 중심점에서 각 호텔까지의 거리 와 방향향(km)-------------------------
from haversine import haversine
import matplotlib.pyplot as plt
import seaborn as sns


center_lat = final_df['latitude'].mean()
center_lon = final_df['longitude'].mean()
center_loc = (center_lat, center_lon)

def calculate_distance(row):
    hotel_loc = (row['latitude'], row['longitude'])
    # 단위: km (미터로 하려면 * 1000)
    return haversine(center_loc, hotel_loc)

# 중심점에서 각 호텔까지의 거리 (km)
final_df['dist_to_center'] = final_df.apply(calculate_distance, axis=1)

# 중심점에서 각 호텔 방향(각도 0~360°, 북=0, 시계방향) → 지역 효과 반영용
def bearing_from_center(center_lat, center_lon, lat, lon):
    lat1, lon1 = np.radians(center_lat), np.radians(center_lon)
    lat2, lon2 = np.radians(lat), np.radians(lon)
    dlon = lon2 - lon1
    x = np.sin(dlon) * np.cos(lat2)
    y = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dlon)
    angle = np.degrees(np.arctan2(x, y))
    return (angle + 360) % 360

final_df['angle_from_center'] = final_df.apply(
    lambda row: bearing_from_center(center_lat, center_lon, row['latitude'], row['longitude']),
    axis=1
)
# sin/cos로 넣으면 0°와 360°가 이어져서 모델이 방향을 더 잘 씀
final_df['angle_sin'] = np.sin(np.radians(final_df['angle_from_center']))
final_df['angle_cos'] = np.cos(np.radians(final_df['angle_from_center']))

# 1-2. 데이터 정제 (학습에 방해되는 텍스트 컬럼 제거)
# id, address, img_url 등은 숫자가 아니므로 모델이 읽지 못합니다.
# angle_from_center는 angle_sin, angle_cos로 이미 반영되므로 제거
features_to_drop = ['id', 'address', 'img_url', 'latitude', 'longitude', 'angle_from_center']
study_df = final_df.drop(columns=features_to_drop)
# ----------------------------------------------------------


# 모델 학습단계 -------------------------------------------------
X = study_df.drop(columns=['log_target_price']) # 문제집
y = study_df['log_target_price'] # 정답지

# 학습 데이터와 테스트 데이터 분리 (8:2 비율)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.10, random_state=2026)

# 1. XGBoost: 트리를 깊게 파고, 과적합 방지를 위해 규제(reg) 강화
model1 = XGBRegressor(
    n_estimators=5000,      
    learning_rate=0.05,     
    max_depth=8,            
    min_child_weight=1,     
    subsample=0.9,         
    colsample_bytree=0.9,
    reg_alpha=0.5,          
    reg_lambda=2.0,         
    random_state=2026
)

# 2. LightGBM: 잎(leaves)의 개수를 확 늘려서 성능 극대화
model2 = LGBMRegressor(
    n_estimators=5000,
    learning_rate=0.05,
    num_leaves=63,          
    min_child_samples=15,   # 20 -> 15
    subsample=0.9,
    colsample_bytree=0.9,
    reg_alpha=0.5,
    reg_lambda=2.0,
    random_state=2026
)

# 3. CatBoost: 범주형 처리에 강한 모델, 깊이와 규제 밸런스 조정
model3 = CatBoostRegressor(  
    iterations=5000,
    learning_rate=0.05,
    depth=8,                # 6 -> 8
    l2_leaf_reg=3,          # 5 -> 3 (규제를 살짝 완화해서 학습력 향상)
    random_strength=1.0,    # 1.5 -> 1.0
    bagging_temperature=0.5,
    loss_function='RMSE',
    eval_metric='RMSE',
    random_state=2026,
    verbose=200 
)
# 2-3. 앙상블 모델 구성 (Voting)
ensemble_model = VotingRegressor(
    estimators=[
        ('xgb', model1), 
        ('lgbm', model2), 
        ('CBR', model3)
    ]
)

# 2-4. 학습 시작
print("🚀 앙상블 모델 학습 중...")
ensemble_model.fit(X_train, y_train)

# 2-5. 평가
y_pred_log = ensemble_model.predict(X_test)
# 로그를 다시 원래 가격으로 복구 (np.expm1)
y_test_real = np.expm1(y_test)
y_pred_real = np.expm1(y_pred_log)

mae = mean_absolute_error(y_test_real, y_pred_real)
r2 = r2_score(y_test, y_pred_log)

print(f"\n📊 모델 평가 결과")
print(f"평균 절대 오차(MAE): 약 {int(mae):,}원")
print(f"결정계수(R2 Score): {r2:.4f} (1에 가까울수록 완벽)")
# 1. 앙상블 모델 저장
joblib.dump(ensemble_model, 'hotel_price_ensemble_model.pkl')

# 2. 학습 데이터의 컬럼 리스트 저장 (나중에 예측할 때 형태를 맞추기 위해 필수!)
training_columns = X.columns.tolist()
joblib.dump(training_columns, 'hotel_training_columns.pkl')

print("✅ 모델 및 컬럼 데이터 저장 완료! (hotel_price_ensemble_model.pkl)")