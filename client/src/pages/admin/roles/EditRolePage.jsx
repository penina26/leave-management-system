import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function EditRolePage() {
    const { roleId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRoleData() {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(`${api}/admin/roles/${roleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const role = response.data.role;

                setFormData({
                    name: role.name || "",
                    description: role.description || "",
                });

                setLoading(false);
            } catch (error) {
                console.error(
                    "Failed to load role data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load role data");
                setLoading(false);
            }
        }

        fetchRoleData();
    }, [roleId]);

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
            const token = localStorage.getItem("token");

            const payload = {
                name: formData.name,
                description: formData.description,
            };

            const response = await axios.patch(
                `${api}/admin/roles/${roleId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Role updated successfully");
            navigate("/admin/roles");
        } catch (error) {
            console.error(
                "Failed to update role:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update role");
        }
    }

    if (loading) {
        return <p>Loading edit form...</p>;
    }

    return (
        <div>
            <h1>Edit Role</h1>

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

                <button type="submit">Update Role</button>
            </form>
        </div>
    );
}

export default EditRolePage;