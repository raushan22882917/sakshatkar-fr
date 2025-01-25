import requests
import os
from typing import Optional

class JDoodleClient:
    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self.api_url = "https://api.jdoodle.com/v1/execute"
    
    def execute(self, 
                script: str, 
                language_id: int, 
                stdin: Optional[str] = "") -> dict:
        # Map language IDs to JDoodle language names
        language_map = {
            71: "python3",  # Python
            62: "java",     # Java
            54: "cpp17",    # C++
            50: "c",        # C
            72: "ruby",     # Ruby
            80: "r",        # R
        }
        
        if language_id not in language_map:
            raise ValueError(f"Unsupported language ID: {language_id}")
            
        payload = {
            "clientId": self.client_id,
            "clientSecret": self.client_secret,
            "script": script,
            "language": language_map[language_id],
            "stdin": stdin
        }
        
        response = requests.post(self.api_url, json=payload)
        response.raise_for_status()
        
        return response.json()
