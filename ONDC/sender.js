const express = require('express');
const fetch = require('node-fetch');
const { createSigningString, signMessage, createAuthorizationHeader } = require("./cryptoUtils");
const { config } = require("./config");

const app = express();
app.use(express.json());

const url = 'http://localhost:4000/receive-message'; // Assuming receiver's server is running at this URL

app.post('/send-message', async (req, res) => {
    try {
        const message = req.body.message; // Assuming the message body is sent in the request body

        // Create the signing string
        const { signing_string, expires, created } = await createSigningString(JSON.stringify(message));

        // Sign the message
        const signature = await signMessage(signing_string, config.sign_private_key);

        // Construct the authorization header
        const authorizationHeader = await createAuthorizationHeader(message);

        console.log("auth:", authorizationHeader);
        // Make a POST request with the message and authorization header to the receiver

        res.status(500).json({ Authorization: authorizationHeader});
        // const response = await fetch(url, {
        //     method: 'POST',
        //     body: JSON.stringify(message),
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': authorizationHeader
        //     }
        // });


        // if (response.ok) {
        //     // Extract response data
        //     const responseData = await response.json();

        //     // Log the response data
        //     console.log('Response Data:', responseData);

        //     // Send the response received from the receiver back to the client (Postman)
        //     res.status(response.status).json(responseData);
        // } else {
        //     // Handle the case where the server responds with an error
        //     console.error('Error:', response.statusText);
        //     res.status(response.status).json({ error: response.statusText });
        // }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sender's server is running on port ${PORT}`);
});
