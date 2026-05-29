import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function CreateLeaveTypePage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        default_days: "",
        requires_balance: false,
        is_active: true,
    });

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const payload = {
                name: formData.name,
                description: formData.description,
                default_days: Number(formData.default_days),
                requires_balance: formData.requires_balance,
                is_active: formData.is_active,
            };

            const response = await axios.post(`${api}/admin/leave-types`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Leave type created successfully");
            navigate("/admin/leave-types");
        } catch (error) {
            console.error(
                "Failed to create leave type:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to create leave type");
        }
    }

    return (
        <div>
            <h1>Create Leave Type</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Name</label>
                    <br />
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter leave type name"
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
                        placeholder="Enter leave type description"
                        rows="4"
                        cols="40"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="default_days">Default Days</label>
                    <br />
                    <input
                        type="number"
                        id="default_days"
                        name="default_days"
                        value={formData.default_days}
                        onChange={handleChange}
                        placeholder="Enter default days"
                    />
                </div>

                <br />

                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="requires_balance"
                            checked={formData.requires_balance}
                            onChange={handleChange}
                        />
                        Requires Balance
                    </label>
                </div>

                <br />

                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />
                        Is Active
                    </label>
                </div>

                <br />

                <button type="submit">Create Leave Type</button>
            </form>
        </div>
    );
}

export default CreateLeaveTypePage;
