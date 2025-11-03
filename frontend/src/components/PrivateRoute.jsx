import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const PrivateRoute = ({children}) => {
    
    const token = Cookies.get("token")

    if(!token){
        return <Navigate to="/login" />
    }

    try{
        const decoded = jwtDecode(token)
        const now = Date.now() / 1000
        if(decoded.exp && decoded.exp < now){
            Cookies.remove("token")
            return <Navigate to="/login" />
        }
    }catch(err){
        Cookies.remove("token")
        return <Navigate to="/login" />
    }

    return children
}

export default PrivateRoute