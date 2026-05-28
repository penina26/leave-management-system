import { Link, useNavigate } from "react-router-dom";

function HeadDashboard() {
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
            <h1>Head of Unit Dashboard</h1>

            {user ? (
                <div>
                    <p><strong>Full Name:</strong> {user.full_name}</p>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Roles:</strong> {user.roles.join(", ")}</p>

                    <hr />

                    <h2>Head Actions</h2>

                    <ul>
                        <li>
                            <Link to="/head/pending-requests">Pending Approval Requests</Link>
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

export default HeadDashboard;