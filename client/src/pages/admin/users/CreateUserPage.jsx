import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import Select from "react-select";

const api = import.meta.env.VITE_API_BASE_URL;

function CreateUserPage() {
    const [formData, setFormData] = useState({
        employee_number: "",
        full_name: "",
        username: "",
        email: "",
        password: "",
        unit_id: "",
        supervisor_id: "",
        role_ids: [],
    });

    const [units, setUnits] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchDropdownData() {
            try {
                const token = localStorage.getItem("token");

                const [unitsResponse, usersResponse] = await Promise.all([
                    axios.get(`${api}/admin/units`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                    axios.get(`${api}/admin/users`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }),
                ]);

                setUnits(unitsResponse.data.units);
                setUsers(usersResponse.data.users);
            } catch (error) {
                console.error(
                    "Failed to load units/users:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load dropdown data");
            }
        }

        fetchDropdownData();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value,
        });
    }

    function handleRoleChange(event) {
        const { value, checked } = event.target;

        if (checked) {
            setFormData({
                ...formData,
                role_ids: [...formData.role_ids, Number(value)],
            });
        } else {
            setFormData({
                ...formData,
                role_ids: formData.role_ids.filter(
                    (roleId) => roleId !== Number(value)
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
                password: formData.password,
                unit_id: formData.unit_id ? Number(formData.unit_id) : null,
                supervisor_id: formData.supervisor_id
                    ? Number(formData.supervisor_id)
                    : null,
                role_ids: formData.role_ids,
            };

            const response = await axios.post(`${api}/admin/users`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "User created successfully");

            setFormData({
                employee_number: "",
                full_name: "",
                username: "",
                email: "",
                password: "",
                unit_id: "",
                supervisor_id: "",
                role_ids: [],
            });
        } catch (error) {
            console.error(
                "Failed to create user:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to create user");
        }
    }

    const supervisors = users.filter((user) =>
        user.roles.includes("supervisor")
    );

    const supervisorOptions = supervisors.map((user) => ({
        value: user.id,
        label: user.full_name,
    }));

    return (
        <div>
            <h1>Create User</h1>

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
                        placeholder="Enter password"
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

                    <label>
                        <input
                            type="checkbox"
                            value="1"
                            checked={formData.role_ids.includes(1)}
                            onChange={handleRoleChange}
                        />
                        Staff
                    </label>

                    <br />

                    <label>
                        <input
                            type="checkbox"
                            value="2"
                            checked={formData.role_ids.includes(2)}
                            onChange={handleRoleChange}
                        />
                        Supervisor
                    </label>

                    <br />

                    <label>
                        <input
                            type="checkbox"
                            value="3"
                            checked={formData.role_ids.includes(3)}
                            onChange={handleRoleChange}
                        />
                        Head of Unit
                    </label>

                    <br />

                    <label>
                        <input
                            type="checkbox"
                            value="4"
                            checked={formData.role_ids.includes(4)}
                            onChange={handleRoleChange}
                        />
                        Admin
                    </label>
                </div>

                <br />

                <button type="submit">Create User</button>
            </form>
        </div>
    );
}

export default CreateUserPage;
