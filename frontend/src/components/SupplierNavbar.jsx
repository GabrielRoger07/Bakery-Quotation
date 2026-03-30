import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import Button from './Button'
import LangSwitcher from './LangSwitcher'
import { decodeJwt } from '../utils/decodeJwt'
import useMobileMenu from '../hooks/useMobileMenu'
import SupplierMobileMenu from './SupplierMobileMenu'
import './Navbar.css'

const SupplierNavbar = () => {

    const { t } = useTranslation()
    const navigate = useNavigate()
    const menu = useMobileMenu()

    const supplierName = useMemo(() => {
        const token = Cookies.get("supplierAccessToken")
        if (!token) return null
        const payload = decodeJwt(token)
        return payload?.supplierName ?? null
    }, [])

    const initial = supplierName ? supplierName.trim().charAt(0).toUpperCase() : '?'

    const logout = () => {
        const cnpj = Cookies.get("supplierCompanyCnpj")
        Cookies.remove("supplierAccessToken")
        Cookies.remove("supplierCompanyCnpj")
        navigate(`/supplier/login/${cnpj}`)
    }

    return (
        <>
            <nav className="navbar">
                <div className="navbar-left">
                    {supplierName && (
                        <div className="supplier-identity">
                            <div className="supplier-identity-avatar" aria-hidden="true">
                                {initial}
                            </div>
                            <div className="supplier-identity-info">
                                <span className="supplier-identity-label">{t("supplier_logged_in_as")}</span>
                                <span className="supplier-identity-name">{supplierName}</span>
                            </div>
                        </div>
                    )}
                </div>
                <div className="navbar-right">
                    <LangSwitcher />
                    <Button onClick={logout}>{t("navbar_logout")}</Button>
                </div>
                <button className="hamburger" onClick={menu.toggle} aria-label={t("navbar_open_menu")}>
                    ☰
                </button>
            </nav>

            <SupplierMobileMenu
                open={menu.isOpen}
                onClose={menu.close}
                onLogout={logout}
                supplierName={supplierName}
                initial={initial}
                t={t}
            />
        </>
    )
}

export default SupplierNavbar
