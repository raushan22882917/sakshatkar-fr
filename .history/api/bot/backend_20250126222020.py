from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import requests
import uuid
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI

# Groq API Setup
GROQ_API_KEY = "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"

# LangChain memory
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

app = FastAPI()

class ChatRequest(BaseModel):
    session_id: Optional[str] = None
    query: str

class ChatResponse(BaseModel):
    session_id: str
    response: str
    chat_history: List[str]

def generate_response(query: str, session_id: str) -> str:
    """Generate response from the Groq API using the Llama model"""
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {GROQ_API_KEY}",
    }
    data = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": query}],
    }
    response = requests.post(url, json=data, headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=500, detail="Error from Groq API")

    return response.json()["choices"][0]["message"]["content"]

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())  # Create new session if none exists

    # Get chat history from LangChain memory
    chat_history = memory.load_memory_variables({})["chat_history"]

    # Add user message to memory (store only the content)
    memory.save_context({"input": request.query}, {"output": "..."})  # Bot will respond soon

    # Get response from Groq API
    bot_response = generate_response(request.query, session_id)

    # Save bot response to memory (store only the content)
    memory.save_context({"input": request.query}, {"output": bot_response})

    # Prepare the history for the response
    chat_history_str = [f"User: {msg['input']}\nBot: {msg['output']}" for msg in memory.buffer]

    return ChatResponse(session_id=session_id, response=bot_response, chat_history=chat_history_str)
