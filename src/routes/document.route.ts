import express, { Request, Response } from 'express';
import multer, { StorageEngine, FileFilterCallback } from 'multer';
import { extname } from 'path';
import {
  uploadTrainingDocument,
  getAllDocuments,
  reingestExistingDocument,
} from '../controllers/document.controller';
import { asyncHandler } from '../utils/asyncHandler';

const documentRouter = express.Router();

// Multer instance for file uploads
function multerInstance() {
  const storage: StorageEngine = multer.memoryStorage();
  const allowedFileTypes: string[] = ['.txt', '.docx', '.pdf'];

  const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const ext = extname(file.originalname).toLowerCase();
    if (allowedFileTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Invalid file type. Only text(.txt), Doc(.docx), and pdf files are allowed.'
        )
      );
    }
  };

  return multer({ storage, fileFilter });
}

// Upload Document route for ingesting documents
documentRouter.post('/ingest', multerInstance().single('file'), 
asyncHandler(async (req:Request, res:Response) => await uploadTrainingDocument(req, res))
);

// Reingest existing document route
documentRouter.post('/reingest/:documentId', multerInstance().single('file'), 
asyncHandler(async (req:Request, res:Response) => await reingestExistingDocument(req, res))
);

// Get all documents route
documentRouter.get('/', asyncHandler(async (req:Request, res:Response) => await getAllDocuments(req, res))
);

export default documentRouter;
