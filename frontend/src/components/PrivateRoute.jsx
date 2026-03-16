import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'

const PrivateRoute = ({children}) => {
    
    const accessToken = Cookies.get("accessToken")

    if(!accessToken){
        return <Navigate to="/login" />
    }

    try{
        const decoded = jwtDecode(accessToken)
        const now = Date.now() / 1000
        if(decoded.exp && decoded.exp < now){
            Cookies.remove("accessToken")
            return <Navigate to="/login" />
        }
    }catch(err){
        Cookies.remove("accessToken")
        return <Navigate to="/login" />
    }

    return children
}

export default PrivateRoute