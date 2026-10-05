const express = require("express");

const Chat = require("../models/Chat");

const router = express.Router();

router.post("/save", async (req, res) => {
    try {
        const { question, answer, sources } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                message: "Question and answer are required"
            });
        }

        let chat = await Chat.findOne();

        if (!chat) {
            chat = await Chat.create({
                title: question.substring(0, 50),
                messages: []
            });
        }

        chat.messages.push({
            role: "user",
            content: question
        });

        chat.messages.push({
            role: "assistant",
            content: answer,
            sources: sources || []
        });

        await chat.save();

        res.status(201).json({
            message: "Chat message saved successfully",
            chat
        });

    } catch (error) {
        console.error("Save chat error:", error);

        res.status(500).json({
            message: "Failed to save chat"
        });
    }
});

router.get("/history", async (req, res) => {
    try {
        const chat = await Chat.findOne();

        if (!chat) {
            return res.json({
                messages: []
            });
        }

        res.json({
            messages: chat.messages
        });

    } catch (error) {
        console.error("Get chat history error:", error);

        res.status(500).json({
            message: "Failed to get chat history"
        });
    }
});

module.exports = router;
