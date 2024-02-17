# ONDC Signing Verification using BLAKE-512

## Overview

This project demonstrates how to implement ONDC (Open Network for Digital Commerce) signing verification using BLAKE-512 hashing algorithm. It involves signing and verifying messages exchanged between a sender and receiver.

## Implementation Details

### Crypto Utils

The `cryptoUtils` module provides various functions for cryptographic operations:

- `createKeyPair`: Asynchronously generates a key pair for signing messages.
- `createSigningString`: Creates a signing string for a given message.
- `signMessage`: Signs a given signing string using the private key.
- `verifyMessage`: Verifies the integrity of a signed message.
- `createAuthorizationHeader`: Creates an authorization header for secure message exchange.
- `verifyHeader`: Verifies the integrity of an authorization header.
- `extractKeyId`: Extracts key information from the provided authorization header.
- `verifyAuthorizationHeader`: Verifies the integrity of the provided authorization header and message.

### Configuration (Config)

The configuration includes parameters such as:
- `bap_id`: Subscriber ID of the Business Activity Provider (BAP).
- `unique_key_id`: Unique key ID associated with the BAP.
- `sign_private_key`: Private key used for signing messages.

## Sender

### `/send-message` Endpoint

Handles POST requests for sending messages securely.
Expects a JSON object containing a message property in the request body.
Creates a signing string for the message, signs it, and constructs an authorization header.
Logs the generated authorization header.
Responds with a JSON object containing the generated authorization header in the Authorization field.
Handles errors by logging them and responding with an internal server error.

#### Flow

- `/send-message` Endpoint → `createAuthorizationHeader` → `createSigningString` → `signMessage`


## Receiver

### `/receive-message` Endpoint

Handles POST requests for receiving and verifying messages.
Expects a JSON object containing a message property in the request body.
Retrieves the authorization header from the request headers.
Verifies the authorization header and the received message using cryptographic utilities.
If the verification is successful, respond with a success message and HTTP status 200.
If the verification fails, respond with an unauthorized error and HTTP status 401.
Handles errors by logging them and responding with an internal server error.

#### Flow

- `/receive-message` Endpoint → `verifyAuthorizationHeader` → `extractKeyId` → `verifyHeader` → `verifyMessage`


## References

- [Medium Article](https://medium.com/@vikramacharya/auth-header-signing-in-node-js-ondc-b84959c6393e)
- [Documentation](https://docs.google.com/document/d/1brvcltG_DagZ3kGr1ZZQk4hG4tze3zvcxmGV4NMTzr8/edit)


