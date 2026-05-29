import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";



function CreateRolePage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
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
            const token = localStorage.getItem("access_token");

            const payload = {
                name: formData.name,
                description: formData.description,
            };

            const response = await api.post("/admin/roles", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Role created successfully");
            navigate("/admin/roles");
        } catch (error) {
            console.error(
                "Failed to create role:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to create role");
        }
    }

    return (
        <div>
            <h1>Create Role</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Role Name</label>
                    <br />
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter role name"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="description">Description</label>
                    <br />
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter role description"
                        rows="4"
                        cols="40"
                    />
                </div>

                <br />

                <button type="submit">Create Role</button>
            </form>
        </div>
    );
}

export default CreateRolePage;
