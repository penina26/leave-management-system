import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function LeaveTypesListPage() {
    const [leaveTypes, setLeaveTypes] = useState([]);

    async function fetchLeaveTypes() {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${api}/admin/leave-types`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeaveTypes(response.data.leave_types);
        } catch (error) {
            console.error(
                "Failed to fetch leave types:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to load leave types");
        }
    }

    useEffect(() => {
        fetchLeaveTypes();
    }, []);

    async function handleDeleteLeaveType(leaveTypeId, leaveTypeName) {
        const confirmed = window.confirm(
            `Are you sure you want to delete the leave type "${leaveTypeName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.delete(
                `${api}/admin/leave-types/${leaveTypeId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Leave type deleted successfully");

            // Refresh the list after successful delete
            fetchLeaveTypes();
        } catch (error) {
            console.error(
                "Failed to delete leave type:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to delete leave type");
        }
    }

    return (
        <div>
            <h1>Admin - Leave Types</h1>

            <p>
                <Link to="/admin/leave-types/create">Create New Leave Type</Link>
            </p>

            {leaveTypes.length === 0 ? (
                <p>No leave types found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Default Days</th>
                            <th>Requires Balance</th>
                            <th>Active</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveTypes.map((leaveType) => (
                            <tr key={leaveType.id}>
                                <td>
                                    <Link to={`/admin/leave-types/${leaveType.id}/edit`}>
                                        {leaveType.id}
                                    </Link>
                                </td>
                                <td>{leaveType.name}</td>
                                <td>{leaveType.description || "N/A"}</td>
                                <td>{leaveType.default_days}</td>
                                <td>{leaveType.requires_balance ? "Yes" : "No"}</td>
                                <td>{leaveType.is_active ? "Yes" : "No"}</td>
                                <td>{leaveType.created_at || "N/A"}</td>
                                <td>
                                    <button
                                        onClick={() =>
                                            handleDeleteLeaveType(leaveType.id, leaveType.name)
                                        }
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default LeaveTypesListPage;
