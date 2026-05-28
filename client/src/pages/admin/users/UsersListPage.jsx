import { useEffect, useState } from "react";
import { Link } from "react-router-dom"
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function UsersListPage() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const token = localStorage.getItem("token");

                const response = await axios.get(`${api}/admin/users`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setUsers(response.data.users);
            } catch (error) {
                console.error(
                    "Failed to fetch users:",
                    error.response?.data || error.message
                );

                const backendMessage = error.response?.data?.message;
                toast.error(backendMessage || "Failed to load users");
            }
        }

        fetchUsers();
    }, []);

    return (
        <div>
            <h1>Admin - Users</h1>
            <p>
                <Link to="/admin/users/create">Create New User</Link>
            </p>


            {users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Employee Number</th>
                            <th>Full Name</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Unit</th>
                            <th>Supervisor</th>
                            <th>Roles</th>
                            <th>Active</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.employee_number}</td>
                                <td>{user.full_name}</td>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>{user.unit_name || "N/A"}</td>
                                <td>{user.supervisor_name || "N/A"}</td>
                                <td>{user.roles.join(", ")}</td>
                                <td>{user.is_active ? "Yes" : "No"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default UsersListPage;