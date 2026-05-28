import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token || !storedUser) {
        return <Navigate to="/login" replace />;
    }

    const user = JSON.parse(storedUser);

    const hasAllowedRole = user.roles.some((role) =>
        allowedRoles.includes(role)
    );

    if (!hasAllowedRole) {
        return <Navigate to="/login" replace />;
    }

    return children;
}

export default RoleProtectedRoute;