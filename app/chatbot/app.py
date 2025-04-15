from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})  # Allows your React frontend to make requests

# Initialize OpenAI client
client = OpenAI(
  api_key="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"
)

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message', '')
        chat_history = data.get('messages', [])
        
        # Format chat history for OpenAI API
        formatted_messages = []
        
        # Add system message
        formatted_messages.append({"role": "system", "content": "You are a helpful assistant."})
        
        # Add messages from chat history
        for message in chat_history:
            formatted_messages.append({
                "role": message["role"],
                "content": message["content"]
            })
        
        # Add the latest user message
        if user_input:
            formatted_messages.append({"role": "user", "content": user_input})

        # Get response from OpenAI
        try:
            print("Sending request to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Or use a different model if preferred
                messages=formatted_messages,
                temperature=0.7
            )
            
            # Extract assistant response
            assistant_message = response.choices[0].message.content.strip()
            print(f"Received response from OpenAI: {assistant_message[:50]}...")
            
            return jsonify({
                'response': assistant_message
            })
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return jsonify({
                'response': "I'm having trouble connecting right now. Could you please try again in a moment?",
                'error': str(e)
            }), 500
    
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            'response': "Sorry, there was a problem processing your request. Please try again.",
            'error': str(e)
        }), 500

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working"})

if __name__ == "__main__":
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)