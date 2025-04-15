import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from math import radians, cos, sin, asin, sqrt
import datetime

app = Flask(__name__)
CORS(app)  # This allows your React frontend to make requests to this API

client = OpenAI(
  api_key="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"
)

# Calculate distance between two points using Haversine formula
def haversine(lat1, lon1, lat2, lon2):
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    r = 3956  # Radius of Earth in miles
    return c * r

# More flexible JSON file loading
def load_food_bank_data():
    # Try multiple possible locations
    possible_paths = [
        os.path.join(os.getcwd(), 'food_banks.json'),  # Current directory
        os.path.join(os.getcwd(), 'data', 'food_banks.json'),  # Data subfolder
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'food_banks.json'),  # Script directory
        os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'food_banks.json'),  # Script's data subfolder
        os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'data', 'food_banks.json'),  # Parent folder's data directory
        'C:/Users/sriva/ai-food-insecurity/ai-food-insecurity/data/foodbanks_with_geocodes.json'  # Hardcoded path as last resort
    ]
    
    # Add environment variable option
    if os.environ.get('FOOD_BANKS_PATH'):
        possible_paths.insert(0, os.environ.get('FOOD_BANKS_PATH'))
    
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
    
    # If we reach here, all paths failed - create an empty array that you can fill with data from API requests
    print("All paths failed, creating empty food bank array")
    return []

# Try to load the food bank data
food_banks = load_food_bank_data()
print(f"Loaded {len(food_banks)} food banks for use in chatbot.")

# Create a detailed system prompt with instructions for tailored recommendations
SYSTEM_PROMPT_TEMPLATE = """
You are a friendly assistant for finding local food assistance and support services. Your goal is to guide users through a conversation to understand their needs and provide personalized recommendations.

Follow this conversation flow with users:
1. Begin with a warm greeting and ask what type of service they're looking for (food bank, financial assistance, housing, etc.)
2. Ask for their location information (to find nearby services)
3. Ask about their availability (preferred days/times)
4. If they need food assistance, ask follow-up questions about:
   - Food type preferences (loose groceries, prepared meals, pre-bagged groceries)
   - Distribution method preferences (walk-up, drive-through, home delivery)
   - Whether they'd like to connect with a specific cultural community

After collecting this information, recommend the TOP 3 MOST RELEVANT options only, formatted like this:
1️⃣ [NAME] - [X.X] miles away
2️⃣ [NAME] - [X.X] miles away
3️⃣ [NAME] - [X.X] miles away

Then ask them to select option 1, 2, or 3 to learn more details.

When they select an option, provide complete details about that specific location:
📍 [NAME]
• Address: [address]
• Phone: [phone]
• Distance: [X.X] miles away
• Hours: [day: time]
• Food Type: [food_format]
• Distribution: [distribution_models]
• Frequency: [frequency]
• Services: [additional services offered]
• Cultural Communities: [cultures served]
• Requirements: [requirements or "None"]

Be conversational and empathetic throughout - users may be in difficult situations.
Ask one question at a time and wait for user responses.
Respond in the user's language (English, Spanish, or other requested languages).

Current day and time (for reference): {current_datetime}
"""

def get_detailed_system_prompt():
    # Add current date and time for context
    current_datetime = datetime.datetime.now().strftime("%A, %B %d, %Y at %I:%M %p")
    
    # Create the system prompt with current datetime
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(current_datetime=current_datetime)
    
    # Add data fields explanation
    system_prompt += """
Food bank data fields include:
- id: Unique identifier
- name: Food bank name
- address: Physical location
- phone: Contact number
- region: Service area
- status: Active/Inactive
- by_appointment: Yes/No
- distribution_models: Methods (Walk up, Drive thru, Home Delivery)
- food_format: Types (Pre-bagged or boxed groceries, Loose groceries, Prepared meals)
- frequency: Distribution schedule
- hours: Operating times
- cultures: Cultural communities served
- services: Additional services offered
- requirements: Documentation needed
- lat/lng: Geographic coordinates
- distance: Distance from user location (if provided)
"""
    
    # Add examples of the data structure
    if food_banks and len(food_banks) >= 2:
        example_entries = json.dumps(food_banks[:2], indent=2)
        system_prompt += f"\n\nExample food bank entries:\n{example_entries}"
    
    return system_prompt

