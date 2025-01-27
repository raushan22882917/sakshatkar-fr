from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from langchain.chat_models import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timedelta
import psycopg2
from psycopg2.extras import RealDictCursor
import uvicorn
import judge0api as api
import os
import asyncio
from dotenv import load_dotenv
from pydantic import BaseModel
import subprocess
import os
import csv
from groq import Groq
from apscheduler.schedulers.background import BackgroundScheduler
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx

app = FastAPI(title="Interview Scores API")

# Load environment variables
load_dotenv()
CSV_FILE_PATH = "./Interview_news/meta_article.csv"
# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection parameters
DB_PARAMS = {
    'dbname': 'Sakshatkar',
    'user': 'postgres',
    'password': '22882288',
    'host': 'localhost',
    'cursor_factory': RealDictCursor
}

# Pydantic models for request/response validation
class QuestionScore(BaseModel):
    question_type: str
    question_text: str
    score: int
    strengths: List[str]
    improvements: List[str]
    feedback: Optional[str]

class InterviewScore(BaseModel):
    user_name: str
    email: str
    company_name: str
    position: str
    round_number: int
    total_score: int
    interview_date: datetime
    questions: List[QuestionScore]

class HRQuestionScore(BaseModel):
    question_text: str
    answer_text: str
    score: int
    feedback: Optional[str] = None

class HRInterviewScore(BaseModel):
    user_name: str
    email: str
    company_name: str
    position: str
    total_score: int
    interview_date: datetime
    questions: List[HRQuestionScore]

class StepScore(BaseModel):
    step_name: str
    score: int

class FeedbackScore(BaseModel):
    user_name: str
    email: str
    title: str
    example_score: int = 0
    approach_score: int = 0
    testcase_score: int = 0
    code_score: int = 0

class CodeRequest(BaseModel):
    code: str
    language_id: int
    stdin: Optional[str] = ""
    expected_output: Optional[str] = None

class CodeResponse(BaseModel):
    status: str
    output: Optional[str] = None
    error: Optional[str] = None
    execution_time: Optional[float] = None
    memory: Optional[int] = None
    expected: Optional[str] = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    currentTopic: Optional[str] = None
    chatHistory: Optional[List[ChatMessage]] = None

class QuestionRequest(BaseModel):
    topic: str
    chatHistory: Optional[List[ChatMessage]] = None
    count: int = 5

