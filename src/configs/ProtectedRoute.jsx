import { useEffect, useState } from "react";
import { refreshToken } from "../services/AuthService.jsx";
import { getAccess, signout } from "../services/AccountService.jsx";

async function GetAccessData() {
    const response = await getAccess()
    if (response && response.status === 200) {
        return response.data.body
    } else {
        return null
    }
}

async function Logout() {
    signout().then(res => {
        if (res && res.status === 200) {
            if (localStorage.length > 0) {
                localStorage.clear();
            }
            if (sessionStorage.length > 0) {
                sessionStorage.clear()
            }
            setTimeout(() => {
                window.location.href = "/login"
            }, 1000)
        }
    })
}

async function CheckIfRoleValid(allowRoles, role) {
    return !!allowRoles.includes(role);
}

export default function ProtectedRoute({ children, allowRoles = [] }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [hasValidRole, setHasValidRole] = useState(false);
    const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

    useEffect(() => {
        const checkAuthentication = async () => {
            if (hasAttemptedAuth) {
                return;
            }

            try {
                setIsLoading(true);
                setHasAttemptedAuth(true);

                const data = await GetAccessData();

                if (data != null) {
                    const isValidRole = await CheckIfRoleValid(allowRoles, data.role);
                    if (isValidRole) {
                        setIsAuthenticated(true);
                        setHasValidRole(true);
                        setIsLoading(false);
                        return;
                    } else {
                        await Logout();
                        return;
                    }
                }

                const refreshResponse = await refreshToken();
                if (refreshResponse.status === 401 || refreshResponse.status === 403) {
                    await Logout();
                    return;
                }

                const retryData = await GetAccessData();
                if (retryData != null) {
                    const isValidRole = await CheckIfRoleValid(allowRoles, retryData.role);
                    if (isValidRole) {
                        setIsAuthenticated(true);
                        setHasValidRole(true);
                        setIsLoading(false);
                        return;
                    } else {
                        await Logout();
                        return;
                    }
                } else {
                    await Logout();
                    return;
                }

            } catch (error) {
                console.error("Authentication error:", error);
                await Logout();
            } finally {
                setIsLoading(false);
            }
        };

        checkAuthentication();
    }, [allowRoles]);

    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh'
            }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    border: '4px solid #f3f3f3',
                    borderTop: '4px solid #3498db',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                }}></div>
                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    if (isAuthenticated && hasValidRole) {
        return children;
    }

    return null;
}