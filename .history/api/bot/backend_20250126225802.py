from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import requests
import uuid
import random
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage

# Groq API Setup
GROQ_API_KEY = "your_api_key_here"

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
    question: Optional[dict] = None  # Include the dynamic question (if any)

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
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(status_code=500, detail="Error from Groq API")
    except Exception as err:
        raise HTTPException(status_code=500, detail="Unexpected error occurred")

def generate_random_question(query: str):
    """Generate a random MCQ or fill-in-the-blank question based on the query"""
    question_type = random.choice(["mcq", "fill_in_the_blank"])

    if question_type == "mcq":
        options = ["Option 1", "Option 2", "Option 3", "Option 4"]
        correct_answer = random.choice(options)
        return {
            "type": "mcq",
            "question": f"What is an example of applying '{query}' in real life?",
            "options": options,
            "correct_answer": correct_answer
        }
    else:
        correct_answer = "efficiency"  # For example, you can dynamically generate this based on the query.
        return {
            "type": "fill_in_the_blank",
            "question": f"Fill in the blank: '{query}' is essential for _____ in practical applications.",
            "correct_answer": correct_answer
        }

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    session_id = request.session_id or str(uuid.uuid4())  # Create new session if none exists

    # Get chat history from LangChain memory
    chat_history = memory.load_memory_variables({})["chat_history"]

    # Add user message to memory (store only the content)
    user_message = HumanMessage(content=request.query)
    memory.save_context({"input": request.query}, {"output": "..."})  # Bot will respond soon

    try:
        # Get response from Groq API
        bot_response = generate_response(request.query, session_id)

        # Save bot response to memory
        bot_message = AIMessage(content=bot_response)
        memory.save_context({"input": request.query}, {"output": bot_response})

        # Generate a random question after a valid response
        random_question = generate_random_question(request.query)

        # Prepare the history for the response, extracting just the content
        chat_history_str = [f"User: {msg.content}" for msg in memory.buffer]

        return ChatResponse(
            session_id=session_id,
            response=bot_response,
            chat_history=chat_history_str,
            question=random_question  # Include the dynamic question
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing the request")
