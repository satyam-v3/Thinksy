import mongoose, { Schema, Document } from "mongoose";

export interface ChunkDocument extends Document {
    text: string;
    source: string;
    userId: string;
    embedding: number[];
}

const ChunkSchema = new Schema<ChunkDocument>(
    {
        text: {
            type: String,
            required: true
        },
        source: {
            type: String,
            required: true,
            index: true // Helps with standard queries
        },
        userId: {
            type: String,
            required: true,
            index: true
        },
        embedding: {
            type: [Number],
            required: true
        },
    },
    { timestamps: true }
);

export const ChunkModel = mongoose.models.Chunk || mongoose.model<ChunkDocument>("Chunk", ChunkSchema);