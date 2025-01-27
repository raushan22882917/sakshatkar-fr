import streamlit as st
import requests
import uuid

# Function to fetch chatbot response from FastAPI
def get_bot_response(user_query, session_id):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat",  # Update to your backend URL if different
            json={"query": user_query, "session_id": session_id}
        )
        if response.status_code == 200:
            return response.json().get("response", "No response from the bot.")
        else:
            return f"Error: {response.status_code}, {response.text}"
    except Exception as e:
        return f"Error: {e}"

# Initialize session state
if "messages" not in st.session_state:
    st.session_state.messages = []
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())  # Unique session ID

# Title and Chat History Display
st.title("Chatbot")
st.markdown("### Chat History:")

# Display chat history
for message in st.session_state.messages:
    if message["role"] == "user":
        st.markdown(f"**You**: {message['content']}")
    elif message["role"] == "bot":
        st.markdown(f"**Bot**: {message['content']}")

# User input box
with st.form(key="chat_form", clear_on_submit=True):
    user_query = st.text_input("Your Message:", key="user_input")
    submit_button = st.form_submit_button("Send")

# Process user input
if submit_button and user_query.strip():  # Only process if input is not empty
    # Append user query to the chat history
    st.session_state.messages.append({"role": "user", "content": user_query})
    
    # Get bot response
    with st.spinner("Bot is thinking..."):
        bot_response = get_bot_response(user_query, st.session_state.session_id)
    
    # Append bot response to the chat history
    st.session_state.messages.append({"role": "bot", "content": bot_response})
    
    # Refresh the UI
    st.experimental_rerun()
