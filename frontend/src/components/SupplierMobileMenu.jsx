import LangSwitcher from './LangSwitcher'
import Button from './Button'
import "./Navbar.css"

const SupplierMobileMenu = ({ open, onClose, onLogout, supplierName, initial, t }) => {

    if (!open) return null

    return (
        <>
            <div className="overlay" onClick={onClose} />

            <aside className="mobile-menu open">
                <div className="mobile-menu-header">
                    <span className="mobile-menu-title">Cota Fácil</span>
                    <button className="close-btn" onClick={onClose}>x</button>
                </div>

                {supplierName && (
                    <div className="supplier-mobile-identity">
                        <div className="supplier-mobile-avatar" aria-hidden="true">
                            {initial}
                        </div>
                        <div className="supplier-identity-info">
                            <span className="supplier-identity-label">{t("supplier_logged_in_as")}</span>
                            <span className="supplier-identity-name">{supplierName}</span>
                        </div>
                    </div>
                )}

                <div className="mobile-actions">
                    <LangSwitcher />
                    <Button onClick={onLogout}>{t("navbar_logout")}</Button>
                </div>
            </aside>
        </>
    )
}

export default SupplierMobileMenu
