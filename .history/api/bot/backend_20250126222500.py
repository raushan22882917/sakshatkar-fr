from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import requests
import uuid
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage

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
    try:
        response = requests.post(url, json=data, headers=headers)
        response.raise_for_status()  # Raises HTTPError for bad responses (4xx and 5xx)
        print(f"Groq API response: {response.json()}")  # Print the response for debugging
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err}")
        raise HTTPException(status_code=500, detail="Error from Groq API")
    except Exception as err:
        print(f"Other error occurred: {err}")
        raise HTTPException(status_code=500, detail="Unexpected error occurred")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())  # Create new session if none exists
    print(f"Received query: {request.query} with session_id: {session_id}")  # Print the received query

    # Get chat history from LangChain memory
    chat_history = memory.load_memory_variables({})["chat_history"]

    # Add user message to memory (store only the content)
    user_message = HumanMessage(content=request.query)
    memory.save_context({"input": request.query}, {"output": "..."})  # Bot will respond soon

    try:
        # Get response from Groq API
        bot_response = generate_response(request.query, session_id)
        print(f"Bot response: {bot_response}")  # Print the bot's response

        # Save bot response to memory (store only the content)
        bot_message = AIMessage(content=bot_response)
        memory.save_context({"input": request.query}, {"output": bot_response})

        # Prepare the history for the response, extracting just the content
        chat_history_str = [f"User: {msg.content}" for msg in memory.buffer]

        return ChatResponse(session_id=session_id, response=bot_response, chat_history=chat_history_str)
    except Exception as e:
        print(f"Error during API call: {e}")
        raise HTTPException(status_code=500, detail="Error processing the request")
