import {getCookie} from "../utils/CookieUtil.jsx";
import {jwtDecode} from "jwt-decode";
import {refreshToken} from "../services/AuthService.jsx";
import {signout} from "../services/AccountService.jsx";

function CheckRole(cookie, allowRoles){
    const decode = jwtDecode(cookie)
    if(!decode || !decode.role){
        return false
    }

    if(allowRoles.includes(decode.role.toLocaleString())){
        return true

    }else {
        signout().then(res => {
            if(res && res.status === 200){
                localStorage.clear()
                setTimeout(() => {
                    return false
                }, 1000)
            }
        })
    }
}

export default function ProtectedRoute({children, allowRoles = []}){
    let cookie = getCookie("access")
    if(!cookie){
        refreshToken().then(res => {
            if(res.status === 401 || res.status === 403){
                window.location.href = "/login"
            }

            cookie = getCookie("access")
            const check = CheckRole(cookie, allowRoles)
            if(!check){
                window.location.href = "/login"
            }else {
                return children
            }
        })

    }else {
        const check = CheckRole(cookie, allowRoles)
        if(!check){
            window.location.href = "/login"
        }else {
            return children
        }
    }


}