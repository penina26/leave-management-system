import { useNavigate } from "react-router-dom";

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

                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <p>No user data found.</p>
            )}
        </div>
    );
}

export default AdminDashboard;