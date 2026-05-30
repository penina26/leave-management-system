import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
    FiBriefcase,
    FiCalendar,
    FiChevronDown,
    FiClipboard,
    FiGrid,
    FiHome,
    FiLogOut,
    FiMenu,
    FiSettings,
    FiShield,
    FiUsers,
    FiX,
} from "react-icons/fi";
import {
    getDefaultDashboardPath,
    getNormalizedRoles,
} from "../utils/roleUtils";

function Navbar() {
    const navigate = useNavigate();

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState(null);

    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;
    const roles = getNormalizedRoles(user);

    function handleLogout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
    }

    function toggleDropdown(menuName) {
        setOpenDropdown((prev) => (prev === menuName ? null : menuName));
    }

    function closeMenus() {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
    }

    const navLinkClass = ({ isActive }) =>
        `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition ${isActive
            ? "bg-blue-700 text-white"
            : "text-gray-700 hover:bg-blue-50 hover:text-blue-700"
        }`;

    const dropdownItemClass =
        "flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition";

    const roleBadgeClass =
        "inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 border border-blue-100";

    const menuGroups = useMemo(() => {
        const groups = [];

        if (roles.includes("staff")) {
            groups.push({
                key: "staff",
                label: "Staff",
                items: [
                    {
                        to: "/staff/dashboard",
                        label: "Dashboard",
                        icon: <FiHome className="h-4 w-4" />,
                    },
                    {
                        to: "/staff/apply-leave",
                        label: "Apply Leave",
                        icon: <FiClipboard className="h-4 w-4" />,
                    },
                    {
                        to: "/staff/my-leave-requests",
                        label: "My Requests",
                        icon: <FiCalendar className="h-4 w-4" />,
                    },
                    {
                        to: "/staff/my-leave-balances",
                        label: "My Balances",
                        icon: <FiBriefcase className="h-4 w-4" />,
                    },
                ],
            });
        }

        if (roles.includes("supervisor")) {
            groups.push({
                key: "supervisor",
                label: "Supervisor",
                items: [
                    {
                        to: "/supervisor/dashboard",
                        label: "Dashboard",
                        icon: <FiHome className="h-4 w-4" />,
                    },
                    {
                        to: "/supervisor/pending-requests",
                        label: "Pending Requests",
                        icon: <FiCalendar className="h-4 w-4" />,
                    },
                ],
            });
        }

        if (roles.includes("head_of_unit")) {
            groups.push({
                key: "head_of_unit",
                label: "Head of Unit",
                items: [
                    {
                        to: "/head/dashboard",
                        label: "Dashboard",
                        icon: <FiHome className="h-4 w-4" />,
                    },
                    {
                        to: "/head/pending-requests",
                        label: "Pending Approvals",
                        icon: <FiShield className="h-4 w-4" />,
                    },
                ],
            });
        }

        if (roles.includes("admin")) {
            groups.push({
                key: "admin",
                label: "Admin",
                items: [
                    {
                        to: "/admin/dashboard",
                        label: "Dashboard",
                        icon: <FiGrid className="h-4 w-4" />,
                    },
                    {
                        to: "/admin/users",
                        label: "Users",
                        icon: <FiUsers className="h-4 w-4" />,
                    },
                    {
                        to: "/admin/units",
                        label: "Units",
                        icon: <FiBriefcase className="h-4 w-4" />,
                    },
                    {
                        to: "/admin/roles",
                        label: "Roles",
                        icon: <FiShield className="h-4 w-4" />,
                    },
                    {
                        to: "/admin/leave-types",
                        label: "Leave Types",
                        icon: <FiClipboard className="h-4 w-4" />,
                    },
                    {
                        to: "/admin/leave-balances",
                        label: "Leave Balances",
                        icon: <FiSettings className="h-4 w-4" />,
                    },
                ],
            });
        }

        return groups;
    }, [roles]);

    const roleLabels = useMemo(() => {
        const labels = [];

        if (roles.includes("admin")) labels.push("Admin");
        if (roles.includes("head_of_unit")) labels.push("Head of Unit");
        if (roles.includes("supervisor")) labels.push("Supervisor");
        if (roles.includes("staff")) labels.push("Staff");

        return labels;
    }, [roles]);

    const primaryHomePath = getDefaultDashboardPath(user);

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between gap-4 min-h-16 py-3">
                    {/* Left */}
                    <div className="flex items-center gap-4 min-w-0">
                        <button
                            type="button"
                            onClick={() => navigate(primaryHomePath)}
                            className="text-left shrink-0"
                        >
                            <h1 className="text-lg font-bold text-blue-700 leading-tight">
                                Leave Management System
                            </h1>
                            <p className="text-xs text-gray-500 hidden sm:block">
                                Role-based leave workflow
                            </p>
                        </button>

                        {/* Desktop dropdowns */}
                        <div className="hidden lg:flex items-center gap-3">
                            {menuGroups.map((group) => (
                                <div key={group.key} className="relative">
                                    <button
                                        type="button"
                                        onClick={() => toggleDropdown(group.key)}
                                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition"
                                    >
                                        <span>{group.label}</span>
                                        <FiChevronDown className="h-4 w-4" />
                                    </button>

                                    {openDropdown === group.key && (
                                        <div className="absolute left-0 mt-2 w-56 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-40">
                                            {group.items.map((item) => (
                                                <NavLink
                                                    key={item.to}
                                                    to={item.to}
                                                    onClick={closeMenus}
                                                    className={navLinkClass}
                                                >
                                                    <div className={dropdownItemClass}>
                                                        {item.icon}
                                                        <span>{item.label}</span>
                                                    </div>
                                                </NavLink>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3 shrink-0">
                        {/* User info */}
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-gray-800">
                                {user?.full_name || user?.name || user?.email || "User"}
                            </span>

                            <div className="flex flex-wrap justify-end gap-1 mt-1">
                                {roleLabels.map((role) => (
                                    <span key={role} className={roleBadgeClass}>
                                        {role}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="hidden sm:inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                        >
                            <FiLogOut className="h-4 w-4" />
                            Logout
                        </button>

                        {/* Mobile menu button */}
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="inline-flex lg:hidden items-center justify-center rounded-lg border border-gray-300 p-2 text-gray-700 hover:bg-gray-50 transition"
                        >
                            {mobileMenuOpen ? (
                                <FiX className="h-5 w-5" />
                            ) : (
                                <FiMenu className="h-5 w-5" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="lg:hidden border-t border-gray-200 py-4 space-y-4">
                        {menuGroups.map((group) => (
                            <div key={group.key} className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 px-1">
                                    {group.label}
                                </p>

                                <div className="space-y-1">
                                    {group.items.map((item) => (
                                        <NavLink
                                            key={item.to}
                                            to={item.to}
                                            onClick={closeMenus}
                                            className={navLinkClass}
                                        >
                                            {item.icon}
                                            <span>{item.label}</span>
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-3 border-t border-gray-200">
                            <div className="mb-3">
                                <p className="text-sm font-medium text-gray-800">
                                    {user?.full_name || user?.name || user?.email || "User"}
                                </p>

                                <div className="flex flex-wrap gap-1 mt-2">
                                    {roleLabels.map((role) => (
                                        <span key={role} className={roleBadgeClass}>
                                            {role}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleLogout}
                                className="w-full inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                            >
                                <FiLogOut className="h-4 w-4" />
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;