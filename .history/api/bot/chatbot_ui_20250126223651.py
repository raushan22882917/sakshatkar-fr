import streamlit as st
import requests
import uuid

# Function to fetch chatbot response from FastAPI
def get_bot_response(user_query, session_id):
    try:
        response = requests.post(
            "http://127.0.0.1:8000/chat",  # Update this URL to your backend API endpoint
            json={"query": user_query, "session_id": session_id}
        )
        if response.status_code == 200:
            return response.json().get("response", "No response from the bot.")
        else:
            return f"Error: {response.status_code}, {response.text}"
    except Exception as e:
        return f"Error: {e}"

# Initialize session state variables
if "messages" not in st.session_state:
    st.session_state.messages = []
if "session_id" not in st.session_state:
    st.session_state.session_id = str(uuid.uuid4())  # Generate a unique session ID
if "user_input" not in st.session_state:
    st.session_state.user_input = ""

# Title and chat history display
st.title("Chatbot")
st.markdown("### Chat History:")

# Display chat history
for message in st.session_state.messages:
    if message["role"] == "user":
        st.markdown(f"**You**: {message['content']}")
    elif message["role"] == "bot":
        st.markdown(f"**Bot**: {message['content']}")

# Input field and send button
user_query = st.text_input("Your Message:", key="user_input")

if st.button("Send"):
    if user_query.strip():  # Ensure input is not empty
        # Append user query to chat history
        st.session_state.messages.append({"role": "user", "content": user_query})
        
        # Get bot response
        with st.spinner("Bot is thinking..."):
            bot_response = get_bot_response(user_query, st.session_state.session_id)
        
        # Append bot response to chat history
        st.session_state.messages.append({"role": "bot", "content": bot_response})
        
        # Clear the input field
        st.session_state.user_input = ""

