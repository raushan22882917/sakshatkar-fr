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

# Function to handle follow-up behavior
def follow_up_action(user_response, user_query, question):
    if user_response == "yes":
        # Return the randomly generated question
        return question
    elif user_response == "no":
        # Provide an explanation with a real-life example
        return f"Let me explain '{user_query}' again with a real-life example."
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

        # Get bot response and the random question
        response_data = get_bot_response(user_query)
        bot_response = response_data.get("response", "Sorry, I couldn't get a response.")
        random_question = response_data.get("question")

        st.session_state.messages.append({"role": "bot", "content": bot_response})

        # Display the question if available
        if random_question:
            st.session_state.messages.append({"role": "bot", "content": random_question["question"]})
            st.session_state.follow_up = True
    else:
        # Handle follow-up response
        user_response = user_query.lower().strip()
        follow_up_response = follow_up_action(user_response, st.session_state.last_query, random_question)
        st.session_state.messages.append({"role": "user", "content": user_query})
        st.session_state.messages.append({"role": "bot", "content": follow_up_response})

        # Reset follow-up state
        st.session_state.follow_up = False

    # Refresh the UI
    st.rerun()
