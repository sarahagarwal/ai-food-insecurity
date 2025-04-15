import os
from openai import OpenAI

client = OpenAI(  api_key="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"
)
try:
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": "Hello!"}]
    )
    print("API key works!")
    print(response.choices[0].message.content)
except Exception as e:
    print(f"API key error: {e}")