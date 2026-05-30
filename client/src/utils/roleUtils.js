export function getNormalizedRoles(user) {
    if (!Array.isArray(user?.roles)) return [];

    return user.roles.map((role) => {
        if (typeof role === "string") return role;
        if (typeof role === "object" && role !== null) return role.name;
        return "";
    });
}

export function getHighestPriorityRole(user) {
    const roles = getNormalizedRoles(user);
    const rolePriority = ["admin", "head_of_unit", "supervisor", "staff"];

    return rolePriority.find((role) => roles.includes(role)) || null;
}

export function getDefaultDashboardPath(user) {
    const highestRole = getHighestPriorityRole(user);

    switch (highestRole) {
        case "admin":
            return "/admin/dashboard";
        case "head_of_unit":
            return "/head/dashboard";
        case "supervisor":
            return "/supervisor/dashboard";
        case "staff":
            return "/staff/dashboard";
        default:
            return "/login";
    }
}