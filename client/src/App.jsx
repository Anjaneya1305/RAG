import { useEffect,useState } from "react";
import "./App.css";

function App() {
    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [error, setError] = useState("");
    

   useEffect(() => {
    const loadChats = async () => {
        try {
            const response = await fetch(
                "http://localhost:5000/api/chat/"
            );

            if (!response.ok) {
                throw new Error("Failed to load chats");
            }

            const data = await response.json();
            

            setChats(data.chats || []);

            if (data.chats && data.chats.length > 0) {
                setActiveChatId(data.chats[0]._id);
            }

        } catch (error) {
            console.error(
                "Failed to load chats:",
                error
            );
        }
    };

    loadChats();
}, []);

    const deleteChat = async (chatId) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this chat?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:5000/api/chat/${chatId}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete chat");
        }

        const remainingChats = chats.filter(
            (chat) => chat._id !== chatId
        );

        setChats(remainingChats);

        if (activeChatId === chatId) {

            if (remainingChats.length > 0) {

                const nextChat = remainingChats[0];

                setActiveChatId(nextChat._id);

                const chatResponse = await fetch(
                    `http://localhost:5000/api/chat/${nextChat._id}`
                );

                if (chatResponse.ok) {
                    const data = await chatResponse.json();

                    setMessages(
                        data.chat.messages || []
                    );
                }

            } else {

                setActiveChatId(null);
                setMessages([]);
            }
        }

        setError("");

    } catch (error) {
        console.error("Delete chat error:", error);

        setError(
            "Unable to delete this chat."
        );
    }
};


const loadChat = async (chatId) => {
    try {
        const response = await fetch(
            `http://localhost:5000/api/chat/${chatId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load chat");
        }

        const data = await response.json();

        setActiveChatId(chatId);

        setMessages(
            data.chat.messages || []
        );

        setError("");

    } catch (error) {
        console.error("Load chat error:", error);

        setError(
            "Unable to load this chat."
        );
    }
};


const createNewChat = async () => {
    try {
        const response = await fetch(
            "http://localhost:5000/api/chat/new",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to create chat");
        }

        const data = await response.json();

        const newChat = data.chat;

        setChats((previousChats) => [
            newChat,
            ...previousChats
        ]);

        setActiveChatId(newChat._id);

        setMessages([]);

        setError("");

    } catch (error) {
        console.error("Create chat error:", error);

        setError(
            "Unable to create a new chat."
        );
    }
};


const askQuestion = async () => {
        if (!question.trim() || loading) {
            return;
        }
        if (!activeChatId) {
    setError("Please select a chat first.");
    return;
}

        const userQuestion = question.trim();

        setMessages((previousMessages) => [
            ...previousMessages,
            {
                role: "user",
                content: userQuestion
            }
        ]);

        setQuestion("");
        setLoading(true);
        setError("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/rag/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        chatId: activeChatId,
    question: userQuestion
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to get answer");
            }

            const data = await response.json();

            console.log("RAG RESPONSE:", data);

            setMessages((previousMessages) => [
                ...previousMessages,
                {
                    role: "assistant",
                    content: data.answer,
                    sources: data.sources || []
                }
            ]);
        } catch (error) {
            console.error(error);
            setError("Unable to get an answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const uploadPDF = async (event) => {
        const file = event.target.files[0];

        if (!file) {
            return;
        }

        if (file.type !== "application/pdf") {
            setError("Please select a PDF file.");
            return;
        }

        setUploading(true);
        setUploadMessage("");
        setError("");

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch(
                "http://localhost:5000/api/documents/upload",
                {
                    method: "POST",
                    body: formData
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to upload PDF"
                );
            }

            setUploadMessage(
                `${file.name} uploaded successfully.`
            );
        } catch (error) {
            console.error(error);
            setError("Unable to upload the PDF. Please try again.");
        } finally {
            setUploading(false);
            event.target.value = "";
        }
    };

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            askQuestion();
        }
    };

    return (
        <div className="app">

            <header className="header">
                <h1>Enterprise RAG Knowledge Assistant</h1>

                <p>
                    Ask questions about your enterprise documents
                </p>

                <label>
                    <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={uploadPDF}
                        disabled={uploading}
                    />

                    {uploading
                        ? "Uploading..."
                        : "Upload PDF"}
                </label>

                {uploadMessage && (
                    <p>{uploadMessage}</p>
                )}
            </header>

            <div className="main-layout">

                <aside className="sidebar">

                    <div className="sidebar-header">
                        <h2>Conversations</h2>
                        <span>{chats.length}</span>
                    </div>

                    <button
                        className="new-chat-button"
                        onClick={createNewChat}
                    >
                        + New Chat
                    </button>

                    <div className="chat-list">

                        {chats.map((chat) => (
                            <button
                                key={chat._id}
                                className={
                                    chat._id === activeChatId
                                        ? "chat-item active"
                                        : "chat-item"
                                }
                                onClick={() => loadChat(chat._id)}
                            >
                                <span className="chat-indicator">
                                    {chat._id === activeChatId ? "●" : "○"}
                                </span>
                                <span className="chat-title">
                                    {chat.title}
                                </span>

                                <span
                                    className="delete-chat"
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        deleteChat(chat._id);
                                    }}
                                >
                                    🗑
                                </span>
                            </button>
                        ))}

                    </div>

                </aside>

                <main className="chat-container">

                {messages.length === 0 && (
                    <div className="welcome">
                        <h2>How can I help you?</h2>

                        <p>
                            Upload a PDF and ask questions
                            about your documents.
                        </p>
                    </div>
                )}

                {messages.map((message, index) => (
                    <div
                        className={`message ${
                            message.role === "user"
                                ? "user-message"
                                : "assistant-message"
                        }`}
                        key={index}
                    >
                        {message.role === "user" ? (
                            <div className="user-bubble">
                                {message.content}
                            </div>
                        ) : (
                            <div>
                                <div className="assistant-bubble">
                                    {message.content}
                                </div>

                                {message.sources &&
                                    message.sources.length > 0 && (
                                        <div className="sources">

                                            <div className="sources-title">
                                                Sources
                                            </div>

                                            {message.sources.map(
                                                (source, sourceIndex) => (
                                                    <div
                                                        className="source"
                                                        key={sourceIndex}
                                                    >
                                                        📄{" "}
                                                        {source.filename}
                                                        {" — Page "}
                                                        {source.page}
                                                    </div>
                                                )
                                            )}

                                        </div>
                                    )}
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="message assistant-message">
                        <div className="assistant-bubble">
                            Thinking...
                        </div>
                    </div>
                )}

                {error && (
                    <div className="error">
                        {error}
                    </div>
                )}

            </main>

            </div>

            <div className="input-area">
                <div className="input-wrapper">

                    <input
                        className="question-input"
                        type="text"
                        value={question}
                        onChange={(event) =>
                            setQuestion(event.target.value)
                        }
                        onKeyDown={handleKeyDown}
                        placeholder="Ask a question about your documents..."
                        disabled={loading}
                    />

                    <button
                        className="ask-button"
                        onClick={askQuestion}
                        disabled={
                            loading ||
                            !question.trim()
                        }
                    >
                        {loading ? "Thinking..." : "Ask"}
                    </button>

                </div>
            </div>

        </div>
    );
}

export default App;
