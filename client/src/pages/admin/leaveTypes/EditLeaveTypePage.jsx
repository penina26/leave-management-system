import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";

function EditLeaveTypePage() {
    const { leaveTypeId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        default_days: "",
        requires_balance: false,
        is_active: true,
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLeaveTypeData() {
            try {
                const token = localStorage.getItem("access_token");

                const response = await api.get(
                    `/admin/leave-types/${leaveTypeId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const leaveType = response.data.leave_type;

                setFormData({
                    name: leaveType.name || "",
                    description: leaveType.description || "",
                    default_days: leaveType.default_days ?? "",
                    requires_balance: leaveType.requires_balance,
                    is_active: leaveType.is_active,
                });

                setLoading(false);
            } catch (error) {
                console.error(
                    "Failed to load leave type data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave type data");
                setLoading(false);
            }
        }

        fetchLeaveTypeData();
    }, [leaveTypeId]);

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

            const response = await api.patch(
                `/admin/leave-types/${leaveTypeId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Leave type updated successfully");
            navigate("/admin/leave-types");
        } catch (error) {
            console.error(
                "Failed to update leave type:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update leave type");
        }
    }

    if (loading) {
        return <p>Loading edit form...</p>;
    }

    return (
        <div>
            <h1>Edit Leave Type</h1>

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

                <button type="submit">Update Leave Type</button>
            </form>
        </div>
    );
}

export default EditLeaveTypePage;
