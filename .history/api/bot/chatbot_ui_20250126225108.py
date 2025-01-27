import streamlit as st
import requests
import uuid

# Function to interact with the FastAPI backend
def get_bot_response(user_query):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat",
            json={"query": user_query, "session_id": str(uuid.uuid4())}
        )
        return response.json().get("response", "Sorry, I couldn't get a response.")
    except Exception as e:
        return f"Error: {e}"

# Function to evaluate the answer using Groq API and provide feedback
def evaluate_answer(user_answer, correct_answer):
    # Basic evaluation (this can be replaced with Groq API or more complex logic)
    if user_answer.lower().strip() == correct_answer.lower().strip():
        score = 10
        feedback = "Correct! Well done."
    else:
        score = 0
        feedback = f"Incorrect. The correct answer is: {correct_answer}. Try again next time!"
    
    return score, feedback

# Function to handle follow-up behavior (ask if the user understood and check their answer)
def follow_up_action(user_response, user_query, correct_answer):
    if user_response == "yes":
        # Generate a follow-up question
        return f"Great! Here's a question for you to think about: How would you apply the concept of '{user_query}' in a practical scenario?"
    elif user_response == "no":
        # Provide an explanation with a real-life example
        return f"Let me explain '{user_query}' again with a real-life example. Imagine this situation: ... [insert example here]."
    elif user_response.lower().startswith("answer:"):
        # Check the user's answer and provide feedback
        user_answer = user_response[7:].strip()  # Extract the answer after "Answer:"
        score, feedback = evaluate_answer(user_answer, correct_answer)
        return f"Your answer was scored {score}/10. {feedback}"
    else:
        return "Invalid choice. Please respond with 'yes', 'no', or 'Answer: [your answer]'"

# Streamlit UI
st.title("Interactive Chatbot")

# Session state for chat history and follow-up tracking
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'follow_up' not in st.session_state:
    st.session_state.follow_up = False
if 'last_query' not in st.session_state:
    st.session_state.last_query = ""
if 'correct_answer' not in st.session_state:
    st.session_state.correct_answer = ""

# Display previous chat history
for message in st.session_state.messages:
    if message['role'] == "user":
        st.markdown(f"**You**: {message['content']}")
    else:
        st.markdown(f"**Bot**: {message['content']}")

# Input box for user query
user_query = st.text_input("Your Message:" if not st.session_state.follow_up else "Did you understand? (yes/no)")

# Handle user input
if user_query:
    if not st.session_state.follow_up:
        # Store user query
        st.session_state.messages.append({"role": "user", "content": user_query})
        st.session_state.last_query = user_query

        # Get bot response
        bot_response = get_bot_response(user_query)
        st.session_state.messages.append({"role": "bot", "content": bot_response})

        # Assume we get the correct answer from some source (e.g., predefined or Groq API)
        st.session_state.correct_answer = "Machine learning is a subset of AI that allows systems to learn from data without being explicitly programmed."  # Example correct answer

        # Enable follow-up
        st.session_state.follow_up = True
    else:
        # Handle follow-up response
        user_response = user_query.lower().strip()
        follow_up_response = follow_up_action(user_response, st.session_state.last_query, st.session_state.correct_answer)
        st.session_state.messages.append({"role": "user", "content": user_query})
        st.session_state.messages.append({"role": "bot", "content": follow_up_response})

        # Reset follow-up state
        st.session_state.follow_up = False

    # Refresh the UI
    st.rerun()
