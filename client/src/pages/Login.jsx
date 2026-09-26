import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/Auth.css';

const API_URL =
    import.meta.env.VITE_API_URL;

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                {
                    email,
                    password
                }
            );

            localStorage.setItem(
                "token",
                response.data.token
            );

            localStorage.setItem(
                "user",
                JSON.stringify(response.data.user)
            );

            navigate("/dashboard");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Login failed"
            );
        }
    };

  return (
    <div className="auth-page">

        <div className="auth-background-glow auth-glow-one"></div>
        <div className="auth-background-glow auth-glow-two"></div>

        <div className="auth-container">

            {/* BRAND */}

            <div className="auth-brand">
                <div className="auth-brand-icon">
                    T
                </div>

                <span>TipWave</span>
            </div>


            {/* CARD */}

            <div className="auth-card">

                <div className="auth-card-header">

                    <h1>Welcome back</h1>

                    <p>
                        Sign in to manage your tips and
                        stream alerts.
                    </p>

                </div>


                {error && (
                    <div className="auth-error">
                        <span>!</span>
                        <p>{error}</p>
                    </div>
                )}


                <form
                    className="auth-form"
                    onSubmit={handleSubmit}
                >

                    <div className="auth-field">

                        <label>Email address</label>

                        <input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                        />

                    </div>


                    <div className="auth-field">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) =>
                                setPassword(e.target.value)
                            }
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-submit"
                    >
                        Sign in
                    </button>

                </form>


                <div className="auth-divider">
                    <span></span>
                </div>


                <p className="auth-switch">
                    New to TipWave?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Create an account
                    </button>
                </p>

            </div>


            <p className="auth-footer">
                Support creators. Make an impact.
            </p>

        </div>

    </div>
);
}

export default Login;