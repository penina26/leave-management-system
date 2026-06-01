import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../../services/api";

function ApplyLeavePage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        days_requested: 0,
        reason: "",
    });

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [leaveBalances, setLeaveBalances] = useState([]);
    const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true);
    const [loadingBalances, setLoadingBalances] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchInitialData() {
            try {
                const token = localStorage.getItem("access_token");

                setLoadingLeaveTypes(true);
                setLoadingBalances(true);

                const [leaveTypesResponse, leaveBalancesResponse] = await Promise.all([
                    api.get("/leave-types", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    api.get("/my-leave-balances", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                setLeaveTypes(
                    leaveTypesResponse.data.leave_types || leaveTypesResponse.data || []
                );

                setLeaveBalances(
                    leaveBalancesResponse.data.leave_balances ||
                    leaveBalancesResponse.data ||
                    []
                );
            } catch (error) {
                console.error(
                    "Failed to load apply leave page data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave application data");
            } finally {
                setLoadingLeaveTypes(false);
                setLoadingBalances(false);
            }
        }

        fetchInitialData();
    }, []);

    function calculateDaysRequested(startDate, endDate) {
        if (!startDate || !endDate) {
            return 0;
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (end < start) {
            return 0;
        }

        const differenceInTime = end - start;
        return Math.round(differenceInTime / (1000 * 60 * 60 * 24)) + 1;
    }

    function handleChange(event) {
        const { name, value } = event.target;

        const updatedFormData = {
            ...formData,
            [name]: value,
        };

        if (name === "start_date" || name === "end_date") {
            updatedFormData.days_requested = calculateDaysRequested(
                name === "start_date" ? value : formData.start_date,
                name === "end_date" ? value : formData.end_date
            );
        }

        setFormData(updatedFormData);
    }

    const selectedLeaveType = useMemo(() => {
        return leaveTypes.find(
            (leaveType) => String(leaveType.id) === String(formData.leave_type_id)
        );
    }, [leaveTypes, formData.leave_type_id]);

    const leaveYear = useMemo(() => {
        if (formData.start_date) {
            return new Date(formData.start_date).getFullYear();
        }
        return new Date().getFullYear();
    }, [formData.start_date]);

    const selectedLeaveBalance = useMemo(() => {
        if (!formData.leave_type_id) {
            return null;
        }

        return (
            leaveBalances.find(
                (balance) =>
                    String(balance.leave_type_id) === String(formData.leave_type_id) &&
                    Number(balance.year) === Number(leaveYear)
            ) || null
        );
    }, [leaveBalances, formData.leave_type_id, leaveYear]);

    const balanceValidation = useMemo(() => {
        if (!formData.leave_type_id) {
            return {
                canSubmit: true,
                message: "",
                status: "idle",
            };
        }

        if (!selectedLeaveType) {
            return {
                canSubmit: true,
                message: "",
                status: "idle",
            };
        }

        if (!selectedLeaveType.requires_balance) {
            return {
                canSubmit: true,
                message: `${selectedLeaveType.name} does not require leave balance deduction.`,
                status: "info",
            };
        }

        if (!formData.start_date || !formData.end_date || formData.days_requested <= 0) {
            return {
                canSubmit: true,
                message: "",
                status: "idle",
            };
        }

        if (!selectedLeaveBalance) {
            return {
                canSubmit: false,
                message: `No leave balance record was found for ${selectedLeaveType.name} in ${leaveYear}. Please contact HR or admin.`,
                status: "error",
            };
        }

        if (Number(selectedLeaveBalance.remaining_days) <= 0) {
            return {
                canSubmit: false,
                message: `You have exhausted your ${selectedLeaveType.name} balance for ${leaveYear}. Remaining days: 0.`,
                status: "error",
            };
        }

        if (Number(formData.days_requested) > Number(selectedLeaveBalance.remaining_days)) {
            return {
                canSubmit: false,
                message: `Insufficient leave balance. You requested ${formData.days_requested} day(s), but only ${selectedLeaveBalance.remaining_days} day(s) remain for ${selectedLeaveType.name} in ${leaveYear}.`,
                status: "error",
            };
        }

        return {
            canSubmit: true,
            message: `Available balance for ${selectedLeaveType.name}: ${selectedLeaveBalance.remaining_days} day(s) in ${leaveYear}.`,
            status: "success",
        };
    }, [
        formData.leave_type_id,
        formData.start_date,
        formData.end_date,
        formData.days_requested,
        selectedLeaveType,
        selectedLeaveBalance,
        leaveYear,
    ]);

    const isFormComplete =
        formData.leave_type_id &&
        formData.start_date &&
        formData.end_date &&
        Number(formData.days_requested) > 0 &&
        formData.reason.trim();

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.leave_type_id) {
            return toast.error("Please select a leave type");
        }

        if (!formData.start_date || !formData.end_date) {
            return toast.error("Please select both start date and end date");
        }

        if (Number(formData.days_requested) <= 0) {
            return toast.error("Days requested must be greater than 0");
        }

        if (!formData.reason.trim()) {
            return toast.error("Please provide a reason for leave");
        }

        if (!balanceValidation.canSubmit) {
            return toast.error(balanceValidation.message);
        }

        setSubmitting(true);

        try {
            const token = localStorage.getItem("access_token");

            const response = await api.post(
                "/leave-requests",
                {
                    leave_type_id: Number(formData.leave_type_id),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    days_requested: Number(formData.days_requested),
                    reason: formData.reason.trim(),
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log("Leave request submitted successfully:", response.data);
            toast.success("Leave request submitted successfully");

            setFormData({
                leave_type_id: "",
                start_date: "",
                end_date: "",
                days_requested: 0,
                reason: "",
            });

            navigate("/staff/my-leave-requests");
        } catch (error) {
            console.error(
                "Leave request submission failed:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to submit leave request");
        } finally {
            setSubmitting(false);
        }
    }

    const submitDisabled =
        submitting ||
        loadingLeaveTypes ||
        loadingBalances ||
        !isFormComplete ||
        !balanceValidation.canSubmit;

    return (
        <div className="space-y-8">
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 p-8 text-white shadow-sm">
                <p className="mb-2 text-sm uppercase tracking-wide text-blue-100">
                    Staff Portal
                </p>
                <h1 className="text-3xl font-bold">Apply Leave</h1>
                <p className="mt-3 max-w-2xl text-blue-100">
                    Complete the form below to submit a new leave request. Your request
                    will be reviewed through the approval workflow.
                </p>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Leave Request Form
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            Fill in your leave details carefully before submitting.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="leave_type_id"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Leave Type
                            </label>

                            <select
                                id="leave_type_id"
                                name="leave_type_id"
                                value={formData.leave_type_id}
                                onChange={handleChange}
                                required
                                disabled={loadingLeaveTypes || submitting}
                                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            >
                                <option value="">
                                    {loadingLeaveTypes
                                        ? "Loading leave types..."
                                        : "Select leave type"}
                                </option>
                                {leaveTypes.map((leaveType) => (
                                    <option key={leaveType.id} value={leaveType.id}>
                                        {leaveType.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div>
                                <label
                                    htmlFor="start_date"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    id="start_date"
                                    name="start_date"
                                    value={formData.start_date}
                                    onChange={handleChange}
                                    min={today}
                                    required
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="end_date"
                                    className="mb-2 block text-sm font-medium text-gray-700"
                                >
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    id="end_date"
                                    name="end_date"
                                    value={formData.end_date}
                                    onChange={handleChange}
                                    min={formData.start_date || today}
                                    required
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="days_requested"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Days Requested
                            </label>
                            <input
                                type="number"
                                id="days_requested"
                                name="days_requested"
                                value={formData.days_requested}
                                readOnly
                                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-700 outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="reason"
                                className="mb-2 block text-sm font-medium text-gray-700"
                            >
                                Reason
                            </label>
                            <textarea
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Enter reason for leave"
                                rows="5"
                                required
                                disabled={submitting}
                                className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            />
                        </div>

                        {balanceValidation.message && (
                            <div
                                className={`rounded-xl border p-4 text-sm ${balanceValidation.status === "error"
                                        ? "border-red-200 bg-red-50 text-red-700"
                                        : balanceValidation.status === "success"
                                            ? "border-green-200 bg-green-50 text-green-700"
                                            : "border-blue-200 bg-blue-50 text-blue-700"
                                    }`}
                            >
                                {balanceValidation.message}
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitDisabled}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                )}
                                {submitting ? "Submitting..." : "Submit Leave Request"}
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-gray-900">
                        Request Summary
                    </h2>

                    <div className="space-y-4">
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Selected Leave Type
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {formData.leave_type_id
                                    ? selectedLeaveType?.name || "Selected"
                                    : "Not selected"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Duration
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {formData.days_requested > 0
                                    ? `${formData.days_requested} day(s)`
                                    : "Not calculated yet"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Leave Year
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {leaveYear}
                            </p>
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                Available Balance
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {!formData.leave_type_id
                                    ? "Select leave type"
                                    : !selectedLeaveType?.requires_balance
                                        ? "Not balance-based"
                                        : selectedLeaveBalance
                                            ? `${selectedLeaveBalance.remaining_days} day(s)`
                                            : "No balance record found"}
                            </p>
                        </div>

                        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                            <p className="mb-2 text-sm font-medium text-blue-800">
                                Before you submit
                            </p>
                            <ul className="space-y-2 text-sm leading-6 text-blue-700">
                                <li>- Ensure your dates are correct.</li>
                                <li>- Confirm the leave type matches your request.</li>
                                <li>- Check your available leave balance before submitting.</li>
                                <li>- Provide a clear reason for approval processing.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default ApplyLeavePage;