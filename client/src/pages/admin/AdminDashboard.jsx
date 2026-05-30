import { Link } from "react-router-dom";
import {
    FiBriefcase,
    FiClipboard,
    FiGrid,
    FiSettings,
    FiShield,
    FiUsers,
} from "react-icons/fi";

function AdminDashboard() {
    const storedUser = localStorage.getItem("user");
    const user = storedUser ? JSON.parse(storedUser) : null;

    if (!user) {
        return (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                No user data found.
            </div>
        );
    }

    const infoItems = [
        { label: "Full Name", value: user.full_name || "N/A" },
        { label: "Username", value: user.username || "N/A" },
        { label: "Email", value: user.email || "N/A" },
        { label: "Roles", value: user.roles?.join(", ") || "N/A" },
    ];

    const adminActions = [
        {
            title: "Manage Users",
            description:
                "Create, update, and review user accounts, roles, and assignment details.",
            to: "/admin/users",
            buttonText: "Open Users",
            icon: <FiUsers className="h-5 w-5" />,
            iconWrapperClass: "bg-blue-50 text-blue-700",
        },
        {
            title: "Manage Units",
            description:
                "Create and maintain organizational units used across the leave workflow.",
            to: "/admin/units",
            buttonText: "Open Units",
            icon: <FiBriefcase className="h-5 w-5" />,
            iconWrapperClass: "bg-yellow-50 text-yellow-700",
        },
        {
            title: "Manage Roles",
            description:
                "Configure available system roles and access structures for users.",
            to: "/admin/roles",
            buttonText: "Open Roles",
            icon: <FiShield className="h-5 w-5" />,
            iconWrapperClass: "bg-green-50 text-green-700",
        },
        {
            title: "Manage Leave Types",
            description:
                "Define and update leave types available for leave requests and balances.",
            to: "/admin/leave-types",
            buttonText: "Open Leave Types",
            icon: <FiClipboard className="h-5 w-5" />,
            iconWrapperClass: "bg-purple-50 text-purple-700",
        },
        {
            title: "Manage Leave Balances",
            description:
                "Review and update leave balances assigned to staff across leave types.",
            to: "/admin/leave-balances",
            buttonText: "Open Leave Balances",
            icon: <FiSettings className="h-5 w-5" />,
            iconWrapperClass: "bg-red-50 text-red-700",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Admin Portal
                </p>
                <h1 className="text-3xl font-bold">
                    Welcome{user.full_name ? `, ${user.full_name}` : ""}
                </h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Manage users, roles, units, leave settings, and balances from the
                    administrative control panel.
                </p>
            </section>

            {/* Summary cards */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Admin Modules</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                {adminActions.length}
                            </h2>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
                            <FiGrid className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Primary Role</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">Admin</h2>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center">
                            <FiShield className="h-5 w-5" />
                        </div>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">System Area</p>
                            <h2 className="text-2xl font-bold text-gray-900 mt-2">
                                Administration
                            </h2>
                        </div>
                        <div className="h-12 w-12 rounded-2xl bg-yellow-50 text-yellow-700 flex items-center justify-center">
                            <FiSettings className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Profile summary */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Profile Summary
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Your account information and administrative access details.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                        <FiShield className="h-4 w-4" />
                        Administrator Account
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {infoItems.map((item) => (
                        <div
                            key={item.label}
                            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4"
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                {item.label}
                            </p>
                            <p className="mt-2 text-sm font-semibold text-gray-900 break-words">
                                {item.value}
                            </p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Quick actions */}
            <section>
                <div className="mb-5">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Administrative Modules
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Open a module below to manage system data and workflow settings.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {adminActions.map((action) => (
                        <div
                            key={action.title}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between"
                        >
                            <div>
                                <div
                                    className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${action.iconWrapperClass}`}
                                >
                                    {action.icon}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900">
                                    {action.title}
                                </h3>

                                <p className="text-sm text-gray-500 mt-2 leading-6">
                                    {action.description}
                                </p>
                            </div>

                            <Link
                                to={action.to}
                                className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                            >
                                {action.buttonText}
                            </Link>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default AdminDashboard;