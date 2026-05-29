import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import api from "../../../services/api";



function CreateUnitPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        head_user_id: "",
    });

    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const token = localStorage.getItem("access_token");

                const response = await api.get("/admin/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUsers(response.data.users);
            } catch (error) {
                console.error(
                    "Failed to load users:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load users");
            }
        }

        fetchUsers();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    function handleHeadChange(selectedOption) {
        setFormData({
            ...formData,
            head_user_id: selectedOption ? selectedOption.value : "",
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const payload = {
                name: formData.name,
                description: formData.description,
                head_user_id: formData.head_user_id
                    ? Number(formData.head_user_id)
                    : null,
            };

            const response = await api.post("/admin/units", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Unit created successfully");
            navigate("/admin/units");
        } catch (error) {
            console.error(
                "Failed to create unit:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to create unit");
        }
    }

    // Only show users who have the head_of_unit role
    const headsOfUnit = users.filter((user) =>
        user.roles.includes("head_of_unit")
    );

    const headOptions = headsOfUnit.map((user) => ({
        value: user.id,
        label: user.full_name,
    }));

    return (
        <div>
            <h1>Create Unit</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="name">Unit Name</label>
                    <br />
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter unit name"
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
                        placeholder="Enter unit description"
                        rows="4"
                        cols="40"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="head_user_id">Head of Unit</label>
                    <br />
                    <Select
                        inputId="head_user_id"
                        options={headOptions}
                        value={
                            headOptions.find(
                                (option) => option.value === Number(formData.head_user_id)
                            ) || null
                        }
                        onChange={handleHeadChange}
                        placeholder="Select head of unit"
                        isClearable
                    />
                </div>

                <br />

                <button type="submit">Create Unit</button>
            </form>
        </div>
    );
}

export default CreateUnitPage;