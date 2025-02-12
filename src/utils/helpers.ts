import { PdfReader } from 'pdfreader';
import crypto from "crypto";
import logger from './logger';

const parsePDF = async (pdfBuffer: Buffer): Promise<string> => {
    let pdfContent = "";

    return new Promise((resolve, reject) => {
         new PdfReader().parseBuffer(pdfBuffer, (err, item) => {
            if (err) {
                logger.logError(err);
                reject(err);
            } else if (!item) {
                logger.logVerbose("end of buffer");
                resolve(pdfContent);
            } else if (item.text) {
                pdfContent = pdfContent.concat(item.text);
            }
        });
});
};
// Function to generate SHA-256 hash
const generateFileHash = (buffer: Buffer): string => {
    return crypto.createHash("sha256").update(buffer).digest("hex");
};

// Extract content from the uploaded file based on its type
const extractFileContent = async (extension: string, fileBuffer: Buffer): Promise<string | null> => {
    if (extension === ".pdf") {
        return await parsePDF(fileBuffer);
    } else if (extension === ".txt" || extension === ".docx") {
        return fileBuffer.toString("utf-8");
    }
    return null;
};


export { parsePDF, generateFileHash, extractFileContent };