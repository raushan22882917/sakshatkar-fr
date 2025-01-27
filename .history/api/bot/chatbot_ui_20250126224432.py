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

# Function to handle follow-up behavior
def follow_up_action(user_response, user_query):
    if user_response == "yes":
        # Generate a follow-up question
        return f"Great! Here's a question for you to think about: How would you apply the concept of '{user_query}' in a practical scenario?"
    elif user_response == "no":
        # Provide an explanation with a real-life example
        return f"Let me explain '{user_query}' again with a real-life example. Imagine this situation: ... [insert example here]."
    else:
        return "Invalid choice. Please respond with 'yes' or 'no'."

# Streamlit UI
st.title("Interactive Chatbot")

# Session state for chat history and follow-up tracking
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'follow_up' not in st.session_state:
    st.session_state.follow_up = False
if 'last_query' not in st.session_state:
    st.session_state.last_query = ""

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

        # Enable follow-up
        st.session_state.follow_up = True
    else:
        # Handle follow-up response
        user_response = user_query.lower().strip()
        follow_up_response = follow_up_action(user_response, st.session_state.last_query)
        st.session_state.messages.append({"role": "user", "content": user_query})
        st.session_state.messages.append({"role": "bot", "content": follow_up_response})

        # Reset follow-up state
        st.session_state.follow_up = False

    # Refresh the UI
    st.rerun()
