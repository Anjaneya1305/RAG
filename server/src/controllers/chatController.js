const Chat = require("../models/Chat");

const saveChatMessage = async (req, res) => {
    try {
        const { question, answer, sources } = req.body;

        if (!question || !answer) {
            return res.status(400).json({
                message: "Question and answer are required"
            });
        }

        let chat = await Chat.findOne({
            userId: "000000000000000000000000"
        });

        if (!chat) {
            chat = await Chat.create({
                userId: "000000000000000000000000",
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
};

module.exports = {
    saveChatMessage
};
