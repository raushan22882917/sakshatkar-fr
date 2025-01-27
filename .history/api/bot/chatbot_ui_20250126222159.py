import streamlit as st
import requests

# Backend URL (FastAPI)
API_URL = "http://127.0.0.1:8000/chat"  # Change this URL if running on a different port or server

# Streamlit UI settings
st.title("Chatbot with Session Management")
st.write("This chatbot remembers your chat session, just like ChatGPT.")

# Initialize session state
if 'session_id' not in st.session_state:
    st.session_state.session_id = None
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

# Function to display the chat history
def display_chat():
    for chat in st.session_state.chat_history:
        st.markdown(f"**{chat['role']}**: {chat['message']}")

# Function to get a response from the backend
def get_bot_response(user_query):
    if user_query:
        response = requests.post(
            API_URL,
            json={"session_id": st.session_state.session_id, "query": user_query},
        )
        if response.status_code == 200:
            response_data = response.json()
            st.session_state.session_id = response_data["session_id"]
            st.session_state.chat_history = response_data["chat_history"]
            st.session_state.chat_history.append({"role": "user", "message": user_query})
            st.session_state.chat_history.append({"role": "bot", "message": response_data["response"]})
            st.experimental_rerun()  # Refresh the UI to display the new messages
        else:
            st.error(f"Error: {response.status_code}, {response.text}")

# Input field for the user to chat
user_query = st.text_input("You:", "")
if user_query:
    get_bot_response(user_query)

# Display chat history
display_chat()
