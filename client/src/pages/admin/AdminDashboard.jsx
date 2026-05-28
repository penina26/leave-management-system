import { Link, useNavigate } from "react-router-dom";

function AdminDashboard() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    function handleLogout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <div>
            <h1>Admin Dashboard</h1>

            {user ? (
                <div>
                    <p><strong>Full Name:</strong> {user.full_name}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Roles:</strong> {user.roles.join(", ")}</p>

                    <hr />

                    <h2>Admin Panel</h2>

                    <ul>
                        <li>
                            <Link to="/admin/users">Manage Users</Link>
                        </li>
                        <li>
                            <Link to="/admin/units">Manage Units</Link>
                        </li>
                        <li>
                            <Link to="/admin/roles">Manage Roles</Link>
                        </li>
                        <li>
                            <Link to="/admin/leave-types">Manage Leave Types</Link>
                        </li>
                        <li>
                            <Link to="/admin/leave-balances">Manage Leave Balances</Link>
                        </li>
                    </ul>

                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>No user data found.</p>
            )}
        </div>
    );
}

export default AdminDashboard;