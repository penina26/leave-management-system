import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import {
    FiArrowLeft,
    FiBriefcase,
    FiSave,
    FiShield,
    FiTag,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function CreateUnitPage() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        head_user_id: "",
    });

    const [users, setUsers] = useState([]);
    const [loadingFormData, setLoadingFormData] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    function getNormalizedRoles(user) {
        if (!Array.isArray(user?.roles)) return [];

        return user.roles.map((role) => {
            if (typeof role === "string") return role;
            if (typeof role === "object" && role !== null) return role.name;
            return "";
        });
    }

    useEffect(() => {
        async function fetchUsers() {
            try {
                setLoadingFormData(true);

                const token = localStorage.getItem("access_token");

                const response = await api.get("/admin/users", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUsers(response.data.users || []);
            } catch (error) {
                console.error(
                    "Failed to load users:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load users");
            } finally {
                setLoadingFormData(false);
            }
        }

        fetchUsers();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    function handleHeadChange(selectedOption) {
        setFormData((prev) => ({
            ...prev,
            head_user_id: selectedOption ? selectedOption.value : "",
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.name.trim()) {
            toast.error("Unit name is required");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("access_token");

            const payload = {
                name: formData.name.trim(),
                description: formData.description.trim(),
                head_user_id: formData.head_user_id
                    ? Number(formData.head_user_id)
                    : null,
            };

            const response = await api.post("/admin/units", payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Unit created successfully");
            navigate("/admin/units");
        } catch (error) {
            console.error(
                "Failed to create unit:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to create unit");
        } finally {
            setSubmitting(false);
        }
    }

    const headsOfUnit = useMemo(
        () =>
            users.filter((user) =>
                getNormalizedRoles(user).includes("head_of_unit")
            ),
        [users]
    );

    const headOptions = useMemo(
        () =>
            headsOfUnit.map((user) => ({
                value: user.id,
                label: user.full_name,
            })),
        [headsOfUnit]
    );

    const selectedHead =
        headOptions.find((option) => option.value === Number(formData.head_user_id)) ||
        null;

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

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Admin Portal
                </p>
                <h1 className="text-3xl font-bold">Create Unit</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Create a new organizational unit and optionally assign a head of unit
                    for approval workflow ownership.
                </p>
            </section>

            {/* Top actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                    to="/admin/units"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Units
                </Link>

                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100">
                    New Unit Record
                </div>
            </div>

            {loadingFormData ? (
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="mt-4 text-sm text-gray-500">Loading form data...</p>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                    <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Unit Information
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Provide the unit name, description, and assign a head of unit if applicable.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Unit Name
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <FiTag className="h-4 w-4" />
                                    </span>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Enter unit name"
                                        disabled={submitting}
                                        className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            <div>
                                <label
                                    htmlFor="head_user_id"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Head of Unit
                                </label>
                                <Select
                                    inputId="head_user_id"
                                    options={headOptions}
                                    value={selectedHead}
                                    onChange={handleHeadChange}
                                    placeholder="Select head of unit"
                                    isClearable
                                    isDisabled={submitting}
                                    styles={selectStyles}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Enter unit description"
                                    rows="5"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none resize-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                                <div className="flex items-center gap-2 text-blue-700 mb-2">
                                    <FiBriefcase className="h-4 w-4" />
                                    <p className="text-sm font-medium">Unit Note</p>
                                </div>
                                <p className="text-sm text-blue-800 leading-6">
                                    Create units that align with the organizational structure used in the leave workflow.
                                </p>
                            </div>

                            <div className="rounded-xl border border-green-100 bg-green-50 p-4">
                                <div className="flex items-center gap-2 text-green-700 mb-2">
                                    <FiShield className="h-4 w-4" />
                                    <p className="text-sm font-medium">Head Assignment</p>
                                </div>
                                <p className="text-sm text-green-800 leading-6">
                                    Only users with the head_of_unit role are shown in the searchable dropdown.
                                </p>
                            </div>
                        </div>
                    </section>

                    <div className="flex items-center justify-end gap-3">
                        <Link
                            to="/admin/units"
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
                            {submitting ? "Creating Unit..." : "Create Unit"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}

export default CreateUnitPage;