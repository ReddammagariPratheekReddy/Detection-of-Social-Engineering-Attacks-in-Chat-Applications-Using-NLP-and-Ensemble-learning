from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import logging
import time
import os

from selenium_extraction.generating_verdict import predict_message

logger = logging.getLogger('uvicorn.error')
logger.setLevel(logging.DEBUG)


def start_extraction(chatroom_id: str, username: str, password: str):

    logger.debug("🚀 Extraction starts here")

    MESSAGES_PATH = f'./messages_{chatroom_id}.txt'

    # ✅ साफ previous file
    if os.path.exists(MESSAGES_PATH):
        os.remove(MESSAGES_PATH)

    driver = webdriver.Chrome()

    try:
        # 🔐 STEP 1: Login
        driver.get("http://127.0.0.1:8000/accounts/login/")

        wait = WebDriverWait(driver, 10)

        login = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Email address']")
        ))

        password_field = wait.until(EC.presence_of_element_located(
            (By.CSS_SELECTOR, "input[placeholder='Password']")
        ))

        login.send_keys(username)
        password_field.send_keys(password)

        button = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//button[contains(text(),'Sign In')]")
        ))
        button.click()

        time.sleep(3)

        # 📩 STEP 2: Open chat
        driver.get(f"http://127.0.0.1:8000/chat/room/{chatroom_id}")
        time.sleep(3)

        print("✅ Chat page opened")

        # 🔥 STEP 3: Extract ONCE
        elements = driver.find_elements(By.XPATH, "//div")

        print("Total elements:", len(elements))

        messages_text = []

        for el in elements:
            text = el.text.strip()

            if text and len(text) < 200:
                print("Message:", text)
                messages_text.append(text + "\n")

        # ✅ Save messages
        if messages_text:
            with open(MESSAGES_PATH, 'w') as f:
                f.writelines(messages_text)

            print("✅ File updated")

        # 🔥 STEP 4: Generate verdict ONCE
        print("🤖 Calling ML model...")
        verdict = predict_message(chatroom_id)

        print("🎯 Verdict:", verdict)

        return {
            "status": "completed",
            "verdict": verdict
        }

    except Exception as e:
        print("❌ Error:", str(e))
        return {
            "status": "error",
            "message": str(e)
        }

    finally:
        driver.quit()


def stop_extraction():
    # ❌ No loop anymore → nothing to stop
    return {"message": "No running process"}