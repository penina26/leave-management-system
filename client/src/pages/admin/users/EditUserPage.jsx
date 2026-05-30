import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import {
    FiArrowLeft,
    FiBriefcase,
    FiHash,
    FiLock,
    FiMail,
    FiSave,
    FiShield,
    FiToggleLeft,
    FiToggleRight,
    FiUser,
    FiUsers,
} from "react-icons/fi";
import { toast } from "react-toastify";
import api from "../../../services/api";

function EditUserPage() {
    const { userId } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        employee_number: "",
        full_name: "",
        username: "",
        email: "",
        password: "",
        unit_id: "",
        supervisor_id: "",
        role_ids: [],
        is_active: true,
    });

    const [units, setUnits] = useState([]);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);

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
        async function fetchEditFormData() {
            try {
                setLoadingFormData(true);

                const token = localStorage.getItem("access_token");

                const [usersResponse, unitsResponse, rolesResponse] = await Promise.all([
                    api.get("/admin/users", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    api.get("/admin/units", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    api.get("/admin/roles", {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                const allUsers = usersResponse.data.users || [];
                const allUnits = unitsResponse.data.units || [];
                const allRoles = rolesResponse.data.roles || [];

                const foundUser = allUsers.find((item) => item.id === Number(userId));

                if (!foundUser) {
                    toast.error("User not found");
                    setLoadingFormData(false);
                    return;
                }

                setUsers(allUsers);
                setUnits(allUnits);
                setRoles(allRoles);

                const selectedRoleIds = allRoles
                    .filter((role) => getNormalizedRoles(foundUser).includes(role.name))
                    .map((role) => role.id);

                setFormData({
                    employee_number: foundUser.employee_number || "",
                    full_name: foundUser.full_name || "",
                    username: foundUser.username || "",
                    email: foundUser.email || "",
                    password: "",
                    unit_id: foundUser.unit_id || "",
                    supervisor_id: foundUser.supervisor_id || "",
                    role_ids: selectedRoleIds,
                    is_active: Boolean(foundUser.is_active),
                });
            } catch (error) {
                console.error(
                    "Failed to load edit user form data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load user data");
            } finally {
                setLoadingFormData(false);
            }
        }

        fetchEditFormData();
    }, [userId]);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    }

    function handleRoleChange(event) {
        const { value, checked } = event.target;
        const numericRoleId = Number(value);

        setFormData((prev) => ({
            ...prev,
            role_ids: checked
                ? [...prev.role_ids, numericRoleId]
                : prev.role_ids.filter((roleId) => roleId !== numericRoleId),
        }));
    }

    function handleUnitChange(selectedOption) {
        setFormData((prev) => ({
            ...prev,
            unit_id: selectedOption ? selectedOption.value : "",
        }));
    }

    function handleSupervisorChange(selectedOption) {
        setFormData((prev) => ({
            ...prev,
            supervisor_id: selectedOption ? selectedOption.value : "",
        }));
    }

    function toggleActiveStatus() {
        setFormData((prev) => ({
            ...prev,
            is_active: !prev.is_active,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!formData.employee_number.trim()) {
            toast.error("Employee number is required");
            return;
        }

        if (!formData.full_name.trim()) {
            toast.error("Full name is required");
            return;
        }

        if (!formData.username.trim()) {
            toast.error("Username is required");
            return;
        }

        if (!formData.email.trim()) {
            toast.error("Email is required");
            return;
        }

        if (formData.role_ids.length === 0) {
            toast.error("Please select at least one role");
            return;
        }

        try {
            setSubmitting(true);

            const token = localStorage.getItem("access_token");

            const payload = {
                employee_number: formData.employee_number.trim(),
                full_name: formData.full_name.trim(),
                username: formData.username.trim(),
                email: formData.email.trim(),
                unit_id: formData.unit_id ? Number(formData.unit_id) : null,
                supervisor_id: formData.supervisor_id
                    ? Number(formData.supervisor_id)
                    : null,
                is_active: formData.is_active,
                role_ids: formData.role_ids,
            };

            if (formData.password.trim() !== "") {
                payload.password = formData.password;
            }

            const response = await api.patch(`/admin/users/${userId}`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "User updated successfully");
            navigate("/admin/users");
        } catch (error) {
            console.error(
                "Failed to update user:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update user");
        } finally {
            setSubmitting(false);
        }
    }

    const unitOptions = useMemo(
        () =>
            units.map((unit) => ({
                value: unit.id,
                label: unit.name,
            })),
        [units]
    );

    const supervisors = useMemo(
        () =>
            users.filter((user) =>
                getNormalizedRoles(user).includes("supervisor")
            ),
        [users]
    );

    const supervisorOptions = useMemo(
        () =>
            supervisors.map((user) => ({
                value: user.id,
                label: user.full_name,
            })),
        [supervisors]
    );

    const selectedUnit =
        unitOptions.find((option) => option.value === Number(formData.unit_id)) ||
        null;

    const selectedSupervisor =
        supervisorOptions.find(
            (option) => option.value === Number(formData.supervisor_id)
        ) || null;

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
                <h1 className="text-3xl font-bold">Edit User</h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Update user account details, role assignments, unit links, and account
                    activation status.
                </p>
            </section>

            {/* Top actions */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <Link
                    to="/admin/users"
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    <FiArrowLeft className="h-4 w-4" />
                    Back to Users
                </Link>

                <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 border border-blue-100">
                    Editing User #{userId}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Basic Information */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Basic Information
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update personal and account details for the selected user.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="employee_number"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Employee Number
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiHash className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    id="employee_number"
                                    name="employee_number"
                                    value={formData.employee_number}
                                    onChange={handleChange}
                                    placeholder="Enter employee number"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="full_name"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Full Name
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiUser className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    id="full_name"
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    placeholder="Enter full name"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Username
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiUsers className="h-4 w-4" />
                                </span>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    placeholder="Enter username"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Email
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiMail className="h-4 w-4" />
                                </span>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="Enter email"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                    <FiLock className="h-4 w-4" />
                                </span>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Leave blank to keep current password"
                                    disabled={submitting}
                                    className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                            <p className="mt-2 text-xs text-gray-500">
                                Leave this blank if you do not want to change the user’s current password.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Assignment Details */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Assignment Details
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update the unit association and supervisor relationship.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label
                                htmlFor="unit_id"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Unit
                            </label>
                            <Select
                                inputId="unit_id"
                                options={unitOptions}
                                value={selectedUnit}
                                onChange={handleUnitChange}
                                placeholder="Select unit"
                                isClearable
                                isDisabled={submitting}
                                styles={selectStyles}
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="supervisor_id"
                                className="block text-sm font-medium text-gray-700 mb-2"
                            >
                                Supervisor
                            </label>
                            <Select
                                inputId="supervisor_id"
                                options={supervisorOptions}
                                value={selectedSupervisor}
                                onChange={handleSupervisorChange}
                                placeholder="Select supervisor"
                                isClearable
                                isDisabled={submitting}
                                styles={selectStyles}
                            />
                        </div>
                    </div>

                    <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-center gap-2 text-blue-700 mb-2">
                            <FiBriefcase className="h-4 w-4" />
                            <p className="text-sm font-medium">Assignment Note</p>
                        </div>
                        <p className="text-sm text-blue-800 leading-6">
                            The unit and supervisor selections are searchable. The selected IDs
                            are stored automatically when you save the changes.
                        </p>
                    </div>
                </section>

                {/* Roles */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Role Assignment
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Update one or more roles to control the user’s access level.
                        </p>
                    </div>

                    {roles.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                            No roles found.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {roles.map((role) => (
                                <label
                                    key={role.id}
                                    className={`flex items-start gap-3 rounded-xl border px-4 py-4 cursor-pointer transition ${formData.role_ids.includes(role.id)
                                            ? "border-blue-300 bg-blue-50"
                                            : "border-gray-200 bg-gray-50 hover:bg-gray-100"
                                        }`}
                                >
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={formData.role_ids.includes(role.id)}
                                        onChange={handleRoleChange}
                                        disabled={submitting}
                                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <FiShield className="h-4 w-4 text-gray-500" />
                                            <p className="text-sm font-semibold text-gray-900">
                                                {role.name}
                                            </p>
                                        </div>

                                        {role.description && (
                                            <p className="mt-1 text-xs text-gray-500 leading-5">
                                                {role.description}
                                            </p>
                                        )}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </section>

                {/* Account Status */}
                <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">
                            Account Status
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Control whether this user account is active in the system.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={toggleActiveStatus}
                        disabled={submitting}
                        className={`inline-flex items-center gap-3 rounded-xl border px-5 py-3 text-sm font-semibold transition ${formData.is_active
                                ? "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                                : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
                            } disabled:cursor-not-allowed disabled:opacity-70`}
                    >
                        {formData.is_active ? (
                            <FiToggleRight className="h-5 w-5" />
                        ) : (
                            <FiToggleLeft className="h-5 w-5" />
                        )}
                        {formData.is_active ? "Active" : "Inactive"}
                    </button>
                </section>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3">
                    <Link
                        to="/admin/users"
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
                        {submitting ? "Updating User..." : "Update User"}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default EditUserPage;
