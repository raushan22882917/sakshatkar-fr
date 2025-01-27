import streamlit as st
import requests

API_URL = "http://127.0.0.1:8000/chat"  # URL to your FastAPI backend

# Session state to keep track of the session ID
if "session_id" not in st.session_state:
    st.session_state.session_id = None

# Chat Interface
st.title("Groq-powered Chatbot")

# Get user input
user_query = st.text_input("Ask the bot something:")

# Display chat history
if "chat_history" in st.session_state:
    for message in st.session_state.chat_history:
        st.write(message)

# Handle message submission
if user_query:
    response = requests.post(
        API_URL,
        json={"session_id": st.session_state.session_id, "query": user_query},
    )
    if response.status_code == 200:
        response_data = response.json()
        st.session_state.session_id = response_data["session_id"]
        st.session_state.chat_history = response_data["chat_history"]
        st.session_state.chat_history.append(f"User: {user_query}")
        st.session_state.chat_history.append(f"Bot: {response_data['response']}")
        st.experimental_rerun()  # Refresh the UI to display the new messages
    else:
        st.error("Error: Unable to get response from the chatbot.")
