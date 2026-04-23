import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import LangSwitcher from "./LangSwitcher";
import MobileMenu from "./MobileMenu";

const navLinkClass = ({ isActive }) =>
    [
        'no-underline font-medium text-[0.875rem] tracking-[0.01em]',
        'px-[0.875rem] py-[0.4rem] rounded-[var(--radius-md)]',
        'transition-[color,background-color] duration-[160ms] ease-[ease]',
        isActive
            ? 'text-white bg-[var(--color-accent)] font-semibold [box-shadow:var(--shadow-accent)]'
            : 'text-[var(--color-on-dark-text)] hover:text-[var(--color-on-dark-text-hover)] hover:bg-[var(--color-on-dark-bg-soft)]',
    ].join(' ')

const Navbar = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()

    const logout = () => {
        Cookies.remove("accessToken")
        navigate("/login")
    }

    return (
        <>
            <nav className="flex justify-between items-center gap-4 px-6 h-[3.375rem] bg-[var(--color-brand)] border-b border-[var(--color-on-dark-border)] sticky top-0 z-[1000] [box-shadow:var(--shadow-md-strong)] max-[640px]:px-4">
                <div className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-1 whitespace-nowrap max-[640px]:hidden max-[860px]:gap-0.5">
                    <NavLink to="/suppliers" className={navLinkClass}>{t("navbar_suppliers")}</NavLink>
                    <NavLink to="/products" className={navLinkClass}>{t("navbar_products")}</NavLink>
                    <NavLink to="/quotations" className={navLinkClass}>{t("navbar_quotations")}</NavLink>
                </div>

                <div className="flex items-center justify-end gap-[0.625rem] ml-auto max-[640px]:hidden">
                    <LangSwitcher />
                    <Button onClick={logout}>{t("navbar_logout")}</Button>
                </div>
            </nav>

            <MobileMenu onLogout={logout} />
        </>
    )
}

export default Navbar
