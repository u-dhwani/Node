const sodium = require("libsodium-wrappers");
const { base64_variants } = sodium;
const { config } = require("./config");

const createKeyPair = async () => {
    await sodium.ready;
    const keypair = sodium.crypto_sign_keypair();
    const publicKey = sodium.to_base64(keypair.publicKey, sodium.base64_variants.ORIGINAL);
    const privateKey = sodium.to_base64(keypair.privateKey, sodium.base64_variants.ORIGINAL);
    return { publicKey, privateKey };
};

const createSigningString = async (message, created, expires) => {
    if (!created) created = Math.floor(new Date().getTime() / 1000).toString();
    if (!expires) expires = (parseInt(created) + (1 * 60 * 60)).toString();
    await sodium.ready;
    const digest = sodium.crypto_generichash(64, sodium.from_string(message));
    const digest_base64 = sodium.to_base64(digest, sodium.base64_variants.ORIGINAL);
    const signing_string = `(created): ${created}\n(expires): ${expires}\ndigest: BLAKE-512=${digest_base64}`;
    //return { signing_string };
    return { signing_string, expires, created };
};

const signMessage = async (signing_string, privateKey) => {


    await sodium.ready;
    console.log("hi", base64_variants.ORIGINAL);
    const signingBuffer = sodium.from_string(signing_string);
    console.log("signmessage");
    const privateKeyBuffer = sodium.from_base64(privateKey, base64_variants.ORIGINAL);
    console.log("signmessage");

    const signedMessage = sodium.crypto_sign_detached(signingBuffer, privateKeyBuffer);
    console.log("signmessage");
    return sodium.to_base64(signedMessage, sodium.base64_variants.ORIGINAL);
};

const verifyMessage = async (signedString, signingString, publicKey) => {
    try {
        await sodium.ready;
        console.log("dhwani");
        
        console.log(signedString, sodium.base64_variants.ORIGINAL);
        console.log(signingString);
        console.log(publicKey, sodium.base64_variants.ORIGINAL);
        
        return sodium.crypto_sign_verify_detached(
            sodium.from_base64(signedString, sodium.base64_variants.ORIGINAL),
            sodium.from_string(signingString),
            sodium.from_base64(publicKey, sodium.base64_variants.ORIGINAL)
        );
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

    // Extract body from headers
    //   const bodyMatch = headerParts.match(/headers="(.+?)"/);
    //  const headers = bodyMatch ? bodyMatch[1] : '';
    const [created, expires] = [createdMatch, expiresMatch].map(match => match ? match[1] : '');
    //console.log("hello:",created, expires, headers);
    console.log(body);

    const signatureMatch = headerParts.match(/signature="([^"]+)"/);
    const signature = signatureMatch ? signatureMatch[1] : '';
    const { signing_string } = await createSigningString(body, created, expires);
    console.log("signature:", signature);
    console.log("sign:", signing_string);
    const verified = await verifyMessage(signature, signing_string, public_key);
    return verified;
};

module.exports = {
    createKeyPair,
    createSigningString,
    signMessage,
    verifyMessage,
    createAuthorizationHeader,
    verifyHeader
};