def analyze_conversation_state(history):
    """
    Determine the current state of the conversation to guide the chatbot's next actions.
    States include:
    - greeting: First interaction
    - service_inquiry: Asked about service type
    - location_inquiry: Asked about location
    - availability_inquiry: Asked about days/times
    - food_preferences: Asked about food type
    - distribution_preferences: Asked about distribution method
    - culture_preferences: Asked about cultural communities
    - options_presented: Presented options
    - selection_inquiry: Asked for a selection
    - details_provided: Provided details about a selection
    """
    # Default to greeting if not enough history
    if len(history) < 3:
        return "greeting"
    
    # Skip system messages and analyze only assistant messages
    assistant_messages = [msg["content"] for msg in history if msg["role"] == "assistant"]
    
    # Get the most recent assistant message
    if not assistant_messages:
        return "greeting"
    
    last_message = assistant_messages[-1].lower()
    
    # Check for conversation states based on message content
    if "what type of service" in last_message or "what services" in last_message:
        return "service_inquiry"
    elif "where are you located" in last_message or "what's your location" in last_message:
        return "location_inquiry"
    elif "what days" in last_message or "when are you available" in last_message:
        return "availability_inquiry"
    elif "prefer loose groceries" in last_message or "what type of food" in last_message:
        return "food_preferences"
    elif "walk-up" in last_message or "drive-through" in last_message or "how would you like" in last_message:
        return "distribution_preferences"
    elif "cultural community" in last_message or "specific culture" in last_message:
        return "culture_preferences"
    elif "1️⃣" in last_message or "2️⃣" in last_message or "3️⃣" in last_message:
        return "options_presented"
    elif "select option" in last_message or "which option" in last_message:
        return "selection_inquiry"
    elif "address:" in last_message and "phone:" in last_message:
        return "details_provided"
    
    return "general_conversation"  # Default state

def extract_user_preferences(user_input, history):
    """
    Extract user preferences from the current message and conversation history.
    """
    preferences = {
        'service_type': None,
        'days': [],
        'times': [],
        'food_type': [],
        'distribution': [],
        'culture': [],
        'selected_option': None,
        'location': None
    }
    
    # Convert user input to lowercase for easier matching
    user_input_lower = user_input.lower()
    
    # Extract service type preferences
    service_types = {
        'food bank': 'food_bank',
        'food pantry': 'food_bank',
        'food assistance': 'food_bank',
        'financial assistance': 'financial_assistance',
        'financial help': 'financial_assistance',
        'housing': 'housing',
        'shelter': 'housing'
    }
    
    for service_phrase, service_type in service_types.items():
        if service_phrase in user_input_lower:
            preferences['service_type'] = service_type
            break
    
    # Extract day preferences
    days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", 
            "mon", "tue", "wed", "thu", "fri", "sat", "sun", 
            "weekend", "weekday"]
    
    for day in days:
        if day in user_input_lower:
            if day == "weekend":
                preferences['days'].extend(["saturday", "sunday"])
            elif day == "weekday":
                preferences['days'].extend(["monday", "tuesday", "wednesday", "thursday", "friday"])
            elif day in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]:
                # Map abbreviations to full day names
                day_mapping = {
                    "mon": "monday", "tue": "tuesday", "wed": "wednesday", 
                    "thu": "thursday", "fri": "friday", "sat": "saturday", "sun": "sunday"
                }
                preferences['days'].append(day_mapping.get(day, day))
            else:
                preferences['days'].append(day)
    
    # Extract time preferences
    time_indicators = ["morning", "afternoon", "evening", "night", "am", "pm"]
    for indicator in time_indicators:
        if indicator in user_input_lower:
            preferences['times'].append(indicator)
    
    # Extract food type preferences
    food_types = ["groceries", "meal", "meals", "prepared", "boxed", "pre-bagged", "loose"]
    for food_type in food_types:
        if food_type in user_input_lower:
            preferences['food_type'].append(food_type)
    
    # Extract distribution preferences
    distribution_methods = ["walk", "walk-up", "drive", "drive-through", "delivery", "pickup"]
    for method in distribution_methods:
        if method in user_input_lower:
            preferences['distribution'].append(method)
    
    # Extract cultural preferences
    cultures = ["asian", "african", "latin", "hispanic", "middle eastern", "european", "south asian", "east asian"]
    for culture in cultures:
        if culture in user_input_lower:
            preferences['culture'].append(culture)
    
    # Check for option selection (1, 2, or 3)
    option_indicators = ["option 1", "option 2", "option 3", "option one", "option two", "option three", 
                        "first option", "second option", "third option", "1", "2", "3",
                        "number 1", "number 2", "number 3", "choice 1", "choice 2", "choice 3"]
    
    for i, indicator in enumerate(option_indicators):
        if indicator in user_input_lower:
            # Map to option numbers 1, 2, or 3
            option_mapping = i % 3 + 1
            preferences['selected_option'] = option_mapping
            break
    
    # Extract location information from previous messages
    for msg in history:
        if msg["role"] == "user":
            content = msg["content"].lower()
            # Look for location indicators in previous messages
            location_indicators = ["zip code", "zipcode", "zip", "located in", "address", "live in", "near", "close to"]
            for indicator in location_indicators:
                if indicator in content:
                    # Very simple extraction - in production, you'd use more sophisticated NLP
                    # or a dedicated location extraction service
                    preferences['location'] = content
                    break
    
    return preferences

