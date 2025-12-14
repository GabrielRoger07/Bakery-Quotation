import { NavLink } from 'react-router-dom'
import LangSwitcher from './LangSwitcher'
import Button from './Button'
import "./Navbar.css"

const MobileMenu = ({ open, onClose, onLogout, t }) => {
    
    if(!open) return null

    return (
        <>
            <div className="overlay" onClick={onClose} />

            <aside className="mobile-menu open">
                <div className="mobile-menu-header">
                    <span className="mobile-menu-title">Cota Fácil</span>
                    <button className="close-btn" onClick={onClose}>x</button>
                </div>

                <nav className="mobile-nav">
                    <NavLink to="/suppliers" onClick={onClose}>{t("navbar_suppliers")}</NavLink>
                    <NavLink to="/products" onClick={onClose}>{t("navbar_products")}</NavLink>
                    <NavLink to="/quotations" onClick={onClose}>{t("navbar_quotations")}</NavLink>
                </nav>

                <div className="mobile-actions">
                    <LangSwitcher />
                    <Button onClick={onLogout}>{t("navbar_logout")}</Button>
                </div>
            </aside>
        </>
    )
}

export default MobileMenu