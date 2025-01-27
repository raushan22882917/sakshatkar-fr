import streamlit as st
import requests
from fastapi import FastAPI
import uuid

# FastAPI setup and chatbot API call function
# (Ensure your FastAPI backend is running and accessible)
def get_bot_response(user_query):
    # Make a request to the FastAPI backend to get the response
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat", 
            json={"query": user_query, "session_id": str(uuid.uuid4())}
        )
        return response.json().get("response", "Sorry, I couldn't get a response.")
    except Exception as e:
        return f"Error: {e}"

# Streamlit UI
st.title("Chatbot")

# Session state for storing chat history
if 'messages' not in st.session_state:
    st.session_state.messages = []

# Display previous chat history
for message in st.session_state.messages:
    st.markdown(f"**{message['role']}**: {message['content']}")

# Input box for user query
user_query = st.text_input("Your Message:")

if user_query:
    # Store user message
    st.session_state.messages.append({"role": "user", "content": user_query})
    
    # Get response from the bot
    bot_response = get_bot_response(user_query)

    # Store bot message
    st.session_state.messages.append({"role": "bot", "content": bot_response})

    # Refresh the UI to display the new messages
    st.rerun()  # This will refresh the Streamlit app to update chat

