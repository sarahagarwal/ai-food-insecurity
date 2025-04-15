from openai import OpenAI
import json
import os


client = OpenAI(
  api_key="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"
)

# Load food bank data from JSON file
def load_food_bank_data(filename):
    with open(filename, 'r') as file:
        return json.load(file)

# Main chat loop
def chat():
    # Load the food bank data
    try:
        food_banks = load_food_bank_data('food_banks.json')  # Adjust filename as needed
        print(f"Loaded {len(food_banks)} food banks from data file.")
    except Exception as e:
        print(f"Error loading food bank data: {e}")
        food_banks = []

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
    
    history = [
        {"role": "system", "content": system_prompt}
    ]

    print("Food Bank Chatbot is ready! Type something (or type 'exit' to quit):")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit", "bye"]:
            print("Chatbot: Bye!")
            break

        # Add user input to history
        history.append({"role": "user", "content": user_input})

        # If user is asking about food banks, we'll need to include relevant data
        # This is a simple approach - for more complex queries, you might want to filter relevant food banks
        if any(keyword in user_input.lower() for keyword in ["food bank", "food", "bank", "hungry", "help", "location"]):
            # For specific location queries, we could filter the food banks here
            # For now, we'll just include some recent food banks as context
            context_data = food_banks[:5]  # Limit to 5 to avoid token limits
            context = f"Here are some food banks that might be relevant: {json.dumps(context_data)}"
            
            # Add context as a system message
            history.append({"role": "system", "content": context})

        # Get response from OpenAI
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # Or "gpt-3.5-turbo" or "gpt-4"
                messages=history
            )
            
            # Extract and print assistant response
            assistant_message = response.choices[0].message.content.strip()
            print("Chatbot:", assistant_message)
            
            # Add assistant response to history
            history.append({"role": "assistant", "content": assistant_message})
            
            # Remove the temporary context message if we added one
            if len(history) > 3 and history[-3]["role"] == "system" and "food banks that might be relevant" in history[-3]["content"]:
                history.pop(-3)
                
        except Exception as e:
            print(f"Error getting response: {e}")

# Start the chat
if __name__ == "__main__":
    chat()
