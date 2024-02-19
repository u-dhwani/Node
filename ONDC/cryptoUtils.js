const sodium = require("libsodium-wrappers");
const { base64_variants } = sodium;
const { config } = require("./config");


const createKeyPair = async () => {
    let { publicKey, privateKey } = sodium.crypto_sign_keypair();
    const publicKey_base64 = sodium.to_base64(publicKey, base64_variants.ORIGINAL);
    const privateKey_base64 = sodium.to_base64(privateKey, base64_variants.ORIGINAL);
    return { publicKey: publicKey_base64, privateKey: privateKey_base64 };

};


const createSigningString = async (message, created, expires) => {
    if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
    if (!expires) expires = (parseInt(created) + (1 * 60 * 60)).toString();
    await sodium.ready;
    const digest = sodium.crypto_generichash(64, sodium.from_string(message));
    const digest_base64 = sodium.to_base64(digest, sodium.base64_variants.ORIGINAL);
    const signing_string = `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest_base64}`;
    return { signing_string, expires, created };
};




const signMessage = async (signing_string, privateKey) => {

    await sodium.ready;
    const signedMessage = sodium.crypto_sign_detached(signing_string, sodium.from_base64(privateKey, base64_variants.ORIGINAL));
    return sodium.to_base64(signedMessage, base64_variants.ORIGINAL);

};



const verifyMessage = async (signedString, signingString, publicKey) => {
    try {
        await sodium.ready;
        console.log("dhwani");

        console.log(signedString);
        console.log(sodium.from_base64(signedString, sodium.base64_variants.ORIGINAL));
        console.log(signingString);
        console.log(sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL));

        return sodium.crypto_sign_verify_detached(sodium.from_base64(signedString, base64_variants.ORIGINAL), signingString, sodium.from_base64(publicKey, base64_variants.ORIGINAL));

    } catch (error) {
        return false;
    }
};


const createAuthorizationHeader = async (message) => {
    const { signing_string, expires, created } = await createSigningString(JSON.stringify(message));
    const signature = await signMessage(signing_string, config.sign_private_key || "");
    const subscriber_id = config.bap_id;
    const header = `Signature keyId="${subscriber_id}|${config.unique_key_id}|ed25519",algorithm="ed25519",created="${created}",expires="${expires}",headers="(created) (expires) digest",signature="${signature}"`;
    return header;
};


const verifyHeader = async (headerParts, body, public_key) => {
    const createdMatch = headerParts.match(/created="(\d+)"/);
    const expiresMatch = headerParts.match(/expires="(\d+)"/);

    // Extracting created and expires values
    const created = createdMatch ? createdMatch[1] : null;
    const expires = expiresMatch ? expiresMatch[1] : null;
    const { signing_string } = await createSigningString(JSON.stringify(body), created, expires);
    console.log("recreated signing string:");
    console.log("header:", signing_string);
    const signatureRegex = /signature="([^"]+)"/;
    const match = headerParts.match(signatureRegex);

    // Check if the match was found
    if (match && match[1]) {
        const signature = match[1];
        console.log("-------------");

        const verified = await verifyMessage(signature, signing_string, public_key);
        return verified;
    }
    else {
        return false;
    }
}

// Function to extract keyId from authorization header
function extractKeyId(authorizationHeader) {
    const match = authorizationHeader.match(/keyId="([^"]+)"/);
    if (!match) {
        throw new Error('Invalid Authorization header');
    }
    const [subscriberId, uniqueKeyId, algorithm] = match[1].split('|');
    return { subscriberId, uniqueKeyId, algorithm };
}


async function verifyAuthorizationHeader(authorizationHeader, message) {
    try {
        // Extract necessary information from authorization header
        const { subscriberId, uniqueKeyId, algorithm } = extractKeyId(authorizationHeader);

        // Verify the algorithm
        if (algorithm !== 'ed25519') {
            return false; // Algorithm mismatch
        }

        // Look up the public key using subscriberId and uniqueKeyId
        const publicKey = 'L3mHZmHkrEuBeoyh3VdP7WKT824quiJ/kdO6a+VvR0c=';

        // Verify the header using the retrieved public key
        return await verifyHeader(authorizationHeader, message, publicKey);
    } catch (error) {
        console.error('Error verifying authorization header:', error);
        return false; // Internal server error
    }
}

module.exports = {
    createKeyPair,
    createSigningString,
    signMessage,
    verifyMessage,
    createAuthorizationHeader,
    verifyHeader,
    extractKeyId,
    verifyAuthorizationHeader
};
