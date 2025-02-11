import mongoose from "mongoose";

const Schema = mongoose.Schema;

const documentSchema = new Schema({
    name: {
        type: String,
    },
    hash: {
        type: String,
        required: true,
        unique: true
    }
},{timestamps: true});

const DocumentModel = mongoose.model('Document', documentSchema);


export { DocumentModel };