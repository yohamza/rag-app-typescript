import express from "express";
import { Request, Response } from "express";
import { queryDocument } from "../controllers/query.controller";
import { asyncHandler } from '../utils/asyncHandler';

const queryRouter = express.Router();

// Route for querying the document
queryRouter.post('/', asyncHandler(async (req: Request, res: Response) => await queryDocument(req, res)));

export default queryRouter;