import psycopg2
from datetime import datetime
from typing import Dict

# Database connection parameters
DB_PARAMS = {
    'dbname': 'Sakshatkar',
    'user': 'postgres',
    'password': '22882288',
    'host': 'localhost'
}

def connect_to_db():
    """Establish connection to PostgreSQL database"""
    try:
        conn = psycopg2.connect(**DB_PARAMS)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def create_scores_table(conn):
    """Create the interview_scores table if it doesn't exist"""
    try:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS interview_scores (
                    id SERIAL PRIMARY KEY,
                    user_name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) NOT NULL,
                    round_number INTEGER NOT NULL,
                    score INTEGER NOT NULL,
                    interview_date DATE NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
        conn.commit()
        print("Table created/verified successfully")
    except Exception as e:
        print(f"Error creating table: {e}")
        conn.rollback()

def insert_interview_score(
    conn,
    user_name: str,
    email: str,
    round_number: int,
    score: int,
    interview_date: datetime.date = None
):
    """Insert a new interview score record"""
    if interview_date is None:
        interview_date = datetime.now().date()
    
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO interview_scores 
                (user_name, email, round_number, score, interview_date)
                VALUES (%s, %s, %s, %s, %s)
                RETURNING id
            """, (user_name, email, round_number, score, interview_date))
            score_id = cur.fetchone()[0]
            conn.commit()
            print(f"Successfully inserted score record with ID: {score_id}")
            return score_id
    except Exception as e:
        print(f"Error inserting score: {e}")
        conn.rollback()
        return None

def main():
    # Connect to database
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        # Create table if it doesn't exist
        create_scores_table(conn)
        
        # Example usage
        score_data = {
            'user_name': 'John Doe',
            'email': 'john@example.com',
            'round_number': 1,
            'score': 45  # out of 50
        }
        
        # Insert score
        insert_interview_score(conn, **score_data)
        
    finally:
        conn.close()

if __name__ == "__main__":
    main()
