const express = require("express");
const Chat = require("../models/Chat");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* Create a new chat */
router.post("/new", authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.create({
            user: req.user.userId,
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
            message: "Failed to create chat"
        });
    }
});


/* Get all chats for logged-in user */
router.get("/", authMiddleware, async (req, res) => {
    try {
        const chats = await Chat.find({
            user: req.user.userId
        })
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


/* Get one chat for logged-in user */
router.get("/:id", authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        res.json({
            chat
        });

    } catch (error) {
        console.error("Get chat error:", error);

        res.status(500).json({
            message: "Failed to get chat"
        });
    }
});


/* Delete a chat for logged-in user */
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const chat = await Chat.findOne({
            _id: req.params.id,
            user: req.user.userId
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found"
            });
        }

        await Chat.findByIdAndDelete(req.params.id);

        res.json({
            message: "Chat deleted successfully"
        });

    } catch (error) {
        console.error("Delete chat error:", error);

        res.status(500).json({
            message: "Failed to delete chat"
        });
    }
});


module.exports = router;
