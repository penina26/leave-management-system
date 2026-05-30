import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiBriefcase,
    FiEdit,
    FiInbox,
    FiPlus,
    FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function UnitsListPage() {
    const [units, setUnits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUnits() {
            try {
                setLoading(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get("/admin/units", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUnits(response.data.units || []);
            } catch (error) {
                console.error(
                    "Failed to fetch units:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load units");
            } finally {
                setLoading(false);
            }
        }

        fetchUnits();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Admin Portal
                </p>
                <h1 className="text-3xl font-bold">Units</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Manage organizational units, assign heads of unit, and review member
                    counts for each unit.
                </p>
            </section>

            {/* Top summary / action */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Units</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "--" : units.length}
                            </h2>
                        </div>

                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <FiBriefcase className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Module</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                Unit Management
                            </h2>
                        </div>

                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                            <FiUsers className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Quick Action</p>
                        <h2 className="text-lg font-semibold text-gray-900 mt-2">
                            Add a new unit
                        </h2>
                    </div>

                    <Link
                        to="/admin/units/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition whitespace-nowrap"
                    >
                        <FiPlus className="h-4 w-4" />
                        Create Unit
                    </Link>
                </div>
            </section>

            {/* Table */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Unit Records</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review unit details and open any record to edit the unit information.
                        </p>
                    </div>

                    {!loading && (
                        <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                            {units.length} unit{units.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm text-gray-500">Loading units...</p>
                    </div>
                ) : units.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FiInbox className="h-6 w-6" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                            No units found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            No organizational units are available yet. Create a new unit to
                            get started.
                        </p>

                        <Link
                            to="/admin/units/create"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                        >
                            <FiPlus className="h-4 w-4" />
                            Create Unit
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Description
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Head of Unit
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Member Count
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {units.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            #{unit.id}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {unit.name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700 max-w-md">
                                            {unit.description || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {unit.head_user_name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                                                {unit.member_count ?? 0}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/units/${unit.id}/edit`}
                                                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                                            >
                                                <FiEdit className="h-4 w-4" />
                                                Edit
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

export default UnitsListPage;