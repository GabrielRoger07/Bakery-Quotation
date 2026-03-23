import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import LangSwitcher from './LangSwitcher'
import './Navbar.css'

const SupplierNavbar = () => {

    const { t } = useTranslation()
    const navigate = useNavigate()

    const logout = () => {
        const cnpj = Cookies.get("supplierCompanyCnpj")
        Cookies.remove("supplierAccessToken")
        Cookies.remove("supplierCompanyCnpj")
        navigate(`/supplier/login/${cnpj}`)
    }

    return (
        <nav className="navbar">
            <div className="navbar-left" />
            <div className="navbar-right">
                <LangSwitcher />
                <Button onClick={logout}>{t("navbar_logout")}</Button>
            </div>
        </nav>
    )
}

export default SupplierNavbar
