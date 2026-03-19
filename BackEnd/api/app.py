"""
HotelBear Backend API
- 오늘의 호텔 추천 (서울 가성비 10개)
- 이런 숙소 어떠세요 (서울+경기 가성비 50개)
- 검색 (type, 지역/숙소명, 날짜별 가격)
"""
import os
import math
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS

# 프로젝트 루트를 path에 추가
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(ROOT))

from BackEnd.database import get_connection

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.162.36:3000",
])

# type 코드
TYPE_MAP = {100: "호텔", 200: "모텔", 300: "펜션", 400: "게스트하우스", 500: "리조트"}
TYPE_ID_MAP = {"hotel": 100, "motel": 200, "pension": 300, "guesthouse": 400, "resort": 500}

# area 코드
AREA_MAP = {101: "서울", 102: "경기", 103: "인천", 104: "강원", 105: "충북", 106: "충남",
            107: "전남", 108: "전북", 109: "경북", 110: "경남", 111: "제주"}

# 한국 공휴일 (간단한 예시: 2025년)
HOLIDAYS_2025 = {
    "01-01", "02-09", "02-10", "02-11", "02-12", "03-01", "04-08", "05-05", "05-06",
    "06-06", "08-15", "10-03", "10-09", "12-25"
}


def is_weekend(date_str):
    """yyyy-mm-dd가 토/일이면 True"""
    try:
        d = datetime.strptime(date_str, "%Y-%m-%d")
        return d.weekday() >= 5  # 5=토, 6=일
    except Exception:
        return False


def is_holiday(date_str):
    """yyyy-mm-dd가 공휴일이면 True"""
    try:
        return date_str[5:10] in HOLIDAYS_2025  # MM-DD
    except Exception:
        return False


def get_price_column_for_date(date_str):
    """해당 날짜에 표시할 가격 컬럼명. 공휴일이 주말이면 주말가격 우선."""
    if is_holiday(date_str) and is_weekend(date_str):
        return "weekend_price"
    if is_holiday(date_str):
        return "event_price"
    if is_weekend(date_str):
        return "weekend_price"
    return "price"


def compute_ce_score(row):
    """topValue.py 로직: 가성비 점수 (숫자만 사용, pandas 없이)"""
    try:
        price = float(row.get("price") or row.get("display_price") or 0)
        if price <= 0:
            return -999999
        grade = float(row.get("grade") or 0)
        review_count = float(row.get("reviewCount") or 0)
        star = float(row.get("star") or 0)
        swimming_pool = float(row.get("swimming_pool") or 0)
        parking = float(row.get("parking") or 0)
        breakfast = float(row.get("breakfast") or 0)
        facillity_score = (swimming_pool * 20) + (parking * 50) + (breakfast * 15)
        value_score = (grade * 50) + (math.log1p(review_count) * 10) + (star * 20) + facillity_score
        ce_score = value_score - (price / 2000)
        return ce_score
    except Exception:
        return -999999


def row_to_hotel(row, price_key="price"):
    """DB row를 프론트용 객체로 변환"""
    price = row.get(price_key) or row.get("price") or 0
    try:
        price = int(price)
    except (TypeError, ValueError):
        price = 0
    return {
        "id": row.get("id"),
        "name": row.get("name") or "",
        "image": row.get("img_url") or "",
        "stars": float(row.get("grade") or 0),
        "reviews": int(row.get("reviewCount") or 0),
        "parking": bool(int(row.get("parking") or 0)),
        "price": price,
        "location": row.get("address") or "",
        "category": TYPE_MAP.get(int(row.get("type") or 0), ""),
        "type": int(row.get("type") or 0),
        "area": int(row.get("area") or 0),
        "star": int(row.get("star") or 0),
        "grade": float(row.get("grade") or 0),
        "reviewCount": int(row.get("reviewCount") or 0),
        "facillity_list": row.get("facillity_list") or row.get("facility_list") or "",
        "swimming_pool": int(row.get("swimming_pool") or 0),
        "breakfast": int(row.get("breakfast") or 0),
        "bathtub": int(row.get("bathtub") or 0),
        "pickUp": int(row.get("pickUp") or 0),
        "fitness": int(row.get("fitness") or 0),
        "bar": int(row.get("bar") or 0),
        "desk24": int(row.get("desk24") or 0),
        "terrace": int(row.get("terrace") or 0),
        "club": int(row.get("club") or 0),
        "address": row.get("address") or "",
        "img_url": row.get("img_url") or "",
        "latitude": row.get("latitude"),
        "longitude": row.get("longitude"),
    }


@app.route("/api/today-recommendations", methods=["GET"])
def today_recommendations():
    """서울(101) 가성비 10개"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            # hotellist 컬럼명: price 또는 low_week_price, 등
            cur.execute("""
                SELECT * FROM hotellist
                WHERE area = 101
            """)
            rows = cur.fetchall()
        conn.close()
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({"error": str(e)}), 500

    for r in rows:
        r["price"] = r.get("price") or r.get("low_week_price") or 0
        r["ce_score"] = compute_ce_score(r)
    rows_sorted = [r for r in rows if float(r.get("price") or 0) > 0]
    rows_sorted = sorted(rows_sorted, key=lambda x: x["ce_score"], reverse=True)[:10]
    return jsonify([row_to_hotel(r) for r in rows_sorted])


@app.route("/api/carousel-recommendations", methods=["GET"])
def carousel_recommendations():
    """서울(101)+경기(102) 가성비 50개"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM hotellist WHERE area IN (101, 102)")
            rows = cur.fetchall()
        conn.close()
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({"error": str(e)}), 500

    for r in rows:
        r["price"] = r.get("price") or r.get("low_week_price") or 0
        r["ce_score"] = compute_ce_score(r)
    rows_sorted = [r for r in rows if float(r.get("price") or 0) > 0]
    rows_sorted = sorted(rows_sorted, key=lambda x: x["ce_score"], reverse=True)[:50]
    return jsonify([row_to_hotel(r) for r in rows_sorted])


