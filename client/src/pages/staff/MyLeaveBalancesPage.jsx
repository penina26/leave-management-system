import { useEffect, useMemo, useState } from "react";
import { FiCalendar, FiClock, FiLayers } from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../services/api";

function MyLeaveBalancesPage() {
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchMyLeaveBalances() {
            try {
                setLoading(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get("/my-leave-balances", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLeaveBalances(response.data.leave_balances || []);
            } catch (error) {
                console.error(
                    "Failed to fetch leave balances:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave balances");
            } finally {
                setLoading(false);
            }
        }

        fetchMyLeaveBalances();
    }, []);

    function formatDateTime(dateString) {
        if (!dateString) return "N/A";

        const date = new Date(dateString);

        if (Number.isNaN(date.getTime())) {
            return dateString;
        }

        return date.toLocaleString();
    }

    function getRemainingDaysClasses(remainingDays) {
        const value = Number(remainingDays);

        if (value <= 2) {
            return "bg-red-100 text-red-700 border border-red-200";
        }

        if (value <= 5) {
            return "bg-yellow-100 text-yellow-700 border border-yellow-200";
        }

        return "bg-green-100 text-green-700 border border-green-200";
    }

    const summary = useMemo(() => {
        const totalAllocated = leaveBalances.reduce(
            (sum, item) => sum + Number(item.allocated_days || 0),
            0
        );
        const totalUsed = leaveBalances.reduce(
            (sum, item) => sum + Number(item.used_days || 0),
            0
        );
        const totalRemaining = leaveBalances.reduce(
            (sum, item) => sum + Number(item.remaining_days || 0),
            0
        );

        return {
            totalTypes: leaveBalances.length,
            totalAllocated,
            totalUsed,
            totalRemaining,
        };
    }, [leaveBalances]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Staff Portal
                </p>
                <h1 className="text-3xl font-bold">My Leave Balances</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Review your allocated, used, and remaining leave days across all leave
                    types for the available leave year records.
                </p>
            </section>

            {/* Summary cards */}
            {!loading && leaveBalances.length > 0 && (
                <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Leave Types</p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                    {summary.totalTypes}
                                </h2>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                                <FiLayers className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Allocated Days</p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                    {summary.totalAllocated}
                                </h2>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                                <FiCalendar className="h-5 w-5" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Remaining Days</p>
                                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                    {summary.totalRemaining}
                                </h2>
                            </div>
                            <div className="h-12 w-12 rounded-2xl bg-yellow-50 text-yellow-700 flex items-center justify-center">
                                <FiClock className="h-5 w-5" />
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Content card */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Leave Balance Records
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            A detailed breakdown of your leave balances by leave type.
                        </p>
                    </div>

                    {!loading && (
                        <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                            {leaveBalances.length} balance{leaveBalances.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm text-gray-500">
                            Loading your leave balances...
                        </p>
                    </div>
                ) : leaveBalances.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FiCalendar className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            No leave balances found
                        </h3>
                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            No leave balance records are available at the moment. Your leave
                            balances will appear here once they are configured for your account.
                        </p>
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
                                    <th className="px-6 py-4 font-semibold text-gray-700">Year</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Allocated Days
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Used Days
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Remaining Days
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Created At
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Updated At
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {leaveBalances.map((balance) => (
                                    <tr key={balance.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            #{balance.id}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {balance.leave_type_name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {balance.year || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {balance.allocated_days ?? "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {balance.used_days ?? "N/A"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRemainingDaysClasses(
                                                    balance.remaining_days
                                                )}`}
                                            >
                                                {balance.remaining_days ?? "N/A"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {formatDateTime(balance.created_at)}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {formatDateTime(balance.updated_at)}
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

export default MyLeaveBalancesPage;