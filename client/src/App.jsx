import { useEffect,useState } from "react";
import Login from "./Login";
import "./App.css";

function App() {
    const token = localStorage.getItem("token");

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("user");

        return savedUser
            ? JSON.parse(savedUser)
            : null;
    });

    const [question, setQuestion] = useState("");
    const [messages, setMessages] = useState([]);
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
const [documents, setDocuments] = useState([]);
    const [error, setError] = useState("");


    

   useEffect(() => {
    const loadDocuments = async () => {
        try {
            const response = await fetch(
                "https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/documents",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error("Failed to load documents");
            }

            const data = await response.json();

            setDocuments(data.documents || []);

        } catch (error) {
            console.error("Document loading error:", error);
        }
    };

    loadDocuments();
}, []);

useEffect(() => {
    const loadChats = async () => {
        try {
            const response = await fetch(
                "https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/chat/",
                {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                }
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

    const deleteDocument = async (documentId) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this document?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/documents/${documentId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            throw new Error("Failed to delete document");
        }

        setDocuments((previousDocuments) =>
            previousDocuments.filter(
                (document) => document._id !== documentId
            )
        );

    } catch (error) {
        console.error("Delete document error:", error);
        setError("Unable to delete this document.");
    }
};

const deleteChat = async (chatId) => {

    const confirmed = window.confirm(
        "Are you sure you want to delete this chat?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            `https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/chat/${chatId}`,
            {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
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
                    `https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/chat/${nextChat._id}`
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
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please sign in again.");
            return;
        }

        const response = await fetch(
            `https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/chat/${chatId}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "Load chat API error:",
                response.status,
                data
            );

            throw new Error(
                data.message || `Failed to load chat (${response.status})`
            );
        }

        setActiveChatId(chatId);
        setMessages(data.chat.messages || []);
        setError("");

    } catch (error) {
        console.error("Load chat error:", error);

        setError(
            error.message || "Unable to load this chat."
        );
    }
};


const createNewChat = async () => {
    try {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Please sign in again.");
            return;
        }

        const response = await fetch(
            "https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/chat/new",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({})
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error(
                "Create chat API error:",
                response.status,
                data
            );

            throw new Error(
                data.message || `Failed to create chat (${response.status})`
            );
        }

        setChats((previousChats) => [
            data.chat,
            ...previousChats
        ]);

        setActiveChatId(data.chat._id);
        setMessages([]);
        setError("");

    } catch (error) {
        console.error("Create chat error:", error);

        setError(
            error.message || "Unable to create a new chat."
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
                "https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/rag/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        chatId: activeChatId,
    question: userQuestion
                    })
                }
            );

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));

                throw new Error(
                    errorData.message ||
                    errorData.details?.detail ||
                    errorData.details ||
                    `RAG service failed (${response.status})`
                );
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
            setError(error.message || "Unable to get an answer. Please try again.");
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
                "https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev/api/documents/upload",
                {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
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

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setMessages([]);
        setChats([]);
        setActiveChatId(null);
    };

    if (!user) {
        return <Login onLogin={setUser} />;
    }

    return (
        <div className="app">

            <header className="header">
                <div className="header-top">
                    <div>
                        <h1>Enterprise RAG Knowledge Assistant</h1>

                        <p>
                            Ask questions about your enterprise documents
                        </p>
                    </div>

                    <div className="account-area">
                        <span>
                            {user.name}
                        </span>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>

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

                    <div className="sidebar-header documents-header">
                        <h2>Your Documents</h2>
                        <span>{documents.length}</span>
                    </div>

                    <div className="document-list">
                        {documents.length === 0 ? (
                            <p className="no-documents">
                                No documents uploaded
                            </p>
                        ) : (
                            documents.map((document) => (
                                <div
                                    className="document-item"
                                    key={document._id}
                                >
                                    <span className="document-icon">
                                        📄
                                    </span>

                                    <span className="document-name">
                                        {document.filename}
                                    </span>

                                    <span
                                        className="delete-document"
                                        onClick={() =>
                                            deleteDocument(document._id)
                                        }
                                    >
                                        🗑
                                    </span>
                                </div>
                            ))
                        )}
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
                            <div className="assistant-response">
                                <div className="assistant-label">
                                    <span className="assistant-icon">✦</span>
                                    <span>Knowledge Assistant</span>
                                </div>

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
                    <div className="error error-banner">
                        <span className="error-icon">⚠</span>
                        <div className="error-content">
                            <strong>Something went wrong</strong>
                            <span>{error}</span>
                        </div>
                    </div>
                )}

            </main>

            </div>

            <div className="input-area">
                <div className="input-wrapper">

    <div className="question-area">

                        <label className="upload-button">
                            <input
                                type="file"
                                accept=".pdf,application/pdf"
                                onChange={uploadPDF}
                                disabled={uploading}
                            />

                            {uploading
                                ? "Uploading..."
                                : "📄 Upload PDF"}
                        </label>

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
        </div>
    );
}

export default App;
