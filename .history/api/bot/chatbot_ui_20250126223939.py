import streamlit as st
import requests
import uuid

# FastAPI setup and chatbot API call function
# (Ensure your FastAPI backend is running and accessible)
def get_bot_response(user_query, session_id):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat",
            json={"query": user_query, "session_id": session_id}
        )
        if response.status_code == 200:
            return response.json().get("response", "Sorry, I couldn't get a response.")
        else:
            return f"Error: {response.status_code} - {response.text}"
    except Exception as e:
        return f"Error: {e}"

# Streamlit UI
st.title("Chatbot")

# Session state for storing chat history and session ID
if 'messages' not in st.session_state:
    st.session_state.messages = []
if 'session_id' not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())  # Unique session ID for the chat

# Display previous chat history
for message in st.session_state.messages:
    if message['role'] == "user":
        st.markdown(f"**You**: {message['content']}")
    elif message['role'] == "bot":
        st.markdown(f"**Bot**: {message['content']}")

# Input box for user query
user_query = st.text_input("Your Message:", key="input_box", placeholder="Type your message here...")

# Handle user query and bot response
if st.button("Send") and user_query.strip():  # Ensure the query is not empty
    # Store the user's message
    st.session_state.messages.append({"role": "user", "content": user_query})

    # Get the bot's response
    with st.spinner("Bot is thinking..."):
        bot_response = get_bot_response(user_query, st.session_state.session_id)

    # Store the bot's response
    st.session_state.messages.append({"role": "bot", "content": bot_response})

    # Clear the input box for the next query
    st.session_state.input_box = ""
    st.experimental_rerun()  # Refresh the app to update the chat history
