import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
    FiArrowLeft,
    FiCalendar,
    FiEdit3,
    FiHash,
    FiSave,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function EditLeaveBalancePage() {
    const { balanceId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        user_id: "",
        leave_type_id: "",
        year: "",
        allocated_days: "",
        used_days: "",
    });

    const [users, setUsers] = useState([]);
    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loadingFormData, setLoadingFormData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function fetchEditFormData() {
            try {
                setLoadingFormData(true);

                const token = localStorage.getItem("access_token");

                const [balanceResponse, usersResponse, leaveTypesResponse] =
                    await Promise.all([
                        api.get(`/admin/leave-balances/${balanceId}`, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                        api.get("/admin/users", {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                        api.get("/admin/leave-types", {
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }),
                    ]);

                const balance = balanceResponse.data.leave_balance;

                setUsers(usersResponse.data.users || []);
                setLeaveTypes(leaveTypesResponse.data.leave_types || []);

                setFormData({
                    user_id: balance?.user_id || "",
                    leave_type_id: balance?.leave_type_id || "",
                    year: balance?.year ?? "",
                    allocated_days: balance?.allocated_days ?? "",
                    used_days: balance?.used_days ?? "",
                });
            } catch (error) {
                console.error(
                    "Failed to load leave balance data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave balance data");
            } finally {
                setLoadingFormData(false);
            }
        }

        fetchEditFormData();
    }, [balanceId]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleUserChange(selectedOption) {
        setFormData((prev) => ({
            ...prev,
            user_id: selectedOption ? selectedOption.value : "",
        }));
    }

    function handleLeaveTypeChange(selectedOption) {
        setFormData((prev) => ({
            ...prev,
            leave_type_id: selectedOption ? selectedOption.value : "",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.user_id) {
            toast.error("User is required");
            return;
        }

        if (!formData.leave_type_id) {
            toast.error("Leave type is required");
            return;
        }

        if (formData.year === "") {
            toast.error("Year is required");
            return;
        }

        if (formData.allocated_days === "") {
            toast.error("Allocated days is required");
            return;
        }

        if (formData.used_days === "") {
            toast.error("Used days is required");
            return;
        }

        if (Number(formData.year) < 0) {
            toast.error("Year must be a valid positive number");
            return;
        }

        if (Number(formData.allocated_days) < 0) {
            toast.error("Allocated days cannot be negative");
            return;
        }

        if (Number(formData.used_days) < 0) {
            toast.error("Used days cannot be negative");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("access_token");

            const payload = {
                user_id: Number(formData.user_id),
                leave_type_id: Number(formData.leave_type_id),
                year: Number(formData.year),
                allocated_days: Number(formData.allocated_days),
                used_days: Number(formData.used_days),
            };

            const response = await api.patch(
                `/admin/leave-balances/${balanceId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(
                response.data.message || "Leave balance updated successfully"
            );

            navigate("/admin/leave-balances");
        } catch (error) {
            console.error(
                "Failed to update leave balance:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update leave balance");
        } finally {
            setSubmitting(false);
        }
    }

    const userOptions = useMemo(
        () =>
            users.map((user) => ({
                value: user.id,
                label: user.full_name,
            })),
        [users]
    );

    const leaveTypeOptions = useMemo(
        () =>
            leaveTypes.map((leaveType) => ({
                value: leaveType.id,
                label: leaveType.name,
            })),
        [leaveTypes]
    );

    const selectedUser =
        userOptions.find((option) => option.value === Number(formData.user_id)) || null;

    const selectedLeaveType =
        leaveTypeOptions.find(
            (option) => option.value === Number(formData.leave_type_id)
        ) || null;

    const remainingDays =
        formData.allocated_days !== "" && formData.used_days !== ""
            ? Number(formData.allocated_days) - Number(formData.used_days)
            : null;

    const selectStyles = {
        control: (base, state) => ({
            ...base,
            minHeight: "48px",
            borderRadius: "0.75rem",
            borderColor: state.isFocused ? "#2563eb" : "#d1d5db",
            boxShadow: state.isFocused ? "0 0 0 2px rgba(219, 234, 254, 1)" : "none",
            "&:hover": {
                borderColor: state.isFocused ? "#2563eb" : "#9ca3af",
            },
            backgroundColor: state.isDisabled ? "#f3f4f6" : "#ffffff",
        }),
        placeholder: (base) => ({
            ...base,
            color: "#9ca3af",
            fontSize: "0.875rem",
        }),
        singleValue: (base) => ({
            ...base,
            fontSize: "0.875rem",
            color: "#111827",
        }),
        menu: (base) => ({
            ...base,
            zIndex: 30,
        }),
    };

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
                <h1 className="text-3xl font-bold">Edit Leave Balance</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Update the balance allocation for a user by leave type and year, then
                    review the resulting remaining days.
                </p>
            </section>

            {/* Top actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                    to="/admin/leave-balances"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Leave Balances
                </Link>

                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100">
                    Editing Balance #{balanceId}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Balance Information */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Balance Information
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update the user, leave type, year, and day allocations for this leave balance record.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="user_id"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                User
                            </label>
                            <Select
                                inputId="user_id"
                                options={userOptions}
                                value={selectedUser}
                                onChange={handleUserChange}
                                placeholder="Select user"
                                isClearable
                                isDisabled={submitting}
                                styles={selectStyles}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="leave_type_id"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Leave Type
                            </label>
                            <Select
                                inputId="leave_type_id"
                                options={leaveTypeOptions}
                                value={selectedLeaveType}
                                onChange={handleLeaveTypeChange}
                                placeholder="Select leave type"
                                isClearable
                                isDisabled={submitting}
                                styles={selectStyles}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="year"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Year
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiCalendar className="h-4 w-4" />
                                </span>
                                <input
                                    type="number"
                                    id="year"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    placeholder="Enter year"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="allocated_days"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Allocated Days
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiHash className="h-4 w-4" />
                                </span>
                                <input
                                    type="number"
                                    id="allocated_days"
                                    name="allocated_days"
                                    value={formData.allocated_days}
                                    onChange={handleChange}
                                    placeholder="Enter allocated days"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="used_days"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Used Days
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiEdit3 className="h-4 w-4" />
                                </span>
                                <input
                                    type="number"
                                    id="used_days"
                                    name="used_days"
                                    value={formData.used_days}
                                    onChange={handleChange}
                                    placeholder="Enter used days"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Balance Summary */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Balance Summary
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Review the remaining days based on allocated and used leave values.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-blue-700 font-medium">
                                Allocated Days
                            </p>
                            <p className="mt-2 text-lg font-semibold text-blue-900">
                                {formData.allocated_days === "" ? "--" : formData.allocated_days}
                            </p>
                        </div>

                        <div className="rounded-xl border border-yellow-100 bg-yellow-50 p-4">
                            <p className="text-xs uppercase tracking-wide text-yellow-700 font-medium">
                                Used Days
                            </p>
                            <p className="mt-2 text-lg font-semibold text-yellow-900">
                                {formData.used_days === "" ? "--" : formData.used_days}
                            </p>
                        </div>

                        <div
                            className={`rounded-xl border p-4 ${remainingDays === null
                                    ? "border-gray-200 bg-gray-50"
                                    : remainingDays < 0
                                        ? "border-red-100 bg-red-50"
                                        : remainingDays <= 5
                                            ? "border-yellow-100 bg-yellow-50"
                                            : "border-green-100 bg-green-50"
                                }`}
                        >
                            <p
                                className={`text-xs uppercase tracking-wide font-medium ${remainingDays === null
                                        ? "text-gray-600"
                                        : remainingDays < 0
                                            ? "text-red-700"
                                            : remainingDays <= 5
                                                ? "text-yellow-700"
                                                : "text-green-700"
                                    }`}
                            >
                                Remaining Days
                            </p>
                            <p
                                className={`mt-2 text-lg font-semibold ${remainingDays === null
                                        ? "text-gray-800"
                                        : remainingDays < 0
                                            ? "text-red-900"
                                            : remainingDays <= 5
                                                ? "text-yellow-900"
                                                : "text-green-900"
                                    }`}
                            >
                                {remainingDays === null ? "--" : remainingDays}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        to="/admin/leave-balances"
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
                        {submitting ? "Updating Leave Balance..." : "Update Leave Balance"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditLeaveBalancePage;