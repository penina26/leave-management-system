import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Attach access token to every request
api.interceptors.request.use(
    (config) => {
        const accessToken = localStorage.getItem("access_token");

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Refresh token logic on 401
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const message =
            error.response?.data?.msg || error.response?.data?.message || "";

        const isUnauthorized = error.response?.status === 401;
        const isExpired =
            typeof message === "string" &&
            message.toLowerCase().includes("expired");

        // Prevent infinite retry loops
        if (isUnauthorized && isExpired && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem("refresh_token");

                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }

                const refreshResponse = await axios.post(
                    `${import.meta.env.VITE_API_BASE_URL}/refresh`,
                    {},
                    {
                        headers: {
                            Authorization: `Bearer ${refreshToken}`,
                        },
                    }
                );

                const newAccessToken = refreshResponse.data.access_token;

                localStorage.setItem("access_token", newAccessToken);

                // Update the failed request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed -> clear auth and redirect to login
                localStorage.removeItem("user");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
