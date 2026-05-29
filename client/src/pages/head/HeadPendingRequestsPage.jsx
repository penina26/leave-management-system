import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";



function HeadPendingRequestsPage() {
    const [leaveRequests, setLeaveRequests] = useState([]);

    useEffect(() => {
        async function fetchPendingLeaveRequests() {
            try {
                const token = localStorage.getItem("access_token");

                const response = await api.get(
                    "/head/leave-requests/pending",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setLeaveRequests(response.data.pending_leave_requests);
            } catch (error) {
                console.error(
                    "Failed to fetch head pending requests:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load pending approval requests");
            }
        }

        fetchPendingLeaveRequests();
    }, []);

    return (
        <div>
            <h1>Head Pending Approval Requests</h1>

            {leaveRequests.length === 0 ? (
                <p>No pending approval requests found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Applicant Name</th>
                            <th>Leave Type</th>
                            <th>Unit</th>
                            <th>Supervisor</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Days Requested</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Submitted At</th>
                            <th>Supervisor Action At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaveRequests.map((leaveRequest) => (
                            <tr key={leaveRequest.id}>
                                <td>
                                    <Link to={`/head/leave-requests/${leaveRequest.id}`}>
                                        {leaveRequest.id}
                                    </Link>
                                </td>
                                <td>{leaveRequest.applicant_name}</td>
                                <td>{leaveRequest.leave_type_name}</td>
                                <td>{leaveRequest.unit_name}</td>
                                <td>{leaveRequest.supervisor_name}</td>
                                <td>{leaveRequest.start_date}</td>
                                <td>{leaveRequest.end_date}</td>
                                <td>{leaveRequest.days_requested}</td>
                                <td>{leaveRequest.reason}</td>
                                <td>{leaveRequest.status}</td>
                                <td>{leaveRequest.submitted_at}</td>
                                <td>{leaveRequest.supervisor_action_at}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default HeadPendingRequestsPage;