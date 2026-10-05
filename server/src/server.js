const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const documentRoutes = require("./routes/documentRoutes");
const ragRoutes = require("./routes/ragRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Document routes
app.use("/api/documents", documentRoutes);
app.use("/api/rag", ragRoutes);
// Connect to MongoDB
connectDB();

app.get("/", (req, res) => {
    res.json({
        message: "Enterprise RAG Backend is running"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
