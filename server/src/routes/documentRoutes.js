const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fs = require("fs");

const Document = require("../models/Document");

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new Error("Only PDF files are allowed"));
        }
    }
});

router.post("/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "No PDF file uploaded"
            });
        }

        const document = await Document.create({
            filename: req.file.originalname,
            filePath: req.file.path,
            uploadedBy: "test-user",
            status: "processing"
        });

        const formData = new FormData();

        const fileBuffer = fs.readFileSync(req.file.path);

        formData.append(
            "file",
            new Blob([fileBuffer], {
                type: "application/pdf"
            }),
            req.file.originalname
        );

        const response = await axios.post(
            "http://localhost:8000/upload",
            formData,
        );

        document.status = "completed";
        await document.save();

        res.status(201).json({
            message: "PDF uploaded and indexed successfully",
            document: document,
            rag: response.data
        });

    } catch (error) {

        console.error(
            "Document upload error:",
            error.response?.data || error.message
        );

        if (req.file) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (deleteError) {
                console.error(
                    "Failed to delete uploaded file:",
                    deleteError.message
                );
            }
        }

        res.status(500).json({
            message: "Failed to upload and process PDF",
            error: error.response?.data?.detail || error.message
        });
    }
});

module.exports = router;
