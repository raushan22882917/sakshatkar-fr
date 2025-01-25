import requests
import json

# Replace with your Glot.io API Key
GLOT_API_KEY = "your_api_key_here"

def execute_code(language, code, stdin=""):
    url = f"https://run.glot.io/languages/{language}/latest"
    headers = {
        "Authorization": f"Token {GLOT_API_KEY}",
        "Content-Type": "application/json"
    }
    payload = {
        "files": [{"name": "main", "content": code}],
        "stdin": stdin
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": response.text}

# Example usage
if __name__ == "__main__":
    code = "print('Hello, Glot!')"
    result = execute_code("python", code)
    print(result)
