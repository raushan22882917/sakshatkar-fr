from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, List, Optional
import requests
import uuid

app = FastAPI()

# In-memory session storage
sessions: Dict[str, List[Dict[str, str]]] = {}

# Groq Llama API details
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY = "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"
HEADERS = {
    "Content-Type": "application/json",
    "Authorization": f"Bearer {GROQ_API_KEY}"
}


class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    query: str


class ChatResponse(BaseModel):
    session_id: str
    messages: List[Dict[str, str]]


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    # Generate a new session ID if not provided
    session_id = request.session_id or str(uuid.uuid4())
    
    # Retrieve or initialize session history
    session = sessions.get(session_id, [])

    # Add the user's query to the session
    user_message = {"role": "user", "content": request.query}
    session.append(user_message)

    # Prepare the payload for Groq's Llama API
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": session
    }

    try:
        # Call Groq's API for the response
        response = requests.post(GROQ_API_URL, headers=HEADERS, json=payload)
        response_data = response.json()

        # Extract the bot's response
        if response.status_code == 200 and "choices" in response_data:
            bot_response = response_data["choices"][0]["message"]["content"]
        else:
            raise HTTPException(status_code=500, detail="Failed to get a valid response from Groq API")

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Groq API: {str(e)}")

    # Add the bot's response to the session
    bot_message = {"role": "bot", "content": bot_response}
    session.append(bot_message)

    # Save the session
    sessions[session_id] = session

    return ChatResponse(session_id=session_id, messages=session)


@app.get("/get_session/{session_id}", response_model=ChatResponse)
async def get_session(session_id: str):
    # Retrieve session history
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return ChatResponse(session_id=session_id, messages=sessions[session_id])


@app.post("/clear_session/{session_id}")
async def clear_session(session_id: str):
    # Clear a specific session
    if session_id in sessions:
        del sessions[session_id]
        return {"message": "Session cleared successfully"}
    raise HTTPException(status_code=404, detail="Session not found")


@app.get("/")
async def root():
    return {"message": "Welcome to the Groq Llama-powered Chatbot API!"}
