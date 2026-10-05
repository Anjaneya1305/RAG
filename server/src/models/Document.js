const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
    {
        filename: {
            type: String,
            required: true
        },

        filePath: {
            type: String,
            required: true
        },

        uploadedBy: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["uploaded", "processing", "completed", "failed"],
            default: "uploaded"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Document", documentSchema);
