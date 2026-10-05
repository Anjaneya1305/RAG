const express = require("express");
const axios = require("axios");

const Chat = require("../models/Chat");

const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

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

        // Find the selected chat
        const chat = await Chat.findById(chatId);

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        // Send question to Python RAG service
        const response = await axios.post(
            "http://localhost:8000/ask",
            {
                question: question
            }
        );

        const ragData = response.data;

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
            "RAG service error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Failed to get answer from RAG service",
            error: error.message,
            details: error.response?.data || null
        });
    }
});

module.exports = router;
