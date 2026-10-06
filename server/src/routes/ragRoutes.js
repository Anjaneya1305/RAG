const express = require("express");
const axios = require("axios");

const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/ask", authMiddleware, async (req, res) => {
    try {
        const { chatId, question } = req.body;

        if (!chatId) {
            return res.status(400).json({
                message: "Chat ID is required"
            });
        }

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
            });
        }

        // Find chat belonging to the logged-in user
        const chat = await Chat.findOne({
            _id: chatId,
            user: req.user.userId
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        // Send question to Python RAG service
        let ragData;

        try {
            const response = await axios.post(
                "http://localhost:8000/ask",
                {
                    question
                },
                {
                    timeout: 120000
                }
            );

            ragData = response.data;

        } catch (ragError) {
            console.error(
                "RAG service request failed:",
                ragError.response?.status,
                ragError.response?.data ||
                ragError.message
            );

            const ragMessage =
                ragError.response?.data?.detail ||
                ragError.response?.data?.message ||
                "AI service is currently unavailable. Please try again later.";

            return res.status(502).json({
                message: ragMessage
            });
        }

        // Save user question
        chat.messages.push({
            role: "user",
            content: question
        });

        // Save assistant answer
        chat.messages.push({
            role: "assistant",
            content: ragData.answer,
            sources: ragData.sources || []
        });

        // Give the chat a useful title
        if (chat.title === "New Chat") {
            chat.title = question.substring(0, 50);
        }

        await chat.save();

        // Return answer to React
        res.json({
            ...ragData,
            chatId: chat._id
        });

    } catch (error) {
        console.error(
            "RAG route error:",
            error
        );

        res.status(500).json({
            message: "Failed to process RAG request",
            error: error.message
        });
    }
});

module.exports = router;
