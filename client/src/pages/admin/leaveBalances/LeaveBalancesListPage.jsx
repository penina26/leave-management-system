import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../../services/api";



function LeaveBalancesListPage() {
    const [leaveBalances, setLeaveBalances] = useState([]);

    useEffect(() => {
        async function fetchLeaveBalances() {
            try {
                const token = localStorage.getItem("access_token");

                const response = await api.get("/admin/leave-balances", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLeaveBalances(response.data.leave_balances);
            } catch (error) {
                console.error(
                    "Failed to fetch leave balances:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave balances");
            }
        }

        fetchLeaveBalances();
    }, []);

    return (
        <div>
            <h1>Admin - Leave Balances</h1>


            {leaveBalances.length === 0 ? (
                <p>No leave balances found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Leave Type</th>
                            <th>Year</th>
                            <th>Allocated Days</th>
                            <th>Used Days</th>
                            <th>Remaining Days</th>
                            <th>Created At</th>
                            <th>Updated At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveBalances.map((balance) => (
                            <tr key={balance.id}>

                                <td>
                                    <Link to={`/admin/leave-balances/${balance.id}/edit`}>
                                        {balance.id}
                                    </Link>
                                </td>

                                <td>{balance.user_name || "N/A"}</td>
                                <td>{balance.leave_type_name || "N/A"}</td>
                                <td>{balance.year}</td>
                                <td>{balance.allocated_days}</td>
                                <td>{balance.used_days}</td>
                                <td>{balance.remaining_days}</td>
                                <td>{balance.created_at || "N/A"}</td>
                                <td>{balance.updated_at || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default LeaveBalancesListPage;