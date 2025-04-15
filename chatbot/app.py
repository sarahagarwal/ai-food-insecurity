import os
from flask import Flask, request
from twilio.twiml.messaging_response import MessagingResponse
import json
import requests
from math import radians, sin, cos, sqrt, atan2

# Flask setup
app = Flask(__name__)

# Load foodbanks data (replace with actual path)
with open('C:/Users/sriva/ai-food-insecurity/ai-food-insecurity/data/foodbanks_with_geocodes.json', 'r') as file:
    foodbanks = json.load(file)

# Google Maps API function to get coordinates from ZIP code
def get_coordinates(zip_code):
    google_api_key = "YOUR_GOOGLE_API_KEY"
    url = f"https://maps.googleapis.com/maps/api/geocode/json?address={zip_code}&key={google_api_key}"
    response = requests.get(url).json()

    if response["status"] == "OK":
        location = response["results"][0]["geometry"]["location"]
        return (location["lat"], location["lng"])
    return None

# Haversine formula to calculate distance between two coordinates
def calculate_distance(user_coords, pantry_coords):
    R = 6371.0  # Radius of Earth in km
    lat1, lon1 = radians(user_coords[0]), radians(user_coords[1])
    lat2, lon2 = radians(pantry_coords[0]), radians(pantry_coords[1])
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = sin(dlat / 2)**2 + cos(lat1) * cos(lat2) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c

# Filter foodbanks based on user input
def filter_foodbanks(foodbanks, user_coords, services_needed, preferred_hours, max_distance_km=10):
    filtered = []
    for pantry in foodbanks:
        # If no services are available, skip this pantry
        if not pantry.get("services"):
            pantry["services"] = []
        
        # Calculate distance
        pantry_coords = (pantry['lat'], pantry['lng'])
        distance = calculate_distance(user_coords, pantry_coords)
        
        # Filter foodbanks based on distance and services
        if distance <= max_distance_km:
            if services_needed.lower() in pantry['services'] or not services_needed:
                if any(hour for hour in pantry['hours'] if preferred_hours.lower() in hour.lower()):
                    pantry['distance'] = distance
                    filtered.append(pantry)
    
    return filtered

# Twilio webhook to handle incoming messages
@app.route("/sms", methods=['POST'])
def sms_reply():
    # Get the user's phone number and message
    phone = request.form['From']
    message_body = request.form['Body'].strip()
    twiml = MessagingResponse()

    # Process user input, simulate flow with basic checks
    if message_body.isdigit() and len(message_body) == 5:  # ZIP Code received
        user_coords = get_coordinates(message_body)
        if user_coords:
            twiml.message("What type of service do you need? (e.g., groceries, hot meals, etc.)")
        else:
            twiml.message("Sorry, we couldn't find that ZIP code. Please try again.")
    elif "groceries" in message_body.lower() or "hot meals" in message_body.lower():  # Service type
        twiml.message("Do you have preferred hours for service? (e.g., weekdays, weekends, etc.)")
    else:  # Collecting hours
        services_needed = "groceries"  # Hardcoded for testing purposes
        preferred_hours = message_body
        # Perform filtering for the nearest food pantries
        filtered_foodbanks = filter_foodbanks(foodbanks, user_coords, services_needed, preferred_hours)
        top_3_foodbanks = sorted(filtered_foodbanks, key=lambda x: x['distance'])[:3]

        # Send the results to the user
        response = "Here are the top 3 food pantries near you:\n"
        for i, pantry in enumerate(top_3_foodbanks, 1):
            response += f"{i}. {pantry['name']}\n"
            response += f"   Address: {pantry['address']}\n"
            response += f"   Distance: {pantry['distance']:.2f} km\n"
            response += f"   Services: {', '.join(pantry['services']) if pantry['services'] else 'N/A'}\n"
            response += f"   Hours: {', '.join(pantry['hours'])}\n"
            response += f"   Phone: {pantry['phone']}\n"
            response += f"   Map: https://maps.google.com?q={pantry['lat']},{pantry['lng']}\n\n"
        twiml.message(response)

    return str(twiml)

if __name__ == "__main__":
    app.run(debug=True)
