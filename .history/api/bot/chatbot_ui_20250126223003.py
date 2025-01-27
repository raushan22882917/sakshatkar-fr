import streamlit as st
import requests
import uuid

# Function to fetch chatbot response from FastAPI
def get_bot_response(user_query):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat",  # Update to your backend URL if different
            json={"query": user_query, "session_id": str(uuid.uuid4())}
        )
        return response.json().get("response", "No response from the bot.")
    except Exception as e:
        return f"Error: {e}"

# Streamlit chat UI
st.title("Chatbot")

if 'messages' not in st.session_state:
    st.session_state.messages = []

# Display chat history
for message in st.session_state.messages:
    st.markdown(f"**{message['role']}**: {message['content']}")

# User input box
user_query = st.text_input("Your Message:")

if user_query:
    st.session_state.messages.append({"role": "user", "content": user_query})

    # Fetch bot response
    bot_response = get_bot_response(user_query)
    st.session_state.messages.append({"role": "bot", "content": bot_response})

    # Refresh the Streamlit app to show the updated chat
    st.rerun()
