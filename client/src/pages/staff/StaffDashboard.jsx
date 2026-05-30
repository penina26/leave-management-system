import { Link } from "react-router-dom";

function StaffDashboard() {
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

    const quickActions = [
        {
            title: "Apply Leave",
            description: "Submit a new leave request quickly and easily.",
            to: "/staff/apply-leave",
            buttonText: "Apply Now",
        },
        {
            title: "My Leave Requests",
            description: "Track submitted requests and monitor approval progress.",
            to: "/staff/my-leave-requests",
            buttonText: "View Requests",
        },
        {
            title: "My Leave Balances",
            description: "Check your available leave balances by leave type.",
            to: "/staff/my-leave-balances",
            buttonText: "View Balances",
        },
    ];

    return (
        <div className="space-y-8">
            {/* Page header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Staff Portal
                </p>
                <h1 className="text-3xl font-bold">
                    Welcome{user.full_name ? `, ${user.full_name}` : ""}
                </h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Manage your leave applications, monitor request progress, and review
                    your leave balances from one place.
                </p>
            </section>

            {/* Profile summary */}
            <section className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">
                            Profile Summary
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            Your account details and assigned role information.
                        </p>
                    </div>

                    <div className="inline-flex items-center rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                        Staff Account
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
                    <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Go directly to the most common staff tasks.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {quickActions.map((action) => (
                        <div
                            key={action.title}
                            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between"
                        >
                            <div>
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

export default StaffDashboard;
