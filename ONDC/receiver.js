// receiver.ts
const { verifyHeader } = require("./cryptoUtils");
const { config } = require("./config");
const express = require('express');
const { Request, Response } = require('express');

const app = express();
app.use(express.json());

// Route for receiving messages
app.post('/receive-message', async (req, res) => {
    try {
        // Extract received message and authorization header
        const receivedMessage = req.body.message;
        const authorizationHeader = req.headers.authorization;

        // Assuming publicKey is defined somewhere
        const publicKey = 'cjbhP0PFyrlSCNszJM1F/YmHDVAWsZqJUPzojnE/7TJU3fJ/rmIlgaUHEr5E0/2PIyf0tpSnWtT6cyNNlpmoAQ==';

        console.log(authorizationHeader);
        console.log(receivedMessage);
        console.log(publicKey);
        // Verify the received authorization header
        const verified = await verifyHeader(authorizationHeader, receivedMessage, publicKey);

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
