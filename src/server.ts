import express from 'express';
import mongoose from 'mongoose';
import "dotenv/config";

import documentRouter from './routes/document.route';
import queryRouter from './routes/query.route';

import { errorHandler } from './middlewares/errorHandler';
import { responseHandler } from './middlewares/responseHandler';
import logger from './utils/logger';
const app = express();
const port = process.env.PORT || 3000;
const dbURL = process.env.MONGODB_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

mongoose
    .connect(dbURL!)
    .then(() => logger.logVerbose('Connected to Database'))
    .catch((error) => logger.logError('Database connection error:', error));

// Response handler middleware handles the response structure across the app.
app.use(responseHandler);

// API routes
app.use('/api/document', documentRouter);
app.use('/api/query', queryRouter);

// Default route
app.get("/", (req, res) => {
    res.send("Welcome to basic RAG App. Contact at hamza.io@hotmail.com for support.")
});

// Error handler middleware. This must be the last middleware in the chain as it handles all errors.
app.use(errorHandler);

app.listen(port, () => logger.logVerbose(`Server running on port ${port}`));
