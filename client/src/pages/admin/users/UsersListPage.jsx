import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiEdit,
    FiInbox,
    FiPlus,
    FiShield,
    FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function UsersListPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoading(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get("/admin/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUsers(response.data.users || []);
            } catch (error) {
                console.error(
                    "Failed to fetch users:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load users");
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    function getRoleBadgeClass(role) {
        const normalizedRole = role?.toLowerCase();

        if (normalizedRole === "admin") {
            return "bg-red-50 text-red-700 border border-red-200";
        }

        if (normalizedRole === "head_of_unit") {
            return "bg-green-50 text-green-700 border border-green-200";
        }

        if (normalizedRole === "supervisor") {
            return "bg-yellow-50 text-yellow-700 border border-yellow-200";
        }

        if (normalizedRole === "staff") {
            return "bg-blue-50 text-blue-700 border border-blue-200";
        }

        return "bg-gray-50 text-gray-700 border border-gray-200";
    }

    function getStatusBadgeClass(isActive) {
        return isActive
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-gray-100 text-gray-600 border border-gray-200";
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Admin Portal
                </p>
                <h1 className="text-3xl font-bold">Users</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Manage user accounts, role assignments, unit relationships, and staff
                    activation status from the administrative panel.
                </p>
            </section>

            {/* Top actions / summary */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Users</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "--" : users.length}
                            </h2>
                        </div>

                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <FiUsers className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Module</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                User Management
                            </h2>
                        </div>

                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                            <FiShield className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Quick Action</p>
                        <h2 className="text-lg font-semibold text-gray-900 mt-2">
                            Add a new user
                        </h2>
                    </div>

                    <Link
                        to="/admin/users/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition whitespace-nowrap"
                    >
                        <FiPlus className="h-4 w-4" />
                        Create User
                    </Link>
                </div>
            </section>

            {/* Table card */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">User Records</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review user details and open any record to edit account information.
                        </p>
                    </div>

                    {!loading && (
                        <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                            {users.length} user{users.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm text-gray-500">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FiInbox className="h-6 w-6" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                            No users found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            No user accounts are currently available. Create a new user to get
                            started.
                        </p>

                        <Link
                            to="/admin/users/create"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                        >
                            <FiPlus className="h-4 w-4" />
                            Create User
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-700">ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Employee Number
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Full Name
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Username
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Email
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Unit
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Supervisor
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Roles
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Action
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            #{user.id}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.employee_number || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.full_name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.username || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.email || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.unit_name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4 text-gray-700">
                                            {user.supervisor_name || "N/A"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {(user.roles || []).length > 0 ? (
                                                    user.roles.map((role) => (
                                                        <span
                                                            key={`${user.id}-${role}`}
                                                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeClass(
                                                                role
                                                            )}`}
                                                        >
                                                            {role}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-gray-500 text-sm">N/A</span>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                                                    user.is_active
                                                )}`}
                                            >
                                                {user.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/admin/users/${user.id}/edit`}
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

export default UsersListPage;