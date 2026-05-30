import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

function ApplyLeavePage() {
    const [formData, setFormData] = useState({
        leave_type_id: "",
        start_date: "",
        end_date: "",
        days_requested: 0,
        reason: "",
    });

    const [leaveTypes, setLeaveTypes] = useState([]);
    const [loadingLeaveTypes, setLoadingLeaveTypes] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchLeaveTypes() {
            try {
                setLoadingLeaveTypes(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get("/leave-types", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setLeaveTypes(response.data.leave_types || response.data);
            } catch (error) {
                console.error(
                    "Failed to fetch leave types:",
                    error.response?.data || error.message
                );
                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load leave types");
            } finally {
                setLoadingLeaveTypes(false);
            }
        }

        fetchLeaveTypes();
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

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.leave_type_id) {
            return toast.error("Please select a leave type");
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
                    reason: formData.reason,
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Staff Portal
                </p>
                <h1 className="text-3xl font-bold">Apply Leave</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Complete the form below to submit a new leave request. Your request
                    will be reviewed through the approval workflow.
                </p>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form card */}
                <section className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Leave Request Form
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Fill in your leave details carefully before submitting.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Leave Type */}
                        <div>
                            <label
                                htmlFor="leave_type_id"
                                className="block text-sm font-medium text-gray-700 mb-2"
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
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm bg-white outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value="">
                                    {loadingLeaveTypes ? "Loading leave types..." : "Select leave type"}
                                </option>
                                {leaveTypes.map((leaveType) => (
                                    <option key={leaveType.id} value={leaveType.id}>
                                        {leaveType.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Dates */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    htmlFor="start_date"
                                    className="block text-sm font-medium text-gray-700 mb-2"
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
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="end_date"
                                    className="block text-sm font-medium text-gray-700 mb-2"
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
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        {/* Days Requested */}
                        <div>
                            <label
                                htmlFor="days_requested"
                                className="block text-sm font-medium text-gray-700 mb-2"
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

                        {/* Reason */}
                        <div>
                            <label
                                htmlFor="reason"
                                className="block text-sm font-medium text-gray-700 mb-2"
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
                                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none resize-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        {/* Submit */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={submitting || loadingLeaveTypes}
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {submitting && (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                                )}
                                {submitting ? "Submitting..." : "Submit Leave Request"}
                            </button>
                        </div>
                    </form>
                </section>

                {/* Side info card */}
                <aside className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 h-fit">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        Request Summary
                    </h2>

                    <div className="space-y-4">
                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                                Selected Leave Type
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {formData.leave_type_id
                                    ? leaveTypes.find(
                                        (leaveType) =>
                                            String(leaveType.id) === String(formData.leave_type_id)
                                    )?.name || "Selected"
                                    : "Not selected"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
                            <p className="text-xs uppercase tracking-wide text-gray-500 font-medium">
                                Duration
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                {formData.days_requested > 0
                                    ? `${formData.days_requested} day(s)`
                                    : "Not calculated yet"}
                            </p>
                        </div>

                        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4">
                            <p className="text-sm font-medium text-blue-800 mb-2">
                                Before you submit
                            </p>
                            <ul className="text-sm text-blue-700 space-y-2 leading-6">
                                <li>• Ensure your dates are correct.</li>
                                <li>• Confirm the leave type matches your request.</li>
                                <li>• Provide a clear reason for approval processing.</li>
                            </ul>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}

export default ApplyLeavePage;