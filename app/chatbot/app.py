import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI

app = Flask(__name__)
CORS(app)  # This allows your React frontend to make requests to this API

client = OpenAI(
  api_key="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"
)

# Load food bank data from JSON file with better error handling
def load_food_bank_data():
    # Try multiple possible file locations
    possible_paths = [
        'food_banks.json',  # Local to the app.py
        'data/food_banks.json',  # In a data subfolder
        'C:/Users/sriva/ai-food-insecurity/ai-food-insecurity/data/foodbanks_with_geocodes.json'  # Your hardcoded path
    ]
    
    for path in possible_paths:
        try:
            print(f"Trying to load from: {path}")
            with open(path, 'r') as file:
                data = json.load(file)
                print(f"Successfully loaded {len(data)} food banks from {path}")
                return data
        except FileNotFoundError:
            print(f"File not found: {path}")
            continue
        except json.JSONDecodeError:
            print(f"Invalid JSON in file: {path}")
            continue
        except Exception as e:
            print(f"Error loading from {path}: {str(e)}")
            continue
    
    # If we reach here, all paths failed
    print("All paths failed, using sample data")
    # Return some sample data so the app can still function
    return [
        {
            "name": "Capital Area Food Bank",
            "address": "4900 Puerto Rico Ave NE, Washington, DC 20017",
            "phone": "(202) 644-9800",
            "region": "DC Metro Area",
            "status": "Active",
            "distribution_models": ["Walk up", "Drive through"],
            "food_format": "Pre-packaged boxes",
            "frequency": "Weekly",
            "hours": "Monday-Friday: 9am-5pm, Saturday: 10am-2pm",
            "requirements": "None, open to all"
        },
        {
            "name": "Bread for the City",
            "address": "1525 7th St NW, Washington, DC 20001",
            "phone": "(202) 265-2400",
            "region": "DC Ward 2",
            "status": "Active",
            "distribution_models": ["Walk up"],
            "food_format": "Loose groceries",
            "frequency": "Monthly",
            "hours": "Monday-Thursday: 8:30am-6pm, Friday: 8:30am-12pm",
            "requirements": "DC resident, proof of residency"
        }
    ]

# Try to load the food bank data
food_banks = load_food_bank_data()
print(f"Loaded {len(food_banks)} food banks for use in chatbot.")

# Create a system prompt that includes information about the data structure
system_prompt = """
You are a helpful assistant for finding local food banks. You have access to the following information about each food bank:
- name: The name of the food bank
- address: Physical location of the food bank
- phone: Contact phone number
- region: Area served (like DC Ward 8)
- status: Whether the food bank is currently active
- distribution_models: How food is distributed (Walk up, Drive through, etc.)
- food_format: What form the food comes in (Loose groceries, Pre-packaged boxes, etc.)
- frequency: How often distribution occurs
- hours: When the food bank is open
- requirements: Any requirements for receiving food

When asked about food banks, provide relevant information based on location, hours, or other criteria the user mentions.
"""

# Prepare example entries to help the model understand the data format
if food_banks:
    example_entries = json.dumps(food_banks[:2], indent=2)
    system_prompt += f"\n\nHere are examples of the food bank entries:\n{example_entries}"

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message', '')
        chat_history = data.get('history', [])
        
        print(f"Received message: {user_input}")
        
        # Initialize history with system prompt if it's empty
        if not chat_history:
            history = [
                {"role": "system", "content": system_prompt}
            ]
        else:
            history = chat_history
        
        # Add user input to history
        history.append({"role": "user", "content": user_input})

        # If user is asking about food banks, include relevant data as context
        if any(keyword in user_input.lower() for keyword in ["food bank", "food", "bank", "hungry", "help", "location"]):
            # For specific location queries, we could filter the food banks here
            context_data = food_banks[:5]  # Limit to 5 to avoid token limits
            context = f"Here are some food banks that might be relevant: {json.dumps(context_data)}"
            
            # Add context as a system message
            history.append({"role": "system", "content": context})

        # Get response from OpenAI
        try:
            print("Sending request to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Or other models as appropriate
                messages=history
            )
            
            # Extract assistant response
            assistant_message = response.choices[0].message.content.strip()
            print(f"Received response from OpenAI: {assistant_message[:50]}...")
            
            # Add assistant response to history
            history.append({"role": "assistant", "content": assistant_message})
            
            # Remove the temporary context message if we added one
            if len(history) > 3 and history[-3]["role"] == "system" and "food banks that might be relevant" in history[-3]["content"]:
                history.pop(-3)
                
            return jsonify({
                'message': assistant_message,
                'history': history
            })
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return jsonify({
                'message': f"Sorry, I'm having trouble connecting to my knowledge base. Please try again later.",
                'error': str(e)
            }), 500
    
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            'message': "Sorry, the server encountered an error. Please try again.",
            'error': str(e)
        }), 500

# Simple health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'ok',
        'food_banks_loaded': len(food_banks)
    })

if __name__ == "__main__":
    print("Starting Flask server on http://localhost:5000")
    app.run(debug=True, port=5000)