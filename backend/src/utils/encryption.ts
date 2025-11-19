import crypto from "crypto";
import { TWO_FA_SECRET_IV, TWO_FA_SECRET_KEY } from "../config/env.config";

const key = Buffer.from(TWO_FA_SECRET_KEY, "hex");      // 32 bytes
const iv = Buffer.from(TWO_FA_SECRET_IV, "hex");        // 16 bytes

export const encrypt = (text: string): string => {
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    let encrypted = cipher.update(text, "utf8", "hex");
    encrypted += cipher.final("hex");
    return encrypted;
};

export const decrypt = (encryptedText: string): string => {
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
};
