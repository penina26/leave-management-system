import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiEdit3,
    FiSave,
    FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function EditRolePage() {
    const { roleId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [loadingFormData, setLoadingFormData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchRoleData() {
            try {
                setLoadingFormData(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get(`/admin/roles/${roleId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const role = response.data.role;

                setFormData({
                    name: role?.name || "",
                    description: role?.description || "",
                });
            } catch (error) {
                console.error(
                    "Failed to load role data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load role data");
            } finally {
                setLoadingFormData(false);
            }
        }

        fetchRoleData();
    }, [roleId]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Role name is required");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("access_token");

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
            };

            const response = await api.patch(`/admin/roles/${roleId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Role updated successfully");
            navigate("/admin/roles");
        } catch (error) {
            console.error(
                "Failed to update role:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update role");
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingFormData) {
        return (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                <p className="mt-4 text-sm text-gray-500">Loading edit form...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Admin Portal
                </p>
                <h1 className="text-3xl font-bold">Edit Role</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Update the role name and description used to control access permissions
                    and workflow responsibilities.
                </p>
            </section>

            {/* Top actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                    to="/admin/roles"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Roles
                </Link>

                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100">
                    Editing Role #{roleId}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Role Information
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update the role definition and keep descriptions clear for easier
                            access management.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-5">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Role Name
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiShield className="h-4 w-4" />
                                </span>

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter role name"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Description
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute top-3 left-0 flex items-start pl-4 text-gray-400">
                                    <FiEdit3 className="h-4 w-4" />
                                </span>

                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter role description"
                                    rows="5"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none resize-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <FiShield className="h-4 w-4" />
                            <p className="text-sm font-medium">Role Note</p>
                        </div>
                        <p className="text-sm text-blue-800 leading-6">
                            Use clear and consistent naming so the role remains easy to
                            understand when assigned to users and referenced in workflow rules.
                        </p>
                    </div>
                </section>

                <div className="flex items-center justify-end gap-3">
                    <Link
                        to="/admin/roles"
                        className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                    >
                        Cancel
                    </Link>

                    <button
                        type="submit"
                        disabled={submitting || loadingFormData}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-70"
                    >
                        {submitting ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                        ) : (
                            <FiSave className="h-4 w-4" />
                        )}
                        {submitting ? "Updating Role..." : "Update Role"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditRolePage;
