import { Link } from "react-router-dom";
import { FiCheckSquare, FiShield } from "react-icons/fi";

function HeadDashboard() {
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

    return (
        <div className="space-y-8">
            {/* Header */}
            <section className="rounded-3xl bg-gradient-to-r from-blue-700 to-blue-600 text-white p-8 shadow-sm">
                <p className="text-sm uppercase tracking-wide text-blue-100 mb-2">
                    Head of Unit Portal
                </p>
                <h1 className="text-3xl font-bold">
                    Welcome{user.full_name ? `, ${user.full_name}` : ""}
                </h1>
                <p className="mt-3 text-blue-100 max-w-2xl">
                    Review endorsed leave requests, make final approval decisions, and
                    oversee leave workflow for your unit.
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
                            Your account details and head of unit access information.
                        </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                        <FiShield className="h-4 w-4" />
                        Head of Unit Account
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
                        Go directly to the main head of unit task.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 flex flex-col justify-between">
                        <div>
                            <div className="h-12 w-12 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mb-4">
                                <FiCheckSquare className="h-5 w-5" />
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900">
                                Pending Approval Requests
                            </h3>
                            <p className="text-sm text-gray-500 mt-2 leading-6">
                                Review leave requests escalated to you and make the final
                                approval decision.
                            </p>
                        </div>

                        <Link
                            to="/head/pending-requests"
                            className="mt-6 inline-flex items-center justify-center rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition"
                        >
                            View Requests
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default HeadDashboard;