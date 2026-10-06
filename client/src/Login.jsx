import { useState } from "react";

function Login({ onLogin }) {
    const [mode, setMode] = useState("login");

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const endpoint =
                mode === "login"
                    ? "/api/auth/login"
                    : "/api/auth/register";

            const body =
                mode === "login"
                    ? { email, password }
                    : { name, email, password };

            const response = await fetch(
                `https://musical-meme-7v55wvw79wrwfx5rw-5000.app.github.dev${endpoint}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(body)
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    (mode === "login"
                        ? "Login failed"
                        : "Registration failed")
                );
            }

            if (mode === "login") {
                localStorage.setItem("token", data.token);
                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                onLogin(data.user);
            } else {
                setSuccess(
                    "Account created successfully. You can now sign in."
                );

                setMode("login");
                setName("");
                setPassword("");
            }

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">

                <h1>Enterprise RAG</h1>

                <p className="login-subtitle">
                    {mode === "login"
                        ? "Sign in to your Knowledge Assistant"
                        : "Create your Knowledge Assistant account"}
                </p>

                <form onSubmit={handleSubmit}>

                    {mode === "register" && (
                        <input
                            type="text"
                            placeholder="Full Name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value)
                            }
                            required
                        />
                    )}

                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />

                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        required
                    />

                    {error && (
                        <p className="login-error">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="login-success">
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? mode === "login"
                                ? "Signing in..."
                                : "Creating account..."
                            : mode === "login"
                                ? "Sign In"
                                : "Create Account"}
                    </button>

                </form>

                <div className="auth-switch">
                    {mode === "login" ? (
                        <>
                            <span>Don't have an account?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("register");
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                Sign Up
                            </button>
                        </>
                    ) : (
                        <>
                            <span>Already have an account?</span>
                            <button
                                type="button"
                                onClick={() => {
                                    setMode("login");
                                    setError("");
                                    setSuccess("");
                                }}
                            >
                                Sign In
                            </button>
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Login;
