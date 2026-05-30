import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiEdit,
    FiInbox,
    FiPlus,
    FiShield,
    FiTrash2,
    FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function RolesListPage() {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deletingRoleId, setDeletingRoleId] = useState(null);

    async function fetchRoles() {
        try {
            setLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await api.get("/admin/roles", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRoles(response.data.roles || []);
        } catch (error) {
            console.error(
                "Failed to fetch roles:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to load roles");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchRoles();
    }, []);

    async function handleDeleteRole(roleId, roleName) {
        const confirmed = window.confirm(
            `Are you sure you want to delete the role "${roleName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingRoleId(roleId);

            const token = localStorage.getItem("access_token");

            const response = await api.delete(`/admin/roles/${roleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Role deleted successfully");
            fetchRoles();
        } catch (error) {
            console.error(
                "Failed to delete role:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to delete role");
        } finally {
            setDeletingRoleId(null);
        }
    }

    function getRoleBadgeClass(roleName) {
        const normalizedRole = roleName?.toLowerCase();

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Admin Portal
                </p>
                <h1 className="text-3xl font-bold">Roles</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Manage role definitions, review role descriptions, and monitor how many
                    users are assigned to each role.
                </p>
            </section>

            {/* Top summary / action */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Total Roles</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                {loading ? "--" : roles.length}
                            </h2>
                        </div>

                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <FiShield className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Module</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                Role Management
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
                            Add a new role
                        </h2>
                    </div>

                    <Link
                        to="/admin/roles/create"
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition whitespace-nowrap"
                    >
                        <FiPlus className="h-4 w-4" />
                        Create Role
                    </Link>
                </div>
            </section>

            {/* Table card */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between flex-wrap gap-3">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Role Records</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review role definitions and manage role configuration records.
                        </p>
                    </div>

                    {!loading && (
                        <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                            {roles.length} role{roles.length === 1 ? "" : "s"}
                        </div>
                    )}
                </div>

                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                        <p className="mt-4 text-sm text-gray-500">Loading roles...</p>
                    </div>
                ) : roles.length === 0 ? (
                    <div className="p-10 text-center">
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <FiInbox className="h-6 w-6" />
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900">
                            No roles found
                        </h3>

                        <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                            No role records are currently available. Create a new role to get started.
                        </p>

                        <Link
                            to="/admin/roles/create"
                            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                        >
                            <FiPlus className="h-4 w-4" />
                            Create Role
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
                                        User Count
                                    </th>
                                    <th className="px-6 py-4 font-semibold text-gray-700">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-200">
                                {roles.map((role) => (
                                    <tr key={role.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">
                                            #{role.id}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span
                                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${getRoleBadgeClass(
                                                    role.name
                                                )}`}
                                            >
                                                {role.name || "N/A"}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4 text-gray-700 max-w-md">
                                            {role.description || "N/A"}
                                        </td>

                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-200">
                                                {role.user_count ?? 0}
                                            </span>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <Link
                                                    to={`/admin/roles/${role.id}/edit`}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition"
                                                >
                                                    <FiEdit className="h-4 w-4" />
                                                    Edit
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => handleDeleteRole(role.id, role.name)}
                                                    disabled={deletingRoleId === role.id}
                                                    className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {deletingRoleId === role.id ? (
                                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-700 border-t-transparent"></span>
                                                    ) : (
                                                        <FiTrash2 className="h-4 w-4" />
                                                    )}
                                                    Delete
                                                </button>
                                            </div>
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

export default RolesListPage;