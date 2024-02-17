// receiver.ts
const { verifyAuthorizationHeader } = require("./cryptoUtils");
const { config } = require("./config");
const express = require('express');
const { Request, Response } = require('express');

const app = express();
app.use(express.json());

// Route for receiving messages
app.post('/receive-message', async (req, res) => {
    try {
        console.log("Welcome to receiver side");
        // Extract received message and authorization header
        const receivedMessage = req.body.message;
        const authorizationHeader = req.headers.authorization;

        console.log(authorizationHeader);
        console.log(receivedMessage);
        // Verify the received authorization header
        const verified = await verifyAuthorizationHeader(authorizationHeader, receivedMessage);

         // If verified, proceed with processing the message
        if (verified) {

            // Respond with success message
            res.status(200).json({ message: 'Message received and verified successfully' });
        } else {
            // Respond with unauthorized status
            res.status(401).json({ verified: verified, error: 'Unauthorized' });
        }
    } catch (error) {
        // Handle any errors
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start the server
const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Receiver's server is running on port ${PORT}`);
});
