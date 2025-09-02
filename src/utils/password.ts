import crypto from "crypto";

export const generateRandomPassword = (length = 12): string => {
  return crypto
    .randomBytes(length)
    .toString("base64")
    .slice(0, length)
    .replace(/\+/g, "A")
    .replace(/\//g, "B");
};
