import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    FiAlertCircle,
    FiArrowLeft,
    FiCheckCircle,
    FiClock,
    FiSend,
    FiXCircle,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";

function SupervisorLeaveRequestDetailPage() {
    const { requestId } = useParams();

    const [leaveRequest, setLeaveRequest] = useState(null);
    const [approvalHistory, setApprovalHistory] = useState([]);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    async function fetchLeaveRequestDetail() {
        try {
            setLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await api.get(`/supervisor/leave-requests/${requestId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setLeaveRequest(response.data.leave_request || null);
            setApprovalHistory(response.data.approval_history || []);
        } catch (error) {
            console.error(
                "Failed to fetch supervisor leave request detail:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to load leave request detail");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchLeaveRequestDetail();
    }, [requestId]);

    async function handleEndorse() {
        try {
            setActionLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await api.patch(
                `/leave-requests/${requestId}/endorse`,
                {
                    comment: comment.trim() || "Recommended for approval",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Leave request endorsed successfully");
            setComment("");
            fetchLeaveRequestDetail();
        } catch (error) {
            console.error(
                "Failed to endorse leave request:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to endorse leave request");
        } finally {
            setActionLoading(false);
        }
    }

    async function handleReject() {
        if (!comment.trim()) {
            toast.error("Comment is required when rejecting a leave request");
            return;
        }

        try {
            setActionLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await api.patch(
                `/leave-requests/${requestId}/reject`,
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
        } finally {
            setActionLoading(false);
        }
    }

    function formatDate(dateString) {
        if (!dateString) return "N/A";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleDateString();
    }

    function formatDateTime(dateString) {
        if (!dateString) return "N/A";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString();
    }

    function getStatusClasses(status) {
        const normalizedStatus = status?.toLowerCase();

        if (normalizedStatus === "approved") {
            return "bg-green-100 text-green-700 border border-green-200";
        }

        if (normalizedStatus === "rejected") {
            return "bg-red-100 text-red-700 border border-red-200";
        }

        if (
            normalizedStatus === "pending" ||
            normalizedStatus === "pending_supervisor" ||
            normalizedStatus === "pending_head"
        ) {
            return "bg-yellow-100 text-yellow-700 border border-yellow-200";
        }

        return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    function getActionClasses(actionType) {
        const normalizedAction = actionType?.toLowerCase();

        if (
            normalizedAction === "approved" ||
            normalizedAction === "endorse" ||
            normalizedAction === "endorsed"
        ) {
            return "bg-green-100 text-green-700 border border-green-200";
        }

        if (normalizedAction === "rejected" || normalizedAction === "reject") {
            return "bg-red-100 text-red-700 border border-red-200";
        }

        if (
            normalizedAction === "submitted" ||
            normalizedAction === "pending" ||
            normalizedAction === "forwarded"
        ) {
            return "bg-blue-100 text-blue-700 border border-blue-200";
        }

        return "bg-gray-100 text-gray-700 border border-gray-200";
    }

    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-500">
                    Loading leave request detail...
                </p>
            </div>
        );
    }

    if (!leaveRequest) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
                    <FiAlertCircle className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                    Leave request not found
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                    We could not find the requested leave record.
                </p>

                <Link
                    to="/supervisor/pending-requests"
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Pending Requests
                </Link>
            </div>
        );
    }

    const detailItems = [
        { label: "Request ID", value: `#${leaveRequest.id}` },
        { label: "Applicant", value: leaveRequest.applicant_name || "N/A" },
        { label: "Leave Type", value: leaveRequest.leave_type_name || "N/A" },
        { label: "Unit", value: leaveRequest.unit_name || "N/A" },
        { label: "Supervisor", value: leaveRequest.supervisor_name || "N/A" },
        { label: "Head of Unit", value: leaveRequest.head_user_name || "N/A" },
        { label: "Start Date", value: formatDate(leaveRequest.start_date) },
        { label: "End Date", value: formatDate(leaveRequest.end_date) },
        {
            label: "Days Requested",
            value: leaveRequest.days_requested ?? "N/A",
        },
        { label: "Submitted At", value: formatDateTime(leaveRequest.submitted_at) },
        {
            label: "Supervisor Action At",
            value: formatDateTime(leaveRequest.supervisor_action_at),
        },
        {
            label: "Head Action At",
            value: formatDateTime(leaveRequest.head_action_at),
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Supervisor Portal
                </p>
                <h1 className="text-3xl font-bold">Leave Request Detail</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Review the request information carefully and decide whether to endorse
                    or reject the leave application.
                </p>
            </section>

            {/* Top actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                    to="/supervisor/pending-requests"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Pending Requests
                </Link>

                <span
                    className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium ${getStatusClasses(
                        leaveRequest.status
                    )}`}
                >
                    {leaveRequest.status || "Unknown"}
                </span>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main request info */}
                <section className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Leave Request Information
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review the applicant details and request timeline before taking action.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {detailItems.map((item) => (
                            <div
                                key={item.label}
                                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                            >
                                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-sm font-semibold text-gray-900 break-words">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                            Reason
                        </p>
                        <p className="mt-2 text-sm text-gray-800 leading-6">
                            {leaveRequest.reason || "N/A"}
                        </p>
                    </div>
                </section>

                {/* Summary side panel */}
                <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Request Summary
                    </h2>

                    <div className="space-y-4">
                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                            <p className="text-xs uppercase tracking-wide text-blue-700 font-medium">
                                Current Status
                            </p>
                            <p className="mt-2 text-sm font-semibold text-blue-900">
                                {leaveRequest.status || "Unknown"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                                Applicant
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {leaveRequest.applicant_name || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                                Leave Type
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {leaveRequest.leave_type_name || "N/A"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                                Duration
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {leaveRequest.days_requested ?? "N/A"} day(s)
                            </p>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Action section */}
            {leaveRequest.status === "pending_supervisor" && (
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Supervisor Action
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Add a comment and choose whether to endorse or reject this request.
                        </p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label
                                htmlFor="comment"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Comment
                            </label>
                            <textarea
                                id="comment"
                                name="comment"
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                placeholder="Enter comment (required if rejecting)"
                                rows="5"
                                disabled={actionLoading}
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none resize-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                            <p className="mt-2 text-xs text-gray-500">
                                A comment is optional for endorsement but required for rejection.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleEndorse}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {actionLoading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                ) : (
                                    <FiCheckCircle className="h-4 w-4" />
                                )}
                                Endorse
                            </button>

                            <button
                                type="button"
                                onClick={handleReject}
                                disabled={actionLoading}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white hover:bg-red-700 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {actionLoading ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                ) : (
                                    <FiXCircle className="h-4 w-4" />
                                )}
                                Reject
                            </button>
                        </div>
                    </div>
                </section>
            )}

            {/* Approval history */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Approval History
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        A record of all actions taken on this leave request.
                    </p>
                </div>

                {approvalHistory.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FiClock className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            No approval history found
                        </h3>
                        <p className="mt-2 text-sm text-gray-500">
                            No approval actions have been recorded for this request yet.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Action By
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Action
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Comment
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Action Date
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {approvalHistory.map((action) => (
                                    <tr key={action.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            #{action.id}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {action.action_by_full_name || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {action.action_role || "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getActionClasses(
                                                    action.action_type
                                                )}`}
                                            >
                                                {action.action_type || "N/A"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 max-w-md">
                                            {action.comment || "N/A"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700">
                                            {formatDateTime(action.action_date)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}

export default SupervisorLeaveRequestDetailPage;