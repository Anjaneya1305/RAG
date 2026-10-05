const express = require("express");
const axios = require("axios");

const Chat = require("../models/Chat");

const router = express.Router();

router.post("/ask", async (req, res) => {
    try {
        const { question } = req.body;

        if (!question) {
            return res.status(400).json({
                message: "Question is required"
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

        // Create a new chat if none exists
        let chat = await Chat.findOne();

        if (!chat) {
            chat = await Chat.create({
                title: question.substring(0, 50),
                messages: []
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

        await chat.save();

        // Return answer to React
        res.json(ragData);

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
