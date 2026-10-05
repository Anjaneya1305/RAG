const express = require("express");
const multer = require("multer");

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

router.post("/upload", upload.single("document"), async (req, res) => {
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
            status: "uploaded"
        });

        res.status(201).json({
            message: "PDF uploaded successfully",
            document
        });

    } catch (error) {
        console.error("Document upload error:", error.message);

        res.status(500).json({
            message: "Failed to save document",
            error: error.message
        });
    }
});

module.exports = router;