def score_and_filter_food_banks(food_banks, preferences, lat=None, lng=None):
    """
    Score and filter food banks based on user preferences.
    """
    # Score each food bank based on user preferences
    scored_banks = []
    for bank in food_banks:
        if bank.get("status", "").lower() != "active":
            continue  # Skip inactive food banks
        
        score = 0
        
        # Score based on distance if coordinates are available
        if lat and lng and "lat" in bank and "lng" in bank:
            distance = haversine(lat, lng, bank["lat"], bank["lng"])
            bank["distance"] = round(distance, 1)
            
            # Higher score for closer food banks (inverted distance)
            # Maximum score of 30 for very close locations
            proximity_score = max(0, 30 - distance)
            score += proximity_score
        
        # Score based on day preferences
        bank_hours = bank.get("hours", [])
        for hour in bank_hours:
            hour_lower = hour.lower()
            for day_pref in preferences.get('days', []):
                if day_pref in hour_lower:
                    score += 10  # High priority for matching days
        
        # Score based on food type preferences
        food_formats = bank.get("food_format", [])
        for format in food_formats:
            format_lower = format.lower()
            for food_pref in preferences.get('food_type', []):
                if food_pref in format_lower:
                    score += 8  # High priority for matching food types
        
        # Score based on distribution preferences
        dist_models = bank.get("distribution_models", [])
        for model in dist_models:
            model_lower = model.lower()
            for dist_pref in preferences.get('distribution', []):
                if dist_pref in model_lower:
                    score += 8  # High priority for matching distribution
        
        # Score based on cultural preferences
        cultures = bank.get("cultures", [])
        for culture in cultures:
            culture_lower = culture.lower()
            for culture_pref in preferences.get('culture', []):
                if culture_pref in culture_lower:
                    score += 12  # Very high priority for matching cultures
        
        # Additional scoring factors
        if "by_appointment" in bank and bank["by_appointment"] == "No":
            score += 2  # Slight preference for walk-ins
        
        # If no specific preferences, prioritize food banks with more available hours
        if not (preferences.get('days') or preferences.get('food_type') or preferences.get('distribution')):
            score += len(bank.get("hours", [])) * 0.5
        
        # Add to scored banks with score
        scored_banks.append((bank, score))
    
    # Sort by score (descending)
    scored_banks.sort(key=lambda x: x[1], reverse=True)
    
    # Take top results
    return [bank for bank, score in scored_banks[:10]]