@app.route("/api/search", methods=["GET"])
def search():
    """
    query: 지역 또는 숙소명 (예: 서울 5성급 호텔, 서울, 강남 호텔)
    type: hotel|motel|pension|guesthouse|resort (또는 100,200,300,400,500)
    checkIn, checkOut: yyyy-mm-dd (비어있으면 오늘)
    name: 숙소명만 검색 시 (선택)
    """
    destination = (request.args.get("destination") or "").strip()
    type_param = request.args.get("type") or "hotel"
    check_in = request.args.get("checkIn") or ""
    check_out = request.args.get("checkOut") or ""
    name_only = (request.args.get("name") or "").strip()

    # 오늘 날짜 기본값
    today = datetime.now().strftime("%Y-%m-%d")
    if not check_in:
        check_in = today
    if not check_out:
        check_out = today

    type_code = TYPE_ID_MAP.get(type_param) if type_param in TYPE_ID_MAP else int(type_param) if str(type_param).isdigit() else 100

    # destination 파싱: "서울 5성급 호텔" -> area=101, star=5 등
    area_codes = []
    star_filter = None
    words = destination.replace(",", " ").split()
    for w in words:
        w = w.strip()
        if not w:
            continue
        for code, area_name in AREA_MAP.items():
            if area_name in w or w == area_name:
                area_codes.append(code)
                break
        if "성급" in w or "성" == w:
            try:
                star_filter = int("".join(c for c in w if c.isdigit()) or 0)
            except ValueError:
                pass

    conn = get_connection()
    try:
        with conn.cursor() as cur:
            sql = "SELECT * FROM hotellist WHERE 1=1"
            params = []
            sql += " AND type = %s"
            params.append(type_code)
            if area_codes:
                sql += " AND area IN (" + ",".join(["%s"] * len(area_codes)) + ")"
                params.extend(area_codes)
            if star_filter is not None and star_filter > 0:
                sql += " AND star = %s"
                params.append(star_filter)

            # --- 이름/주소 검색 조건 ---
            if name_only:
                # 숙소명만 별도로 검색하는 경우
                sql += " AND name LIKE %s"
                params.append("%" + name_only + "%")
            elif destination:
                # 기본: 전체 검색어로 1차 매칭
                like_clauses = ["(name LIKE %s OR address LIKE %s)"]
                params.append("%" + destination + "%")
                params.append("%" + destination + "%")

                # 단어 단위 + 어미(시/구/군/도 등) 제거한 '유사어'도 함께 매칭
                # 예: '부산시' -> '부산', '대전광역시' -> '대전'
                def normalize_word(word: str) -> str:
                    w = word.strip()
                    # 한글 행정구역 접미사 제거
                    suffixes = ["광역시", "특별시", "시", "구", "군", "도"]
                    for s in suffixes:
                        if w.endswith(s) and len(w) > len(s):
                            return w[: -len(s)]
                    return w

                added_keywords = set()
                for w in words:
                    base = normalize_word(w)
                    # 너무 짧은 키워드나 이미 전체 검색어에 포함된 것은 제외
                    if not base or len(base) < 2:
                        continue
                    if base in destination:
                        continue
                    if base in added_keywords:
                        continue
                    added_keywords.add(base)
                    like_clauses.append("(name LIKE %s OR address LIKE %s)")
                    params.append("%" + base + "%")
                    params.append("%" + base + "%")

                if like_clauses:
                    sql += " AND (" + " OR ".join(like_clauses) + ")"

            cur.execute(sql, params)
            rows = cur.fetchall()
        conn.close()
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({"error": str(e)}), 500

    for r in rows:
        r["price"] = r.get("price") or r.get("low_week_price") or 0
        r["weekend_price"] = r.get("weekend_price") or r.get("low_weekend_price") or r.get("price")
        r["event_price"] = r.get("event_price") or r.get("weekend_price") or r.get("price")
        r["ce_score"] = compute_ce_score(r)
    rows_sorted = sorted(rows, key=lambda x: x["ce_score"], reverse=True)

    price_key = get_price_column_for_date(check_in)
    if price_key == "weekend_price":
        for r in rows_sorted:
            r["display_price"] = r.get("weekend_price") or r.get("price") or 0
    elif price_key == "event_price":
        for r in rows_sorted:
            r["display_price"] = r.get("event_price") or r.get("weekend_price") or r.get("price") or 0
    else:
        for r in rows_sorted:
            r["display_price"] = r.get("price") or 0

    return jsonify([row_to_hotel(r, "display_price") for r in rows_sorted])


@app.route("/api/hotel/<int:hotel_id>", methods=["GET"])
def get_hotel(hotel_id: int):
    """단일 호텔 상세 조회"""
    conn = get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM hotellist WHERE id = %s", (hotel_id,))
            row = cur.fetchone()
        conn.close()
    except Exception as e:
        if conn:
            conn.close()
        return jsonify({"error": str(e)}), 500

    if not row:
        return jsonify({"error": "hotel not found"}), 404

    # 기본 가격 세팅
    row["price"] = row.get("price") or row.get("low_week_price") or 0
    row["weekend_price"] = row.get("weekend_price") or row.get("low_weekend_price") or row.get("price")
    row["event_price"] = row.get("event_price") or row.get("weekend_price") or row.get("price")

    return jsonify(row_to_hotel(row))


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
