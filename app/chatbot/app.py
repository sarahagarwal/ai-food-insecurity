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
    # Specify the exact path provided by the user
    specific_path = 'C:/Users/sriva/ai-food-insecurity/ai-food-insecurity/app/chatbot/data/foodbanks_with_geocodes.json'
    
    try:
        print(f"Attempting to load food banks from: {specific_path}")
        with open(specific_path, 'r') as file:
            data = json.load(file)
            print(f"Successfully loaded {len(data)} food banks from {specific_path}")
            return data
    except Exception as e:
        print(f"Error loading from {specific_path}: {str(e)}")
        
        # If the specific path fails, try a few common relative paths as fallback
        possible_paths = [
            os.path.join(os.getcwd(), 'data', 'foodbanks_with_geocodes.json'),
            os.path.join(os.getcwd(), 'foodbanks_with_geocodes.json'),
            os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data', 'foodbanks_with_geocodes.json')
        ]
        
        for path in possible_paths:
            try:
                print(f"Trying fallback path: {path}")
                with open(path, 'r') as file:
                    data = json.load(file)
                    print(f"Successfully loaded {len(data)} food banks from {path}")
                    return data
            except Exception as fallback_error:
                print(f"Fallback path failed: {path} - {str(fallback_error)}")
        
        # All paths failed, return an empty list
        print("All paths failed, no food banks loaded")
        return []

# Try to load the food bank data
food_banks = load_food_bank_data()
print(f"Loaded {len(food_banks)} food banks for use in chatbot.")

# Create a detailed system prompt with instructions for tailored recommendations
SYSTEM_PROMPT_TEMPLATE = """
You are a friendly assistant for finding local assistance and support services. Your goal is to guide users through a conversation to understand their needs and provide personalized recommendations.

Follow this conversation flow with users:
1. Begin with a warm greeting and ask what type of service they're looking for (food bank, healthcare, housing, financial assistance, legal services, job training, etc.)
2. Ask for their location information (to find nearby services)
3. Ask about their availability (preferred days/times)
4. Ask follow-up questions based on the service they need:
   - For FOOD assistance: Ask about food type preferences and distribution method preferences
   - For HEALTHCARE: Ask about specific medical needs (general checkup, dental, vision, etc.)
   - For HOUSING: Ask about emergency vs. long-term needs
   - For FINANCIAL ASSISTANCE: Ask about the type of help needed (bills, rent, etc.)
   - For LEGAL SERVICES: Ask about the type of legal issue they're facing
   - For JOB TRAINING: Ask about skills or industries of interest

After collecting this information, recommend the TOP 3 MOST RELEVANT options only, formatted like this:
1️⃣ [NAME] - [X.X] miles away
   • ✅ [Preference that matches]
   • ✅ [Another preference that matches]
   • ⚠️ [Important limitation to know]

2️⃣ [NAME] - [X.X] miles away
   [Similar preference matches]

3️⃣ [NAME] - [X.X] miles away
   [Similar preference matches]

Then ask them to select option 1, 2, or 3 to learn more details.

When they select an option, provide complete details about that specific location:
📍 [NAME]
- Address: [address]
- Phone: [phone]
- Distance: [X.X] miles away
- Hours: [day: time]
- Services: [services offered]
- Cultural Communities: [cultures served]
- Requirements: [requirements or "None"]

Be conversational and empathetic throughout - users may be in difficult situations.
Ask one question at a time and wait for user responses.
Respond in the user's language (English, Spanish, or other requested languages).

Current day and time (for reference): {current_datetime}

When user preferences can't be fully met, explain which preferences can be satisfied and which cannot.

If a user asks for services at unusual times, politely explain typical service hours and offer alternatives.

When no exact matches are found in the user's immediate area, automatically expand your search to nearby areas and inform the user.

If a user specifically requests options only in a specific location, respect that constraint and clearly explain which preferences can't be met within that area.
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
    States now include service-specific states.
    """
    # Default to greeting if not enough history
    if len(history) < 3:
        return "greeting"
    
    # Skip system messages and analyze only assistant messages
    assistant_messages = [msg["content"] for msg in history if msg["role"] == "assistant"]
    user_messages = [msg["content"].lower() for msg in history if msg["role"] == "user"]
    
    # Check if we have both service and location info to show results
    service_terms = ["food bank", "housing", "healthcare", "financial assistance", 
                    "legal services", "job training"]
    
    service_detected = any(term in " ".join(user_messages) for term in service_terms)
    location_detected = any(term in " ".join(user_messages) for term in ["near", "in", "at", "zip", "address", "located"])
    
    # If we have both service and location, we can show results
    if service_detected and location_detected:
        return "should_show_results"
    
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
    elif "healthcare" in last_message and "need" in last_message:
        return "healthcare_inquiry"
    elif "housing" in last_message and "need" in last_message:
        return "housing_inquiry"
    elif "financial" in last_message and "assistance" in last_message:
        return "financial_inquiry"
    elif "legal" in last_message and "services" in last_message:
        return "legal_inquiry"
    elif "job" in last_message and "training" in last_message:
        return "job_training_inquiry"
    
    # Food-specific states
    elif "prefer loose groceries" in last_message or "what type of food" in last_message:
        return "food_preferences"
    elif "walk-up" in last_message or "drive-through" in last_message:
        return "distribution_preferences"
    
    # Results states
    elif "1️⃣" in last_message or "2️⃣" in last_message:
        return "options_presented"
    elif "select option" in last_message:
        return "selection_inquiry"
    elif "address:" in last_message and "phone:" in last_message:
        return "details_provided"
    
    return "general_conversation"  # Default state

