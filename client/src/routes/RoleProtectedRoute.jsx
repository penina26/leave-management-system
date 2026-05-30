import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ children, allowedRoles }) {
    const accessToken = localStorage.getItem("access_token");
    const storedUser = localStorage.getItem("user");

    if (!accessToken || !storedUser) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(storedUser);
    } catch (error) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        return <Navigate to="/login" replace />;
    }

    const userRoles = Array.isArray(user?.roles) ? user.roles : [];

    const hasAllowedRole = userRoles.some((role) => allowedRoles.includes(role));

    if (!hasAllowedRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default RoleProtectedRoute;