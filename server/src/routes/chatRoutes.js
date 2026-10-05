const express = require("express");

const Chat = require("../models/Chat");

const router = express.Router();


// Create a new chat
router.post("/new", async (req, res) => {
    try {
        const chat = await Chat.create({
            title: "New Chat",
            messages: []
        });

        res.status(201).json({
            message: "New chat created successfully",
            chat
        });

    } catch (error) {
        console.error("Create chat error:", error);

        res.status(500).json({
            message: "Failed to create new chat"
        });
    }
});


// Get all chats
router.get("/", async (req, res) => {
    try {
        const chats = await Chat.find()
            .sort({ updatedAt: -1 })
            .select("_id title createdAt updatedAt");

        res.json({
            chats
        });

    } catch (error) {
        console.error("Get chats error:", error);

        res.status(500).json({
            message: "Failed to get chats"
        });
    }
});


module.exports = router;
