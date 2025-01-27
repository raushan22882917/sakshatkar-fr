from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
import requests
import uuid
import random
from langchain.memory import ConversationBufferMemory
from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage, AIMessage
import subprocess

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
    lesson: Optional[dict] = None  # Include the lesson (if any)
    question: Optional[dict] = None  # Include the dynamic question (if any)

# Groq API Response Generation
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

# Code Execution Function
def execute_code(code: str) -> str:
    """Execute the Python code and return output or error"""
    try:
        # Save the code to a temporary Python file
        with open("temp_code.py", "w") as file:
            file.write(code)

        # Execute the code and capture the output
        result = subprocess.run(["python", "temp_code.py"], capture_output=True, text=True)
        
        if result.returncode == 0:
            return result.stdout  # Return the output if code executes successfully
        else:
            return result.stderr  # Return the error message if code fails
    except Exception as e:
        return f"Error executing code: {str(e)}"

# Generate random lesson for teaching coding concepts
def generate_random_lesson():
    """Generate a random coding lesson for the user"""
    lessons = [
        {
            "title": "Introduction to Python",
            "content": "Let's start with learning Python syntax and variables. Here's a simple example:\n```python\nx = 5\nprint(x)\n```",
            "question": "What will be the output of the code?"
        },
        {
            "title": "Functions in Python",
            "content": "In Python, functions allow you to group reusable code. Here's a simple function example:\n```python\ndef greet(name):\n    return f'Hello, {name}!'\nprint(greet('Alice'))\n```",
            "question": "What will be printed when the function is called?"
        },
        {
            "title": "Loops in Python",
            "content": "Loops are used to repeat a block of code multiple times. Here's an example of a `for` loop:\n```python\nfor i in range(3):\n    print(i)\n```",
            "question": "How many times will 'print(i)' be executed?"
        }
    ]
    
    return random.choice(lessons)

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

        # Generate random lesson after a valid response
        lesson = generate_random_lesson()

        # Prepare the history for the response, extracting just the content
        chat_history_str = [f"User: {msg.content}" for msg in memory.buffer]

        return ChatResponse(
            session_id=session_id,
            response=bot_response,
            chat_history=chat_history_str,
            lesson=lesson,  # Include the lesson
            question={"question": lesson["question"]}  # Include the dynamic question
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing the request")
