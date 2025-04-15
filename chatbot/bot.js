const express = require('express'); 
const bodyParser = require('body-parser');
const twilio = require('twilio');

// Initialize the app
const app = express();
const port = process.env.PORT || 3000;

// Twilio credentials (replace with your own)
const accountSid = 'AC249a5caff859ad8e692da778b24f4997';  // Replace with your Twilio SID
const authToken = '89892afbadc016a4d44b90b15cb61fd5';  // Replace with your Twilio Auth Token
const client = new twilio(accountSid, authToken);

// Use body-parser to handle incoming POST requests
app.use(bodyParser.urlencoded({ extended: false }));

// POST endpoint to send SMS
app.post('/send-sms', (req, res) => {
    const { To, Body } = req.body;

    // Log the incoming data for debugging
    console.log("Received request to send SMS:", req.body);
    console.log(`Sending SMS to ${To} with message: ${Body}`);

    // Validate if both parameters are available
    if (!To || !Body) {
        return res.status(400).send('Missing "To" or "Body" parameter');
    }

    // Send SMS using Twilio API
    client.messages.create({
        body: Body,
        to: To,  // Recipient's phone number
        from: "+17622542816"  // Your valid Twilio number
    })
    .then(() => {
        console.log('SMS sent successfully');
        res.send("SMS sent successfully!");
    })
    .catch((err) => {
        console.error('Error sending SMS:', err);
        res.status(500).send("Error sending the SMS");
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

