import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { FiFileText } from "react-icons/fi";
import api from "../../services/api";

function MyLeaveRequestsPage() {
    const [leaveRequests, setLeaveRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMyLeaveRequests() {
            try {
                setLoading(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get("/my-leave-requests", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLeaveRequests(response.data.leave_requests || []);
            } catch (error) {
                console.error(
                    "Failed to fetch leave requests:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave requests");
            } finally {
                setLoading(false);
            }
        }

        fetchMyLeaveRequests();
    }, []);

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Staff Portal
                </p>
                <h1 className="text-3xl font-bold">My Leave Requests</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Review all your submitted leave requests, track their approval status,
                    and open individual requests for more details.
                </p>
            </section>

            {/* Content card */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Submitted Requests
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            A record of all leave requests you have submitted.
                        </p>
                    </div>

                    <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                        {leaveRequests.length} request{leaveRequests.length === 1 ? "" : "s"}
                    </div>
                </div>

                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm text-gray-500">
                            Loading your leave requests...
                        </p>
                    </div>
                ) : leaveRequests.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 text-xl">
                            <FiFileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            No leave requests found
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            You have not submitted any leave requests yet. Once you apply for
                            leave, your requests will appear here.
                        </p>

                        <Link
                            to="/staff/apply-leave"
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                        >
                            Apply Leave
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Leave Type
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        End Date
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Days
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Reason
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Submitted At
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {leaveRequests.map((leaveRequest) => (
                                    <tr key={leaveRequest.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            #{leaveRequest.id}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {leaveRequest.leave_type_name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {formatDate(leaveRequest.start_date)}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {formatDate(leaveRequest.end_date)}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {leaveRequest.days_requested ?? "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700 max-w-xs">
                                            <p className="line-clamp-2">
                                                {leaveRequest.reason || "N/A"}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                    leaveRequest.status
                                                )}`}
                                            >
                                                {leaveRequest.status || "Unknown"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {formatDateTime(leaveRequest.submitted_at)}
                                        </td>

                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/staff/my-leave-requests/${leaveRequest.id}`}
                                                className="inline-flex items-center rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                                            >
                                                View Details
                                            </Link>
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

export default MyLeaveRequestsPage;