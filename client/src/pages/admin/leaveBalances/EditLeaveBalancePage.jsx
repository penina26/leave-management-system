import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
import api from "../../../services/api";



function EditLeaveBalancePage() {
    const { balanceId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        user_id: "",
        leave_type_id: "",
        year: "",
        allocated_days: "",
        used_days: "",
    });

    const [users, setUsers] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEditFormData() {
            try {
                const token = localStorage.getItem("access_token");

                const [balanceResponse, usersResponse, leaveTypesResponse] =
                    await Promise.all([
                        api.get(`admin/leave-balances/${balanceId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                        api.get("/admin/users", {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                        api.get("/admin/leave-types", {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    ]);

                const balance = balanceResponse.data.leave_balance;

                setUsers(usersResponse.data.users || []);
                setLeaveTypes(leaveTypesResponse.data.leave_types || []);

                setFormData({
                    user_id: balance.user_id || "",
                    leave_type_id: balance.leave_type_id || "",
                    year: balance.year ?? "",
                    allocated_days: balance.allocated_days ?? "",
                    used_days: balance.used_days ?? "",
                });

                setLoading(false);
            } catch (error) {
                console.error(
                    "Failed to load leave balance data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave balance data");
                setLoading(false);
            }
        }

        fetchEditFormData();
    }, [balanceId]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleUserChange(selectedOption) {
        setFormData((prev) => ({
            ...prev,
            user_id: selectedOption ? selectedOption.value : "",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const token = localStorage.getItem("access_token");

            const payload = {
                user_id: Number(formData.user_id),
                leave_type_id: Number(formData.leave_type_id),
                year: Number(formData.year),
                allocated_days: Number(formData.allocated_days),
                used_days: Number(formData.used_days),
            };

            const response = await api.patch(
                `/admin/leave-balances/${balanceId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(
                response.data.message || "Leave balance updated successfully"
            );

            navigate("/admin/leave-balances");
        } catch (error) {
            console.error(
                "Failed to update leave balance:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update leave balance");
        }
    }

    const userOptions = users.map((user) => ({
        value: user.id,
        label: user.full_name,
    }));

    if (loading) {
        return <p>Loading edit form...</p>;
    }

    return (
        <div>
            <h1>Edit Leave Balance</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="user_id">User</label>
                    <br />
                    <Select
                        inputId="user_id"
                        options={userOptions}
                        value={
                            userOptions.find(
                                (option) => option.value === Number(formData.user_id)
                            ) || null
                        }
                        onChange={handleUserChange}
                        placeholder="Select user"
                        isClearable
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="leave_type_id">Leave Type</label>
                    <br />
                    <select
                        id="leave_type_id"
                        name="leave_type_id"
                        value={formData.leave_type_id}
                        onChange={handleChange}
                    >
                        <option value="">Select leave type</option>
                        {leaveTypes.map((leaveType) => (
                            <option key={leaveType.id} value={leaveType.id}>
                                {leaveType.name}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                <div>
                    <label htmlFor="year">Year</label>
                    <br />
                    <input
                        type="number"
                        id="year"
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        placeholder="Enter year"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="allocated_days">Allocated Days</label>
                    <br />
                    <input
                        type="number"
                        id="allocated_days"
                        name="allocated_days"
                        value={formData.allocated_days}
                        onChange={handleChange}
                        placeholder="Enter allocated days"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="used_days">Used Days</label>
                    <br />
                    <input
                        type="number"
                        id="used_days"
                        name="used_days"
                        value={formData.used_days}
                        onChange={handleChange}
                        placeholder="Enter used days"
                    />
                </div>

                <br />

                <button type="submit">Update Leave Balance</button>
            </form>
        </div>
    );
}

export default EditLeaveBalancePage;