def extract_user_preferences(user_input, history):
    """
    Extract user preferences from the current message and conversation history.
    """
    preferences = {
        'service_type': [],  # Changed to list to support multiple services
        'days': [],
        'times': [],
        'food_type': [],
        'distribution': [],
        'culture': [],
        'selected_option': None,
        'location': None,
        'strict_location': False,
        'healthcare': False,
        'housing': False,
        'financial': False,
        'legal': False,
        'job_training': False
    }
    
    # Convert user input to lowercase for easier matching
    user_input_lower = user_input.lower()
    
    # Extract service type preferences
    service_map = {
        'food bank': 'food_bank',
        'food pantry': 'food_bank',
        'food assistance': 'food_bank',
        'financial assistance': 'financial',
        'financial help': 'financial',
        'money': 'financial',
        'housing': 'housing',
        'shelter': 'housing',
        'home': 'housing',
        'healthcare': 'healthcare',
        'health care': 'healthcare',
        'medical': 'healthcare',
        'doctor': 'healthcare',
        'legal': 'legal',
        'lawyer': 'legal',
        'job': 'job_training',
        'employment': 'job_training',
        'work': 'job_training',
        'training': 'job_training',
    }
    
    for service_phrase, service_type in service_map.items():
        if service_phrase in user_input_lower:
            # Add to list if not already present
            if service_type not in preferences['service_type']:
                preferences['service_type'].append(service_type)
            
            # Also set the specific flag for easier checking
            if service_type in preferences:
                preferences[service_type] = True
    
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
    
    # Extract location information
    location_indicators = ["in", "near", "around", "at", "close to"]
    cities = ["gaithersburg", "rockville", "silver spring", "bethesda", "washington", "dc", 
              "montgomery", "maryland", "virginia", "arlington"]
    
    # Check for phrases that indicate strict location preference
    strict_location_phrases = ["only in", "just in", "specifically in", "must be in"]
    for phrase in strict_location_phrases:
        if phrase in user_input_lower:
            preferences['strict_location'] = True
            break
    
    # Try to find location in current message
    for indicator in location_indicators:
        indicator_phrase = indicator + " "
        if indicator_phrase in user_input_lower:
            indicator_pos = user_input_lower.find(indicator_phrase)
            remaining_text = user_input_lower[indicator_pos + len(indicator_phrase):]
            
            for city in cities:
                if city in remaining_text[:30]:  # Look for city in next 30 chars
                    preferences['location'] = city
                    break
    
    # Check for zip codes
    import re
    zip_matches = re.findall(r'\b\d{5}\b', user_input_lower)
    if zip_matches:
        preferences['location'] = zip_matches[0]  # Use the first zip code found
    
    # If location not found in current message, check history
    if not preferences['location']:
        for msg in history:
            if msg["role"] == "user":
                content = msg["content"].lower()
                # Look for location indicators in previous messages
                for indicator in location_indicators:
                    indicator_phrase = indicator + " "
                    if indicator_phrase in content:
                        indicator_pos = content.find(indicator_phrase)
                        remaining_text = content[indicator_pos + len(indicator_phrase):]
                        
                        for city in cities:
                            if city in remaining_text[:30]:
                                preferences['location'] = city
                                break
                
                # Also check for zip codes in history
                zip_matches = re.findall(r'\b\d{5}\b', content)
                if zip_matches:
                    preferences['location'] = zip_matches[0]
    
    return preferences
def score_and_filter_food_banks(providers, preferences, lat=None, lng=None, search_radius=10):
    # This should just call the implementation function with the same parameters
    return score_and_filter_service_providers(providers, preferences, lat, lng, search_radius)

