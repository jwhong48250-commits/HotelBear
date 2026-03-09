import sys
import pandas as pd
import numpy as np
sys.path.append(r"C:\ddddwoo\project\HotelBear")
from BackEnd.database import get_connection

# ==========================================
# 1. 데이터 가져오기 (완벽히 성공한 로직!)
# ==========================================
conn = get_connection()
with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM hotellist")
    data = cursor.fetchall()

df = pd.DataFrame(data)
conn.close()

# 매핑 딕셔너리
area_map = {101: '서울', 102: '경기', 103: '인천', 104: '강원', 105: '충북', 
            106: '충남', 107: '전남', 108: '전북', 109: '경북', 110: '경남', 111: '제주'}
type_map = {100: '호텔', 200: '모텔', 300: '펜션', 400: '게스트하우스', 500: '리조트'}

# ==========================================
# 2. 가성비 점수 계산
# ==========================================
df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)
df = df[df['price'] > 0].copy()

df['facillity_score'] = df['swimming_pool'] + df['parking'] + df['breakfast']
df['value_score'] = (df['grade'] * 20) + (np.log1p(df['reviewCount']) * 5) + (df['facillity_score'] * 10)
df['ce_score'] = df['value_score'] / (df['price'] / 10000)

# ==========================================
# 🏆 3. 지역별/타입별 1등 추출 및 예쁘게 정렬하기
# ==========================================
# (1) 일단 전체를 가성비 점수 내림차순(1등부터)으로 줄 세운다.
df_sorted = df.sort_values('ce_score', ascending=False)

# (2) 지역(area)과 숙소종류(type)가 같은 것들끼리 묶어서 맨 위(1등) 1개씩만 빼온다.
top_value_hotels = df_sorted.groupby(['area', 'type']).head(1).copy()

# (3) ⭐ 핵심! 한글로 바꾸기 전에 숫자 코드를 기준으로 먼저 정렬한다! 
# (이렇게 해야 101(서울)->102(경기) 순서, 100(호텔)->200(모텔) 순서로 예쁘게 묶임)
top_value_hotels = top_value_hotels.sort_values(['area', 'type'])

# (4) 이제 보기 좋게 한글 이름으로 맵핑
top_value_hotels['area_name'] = top_value_hotels['area'].map(area_map)
top_value_hotels['type_name'] = top_value_hotels['type'].map(type_map)

# (5) 출력할 컬럼만 골라서 한글 이름으로 변경
result = top_value_hotels[['area_name', 'type_name', 'name', 'price', 'grade', 'ce_score']]
result.columns = ['지역', '숙소종류', '숙소명', '가격(원)', '평점', '가성비점수']
result = result.reset_index(drop=True)

print("\n" + "="*60)
print(" 🏆 야놀자 지역별 & 숙소타입별 가성비 끝판왕 TOP 1 🏆")
print("="*60 + "\n")
print(result.to_string())