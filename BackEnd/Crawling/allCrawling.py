import pandas as pd
import numpy as np
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options
import random
import re
from BackEnd.database import get_connection

sec = random.uniform(0.5, 1.5)

# 날짜 선택
choseFirstDay = "24"
choseSecondDay = "25"

# yanolja 홈페이지 접속
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

# 팝업 닫기기
def close_popup():
    popup = wait.until(EC.element_to_be_clickable((By.XPATH, '//button[contains(text(), "오늘 하루 보지 않기")]')))
    popup.click()
    time.sleep(sec)

# 지역 호텔 검색
def search_hotel(inputArea, inputType):
    search_box = driver.find_element(By.XPATH, "//input[@aria-label='검색']")
    search_box.send_keys(f'{inputArea} {inputType}')
    search_box.send_keys(Keys.ENTER)
    time.sleep(sec)

# 날짜 선택
def day_select(choseFirstDay, choseSecondDay, inputArea, inputType):
    day_pick = driver.find_element(By.CSS_SELECTOR, ".mr-2.truncate.typography-body-14-regular-line-clamp-1")
    day_pick.click()
    pick_days = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, "z-20")))
    first_day = None
    second_day = None

    for day in pick_days:
        t = day.text.strip()
        if t == choseFirstDay or t.startswith(choseFirstDay):
            first_day = day
        elif t == choseSecondDay or t.startswith(choseSecondDay):
            second_day = day

        if first_day and second_day:
            break
    if first_day is not None and second_day is not None:
        driver.execute_script("arguments[0].click();", first_day)
        driver.execute_script("arguments[0].click();", second_day)
        day_application = driver.find_elements(By.CSS_SELECTOR, ".relative.flex.overflow-hidden")[-1]
        day_application.click()
    else:
        return
    time.sleep(sec)
    # 정렬 선택
    sortings = driver.find_elements(By.CSS_SELECTOR, ".relative.flex.overflow-hidden")
    sorting = sortings[2]
    sorting.click()
    sorting_text = driver.find_element(By.XPATH, "//div[text()='예약가 높은 순']")
    sorting_text.click()

    page_crawling(inputArea, inputType)

def web_crawling(inputArea, inputType):   
    driver.get("https://nol.yanolja.com/")
    # 팝업 닫기
    try:
        close_popup()
    except TimeoutException:
        pass
    time.sleep(sec)
    search_hotel(inputArea, inputType)
    day_select(choseFirstDay, choseSecondDay, inputArea, inputType)

def page_crawling(inputArea, inputType):
    last_page = driver.execute_script("return document.body.scrollHeight")
    while True:
        time.sleep(sec)
        for i in range(10):
            driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            time.sleep(0.8)
        new_height = driver.execute_script("return document.body.scrollHeight")
        if new_height == last_page:
            break
        last_page = new_height

    selector = ".flex.w-full.flex-col.p-16"
    items = driver.find_elements(By.CSS_SELECTOR, selector)
    counts = len(items)
    print(counts)

    # 호텔클릭
    for count in range(counts):
        print(count)
        countType_div = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".mb-4.flex.gap-4")))
        countType_p_tag = countType_div[count].find_element(By.TAG_NAME, "p")
        countType = countType_p_tag.text

        # count 번째 카드에서 평점/리뷰가 있는 div (평점 span 포함하는 div만 사용)
        card = items[count]
        rating_divs = card.find_elements(By.CSS_SELECTOR, "div.mb-4.flex.items-center.justify-start")
        div_box = None
        for d in rating_divs:
            try:
                d.find_element(By.CSS_SELECTOR, "span.typography-body-14-bold.font-bold")
                div_box = d
                break
            except Exception:
                continue
        if div_box is None:
            continue

        grade_span = div_box.find_element(By.CSS_SELECTOR, "span.typography-body-14-bold.font-bold")
        grade_val = float(grade_span.text.strip())

        reviewCount_span = div_box.find_element(By.CSS_SELECTOR, "span.typography-body-14-regular")
        raw_review = reviewCount_span.text.strip()
        if not re.match(r"^\(\d+\)$", raw_review):
            continue
        reviewCount_val = int(raw_review.replace("(", "").replace(")", ""))

        if grade_val < 3.5 or reviewCount_val < 50:
            continue



        if "호텔" in countType:
            countType = "호텔"
        
        if countType != inputType:
            continue

        

        typeNum = ""
        typeArea = ""
        if countType == "호텔":
            typeNum = 100
        elif countType == "모텔":
            typeNum = 200
        elif countType == "펜션":
            typeNum = 300
        elif countType == "게스트하우스":
            typeNum = 400
        elif countType == "리조트":
            typeNum = 500
        else:
            typeNum = 0

        if inputArea == "서울":
            typeArea = "101"
        elif inputArea == "경기":
            typeArea = "102"
        elif inputArea == "인천":
            typeArea = "103"
        elif inputArea == "강원":
            typeArea = "104"
        elif inputArea == "충북":
            typeArea = "105"
        elif inputArea == "충남":
            typeArea = "106"
        elif inputArea == "전남":
            typeArea = "107"
        elif inputArea == "전북":
            typeArea = "108"
        elif inputArea == "경북":
            typeArea = "109"
        elif inputArea == "경남":
            typeArea = "110"
        elif inputArea == "제주":
            typeArea = "111"
        else:
            typeArea = "0"

        links = driver.find_elements(By.CSS_SELECTOR, "a.flex.w-full.flex-col.p-16")
        url = links[count].get_attribute("href")  # 첫 번째

        driver.execute_script("window.open(arguments[0], '_blank');", url)
        driver.switch_to.window(driver.window_handles[-1])
        print(typeNum)
        time.sleep(sec)
        one_page_crawling(typeNum, typeArea)
        driver.close()
        driver.switch_to.window(driver.window_handles[0])
        time.sleep(sec)

        