@app.route('/api/chat', methods=['POST'])
def chat():
    try:
        data = request.json
        user_input = data.get('message', '')
        chat_history = data.get('history', [])
        user_language = data.get('language', 'english').lower()
        user_location = data.get('location', None)
        
        print(f"Received message: {user_input} (Language: {user_language})")
        
        # Initialize history with system prompt if it's empty
        if not chat_history:
            system_prompt = get_detailed_system_prompt()
            
            # Add language instruction
            if user_language == 'spanish':
                system_prompt += "\n\nRespond to the user in Spanish. Be sure to use proper Spanish grammar and vocabulary."
            
            history = [
                {"role": "system", "content": system_prompt}
            ]
        else:
            history = chat_history
        
        # Add user input to history
        history.append({"role": "user", "content": user_input})

        # Analyze conversation state and extract preferences
        conversation_state = analyze_conversation_state(history)
        
        # Extract user preferences from the current message and conversation history
        preferences = extract_user_preferences(user_input, history)
        
        # Find relevant food banks based on extracted preferences and conversation state
        relevant_banks = []
        
        if food_banks and (preferences.get('location') or user_location):
            # Get location data
            lat, lng = None, None
            if user_location:
                lat = user_location.get('latitude')
                lng = user_location.get('longitude')
            
            # Score and filter food banks
            relevant_banks = score_and_filter_food_banks(food_banks, preferences, lat, lng)
        
        # Prepare context with relevant food banks and conversation state
        if relevant_banks:
            context_data = relevant_banks[:5]  # Limit to 5 to avoid token issues
            
            # Format extracted preferences for the AI
            preferences_list = []
            for key, value in preferences.items():
                if value and key != 'location':
                    if isinstance(value, list):
                        if value:  # Only add if the list is not empty
                            preferences_list.append(f"Preferred {key}: {', '.join(value)}")
                    else:
                        preferences_list.append(f"Preferred {key}: {value}")
            
            preferences_str = "No specific preferences detected." if not preferences_list else "\n".join(preferences_list)
            
            context = f"""
Based on the conversation so far, here's what I understand about the user's needs:
{preferences_str}

Current conversation state: {conversation_state}

Here are the top food banks that might be relevant (limited to 3 for presentation):
{json.dumps(context_data[:3], indent=2)}

Please continue the conversation according to the system prompt instructions. 
If the user has selected a specific option (1, 2, or 3), provide detailed information about that option.
Otherwise, continue with appropriate follow-up questions based on the conversation state.
Respond in {'Spanish' if user_language == 'spanish' else 'English'}.
Remember to show only the top 3 options if presenting a list of food banks.
"""
        else:
            context = """
No food banks found matching the query or location information is missing. 
Continue the conversation to gather more information about the user's needs and location.
Respond in a helpful, conversational way.
"""
        
        # Add context as a system message
        history.append({"role": "system", "content": context})

        # Get response from OpenAI
        try:
            print("Sending request to OpenAI...")
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Or use a more capable model if available
                messages=history,
                temperature=0.7  # Slightly creative while staying informative
            )
            
            # Extract assistant response
            assistant_message = response.choices[0].message.content.strip()
            print(f"Received response from OpenAI: {assistant_message[:50]}...")
            
            # Add assistant response to history
            history.append({"role": "assistant", "content": assistant_message})
            
            # Remove the temporary context message
            if len(history) > 3 and history[-3]["role"] == "system" and "conversation state" in history[-3]["content"]:
                history.pop(-3)
                
            return jsonify({
                'message': assistant_message,
                'history': history
            })
            
        except Exception as e:
            print(f"OpenAI API error: {str(e)}")
            return jsonify({
                'message': "I'm having trouble accessing my database right now. Could you please try again in a moment?",
                'error': str(e)
            }), 500
    
    except Exception as e:
        print(f"Server error: {str(e)}")
        return jsonify({
            'message': "Sorry, there was a problem processing your request. Please try again.",
            'error': str(e)
        }), 500

@app.route('/api/set-location', methods=['POST'])
def set_location():
    try:
        data = request.json
        lat = data.get('latitude')
        lng = data.get('longitude')
        
        nearby_banks = []
        
        if lat and lng and food_banks:
            # Find nearby food banks
            for bank in food_banks:
                if "lat" in bank and "lng" in bank:
                    distance = haversine(lat, lng, bank["lat"], bank["lng"])
                    if distance < 20:  # Within 20 miles
                        bank_with_distance = bank.copy()
                        bank_with_distance["distance"] = round(distance, 1)
                        nearby_banks.append(bank_with_distance)
            
            # Sort by distance
            nearby_banks.sort(key=lambda x: x["distance"])
            
            # Limit results
            nearby_banks = nearby_banks[:10]
        
        return jsonify({
            'success': True,
            'nearby_food_banks': nearby_banks
        })
        
    except Exception as e:
        print(f"Location error: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Add an endpoint to upload food bank data for teams without the file
@app.route('/api/upload-data', methods=['POST'])
def upload_data():
    try:
        # Check if file was uploaded
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        # If user doesn't select file
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file:
            # Save the file temporarily
            temp_path = os.path.join(os.getcwd(), 'temp_food_banks.json')
            file.save(temp_path)
            
            # Try to load the data
            try:
                with open(temp_path, 'r') as f:
                    global food_banks
                    food_banks = json.load(f)
                
                # Optionally clean up
                # os.remove(temp_path)
                
                return jsonify({
                    'success': True,
                    'message': f'Successfully loaded {len(food_banks)} food banks',
                    'count': len(food_banks)
                })
            except Exception as e:
                return jsonify({'error': f'Error loading file: {str(e)}'}), 500
    
    except Exception as e:
        return jsonify({'error': f'Server error: {str(e)}'}), 500

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