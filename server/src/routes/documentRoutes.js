const express = require("express");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const axios = require("axios");
const FormData = require("form-data");

const Document = require("../models/Document");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const upload = multer({
    dest: "uploads/"
});


/* Get documents for logged-in user */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const documents = await Document.find({
            user: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.json({
            documents
        });

    } catch (error) {
        console.error("Get documents error:", error);

        res.status(500).json({
            message: "Failed to get documents"
        });
    }
});


/* Upload document */
router.post(
    "/upload",
    authMiddleware,
    upload.single("file"),
    async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({
                    message: "No file uploaded"
                });
            }

            if (req.file.mimetype !== "application/pdf") {
                fs.unlinkSync(req.file.path);

                return res.status(400).json({
                    message: "Only PDF files are allowed"
                });
            }

            const document = await Document.create({
                user: req.user.userId,
                filename: req.file.originalname,
                filePath: req.file.path
            });

            try {
                const formData = new FormData();

                formData.append(
                    "file",
                    fs.createReadStream(req.file.path),
                    {
                        filename: req.file.originalname,
                        contentType: "application/pdf"
                    }
                );

                const ragResponse = await axios.post(
                    "http://localhost:8000/upload",
                    formData,
                    {
                        headers: formData.getHeaders(),
                        maxContentLength: Infinity,
                        maxBodyLength: Infinity
                    }
                );

                console.log(
                    "RAG upload response:",
                    ragResponse.data
                );
            } catch (ragError) {
                console.error(
                    "RAG upload error:",
                    ragError.response?.data ||
                    ragError.message
                );

                await Document.findByIdAndDelete(
                    document._id
                );

                if (fs.existsSync(req.file.path)) {
                    fs.unlinkSync(req.file.path);
                }

                return res.status(500).json({
                    message:
                        "Document uploaded but RAG indexing failed"
                });
            }

            res.status(201).json({
                message:
                    "Document uploaded successfully",
                document
            });

        } catch (error) {
            console.error(
                "Upload document error:",
                error
            );

            if (req.file?.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            res.status(500).json({
                message: "Failed to upload document"
            });
        }
    }
);


/* Delete document for logged-in user */
router.delete(
    "/:id",
    authMiddleware,
    async (req, res) => {
        try {
            const document = await Document.findOne({
                _id: req.params.id,
                user: req.user.userId
            });

            if (!document) {
                return res.status(404).json({
                    message: "Document not found"
                });
            }

            await Document.findByIdAndDelete(
                document._id
            );

            const filePath = path.resolve(
                document.filePath
            );

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            res.json({
                message:
                    "Document deleted successfully"
            });

        } catch (error) {
            console.error(
                "Delete document error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to delete document"
            });
        }
    }
);


module.exports = router;