def one_page_crawling(typeNum, typeArea):
    # 각 페이지별 객체 크롤링#########
    time.sleep(sec)

    # 이름
    try:
        name = driver.find_element(By.CLASS_NAME, "line-clamp-2").text
        print(name)
    except:
        return

    # 가격 - 최저가
    try:
        price_list = wait.until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, ".pl-2.typography-subtitle-18-bold")))
        price = 10000000
        for prices in price_list:
            t = prices.text.strip()
            t = int(t.replace(",", ""))
            # if t < 45000:
            #     continue
            if t <= price:
                price = t   
            else:
                pass
        if price == 10000000000000:
            return
    except:
        return
    

    # 평점
    try:
        gradeAndReviewCount = driver.find_element(By.CSS_SELECTOR, ".flex.items-center.gap-2")
        grade = gradeAndReviewCount.find_elements(By.TAG_NAME, "span")[0].text
        grade = float(grade)
        reviewCount = gradeAndReviewCount.find_elements(By.TAG_NAME, "span")[1].text
        reviewCount = int(reviewCount.strip("()"))
    except:
        return


    # 시설 정보
    try:
        facillitysBox = driver.find_elements(By.CSS_SELECTOR, ".domestic_type.grid_type.flex.flex-wrap.gap-x-6")[0]
        facillitys = facillitysBox.find_elements(By.CSS_SELECTOR, "div.typography-body-14-regular span:last-child")
        facillity_list = [a.text.strip() for a in facillitys if a.text.strip()]
    except:
        return

    # 주차가능
    parking = 0
    for a in facillity_list:
        if "주차가능" in a:
            parking = 1

    # 주소
    try:
        address = driver.find_element(By.CSS_SELECTOR, ".flex.items-center.gap-4.py-12.typography-body-14-regular").text
        print(address)
    except:
        return

    # 이미지
    try:
        img_tag = driver.find_element(By.CSS_SELECTOR, ".size-full.object-center.object-cover")
        img_url = img_tag.get_attribute("src")
    except:
        return

    # 몇성급? 이건 마지막 이유는 호텔 말고는 없어서서
    try:
        star = driver.find_element(By.CSS_SELECTOR, ".typography-body-12-regular.pc\\:typography-subtitle-16-regular").text
        if star == "5성급":
            star = 5
        elif star == "4성급":
            star = 4
        elif star == "3성급":
            star = 3
        elif star == "2성급":
            star = 2
        elif star == "1성급":
            star = 1
        else:
            star = 0
    except:
        return
    print(star)

    # 정리
    one_data_dict = {
        "type": typeNum,
        "area": typeArea,
        "name": name,
        "price": price,
        "grade": grade,
        "reviewCount": reviewCount,
        "facillity_list": facillity_list,
        "parking": parking,
        "address": address,
        "img_url": img_url,
        "star": star
    }
        # DB에 저장
    conn = get_connection()
    cursor = conn.cursor()

    sql = """
    INSERT INTO hotellist (
        type,
        area,
        name,
        price,
        grade,
        reviewCount,
        facillity_list,
        parking,
        address,
        img_url,
        star
    ) VALUES (
        %s, %s, %s, %s, %s,
        %s, %s, %s, %s, %s,
        %s
    )
    """

    facillity_str = ",".join(one_data_dict["facillity_list"])

    values = (
        one_data_dict["type"],
        one_data_dict["area"],
        one_data_dict["name"],
        one_data_dict["price"],
        one_data_dict["grade"],
        one_data_dict["reviewCount"],
        facillity_str,
        one_data_dict["parking"],
        one_data_dict["address"],
        one_data_dict["img_url"],
        one_data_dict["star"],
    )
    print(one_data_dict)

    cursor.execute(sql, values)
    conn.commit()
    cursor.close()
    conn.close()


inputArea_list = ["서울", "경기", "인천", "강원", "충북", "충남", "전남", "전북", "경북", "경남", "제주"]
inputType_list = ["호텔", "모텔", "펜션", "게스트하우스", "리조트"]

def run_crawling():
    for inputArea in inputArea_list:
        for inputType in inputType_list:
            web_crawling(inputArea, inputType)
    driver.quit()

run_crawling()