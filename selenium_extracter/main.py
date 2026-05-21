from fastapi import FastAPI, HTTPException
from selenium_extraction import extract_messages
from selenium_extraction.generating_verdict import predict_message   # ✅ ADDED
from models import Credentials
import json

app = FastAPI()

# ✅ Fixed path for Mac
CREDENTIALS_PATH = "./credentials.json"


@app.get("/start-extraction/{chatroom_id}")
def start_execution(chatroom_id: str):
    try:
        with open(CREDENTIALS_PATH, 'r') as fileRead:
            credentials = json.load(fileRead)

        username = credentials.get("username")
        password = credentials.get("password")

        # ✅ IMPORTANT CHECK
        if not username or not password:
            raise HTTPException(
                status_code=400,
                detail="Credentials are empty. Please save them again."
            )

        return extract_messages.start_extraction(chatroom_id, username, password)
    
    except FileNotFoundError:
        raise HTTPException(
            status_code=400,
            detail="Credentials not set. Please set credentials first."
        )


@app.get("/stop-extraction/")
def stops_execution():
    return extract_messages.stop_extraction()


@app.post("/set-credentials/")
def set_credentials(credentials: Credentials):
    try:
        with open(CREDENTIALS_PATH, 'w') as credentialsFile:
            json.dump(credentials.model_dump(), credentialsFile)

        return {"message": "Credentials saved successfully"}
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save credentials: {str(e)}"
        )


# ✅🔥 NEW API (VERY IMPORTANT)
@app.get("/get-verdict/{chatroom_id}")
def get_verdict(chatroom_id: str):
    try:
        result = predict_message(chatroom_id)
        return {"verdict": result}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting verdict: {str(e)}"
        )