import sys
import pandas as pd
import numpy as np

# 덩우의 프로젝트 경로 설정 및 DB 연동
sys.path.append(r"C:\ddddwoo\project\HotelBear")
from BackEnd.database import get_connection

# ==========================================
# 1. DB에서 데이터 안전하게 가져오기 (DictCursor 에러 완벽 회피)
# ==========================================
conn = get_connection()
with conn.cursor() as cursor:
    cursor.execute("SELECT * FROM hotellist")
    data = cursor.fetchall()

# 딕셔너리 리스트를 판다스 데이터프레임으로 변환
df = pd.DataFrame(data)
conn.close()

# 지역 및 타입 매핑 딕셔너리
area_map = {101: '서울', 102: '경기', 103: '인천', 104: '강원', 105: '충북', 
            106: '충남', 107: '전남', 108: '전북', 109: '경북', 110: '경남', 111: '제주'}
type_map = {100: '호텔', 200: '모텔', 300: '펜션', 400: '게스트하우스', 500: '리조트'}

# ==========================================
# 2. 강력한 데이터 전처리 (불순물 제거 및 숫자 변환)
# ==========================================
# 가격(price)에 섞인 콤마나 글자 싹 다 날리고 숫자로 변환
df['price'] = df['price'].astype(str).str.replace(r'[^0-9]', '', regex=True)
df['price'] = pd.to_numeric(df['price'], errors='coerce').fillna(0)

# 가격이 0원인 쓰레기 데이터는 미리 컷!
df = df[df['price'] > 0].copy()

# 계산에 필요한 나머지 컬럼들도 안전하게 숫자로 변환 (결측치는 0으로)
cols_to_num = ['area', 'type', 'grade', 'reviewCount', 'swimming_pool', 'parking', 'breakfast', 'star']
for col in cols_to_num:
    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)

# ==========================================
# 🏆 3. 잼민이표 프리미엄 가성비 스코어링 (나눗셈 버리고 뺄셈 도입!)
# ==========================================
# (1) 부대시설 가중치 (주차장 50점, 수영장 20점, 조식 15점)
df['facillity_score'] = (df['swimming_pool'] * 20) + (df['parking'] * 50) + (df['breakfast'] * 15)

# (2) 종합 가치 스코어 (성급 star 가산점 20점씩 추가!)
df['value_score'] = (df['grade'] * 50) + (np.log1p(df['reviewCount']) * 10) + (df['star'] * 20) + df['facillity_score']

# (3) 최종 가성비 점수 (가치 점수에서 가격 페널티 빼기! 2000원당 1점 감점)
df['ce_score'] = df['value_score'] - (df['price'] / 2000)

# ==========================================
# 🥇 4. 지역별/타입별 1등 추출 및 예쁘게 정렬하기
# ==========================================
# (1) 가성비 점수(ce_score) 기준으로 전체 내림차순 1차 정렬 (1등이 맨 위로)
df_sorted = df.sort_values('ce_score', ascending=False)

# (2) 지역(area)과 숙소종류(type)로 묶어서 그룹별 맨 위(1등) 데이터만 쏙 빼오기
top_value_hotels = df_sorted.groupby(['area', 'type']).head(3).copy()

# (3) 숫자 코드 상태에서 오름차순으로 정렬 (101 서울 -> 102 경기 순서 보장)
top_value_hotels = top_value_hotels.sort_values(['area', 'type'])

# (4) 숫자 코드를 예쁜 한글 이름으로 맵핑
top_value_hotels['area_name'] = top_value_hotels['area'].map(area_map)
top_value_hotels['type_name'] = top_value_hotels['type'].map(type_map)

# (5) 콘솔 출력용으로 필요한 컬럼만 추리고 한글 컬럼명 덮어쓰기
result = top_value_hotels[['area_name', 'type_name', 'name', 'price', 'star', 'grade', 'ce_score']]
result.columns = ['지역', '숙소종류', '숙소명', '가격(원)', '성급', '평점', '가성비점수']
result = result.reset_index(drop=True)

# ==========================================
# 5. 결과 출력
# ==========================================
print("\n" + "="*80)
print(" 🏆 야놀자 지역별 & 숙소타입별 찐 가성비 끝판왕 TOP 1 (프리미엄 로직 적용) 🏆")
print("="*80 + "\n")
print(result.to_string())