# Language mapping for easy reference
LANGUAGES = {
    "python": 71,
    "java": 62,
    "cpp": 54,
    "c": 50,
    "ruby": 72,
    "r": 80,
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection error: {str(e)}")

def init_db():
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Create main interview scores table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS interview_scores (
                    id SERIAL PRIMARY KEY,
                    user_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    company_name VARCHAR(100) NOT NULL,
                    position VARCHAR(100) NOT NULL,
                    round_number INTEGER NOT NULL,
                    total_score INTEGER NOT NULL,
                    interview_date TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create question scores table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS question_scores (
                    id SERIAL PRIMARY KEY,
                    interview_id INTEGER REFERENCES interview_scores(id),
                    question_type VARCHAR(50) NOT NULL,
                    question_text TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    strengths TEXT[] NOT NULL,
                    improvements TEXT[] NOT NULL,
                    feedback TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create HR interview scores table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS hr_interview_scores (
                    id SERIAL PRIMARY KEY,
                    user_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    company_name VARCHAR(100) NOT NULL,
                    position VARCHAR(100) NOT NULL,
                    total_score INTEGER NOT NULL,
                    interview_date TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create HR question scores table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS hr_question_scores (
                    id SERIAL PRIMARY KEY,
                    interview_id INTEGER REFERENCES hr_interview_scores(id),
                    question_text TEXT NOT NULL,
                    answer_text TEXT NOT NULL,
                    score INTEGER NOT NULL,
                    feedback TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create feedback scores table
            cur.execute("""
                DROP TABLE IF EXISTS feedback_scores CASCADE;
                CREATE TABLE feedback_scores (
                    id SERIAL PRIMARY KEY,
                    user_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    title VARCHAR(200) NOT NULL,
                    example_score INTEGER DEFAULT 0,
                    approach_score INTEGER DEFAULT 0,
                    testcase_score INTEGER DEFAULT 0,
                    code_score INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create subscription plans table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS subscription_plans (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Create user subscriptions table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS user_subscriptions (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    subscription_plan_id INTEGER NOT NULL,
                    payment_id VARCHAR(100) NOT NULL,
                    payment_provider VARCHAR(100) NOT NULL,
                    amount_usd DECIMAL(10, 2) NOT NULL,
                    amount_inr DECIMAL(10, 2) NOT NULL,
                    status VARCHAR(50) NOT NULL,
                    start_date TIMESTAMP NOT NULL,
                    end_date TIMESTAMP NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Database initialization error: {str(e)}")
    finally:
        conn.close()

@app.on_event("startup")
async def startup_event():
    init_db()

@app.post("/api/scores", response_model=dict)
async def save_interview_score(score: InterviewScore):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Insert main interview score
            cur.execute("""
                INSERT INTO interview_scores 
                (user_name, email, company_name, position, round_number, total_score, interview_date)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                score.user_name,
                score.email,
                score.company_name,
                score.position,
                score.round_number,
                score.total_score,
                score.interview_date
            ))
            interview_id = cur.fetchone()['id']
            
            # Insert question scores
            for question in score.questions:
                cur.execute("""
                    INSERT INTO question_scores
                    (interview_id, question_type, question_text, score, strengths, improvements, feedback)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                """, (
                    interview_id,
                    question.question_type,
                    question.question_text,
                    question.score,
                    question.strengths,
                    question.improvements,
                    question.feedback
                ))
            
            conn.commit()
            return {"message": "Interview score saved successfully", "interview_id": interview_id}
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=f"Error saving interview score: {str(e)}")
    finally:
        conn.close()

@app.get("/api/scores/{email}")
async def get_user_scores(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    i.*,
                    json_agg(
                        json_build_object(
                            'question_type', q.question_type,
                            'question_text', q.question_text,
                            'score', q.score,
                            'strengths', q.strengths,
                            'improvements', q.improvements,
                            'feedback', q.feedback
                        )
                    ) as questions
                FROM interview_scores i
                LEFT JOIN question_scores q ON q.interview_id = i.id
                WHERE i.email = %s
                GROUP BY i.id
                ORDER BY i.interview_date DESC
            """, (email,))
            scores = cur.fetchall()
            return {"scores": scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching scores: {str(e)}")
    finally:
        conn.close()

@app.get("/api/interview-scores/{email}")
async def get_interview_scores(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    id,
                    user_name,
                    email,
                    total_score,
                    interview_date,
                    feedback,
                    created_at
                FROM interview_scores
                WHERE email = %s
                ORDER BY created_at DESC
            """, (email,))
            scores = cur.fetchall()
            return {"scores": scores}
    except Exception as e:
        print("Error fetching interview scores:", str(e))
        raise HTTPException(status_code=500, detail=f"Error fetching interview scores: {str(e)}")
    finally:
        conn.close()

@app.post("/api/hr-scores", response_model=dict)
async def save_hr_interview_score(score: HRInterviewScore):
    print("Received data:", score.dict())
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Insert main HR interview score
            cur.execute("""
                INSERT INTO hr_interview_scores 
                (user_name, email, company_name, position, total_score, interview_date)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                score.user_name,
                score.email,
                score.company_name,
                score.position,
                score.total_score,
                score.interview_date
            ))
            interview_id = cur.fetchone()['id']
            
            # Insert HR question scores
            for question in score.questions:
                cur.execute("""
                    INSERT INTO hr_question_scores
                    (interview_id, question_text, answer_text, score, feedback)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    interview_id,
                    question.question_text,
                    question.answer_text,
                    question.score,
                    question.feedback
                ))
            
            conn.commit()
            return {"message": "HR Interview score saved successfully", "interview_id": interview_id}
    except Exception as e:
        conn.rollback()
        print("Error saving HR interview score:", str(e))
        raise HTTPException(status_code=500, detail=f"Error saving HR interview score: {str(e)}")
    finally:
        conn.close()

@app.get("/api/hr-scores/{email}")
async def get_hr_user_scores(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT 
                    h.*,
                    json_agg(
                        json_build_object(
                            'question_text', q.question_text,
                            'answer_text', q.answer_text,
                            'score', q.score,
                            'feedback', q.feedback
                        )
                    ) as questions
                FROM hr_interview_scores h
                LEFT JOIN hr_question_scores q ON q.interview_id = h.id
                WHERE h.email = %s
                GROUP BY h.id
                ORDER BY h.interview_date DESC
            """, (email,))
            scores = cur.fetchall()
            return {"scores": scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching HR scores: {str(e)}")
    finally:
        conn.close()

@app.post("/api/feedback-scores", response_model=dict)
async def save_feedback_score(score: FeedbackScore):
    print("Received feedback data (FULL):", score.model_dump())
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=psycopg2.extras.DictCursor) as cur:
            # Detailed logging of each field
            print("Inserting data:", 
                score.user_name,
                score.email,
                score.title,
                score.example_score,
                score.approach_score,
                score.testcase_score,
                score.code_score
            )
            
            cur.execute("""
                INSERT INTO feedback_scores 
                (user_name, email, title, example_score, approach_score, testcase_score, code_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            """, (
                score.user_name,
                score.email,
                score.title,
                score.example_score,
                score.approach_score,
                score.testcase_score,
                score.code_score
            ))
            feedback_id = cur.fetchone()['id']
            
            conn.commit()
            print(f"Successfully saved feedback score with ID: {feedback_id}")
            return {"message": "Feedback score saved successfully", "feedback_id": feedback_id}
    except Exception as e:
        conn.rollback()
        print("FULL Error saving feedback score:", str(e), "Traceback:", traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Error saving feedback score: {str(e)}")
    finally:
        conn.close()

@app.get("/api/feedback-scores/{email}")
async def get_feedback_scores(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("""
                SELECT * FROM feedback_scores
                WHERE email = %s
                ORDER BY created_at DESC
            """, (email,))
            scores = cur.fetchall()
            return {"scores": scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching feedback scores: {str(e)}")
    finally:
        conn.close()

@app.get("/api/user-scores/{email}")
async def get_all_user_scores(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Get coding feedback scores
            cur.execute("""
                SELECT 
                    id,
                    title,
                    example_score,
                    approach_score,
                    testcase_score,
                    code_score,
                    created_at
                FROM feedback_scores
                WHERE email = %s
                ORDER BY created_at DESC
            """, (email,))
            coding_scores = cur.fetchall()

            # Get HR interview scores
            cur.execute("""
                SELECT 
                    h.*,
                    json_agg(
                        json_build_object(
                            'question_text', q.question_text,
                            'answer_text', q.answer_text,
                            'score', q.score,
                            'feedback', q.feedback
                        )
                    ) as questions
                FROM hr_interview_scores h
                LEFT JOIN hr_question_scores q ON q.interview_id = h.id
                WHERE h.email = %s
                GROUP BY h.id
                ORDER BY h.interview_date DESC
            """, (email,))
            hr_scores = cur.fetchall()

            return {
                "coding_scores": coding_scores,
                "hr_scores": hr_scores
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user scores: {str(e)}")
    finally:
        conn.close()

@app.get("/api/question-counts/{email}")
async def get_question_counts(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # Count coding questions (from feedback_scores)
            cur.execute("""
                SELECT COUNT(*) as count
                FROM feedback_scores
                WHERE email = %s
            """, (email,))
            code_count = cur.fetchone()['count'] or 0

            # Count HR questions
            cur.execute("""
                SELECT COUNT(*) as count
                FROM hr_question_scores hq
                JOIN hr_interview_scores hi ON hi.id = hq.interview_id
                WHERE hi.email = %s
            """, (email,))
            hr_count = cur.fetchone()['count'] or 0

            # For now, DSA count is 0 since we don't have that table yet
            dsa_count = 0

            total_count = code_count + hr_count + dsa_count

            return {
                "code_questions": code_count,
                "dsa_questions": dsa_count,
                "hr_questions": hr_count,
                "total_questions": total_count
            }
    except Exception as e:
        print(f"Error in get_question_counts: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching question counts: {str(e)}")
    finally:
        conn.close()

@app.get("/api/daily-activity/{email}")
async def get_daily_activity(email: str):
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get feedback scores by date with question details
            cur.execute("""
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as questions_count,
                    ROUND(AVG(example_score + approach_score + testcase_score + code_score)::numeric, 2) as avg_score,
                    json_agg(json_build_object(
                        'title', title,
                        'total_score', (example_score + approach_score + testcase_score + code_score)
                    )) as questions
                FROM feedback_scores
                WHERE email = %s
                GROUP BY DATE(created_at)
                ORDER BY date DESC
                LIMIT 30
            """, (email,))
            
            activity_data = cur.fetchall()

            # Calculate streaks
            current_streak = 0
            longest_streak = 0
            temp_streak = 0
            
            for day in activity_data:
                if day['questions_count'] > 0:
                    temp_streak += 1
                    current_streak = temp_streak
                    longest_streak = max(longest_streak, temp_streak)
                else:
                    if current_streak == temp_streak:
                        current_streak = 0
                    temp_streak = 0

            # Calculate achievements
            achievements = []
            if longest_streak >= 7:
                achievements.append({
                    "title": "Week Warrior",
                    "description": "7 days coding streak!",
                    "icon": "🔥"
                })
            if longest_streak >= 30:
                achievements.append({
                    "title": "Monthly Master",
                    "description": "30 days coding streak!",
                    "icon": "🌟"
                })
            if longest_streak >= 60:
                achievements.append({
                    "title": "Dedication Champion",
                    "description": "60 days coding streak!",
                    "icon": "🏆"
                })

            return {
                "daily_activity": [{
                    "date": str(day['date']),
                    "questions_count": day['questions_count'],
                    "avg_score": day['avg_score'],
                    "questions": day['questions']
                } for day in activity_data],
                "current_streak": current_streak,
                "longest_streak": longest_streak,
                "achievements": achievements
            }
    except Exception as e:
        print(f"Error in get_daily_activity: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching daily activity: {str(e)}")
    finally:
        conn.close()

@app.post("/api/subscriptions/verify-payment")
async def verify_payment(payment_details: dict):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        
        # Insert subscription record
        query = """
        INSERT INTO user_subscriptions (
            user_id, subscription_plan_id, payment_id, 
            payment_provider, amount_usd, amount_inr, 
            status, start_date, end_date
        )
        VALUES (
            %s, (SELECT id FROM subscription_plans WHERE price = %s LIMIT 1),
            %s, %s, %s, %s, %s, CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP + INTERVAL '1 month'
        )
        RETURNING id;
        """
        
        cursor.execute(query, (
            payment_details['user_id'],
            float(payment_details['plan_price']),
            payment_details['payment_id'],
            payment_details['payment_provider'],
            float(payment_details['amount_usd']),
            float(payment_details.get('amount_inr', 0)),
            'active'
        ))
        
        subscription_id = cursor.fetchone()['id']
        
        # Update user's subscription status
        update_query = """
        UPDATE users
        SET subscription_status = 'active',
            subscription_end_date = CURRENT_TIMESTAMP + INTERVAL '1 month'
        WHERE id = %s
        """
        cursor.execute(update_query, (payment_details['user_id'],))
        
        conn.commit()
        return {"status": "success", "subscription_id": subscription_id}
    
    except Exception as e:
        conn.rollback()
        print(f"Error processing subscription: {e}")
        raise HTTPException(status_code=500, detail="Error processing subscription")
    finally:
        conn.close()

@app.get("/api/subscriptions/user/{user_id}")
async def get_user_subscription(user_id: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT 
            us.id as subscription_id,
            sp.name as plan_name,
            sp.price as plan_price,
            us.status,
            us.start_date,
            us.end_date,
            us.payment_provider,
            us.amount_usd,
            us.amount_inr
        FROM user_subscriptions us
        JOIN subscription_plans sp ON us.subscription_plan_id = sp.id
        WHERE us.user_id = %s
        ORDER BY us.created_at DESC
        LIMIT 1;
        """
        cursor.execute(query, (user_id,))
        subscription = cursor.fetchone()
        
        if not subscription:
            return {
                "status": "inactive",
                "plan_name": "Free",
                "subscription_id": None
            }
            
        return subscription
    
    except Exception as e:
        print(f"Error fetching subscription: {e}")
        raise HTTPException(status_code=500, detail="Error fetching subscription")
    finally:
        conn.close()

@app.get("/api/subscriptions/check-status/{user_id}")
async def check_subscription_status(user_id: str):
    conn = get_db_connection()
    try:
        cursor = conn.cursor()
        query = """
        SELECT 
            CASE 
                WHEN end_date > CURRENT_TIMESTAMP THEN 'active'
                ELSE 'expired'
            END as status,
            end_date
        FROM user_subscriptions
        WHERE user_id = %s
        ORDER BY created_at DESC
        LIMIT 1;
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        if not result:
            return {"status": "inactive", "end_date": None}
            
        return result
    
    except Exception as e:
        print(f"Error checking subscription status: {e}")
        raise HTTPException(status_code=500, detail="Error checking subscription status")
    finally:
        conn.close()

@app.get("/")
async def root():
    return {
        "message": "Code Execution API is running",
        "supported_languages": list(LANGUAGES.keys())
    }

@app.post("/api/execute", response_model=CodeResponse)
async def execute_code(request: CodeRequest):
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
            return CodeResponse(
                status="success",
                output=submission.stdout,
                execution_time=submission.time,
                memory=submission.memory
            )
        elif submission.status["id"] == 4:  # Wrong Answer
            return CodeResponse(
                status="wrong_answer",
                output=submission.stdout,
                expected=request.expected_output
            )
        elif submission.status["id"] == 6:  # Compilation Error
            return CodeResponse(
                status="compilation_error",
                error=submission.compile_output
            )
        else:
            return CodeResponse(
                status="error",
                error=submission.stderr or "An error occurred during execution"
            )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/example/{language}")
async def get_example(language: str):
    if language not in LANGUAGES:
        raise HTTPException(status_code=400, detail=f"Language {language} not supported")
    
    examples = {
        "python": 'print("Hello, World!")',
        "java": '''public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}''',
        "cpp": '''#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}''',
        "c": '''#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}''',
        "ruby": 'puts "Hello, World!"',
        "r": 'print("Hello, World!")'
    }
    
    return {
        "language": language,
        "language_id": LANGUAGES[language],
        "example_code": examples[language]
    }


class RunStatus(BaseModel):
    status: str
    message: str
GROQ_API_KEY = os.getenv('GROQ_API_KEY')  # Fetch from environment variable for security
GROQ_API_URL = "https://api.groq.com/v1/chat/completions"
# Path to the CSV file
CSV_FILE_PATH = "./Interview_news/meta_article.csv"
timeout = httpx.Timeout(30.0, read=60.0)  # Increase read timeout
client = httpx.Client(timeout=timeout)
def run_script():
    # File path to the Python script
    file_path = r"./Interview_news/meta_article.py"

    # Ensure the file exists
    if not os.path.exists(file_path):
        print("File not found at the specified path")
        return

    try:
        # Run the Python file using subprocess
        result = subprocess.run(
            ["python", file_path],
            capture_output=True,
            text=True,
            check=True
        )
        print(result.stdout.strip() or "Script executed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Script execution failed: {e.stderr.strip()}")
    except Exception as e:
        print(f"An error occurred: {str(e)}")

# Read data from CSV file
def read_csv():
    if not os.path.exists(CSV_FILE_PATH):
        raise FileNotFoundError(f"CSV file not found at {CSV_FILE_PATH}")

    with open(CSV_FILE_PATH, mode="r", encoding="utf-8") as file:
        reader = csv.DictReader(file)  # Use DictReader to get rows as dictionaries
        data = [row for row in reader]  # Read all rows into a list
    return data

@app.get("/run-meta-article", response_model=RunStatus)
def run_meta_article():
    try:
        run_script()
        return RunStatus(
            status="success",
            message="Script executed successfully."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred: {str(e)}"
        )

# Endpoint to fetch articles from CSV file
@app.get("/get-articles/")
async def get_articles():
    try:
        data = read_csv()
        return JSONResponse(content={"data": data}, status_code=200)
    except FileNotFoundError:
        return JSONResponse(content={"detail": "CSV file not found"}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
