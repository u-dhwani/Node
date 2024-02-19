const express = require('express');
const fetch = require('node-fetch');
const { createSigningString, signMessage, createAuthorizationHeader, createKeyPair } = require("./cryptoUtils");
const { config } = require("./config");

const app = express();
app.use(express.json());


app.post('/send-message', async (req, res) => {
    try {
        const message = req.body.message; // Assuming the message body is sent in the request body

        // Construct the authorization header
        const authorizationHeader = await createAuthorizationHeader(message);

        console.log("auth:", authorizationHeader);
        // Make a POST request with the message and authorization header to the receiver

        res.status(500).json({ Authorization: authorizationHeader });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sender's server is running on port ${PORT}`);
});
