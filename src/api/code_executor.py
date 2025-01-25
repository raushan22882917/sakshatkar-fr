from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import judge0api as api
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CodeExecutionRequest(BaseModel):
    code: str
    language_id: int
    stdin: str = ""
    expected_output: str = None

@app.post("/api/execute")
async def execute_code(request: CodeExecutionRequest):
    try:
        # Initialize Judge0 client
        client = api.Client(os.getenv("JUDGE0_API_URL", "https://api.judge0.com"))
        client.wait = False

        # Convert strings to bytes for the API
        code_bytes = request.code.encode('utf-8')
        stdin_bytes = request.stdin.encode('utf-8') if request.stdin else b''
        expected_output_bytes = request.expected_output.encode('utf-8') if request.expected_output else None

        # Submit code to Judge0
        submission = api.submission.submit(
            client,
            code_bytes,
            request.language_id,
            stdin=stdin_bytes,
            expected_output=expected_output_bytes
        )

        # Wait for the result
        max_attempts = 10
        attempt = 0
        
        while attempt < max_attempts:
            submission.load(client)
            if submission.status["id"] > 2:  # Status > 2 means processing is complete
                break
            attempt += 1
            await asyncio.sleep(1)

        # Process the result
        if submission.status["id"] == 3:  # Accepted
            return {
                "status": "success",
                "output": submission.stdout,
                "execution_time": submission.time,
                "memory": submission.memory
            }
        elif submission.status["id"] == 4:  # Wrong Answer
            return {
                "status": "wrong_answer",
                "output": submission.stdout,
                "expected": request.expected_output
            }
        elif submission.status["id"] == 6:  # Compilation Error
            return {
                "status": "compilation_error",
                "error": submission.compile_output
            }
        else:
            return {
                "status": "error",
                "error": submission.stderr or "An error occurred during execution"
            }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
