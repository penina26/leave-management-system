import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";


const api = import.meta.env.VITE_API_BASE_URL

function LoginPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const response = await axios.post(`${api}/login`, formData);

            console.log("Login successful:", response.data);

            const { access_token, user } = response.data;

            // Save token and user info in localStorage
            localStorage.setItem("token", access_token);
            localStorage.setItem("user", JSON.stringify(user));

            toast.success("Login successful")

            // Redirect based on role
            if (user.roles.includes("admin")) {
                navigate("/admin/dashboard");
            } else if (user.roles.includes("head_of_unit")) {
                navigate("/head/dashboard");
            } else if (user.roles.includes("supervisor")) {
                navigate("/supervisor/dashboard");
            } else if (user.roles.includes("staff")) {
                navigate("/staff/dashboard");
            } else {
                navigate("/login");
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);

            const backendMessage = error.response?.data?.message;

            toast.error(backendMessage || "Login failed");
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username</label>
                    <br />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter your username"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="password">Password</label>
                    <br />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                    />
                </div>

                <br />

                <button type="submit">Login</button>
            </form>
        </div>
    );
}

export default LoginPage;