import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";


function HeadLeaveRequestDetailPage() {
    const { requestId } = useParams();

    const [leaveRequest, setLeaveRequest] = useState(null);
    const [approvalHistory, setApprovalHistory] = useState([]);
    const [comment, setComment] = useState("");

    async function fetchLeaveRequestDetail() {
        try {
            const token = localStorage.getItem("access_token");

            const response = await api.get(
                `/head/leave-requests/${requestId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setLeaveRequest(response.data.leave_request);
            setApprovalHistory(response.data.approval_history);
        } catch (error) {
            console.error(
                "Failed to fetch head leave request detail:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to load leave request detail");
        }
    }

    useEffect(() => {
        fetchLeaveRequestDetail();
    }, [requestId]);

    async function handleApprove() {
        try {
            const token = localStorage.getItem("token");

            const response = await api.patch(
                `/leave-requests/${requestId}/approve`,
                {
                    comment: comment.trim() || "Approved by head of unit",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Leave request approved successfully");
            setComment("");
            fetchLeaveRequestDetail();
        } catch (error) {
            console.error(
                "Failed to approve leave request:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to approve leave request");
        }
    }

    async function handleReject() {
        if (!comment.trim()) {
            toast.error("Comment is required when rejecting a leave request");
            return;
        }

        try {
            const token = localStorage.getItem("access_token");

            const response = await api.patch(
                `/leave-requests/${requestId}/reject-by-head`,
                {
                    comment: comment.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Leave request rejected successfully");
            setComment("");
            fetchLeaveRequestDetail();
        } catch (error) {
            console.error(
                "Failed to reject leave request:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to reject leave request");
        }
    }

    if (!leaveRequest) {
        return <p>Loading leave request detail...</p>;
    }

    return (
        <div>
            <h1>Head Leave Request Detail</h1>

            <h2>Leave Request</h2>
            <p><strong>ID:</strong> {leaveRequest.id}</p>
            <p><strong>Applicant:</strong> {leaveRequest.applicant_name}</p>
            <p><strong>Leave Type:</strong> {leaveRequest.leave_type_name}</p>
            <p><strong>Unit:</strong> {leaveRequest.unit_name}</p>
            <p><strong>Supervisor:</strong> {leaveRequest.supervisor_name}</p>
            <p><strong>Head of Unit:</strong> {leaveRequest.head_user_name}</p>
            <p><strong>Start Date:</strong> {leaveRequest.start_date}</p>
            <p><strong>End Date:</strong> {leaveRequest.end_date}</p>
            <p><strong>Days Requested:</strong> {leaveRequest.days_requested}</p>
            <p><strong>Reason:</strong> {leaveRequest.reason}</p>
            <p><strong>Status:</strong> {leaveRequest.status}</p>
            <p><strong>Submitted At:</strong> {leaveRequest.submitted_at}</p>
            <p><strong>Supervisor Action At:</strong> {leaveRequest.supervisor_action_at || "N/A"}</p>
            <p><strong>Head Action At:</strong> {leaveRequest.head_action_at || "N/A"}</p>

            <br />

            {leaveRequest.status === "pending_head" && (
                <div>
                    <div>
                        <label htmlFor="comment"><strong>Comment</strong></label>
                        <br />
                        <textarea
                            id="comment"
                            name="comment"
                            value={comment}
                            onChange={(event) => setComment(event.target.value)}
                            placeholder="Enter comment (required if rejecting)"
                            rows="4"
                            cols="50"
                        />
                    </div>

                    <br />

                    <button onClick={handleApprove}>Approve</button>
                    <button onClick={handleReject} style={{ marginLeft: "10px" }}>
                        Reject
                    </button>
                </div>
            )}

            <hr />

            <h2>Approval History</h2>

            {approvalHistory.length === 0 ? (
                <p>No approval history found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Action By</th>
                            <th>Role</th>
                            <th>Action</th>
                            <th>Comment</th>
                            <th>Action Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvalHistory.map((action) => (
                            <tr key={action.id}>
                                <td>{action.id}</td>
                                <td>{action.action_by_full_name}</td>
                                <td>{action.action_role}</td>
                                <td>{action.action_type}</td>
                                <td>{action.comment}</td>
                                <td>{action.action_date}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default HeadLeaveRequestDetailPage;