def score_and_filter_service_providers(providers, preferences, lat=None, lng=None, search_radius=10):
    """
    Score and filter service providers based on user preferences with expanded radius search.
    search_radius: initial radius to search in miles
    """
    # Score each provider based on user preferences
    scored_providers = []
    exact_matches = []
    partial_matches = []
    
    # Track which preferences we're looking for
    wanted_features = {
        'service_type': preferences.get('service_type', []),
        'food_type': preferences.get('food_type', []),
        'distribution': preferences.get('distribution', []),
        'days': preferences.get('days', []),
        'culture': preferences.get('culture', [])
    }
    
    # Check if looking for a strict location match
    strict_location = preferences.get('strict_location', False)
    location_name = preferences.get('location')
    
    for provider in providers:
        if provider.get("status", "").lower() != "active":
            continue  # Skip inactive providers
        
        score = 0
        matches = []  # Track which preferences match
        missing_preferences = []  # Track which preferences aren't matched
        
        # Score based on distance if coordinates are available
        if lat and lng and "lat" in provider and "lng" in provider:
            distance = haversine(lat, lng, provider["lat"], provider["lng"])
            provider["distance"] = round(distance, 1)
            
            # If strict location and outside search radius, skip
            if strict_location and distance > search_radius:
                continue
                
            # Higher score for closer providers (inverted distance)
            proximity_score = max(0, 40 - distance * 2)  # Increased weight for proximity
            score += proximity_score
            
            # Add distance info to matches
            matches.append(f"📍 {distance} miles away")
        
        # Score based on services offered
        service_match = False
        provider_services = provider.get("services", [])
        
        # For each service the user wants
        for service_pref in preferences.get('service_type', []):
            service_found = False
            
            # Map our internal service types to terms in the database
            service_terms = {
                'food_bank': ['food', 'meals', 'groceries', 'pantry'],
                'financial': ['financial assistance', 'financial advising', 'money'],
                'housing': ['housing', 'shelter'],
                'healthcare': ['healthcare', 'health', 'medical', 'behavioral healthcare'],
                'legal': ['legal'],
                'job_training': ['job training', 'workforce', 'employment']
            }
            
            # Check if the provider offers this service
            search_terms = service_terms.get(service_pref, [service_pref])
            
            for service in provider_services:
                service_lower = service.lower()
                for term in search_terms:
                    if term in service_lower:
                        score += 20  # High priority for matching services
                        service_found = True
                        service_match = True
                        matches.append(f"✅ Offers {service}")
                        break
                if service_found:
                    break
                    
            if not service_found and service_pref:
                missing_preferences.append(f"{service_pref} services")
                
        if not service_match and preferences.get('service_type'):
            # If we didn't find any of the requested services, major issue
            score -= 50
        
        # Continue with the rest of your scoring logic (days, food type, etc.)
        # ...
        
        # Add matches info to provider for display in results
        provider["matches"] = matches
        provider["missing_preferences"] = missing_preferences
        
        # Add to scored providers with score
        scored_providers.append((provider, score))
        
        # If this is an exact match (no missing preferences), add to exact matches
        if not missing_preferences:
            exact_matches.append((provider, score))
        else:
            partial_matches.append((provider, score))
    
    # If we found exact matches, return those
    if exact_matches:
        exact_matches.sort(key=lambda x: x[1], reverse=True)
        return [provider for provider, score in exact_matches[:10]], False, search_radius
        
    # If strict location and no exact matches, return partial matches for that location
    if strict_location and partial_matches:
        partial_matches.sort(key=lambda x: x[1], reverse=True)
        return [bank for bank, score in partial_matches[:10]], True, search_radius
    
    # If no exact matches in the initial radius, EXPAND the search
    # by recursively calling this function with a larger radius, unless strict location
    if not exact_matches and not partial_matches and not strict_location and search_radius < 50:
        expanded_results, compromises_made, new_radius = score_and_filter_food_banks(
            food_banks, preferences, lat, lng, search_radius + 15)
        return expanded_results, True, new_radius
    
    # If we've expanded but still no exact matches, return partial matches
    partial_matches.sort(key=lambda x: x[1], reverse=True)
    return [bank for bank, score in partial_matches[:10]], True, search_radius

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
        compromises_made = False
        search_radius = 10
        
        if food_banks and (preferences.get('location') or user_location):
            # Get location data
            lat, lng = None, None
            if user_location:
                lat = user_location.get('latitude')
                lng = user_location.get('longitude')
            
            # Score and filter food banks with new function signature
            relevant_banks, compromises_made, search_radius = score_and_filter_food_banks(
                food_banks, preferences, lat, lng, search_radius)
        
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

The search radius was {search_radius} miles.
Did we need to make compromises: {'Yes' if compromises_made else 'No'}
"""
            # If compromises were made, instruct the AI on how to handle
            if compromises_made:
                context += """
We had to make compromises to find relevant options. Please explain this to the user by:
1. Clearly stating which preferences couldn't be fully met
2. Explaining we expanded the search radius to find better matches
3. For each result, highlight which preferences it DOES satisfy using the "matches" information
4. If the user specified a strict location, emphasize you're only showing results from that area
"""

            context += f"""
Please continue the conversation according to the system prompt instructions.
If the user has selected a specific option (1, 2, or 3), provide detailed information about that option.
Otherwise, continue with appropriate follow-up questions based on the conversation state.
Respond in {'Spanish' if user_language == 'spanish' else 'English'}.
Remember to show only the top 3 options if presenting a list of food banks.
"""

            # If state indicates we should show results without confirmation
            if conversation_state == "should_show_results":
                context += "\nThe user has provided enough information. Show them the food bank options immediately without asking for further confirmation."
        else:
            if not relevant_banks:
                context = """
No food banks found matching the query or location information is missing. 
If location was provided but no results found, explain that we couldn't find any matching services
in that area and suggest they try a different location or a broader search.
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