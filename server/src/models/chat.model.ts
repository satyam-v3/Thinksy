import mongoose, {
    Schema,
    Document,
} from "mongoose";

export interface ChatMessage {
    role:
    | "user"
    | "assistant";

    content: string;

    createdAt: Date;
}

export interface ChatDocument
    extends Document {
    userId: mongoose.Types.ObjectId; // Ties the chat to a specific user

    title: string;

    messages: ChatMessage[];

    createdAt: Date;

    updatedAt: Date;
}

const MessageSchema =
    new Schema<ChatMessage>(
        {
            role: {
                type: String,

                enum: [
                    "user",
                    "assistant",
                ],

                required: true,
            },

            content: {
                type: String,

                required: true,
            },

            createdAt: {
                type: Date,

                default:
                    Date.now,
            },
        },
        {
            _id: false,
        },
    );

const ChatSchema =
    new Schema<ChatDocument>(
        {
            userId: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },

            title: {
                type: String,

                required: true,

                default:
                    "New Chat",
            },

            messages: {
                type: [
                    MessageSchema,
                ],

                default: [],
            },
        },
        {
            timestamps: true,
        },
    );

export const ChatModel =
    mongoose.models.Chat || mongoose.model<ChatDocument>("Chat", ChatSchema);