import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../styles/Auth.css';


const API_URL =
    import.meta.env.VITE_API_URL;

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        displayName: "",
        email: "",
        password: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            await axios.post(
               `${API_URL}/api/auth/register`,
                formData
            );

            navigate("/login");

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
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

            <div className="auth-card auth-register-card">

                <div className="auth-card-header">

                    <h1>Create your account</h1>

                    <p>
                        Start receiving support from
                        your community.
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

                        <label>Username</label>

                        <div className="auth-username-input">

                            <span>@</span>

                            <input
                                type="text"
                                name="username"
                                placeholder="yourname"
                                value={formData.username}
                                onChange={handleChange}
                            />

                        </div>

                        <small>
                            This will be used in your public
                            TipWave link.
                        </small>

                    </div>


                    <div className="auth-field">

                        <label>Display name</label>

                        <input
                            type="text"
                            name="displayName"
                            placeholder="Your display name"
                            value={formData.displayName}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="auth-field">

                        <label>Email address</label>

                        <input
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleChange}
                        />

                    </div>


                    <div className="auth-field">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                        />

                    </div>


                    <button
                        type="submit"
                        className="auth-submit"
                    >
                        Create account
                    </button>

                </form>


                <div className="auth-divider">
                    <span></span>
                </div>


                <p className="auth-switch">
                    Already have an account?{" "}

                    <button
                        type="button"
                        onClick={() =>
                            navigate("/login")
                        }
                    >
                        Sign in
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

export default Register;