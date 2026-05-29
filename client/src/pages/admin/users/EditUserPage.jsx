import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "react-select";
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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEditFormData() {
            try {
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

                const allUsers = usersResponse.data.users;
                const foundUser = allUsers.find((item) => item.id === Number(userId));

                if (!foundUser) {
                    toast.error("User not found");
                    setLoading(false);
                    return;
                }

                setUsers(allUsers);
                setUnits(unitsResponse.data.units);
                setRoles(rolesResponse.data.roles);

                // Convert backend role names into role IDs for checkbox selection
                const selectedRoleIds = rolesResponse.data.roles
                    .filter((role) => foundUser.roles.includes(role.name))
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
                    is_active: foundUser.is_active,
                });

                setLoading(false);
            } catch (error) {
                console.error(
                    "Failed to load edit user form data:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load user data");
                setLoading(false);
            }
        }

        fetchEditFormData();
    }, [userId]);

    function handleChange(event) {
        const { name, value, type, checked } = event.target;

        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    }

    function handleRoleChange(event) {
        const { value, checked } = event.target;
        const numericRoleId = Number(value);

        if (checked) {
            setFormData({
                ...formData,
                role_ids: [...formData.role_ids, numericRoleId],
            });
        } else {
            setFormData({
                ...formData,
                role_ids: formData.role_ids.filter(
                    (roleId) => roleId !== numericRoleId
                ),
            });
        }
    }

    function handleSupervisorChange(selectedOption) {
        setFormData({
            ...formData,
            supervisor_id: selectedOption ? selectedOption.value : "",
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            const token = localStorage.getItem("token");

            const payload = {
                employee_number: formData.employee_number,
                full_name: formData.full_name,
                username: formData.username,
                email: formData.email,
                unit_id: formData.unit_id ? Number(formData.unit_id) : null,
                supervisor_id: formData.supervisor_id
                    ? Number(formData.supervisor_id)
                    : null,
                is_active: formData.is_active,
                role_ids: formData.role_ids,
            };

            // Only include password if admin typed a new one
            if (formData.password.trim() !== "") {
                payload.password = formData.password;
            }

            const response = await api.patch(
                `/admin/users/${userId}`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(response.data.message || "User updated successfully");
            navigate("/admin/users");
        } catch (error) {
            console.error(
                "Failed to update user:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to update user");
        }
    }

    // Only users with supervisor role should appear in supervisor dropdown
    const supervisors = users.filter((user) =>
        user.roles.includes("supervisor")
    );

    const supervisorOptions = supervisors.map((user) => ({
        value: user.id,
        label: user.full_name,
    }));

    if (loading) {
        return <p>Loading edit form...</p>;
    }

    return (
        <div>
            <h1>Edit User</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="employee_number">Employee Number</label>
                    <br />
                    <input
                        type="text"
                        id="employee_number"
                        name="employee_number"
                        value={formData.employee_number}
                        onChange={handleChange}
                        placeholder="Enter employee number"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="full_name">Full Name</label>
                    <br />
                    <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        placeholder="Enter full name"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="username">Username</label>
                    <br />
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="Enter username"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="email">Email</label>
                    <br />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="password">Password</label>
                    <br />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Leave blank to keep current password"
                    />
                </div>

                <br />

                <div>
                    <label htmlFor="unit_id">Unit</label>
                    <br />
                    <select
                        id="unit_id"
                        name="unit_id"
                        value={formData.unit_id}
                        onChange={handleChange}
                    >
                        <option value="">Select unit</option>
                        {units.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                                {unit.name}
                            </option>
                        ))}
                    </select>
                </div>

                <br />

                <div>
                    <label htmlFor="supervisor_id">Supervisor</label>
                    <br />
                    <Select
                        inputId="supervisor_id"
                        options={supervisorOptions}
                        value={
                            supervisorOptions.find(
                                (option) => option.value === Number(formData.supervisor_id)
                            ) || null
                        }
                        onChange={handleSupervisorChange}
                        placeholder="Select supervisor"
                        isClearable
                    />
                </div>

                <br />

                <div>
                    <p><strong>Roles</strong></p>

                    {roles.length === 0 ? (
                        <p>No roles found.</p>
                    ) : (
                        roles.map((role) => (
                            <div key={role.id}>
                                <label>
                                    <input
                                        type="checkbox"
                                        value={role.id}
                                        checked={formData.role_ids.includes(role.id)}
                                        onChange={handleRoleChange}
                                    />
                                    {role.name}
                                </label>
                            </div>
                        ))
                    )}
                </div>

                <br />

                <div>
                    <label>
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleChange}
                        />
                        Active
                    </label>
                </div>

                <br />

                <button type="submit">Update User</button>
            </form>
        </div>
    );
}

export default EditUserPage;
