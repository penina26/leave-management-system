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

    const today = new Date().toISOString().split("T")[0];

    useEffect(() => {
        async function fetchLeaveTypes() {
            try {
                const token = localStorage.getItem("token");

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
        }
    }

    return (
        <div>
            <h1>Apply Leave</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="leave_type_id">Leave Type</label>
                    <br />
                    <select
                        id="leave_type_id"
                        name="leave_type_id"
                        value={formData.leave_type_id}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select leave type</option>
                        {leaveTypes.map((leaveType) => (
                            <option key={leaveType.id} value={leaveType.id}>
                                {leaveType.name}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                <div>
                    <label htmlFor="start_date">Start Date</label>
                    <br />
                    <input
                        type="date"
                        id="start_date"
                        name="start_date"
                        value={formData.start_date}
                        onChange={handleChange}
                        min={today}
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="end_date">End Date</label>
                    <br />
                    <input
                        type="date"
                        id="end_date"
                        name="end_date"
                        value={formData.end_date}
                        onChange={handleChange}
                        min={formData.start_date || today}
                        required
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="days_requested">Days Requested</label>
                    <br />
                    <input
                        type="number"
                        id="days_requested"
                        name="days_requested"
                        value={formData.days_requested}
                        readOnly
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="reason">Reason</label>
                    <br />
                    <textarea
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        placeholder="Enter reason for leave"
                        rows="4"
                        cols="40"
                        required
                    />
                </div>

                <br />

                <button type="submit">Submit Leave Request</button>
            </form>
        </div>
    );
}

export default ApplyLeavePage;
