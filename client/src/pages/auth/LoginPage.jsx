import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLoader, FiLock, FiUser } from "react-icons/fi";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";
import { getDefaultDashboardPath } from "../../utils/roleUtils";
import api from "../../services/api";

function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isFormInvalid = useMemo(() => {
        return !formData.username.trim() || !formData.password.trim();
    }, [formData.username, formData.password]);

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const accessToken = localStorage.getItem("access_token");

        if (storedUser && accessToken && storedUser !== "undefined" && accessToken !== "undefined") {
            try {
                const parsedUser = JSON.parse(storedUser);
                navigate(getDefaultDashboardPath(parsedUser), { replace: true });
            } catch (error) {
                localStorage.removeItem("user");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }
        }
    }, [navigate]);

    function handleChange(event) {
        const { name, value } = event.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const trimmedUsername = formData.username.trim();
        const trimmedPassword = formData.password.trim();

        if (!trimmedUsername || !trimmedPassword) {
            toast.error("Username and password are required");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/login", {
                username: trimmedUsername,
                password: trimmedPassword,
            });

            console.log("Login response:", response);
            console.log("Login response.data:", response.data);

            // Support either:
            // 1. response.data = { access_token, refresh_token, user }
            // 2. response.data = { data: { access_token, refresh_token, user } }
            const responsePayload = response?.data?.data || response?.data || {};

            const accessToken = responsePayload.access_token;
            const refreshToken = responsePayload.refresh_token;
            const user = responsePayload.user;

            if (!accessToken || !refreshToken || !user) {
                console.error("Invalid login response payload:", responsePayload);
                toast.error("Login response is missing authentication data");
                return;
            }

            // Save auth state through context
            login(user, accessToken, refreshToken);

            toast.success("Login successful");

            navigate(getDefaultDashboardPath(user), { replace: true });
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);

            const backendMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.response?.data?.msg ||
                "Login failed";

            toast.error(backendMessage);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Left panel */}
            <div className="hidden lg:flex w-1/2 bg-blue-700 text-white items-center justify-center px-12">
                <div className="max-w-md">
                    <div className="mb-8">
                        <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white border border-white/20">
                            <FiLock className="h-6 w-6" />
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold mb-4">
                        Leave Management System
                    </h1>

                    <p className="text-blue-100 text-lg mb-6 leading-8">
                        Manage leave applications, approvals, balances, and workflow access
                        in one place.
                    </p>

                    <ul className="space-y-4 text-blue-50 text-sm leading-6">
                        <li className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-white/80"></span>
                            <span>Apply for leave quickly and track request progress.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-white/80"></span>
                            <span>Review and approve requests through role-based workflows.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="mt-1 h-2 w-2 rounded-full bg-white/80"></span>
                            <span>Access balances, approvals, and administration securely.</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Right panel */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
                <div className="w-full max-w-md">
                    <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
                        {/* Title */}
                        <div className="text-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
                            <p className="text-sm text-gray-500 mt-2">
                                Sign in to your account to continue
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Username */}
                            <div>
                                <label
                                    htmlFor="username"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Username
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <FiUser className="h-4 w-4" />
                                    </span>

                                    <input
                                        type="text"
                                        id="username"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter your username"
                                        className="w-full rounded-xl border border-gray-300 pl-11 pr-4 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        disabled={loading}
                                        autoComplete="username"
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-gray-700 mb-2"
                                >
                                    Password
                                </label>

                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
                                        <FiLock className="h-4 w-4" />
                                    </span>

                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-gray-300 pl-11 pr-12 py-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                                        disabled={loading}
                                        autoComplete="current-password"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        disabled={loading}
                                        className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-500 hover:text-gray-700 disabled:cursor-not-allowed"
                                    >
                                        {showPassword ? (
                                            <FiEyeOff className="h-4 w-4" />
                                        ) : (
                                            <FiEye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                type="submit"
                                disabled={loading || isFormInvalid}
                                className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 text-white py-3 rounded-xl text-sm font-semibold hover:bg-blue-800 transition disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {loading && <FiLoader className="h-4 w-4 animate-spin" />}
                                {loading ? "Signing in..." : "Sign in"}
                            </button>
                        </form>

                        {/* Footer note */}
                        <p className="text-xs text-gray-500 text-center mt-6 leading-5">
                            Access restricted to authorized staff, supervisors, heads of unit,
                            and administrators.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;