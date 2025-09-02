import * as crypto from "crypto";

// Generate encryption key (32 bytes)
const encryptionKey = crypto.randomBytes(32).toString("base64");
console.log("DB_ENCRYPTION_KEY=", encryptionKey);

// Generate signing key (64 bytes)
const signingKey = crypto.randomBytes(64).toString("base64");
console.log("DB_SIGNING_KEY=", signingKey);


export { encryptionKey, signingKey };