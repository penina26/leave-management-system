import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const api = import.meta.env.VITE_API_BASE_URL;

function RolesListPage() {
    const [roles, setRoles] = useState([]);

    async function fetchRoles() {
        try {
            const token = localStorage.getItem("token");

            const response = await axios.get(`${api}/admin/roles`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRoles(response.data.roles);
        } catch (error) {
            console.error(
                "Failed to fetch roles:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to load roles");
        }
    }

    useEffect(() => {
        fetchRoles();
    }, []);

    async function handleDeleteRole(roleId, roleName) {
        const confirmed = window.confirm(
            `Are you sure you want to delete the role "${roleName}"?`
        );

        if (!confirmed) {
            return;
        }

        try {
            const token = localStorage.getItem("token");

            const response = await axios.delete(`${api}/admin/roles/${roleId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            toast.success(response.data.message || "Role deleted successfully");

            // refresh roles list after delete
            fetchRoles();
        } catch (error) {
            console.error(
                "Failed to delete role:",
                error.response?.data || error.message
            );

            const backendMessage = error.response?.data?.message;
            toast.error(backendMessage || "Failed to delete role");
        }
    }

    return (
        <div>
            <h1>Admin - Roles</h1>

            <p>
                <Link to="/admin/roles/create">Create New Role</Link>
            </p>

            {roles.length === 0 ? (
                <p>No roles found.</p>
            ) : (
                <table border="1" cellPadding="8" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>User Count</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {roles.map((role) => (
                            <tr key={role.id}>
                                <td>
                                    <Link to={`/admin/roles/${role.id}/edit`}>
                                        {role.id}
                                    </Link>
                                </td>
                                <td>{role.name}</td>
                                <td>{role.description || "N/A"}</td>
                                <td>{role.user_count}</td>
                                <td>
                                    <button
                                        onClick={() => handleDeleteRole(role.id, role.name)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default RolesListPage;