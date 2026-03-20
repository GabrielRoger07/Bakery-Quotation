import { useParams } from 'react-router-dom'
import Cookies from 'js-cookie'
import FetchAuthContext from '../../contexts/FetchAuthContext'

const SupplierRoute = ({ children }) => {
    const { companyCnpj } = useParams()
    const cnpj = companyCnpj || Cookies.get("supplierCompanyCnpj")

    return (
        <FetchAuthContext.Provider value={{
            cookieName: "supplierAccessToken",
            loginPath: `/supplier/login/${cnpj}`
        }}>
            {children}
        </FetchAuthContext.Provider>
    )
}

export default SupplierRoute
