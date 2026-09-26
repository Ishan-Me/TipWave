import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
        <div>
            <h1>Create your TipWave account</h1>

            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit}>

                <input
                    type="text"
                    name="username"
                    placeholder="Username"
                    value={formData.username}
                    onChange={handleChange}
                />

                <input
                    type="text"
                    name="displayName"
                    placeholder="Display name"
                    value={formData.displayName}
                    onChange={handleChange}
                />

                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                />

                <button type="submit">
                    Create Account
                </button>

            </form>
        </div>
    );
}

export default Register;