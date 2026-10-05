const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        const response = await axios.post(
            "http://localhost:8000/ask",
            {
                question: question
            }
        );

        res.json(response.data);

    } catch (error) {
        console.error(
            "RAG service error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Failed to get answer from RAG service"
        });
    }
});

module.exports = router;
