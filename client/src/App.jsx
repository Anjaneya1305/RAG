import { useState } from "react";

function App() {
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [sources, setSources] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const askQuestion = async () => {
        if (!question.trim()) {
            return;
        }

        setLoading(true);
        setError("");
        setAnswer("");
        setSources([]);

        try {
            const response = await fetch(
                "http://localhost:5000/api/rag/ask",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        question: question
                    })
                }
            );

            if (!response.ok) {
                throw new Error("Failed to get answer");
            }

            const data = await response.json();

            setAnswer(data.answer);
            setSources(data.sources || []);

        } catch (error) {
            console.error(error);
            setError("Unable to get an answer. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Enterprise RAG Knowledge Assistant</h1>

            <input
                type="text"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                placeholder="Ask a question about your documents..."
            />

            <button onClick={askQuestion} disabled={loading}>
                {loading ? "Thinking..." : "Ask"}
            </button>

            {error && (
                <p>{error}</p>
            )}

            {answer && (
                <div>
                    <h2>Answer</h2>
                    <p>{answer}</p>
                </div>
            )}

            {sources.length > 0 && (
                <div>
                    <h2>Sources</h2>

                    {sources.map((source, index) => (
                        <div key={index}>
                            <p>
                                {source.filename} — Page {source.page}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default App;
