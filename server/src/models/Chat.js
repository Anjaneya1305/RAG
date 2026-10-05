const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        role: {
            type: String,
            enum: ["user", "assistant"],
            required: true
        },

        content: {
            type: String,
            required: true
        },

        sources: [
            {
                filename: String,
                page: Number,
                score: Number
            }
        ]
    },
    {
        _id: false
    }
);

const chatSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            default: "New Chat"
        },

        messages: [messageSchema]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Chat", chatSchema);
