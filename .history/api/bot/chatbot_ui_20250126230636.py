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
        return response.json()
    except Exception as e:
        return {"response": f"Error: {e}"}
# Ensure this function is defined before it's used in chatbot_ui.py
def execute_code(code: str) -> str:
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

# Function to handle follow-up behavior
def follow_up_action(user_response, lesson):
    if user_response.lower() == "yes":
        return f"Great! Let's move on to the next lesson.\n\n{lesson['content']}"
    elif user_response.lower() == "no":
        return f"Let's revisit this topic. Here's an example:\n\n{lesson['content']}"
    else:
        return "Please respond with 'yes' or 'no'."

# Streamlit UI
st.title("Virtual Coding Classroom")

# Session state for chat history and lesson follow-up tracking
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'follow_up' not in st.session_state:
    st.session_state.follow_up = False
if 'lesson' not in st.session_state:
    st.session_state.lesson = None

# Display previous chat history
for message in st.session_state.messages:
    if message['role'] == "user":
        st.markdown(f"**You**: {message['content']}")
    else:
        st.markdown(f"**Bot**: {message['content']}")

# Input box for user query
user_query = st.text_input("Ask for a lesson or help:" if not st.session_state.follow_up else "Do you understand the lesson? (yes/no)")

# Handle user input
if user_query:
    if not st.session_state.follow_up:
        # Store user query
        st.session_state.messages.append({"role": "user", "content": user_query})

        # Get bot response and the lesson
        response_data = get_bot_response(user_query)
        bot_response = response_data.get("response", "Sorry, I couldn't get a response.")
        lesson = response_data.get("lesson")

        # Display the response and lesson content
        st.session_state.messages.append({"role": "bot", "content": bot_response})

        if lesson:
            st.session_state.lesson = lesson
            st.session_state.messages.append({"role": "bot", "content": lesson['content']})
            st.session_state.follow_up = True
    else:
        # Handle follow-up response
        user_response = user_query.lower().strip()
        follow_up_response = follow_up_action(user_response, st.session_state.lesson)
        st.session_state.messages.append({"role": "user", "content": user_query})
        st.session_state.messages.append({"role": "bot", "content": follow_up_response})

        # Reset follow-up flag
        st.session_state.follow_up = False

# Display code submission area
code_input = st.text_area("Write your code here:")

# If code is submitted
if st.button("Submit Code"):
    if code_input:
        feedback = execute_code(code_input)
        st.markdown(f"**Code Feedback**: {feedback}")
