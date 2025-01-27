import streamlit as st
import requests

# Function to interact with the Groq API and get the bot response
def get_bot_response(user_query):
    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={"Content-Type": "application/json", "Authorization": "Bearer GSK_2CNWrTHohHkHbLrDqvtVWGdyb3FYSlkwsFVDK2SdFF2WCWnLZcHT"},
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": user_query}]
            }
        )
        if response.status_code == 200:
            return response.json().get("choices", [{}])[0].get("message", {}).get("content", "Sorry, I couldn't get a response.")
        else:
            return f"Error: Unable to retrieve a valid response from the API (Status Code: {response.status_code})"
    except Exception as e:
        return f"Error: {e}"

# Function to handle follow-up action based on user response
def follow_up_action(user_response, user_query, is_answer_correct):
    if is_answer_correct:
        return f"Great! Here's a related question for you: What are some practical applications of '{user_query}'?"
    else:
        return f"Let me explain '{user_query}' again with a real-life example. Imagine this: Python is like a Swiss Army knife in programming—it can handle many tasks. For instance, if you wanted to analyze data, automate tasks, or even build a website, Python can do it all. Can you try again?"

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

        if user_response == "yes":
            # Ask a related question if user understood
            follow_up_response = follow_up_action(user_response, st.session_state.last_query, True)
            st.session_state.messages.append({"role": "bot", "content": follow_up_response})
        elif user_response == "no":
            # Explain again if the user did not understand
            follow_up_response = follow_up_action(user_response, st.session_state.last_query, False)
            st.session_state.messages.append({"role": "bot", "content": follow_up_response})

            # Ask for more clarification
            st.session_state.follow_up = True
        else:
            # If the response is not valid, prompt again
            st.session_state.messages.append({"role": "bot", "content": "Please answer with 'yes' or 'no'."})

        # Reset follow-up state after interaction
        st.session_state.follow_up = False

    # Refresh the UI
    st.experimental_rerun()
