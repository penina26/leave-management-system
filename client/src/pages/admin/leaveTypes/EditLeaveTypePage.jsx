import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
    FiArrowLeft,
    FiCalendar,
    FiEdit3,
    FiHash,
    FiSave,
    FiToggleLeft,
    FiToggleRight,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function EditLeaveTypePage() {
    const { leaveTypeId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        default_days: "",
        requires_balance: false,
        is_active: true,
    });

    const [loadingFormData, setLoadingFormData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchLeaveTypeData() {
            try {
                setLoadingFormData(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get(`/admin/leave-types/${leaveTypeId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const leaveType = response.data.leave_type;

                setFormData({
                    name: leaveType?.name || "",
                    description: leaveType?.description || "",
                    default_days: leaveType?.default_days ?? "",
                    requires_balance: Boolean(leaveType?.requires_balance),
                    is_active: Boolean(leaveType?.is_active),
                });
            } catch (error) {
                console.error(
                    "Failed to load leave type data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave type data");
            } finally {
                setLoadingFormData(false);
            }
        }

        fetchLeaveTypeData();
    }, [leaveTypeId]);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function toggleBooleanField(fieldName) {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: !prev[fieldName],
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Leave type name is required");
            return;
        }

        if (formData.default_days === "") {
            toast.error("Default days is required");
            return;
        }

        if (Number(formData.default_days) < 0) {
            toast.error("Default days cannot be negative");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("access_token");

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                default_days: Number(formData.default_days),
                requires_balance: formData.requires_balance,
                is_active: formData.is_active,
            };

            const response = await api.patch(
                `/admin/leave-types/${leaveTypeId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "Leave type updated successfully");
            navigate("/admin/leave-types");
        } catch (error) {
            console.error(
                "Failed to update leave type:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update leave type");
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
                <h1 className="text-3xl font-bold">Edit Leave Type</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Update the leave type definition, default day allocation, and system
                    settings for balance tracking and active status.
                </p>
            </section>

            {/* Top actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                    to="/admin/leave-types"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Leave Types
                </Link>

                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100">
                    Editing Leave Type #{leaveTypeId}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Leave Type Information */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Leave Type Information
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update the leave type details and default configuration values.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Name
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiCalendar className="h-4 w-4" />
                                </span>

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Enter leave type name"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="default_days"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Default Days
                            </label>

                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiHash className="h-4 w-4" />
                                </span>

                                <input
                                    type="number"
                                    id="default_days"
                                    name="default_days"
                                    value={formData.default_days}
                                    onChange={handleChange}
                                    placeholder="Enter default days"
                                    min="0"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
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
                                    placeholder="Enter leave type description"
                                    rows="5"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none resize-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Settings */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Leave Type Settings
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update balance requirements and active status for this leave type.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => toggleBooleanField("requires_balance")}
                            disabled={submitting}
                            className={`inline-flex items-center justify-between rounded-xl border px-5 py-4 text-sm font-semibold transition ${formData.requires_balance
                                    ? "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
                                    : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                            <span>Requires Balance</span>
                            {formData.requires_balance ? (
                                <FiToggleRight className="h-5 w-5" />
                            ) : (
                                <FiToggleLeft className="h-5 w-5" />
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={() => toggleBooleanField("is_active")}
                            disabled={submitting}
                            className={`inline-flex items-center justify-between rounded-xl border px-5 py-4 text-sm font-semibold transition ${formData.is_active
                                    ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                    : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                                } disabled:cursor-not-allowed disabled:opacity-70`}
                        >
                            <span>Status: {formData.is_active ? "Active" : "Inactive"}</span>
                            {formData.is_active ? (
                                <FiToggleRight className="h-5 w-5" />
                            ) : (
                                <FiToggleLeft className="h-5 w-5" />
                            )}
                        </button>
                    </div>

                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <FiCalendar className="h-4 w-4" />
                            <p className="text-sm font-medium">Configuration Note</p>
                        </div>
                        <p className="text-sm text-blue-800 leading-6">
                            Leave types that require balances will reduce from allocated leave
                            days where balance tracking applies. Inactive leave types remain in
                            historical records but should not be used for new requests.
                        </p>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        to="/admin/leave-types"
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
                        {submitting ? "Updating Leave Type..." : "Update Leave Type"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditLeaveTypePage;