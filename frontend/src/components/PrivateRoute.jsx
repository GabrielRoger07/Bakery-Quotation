import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const isTokenValid = (token) => {
    try {
        const decoded = jwtDecode(token)
        return !(decoded.exp && decoded.exp < Date.now() / 1000)
    } catch {
        return false
    }
}

const PrivateRoute = ({ children }) => {
    const accessToken = Cookies.get("accessToken")

    if (!accessToken || !isTokenValid(accessToken)) {
        Cookies.remove("accessToken")
        return <Navigate to="/login" />
    }

    return children
}

export default PrivateRoute
