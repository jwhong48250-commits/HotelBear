import sys
import time
import joblib
import numpy as np
import pandas as pd
import re
from tqdm import tqdm
from geopy.geocoders import Nominatim
from haversine import haversine
import warnings

# 보기 싫은 경고 메시지 끄기
warnings.filterwarnings('ignore')

# DB 연결 모듈 경로 설정 (덩우의 프로젝트 경로)
sys.path.append(r"C:\ddddwoo\project\HotelBear")
from BackEnd.database import get_connection

# ==========================================
# 1. 모델 및 컬럼 리스트 로드
# ==========================================
print("📦 AI 가중치(모델)와 학습 컬럼 정보를 불러옵니다...")
try:
    ensemble_model = joblib.load('hotel_price_ensemble_model.pkl')
    train_cols = joblib.load('hotel_training_columns.pkl')
    print("✅ 로드 성공!")
except Exception as e:
    print(f"❌ 파일 로드 실패: {e}")
    sys.exit()

# ==========================================
# 2. 필수 함수 정의
# ==========================================
def load_all_hotels():
    conn = get_connection()
    with conn.cursor() as cursor:
        cursor.execute("SELECT * FROM hotellist")
        columns = [col[0] for col in cursor.description]
        rows = cursor.fetchall()
    df = pd.DataFrame(rows, columns=columns)
    conn.close()
    return df

# DB에 위도, 경도, 주말가, 공휴일가를 한 번에 업데이트하는 함수
def update_hotel_row(hotel_id, lat, lon, weekend_price, event_price):
    conn = get_connection()
    with conn.cursor() as cursor:
        sql = """
            UPDATE hotellist 
            SET latitude = %s, longitude = %s, weekend_price = %s, event_price = %s
            WHERE id = %s
        """
        cursor.execute(sql, (float(lat), float(lon), int(weekend_price), int(event_price), hotel_id))
    conn.commit()
    conn.close()

# 주소 변환용 API 세팅
geolocator = Nominatim(user_agent="hotel_price_updater", timeout=10)

def clean_address(address):
    if not isinstance(address, str): return ""
    return re.sub(r'\([^)]*\)', '', address).strip()

def get_coordinates(address):
    cleaned_addr = clean_address(address)
    try:
        location = geolocator.geocode(cleaned_addr)
        if location: return location.latitude, location.longitude
        short_addr = " ".join(cleaned_addr.split()[:3])
        location = geolocator.geocode(short_addr)
        if location: return location.latitude, location.longitude
        return None, None
    except Exception as e:
        return None, None

# 중심점 기준 각도 계산 함수
def bearing_from_center(center_lat, center_lon, lat, lon):
    lat1, lon1 = np.radians(center_lat), np.radians(center_lon)
    lat2, lon2 = np.radians(lat), np.radians(lon)
    dlon = lon2 - lon1
    x = np.sin(dlon) * np.cos(lat2)
    y = np.cos(lat1) * np.sin(lat2) - np.sin(lat1) * np.cos(lat2) * np.cos(dlon)
    angle = np.degrees(np.arctan2(x, y))
    return (angle + 360) % 360

# ==========================================
# 3. 메인 자동화 로직 실행
# ==========================================
print("🔍 DB에서 호텔 리스트를 가져오는 중...")
df = load_all_hotels()
total_hotels = len(df)
print(f"총 {total_hotels}개의 데이터 확인 완료.\n")

# 중심점 구하기 (위도/경도가 모두 비어있는 초기 상태를 대비해 서울역을 기본값으로 설정)
valid_coords = df.dropna(subset=['latitude', 'longitude'])
if len(valid_coords) > 0:
    center_lat = valid_coords['latitude'].mean()
    center_lon = valid_coords['longitude'].mean()
else:
    print("⚠️ DB에 좌표가 하나도 없어서 임시 중심점을 서울(37.5665, 126.9780)로 설정합니다.")
    center_lat, center_lon = 37.5665, 126.9780
center_loc = (center_lat, center_lon)

address_cache = {}

print("🚀 좌표 변환 및 AI 가격 예측 후 DB 저장을 시작합니다!")
# tqdm으로 1번 행부터 마지막 행까지 진행 상황 바(Bar) 표시
for idx, row in tqdm(df.iterrows(), total=total_hotels, desc="전체 처리율"):
    hotel_id = row['id']
    addr = row['address']
    
    # DB에 있던 위도/경도 가져오기
    lat = row['latitude']
    lon = row['longitude']

    # 1. 위도/경도가 DB에 없으면 API로 구해오기
    if pd.isnull(lat) or pd.isnull(lon):
        if addr in address_cache:
            lat, lon = address_cache[addr]
        else:
            lat, lon = get_coordinates(addr)
            address_cache[addr] = (lat, lon)
            time.sleep(1.1) # 과부하 방지 (필수)
            
    # API로도 못 구했으면 이 호텔은 스킵
    if pd.isnull(lat) or pd.isnull(lon):
        continue

    # 2. AI 예측용 추가 데이터 가공
    f_list = row['facillity_list']
    f_count = len(str(f_list).split(',')) if pd.notnull(f_list) and str(f_list).strip() else 0
    
    dist = haversine(center_loc, (lat, lon))
    angle = bearing_from_center(center_lat, center_lon, lat, lon)
    
    input_dict = row.to_dict()
    input_dict['facility_count'] = f_count
    input_dict['dist_to_center'] = dist
    input_dict['angle_sin'] = np.sin(np.radians(angle))
    input_dict['angle_cos'] = np.cos(np.radians(angle))
    
    # 지역(area), 숙소종류(type) 원핫인코딩 처리
    input_dict[f"area_{row['area']}"] = 1
    input_dict[f"type_{row['type']}"] = 1
    
    row_df = pd.DataFrame([input_dict])
    
    # 3. 모델 예측
    # [주말 가격 예측]
    row_df['price_type'] = 1
    X_weekend = row_df.reindex(columns=train_cols, fill_value=0)
    weekend_pred = np.expm1(ensemble_model.predict(X_weekend)[0])
    
    # [공휴일 가격 예측]
    row_df['price_type'] = 2
    X_event = row_df.reindex(columns=train_cols, fill_value=0)
    event_pred = np.expm1(ensemble_model.predict(X_event)[0])
    
    # 4. DB에 결과 한 방에 업데이트! (좌표, 주말가, 공휴일가 모두)
    update_hotel_row(hotel_id, lat, lon, weekend_pred, event_pred)

print("\n🎉 완료! DB에 좌표와 가격 데이터 저장이 모두 끝났습니다!")