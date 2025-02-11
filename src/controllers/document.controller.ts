import { Request, Response } from "express";
import { extname } from 'path';
import { DocumentModel } from '../models/document.model';
import { pineconeService } from "../services/document.service";
import { generateFileHash, extractFileContent } from '../utils/helpers';
import { BadRequestError, DuplicateEntryError, NotFoundError } from '../types/errors.types';

/** File ingestion logic
 * File hash always stays the same if the content hasn't changed. 
 * So we can use it to check if a document with same content has been ingested before.
 * Check if the document with the same hash already exists 
 * If it does, ignore the new file upload and return the existing document id
 * If it doesn't, create a new document and ingest it
*/
const uploadTrainingDocument = async (req: Request, res: Response) => {

    const { file } = req;
    if (!file) throw new BadRequestError("Please upload a file.");
            
    const extension = extname(file.originalname).toLowerCase();
    const fileBuffer = file.buffer;

    const fileHash = generateFileHash(fileBuffer);
    const fileContent = await extractFileContent(extension, fileBuffer);

    if (!fileContent) throw new BadRequestError("Unsupported file type.");

    const existingDocument = await DocumentModel.findOne({ hash: fileHash });

    if (existingDocument) throw new DuplicateEntryError("This file already exists. The document content is identical; no update needed.");

    const documentModel = new DocumentModel({ name: file.originalname, hash: fileHash });
    const newDocument = await documentModel.save();

    await pineconeService.processAndUploadDocument(fileContent, newDocument._id.toString());

    return res.ok(newDocument._id, "File uploaded successfully");
};

/** File reingestion logic
 * Check if the file content has changed by comparing the file hash
 * If it has, reingest the same document with the new content
 * If it hasn't, ignore the new file upload
*/
const reingestExistingDocument = async (req: Request, res: Response) => {

    const { documentId } = req.params;
    const { file } = req;

    if (!file) throw new BadRequestError("Please upload a file");

    const existingDocument = await DocumentModel.findById(documentId);
    if (!existingDocument) throw new NotFoundError("Document not found");

    const fileHash = generateFileHash(file.buffer);
    if (fileHash === existingDocument.hash) 
        throw new DuplicateEntryError("File content has not changed. Same document cannot be reingested. Ignoring upload.");

    const extension = extname(file.originalname).toLowerCase();
    const fileBuffer = file.buffer;

    const fileContent = await extractFileContent(extension, fileBuffer);
    if (!fileContent) throw new BadRequestError("Unsupported file type");

    await pineconeService.updateDocument(documentId, fileContent);

    return res.ok(documentId, "Document reingested successfully");
};

const getAllDocuments = async (req: Request, res: Response) => {
        const documents = await DocumentModel.find();
        return res.json({ documents });
};

export { uploadTrainingDocument, reingestExistingDocument, getAllDocuments };