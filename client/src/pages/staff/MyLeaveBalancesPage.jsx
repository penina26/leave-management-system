import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function MyLeaveBalancesPage() {
    const [leaveBalances, setLeaveBalances] = useState([]);

    useEffect(() => {
        async function fetchMyLeaveBalances() {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(`${api}/my-leave-balances`, {
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

        fetchMyLeaveBalances();
    }, []);

    return (
        <div>
            <h1>My Leave Balances</h1>

            {leaveBalances.length === 0 ? (
                <p>No leave balances found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
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
                                <td>{balance.id}</td>
                                <td>{balance.leave_type_name}</td>
                                <td>{balance.year}</td>
                                <td>{balance.allocated_days}</td>
                                <td>{balance.used_days}</td>
                                <td>{balance.remaining_days}</td>
                                <td>{balance.created_at}</td>
                                <td>{balance.updated_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default MyLeaveBalancesPage;
