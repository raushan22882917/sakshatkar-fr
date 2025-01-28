import psycopg2
from psycopg2.extras import RealDictCursor

# Database connection parameters
DB_PARAMS = {
    'dbname': 'sakshatkar',
    'user': 'sakshatkar_user',
    'password': 'ytJGgWCPlj8MfB5HfvT1XAuSjaSa5dF5',
    'host': 'dpg-cuc7rijqf0us73c6vg00-a.oregon-postgres.render.com',
    'port': '5432',
    'cursor_factory': RealDictCursor
}

def create_tables():
    # SQL commands to create tables
    commands = [
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            username VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS interview_scores (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            company_name VARCHAR(255) NOT NULL,
            position VARCHAR(255) NOT NULL,
            round_number INTEGER NOT NULL,
            total_score INTEGER NOT NULL,
            interview_date TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS question_scores (
            id SERIAL PRIMARY KEY,
            interview_score_id INTEGER REFERENCES interview_scores(id),
            question_type VARCHAR(50) NOT NULL,
            question_text TEXT NOT NULL,
            score INTEGER NOT NULL,
            strengths TEXT[],
            improvements TEXT[],
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS hr_interview_scores (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            company_name VARCHAR(255) NOT NULL,
            position VARCHAR(255) NOT NULL,
            total_score INTEGER NOT NULL,
            interview_date TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS hr_question_scores (
            id SERIAL PRIMARY KEY,
            hr_interview_score_id INTEGER REFERENCES hr_interview_scores(id),
            question_text TEXT NOT NULL,
            answer_text TEXT NOT NULL,
            score INTEGER NOT NULL,
            feedback TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """,
        """
        CREATE TABLE IF NOT EXISTS feedback_scores (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            title VARCHAR(255) NOT NULL,
            example_score INTEGER DEFAULT 0,
            approach_score INTEGER DEFAULT 0,
            testcase_score INTEGER DEFAULT 0,
            code_score INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    ]

    conn = None
    try:
        # Connect to the database
        print("Connecting to the database...")
        conn = psycopg2.connect(**DB_PARAMS)
        cur = conn.cursor()
        
        # Create tables
        for command in commands:
            print("Executing:", command.split('\n')[1].strip())
            cur.execute(command)
        
        # Commit the changes
        conn.commit()
        print("All tables created successfully!")
        
        # Close communication with the database
        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(f"Error: {error}")
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")

if __name__ == "__main__":
    create_tables()
