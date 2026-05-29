import { Link, useNavigate } from "react-router-dom";

function SupervisorDashboard() {
    const navigate = useNavigate();

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
    }

    return (
        <div>
            <h1>Supervisor Dashboard</h1>

            {user ? (
                <div>
                    <p><strong>Full Name:</strong> {user.full_name}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Roles:</strong> {user.roles.join(", ")}</p>

                    <hr />

                    <h2>Supervisor Actions</h2>

                    <ul>
                        <li>
                            <Link to="/supervisor/pending-requests">Pending Leave Requests</Link>
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

export default SupervisorDashboard;