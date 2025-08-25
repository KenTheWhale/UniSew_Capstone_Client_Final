import {refreshToken} from "../services/AuthService.jsx";
import {getAccess, signout} from "../services/AccountService.jsx";

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

export default function ProtectedRoute({children, allowRoles = []}) {
    GetAccessData().then(data => {
        if (data != null) {
            if(!CheckIfRoleValid(allowRoles, data.role)){
                return Logout()
            }

            return children
        }

        //Retry
        refreshToken().then(res => {
            if (res.status === 401 || res.status === 403) {
                window.location.href = "/login"
            }

            GetAccessData().then(retryData => {
                if (retryData != null) {
                    if(!CheckIfRoleValid(allowRoles, retryData.role)){
                        return Logout()
                    }

                    return children
                }
            })
        })
    })


}