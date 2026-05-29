import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [accessToken, setAccessToken] = useState("");
    const [refreshToken, setRefreshToken] = useState("");

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        const storedAccessToken = localStorage.getItem("access_token");
        const storedRefreshToken = localStorage.getItem("refresh_token");

        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        if (storedAccessToken) {
            setAccessToken(storedAccessToken);
        }

        if (storedRefreshToken) {
            setRefreshToken(storedRefreshToken);
        }
    }, []);

    function login(userData, newAccessToken, newRefreshToken) {
        setUser(userData);
        setAccessToken(newAccessToken);
        setRefreshToken(newRefreshToken);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);
    }

    function logout() {
        setUser(null);
        setAccessToken("");
        setRefreshToken("");

        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}