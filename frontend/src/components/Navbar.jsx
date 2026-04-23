import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import LangSwitcher from "./LangSwitcher";
import useMobileMenu from "../hooks/useMobileMenu";
import MobileMenu from "./MobileMenu";

const navLinkClass = ({ isActive }) =>
    [
        'no-underline font-medium text-[0.875rem] tracking-[0.01em]',
        'px-[0.875rem] py-[0.4rem] rounded-[var(--radius-md)]',
        'transition-[color,background-color] duration-[160ms] ease-[ease]',
        isActive
            ? 'text-white bg-[var(--color-accent)] font-semibold [box-shadow:var(--shadow-accent)]'
            : 'text-[rgba(255,255,255,0.92)] hover:text-[rgba(255,255,255,0.95)] hover:bg-[rgba(255,255,255,0.09)]',
    ].join(' ')

const Navbar = () => {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const menu = useMobileMenu()

    const logout = () => {
        Cookies.remove("accessToken")
        navigate("/login")
    }

    return (
        <>
            <nav className="flex justify-between items-center gap-4 px-6 h-[3.375rem] bg-[var(--color-brand)] border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-[1000] [box-shadow:0_2px_16px_rgba(15,13,35,0.3)] max-[640px]:px-4">
                <div className="flex items-center">
                    <button
                        onClick={menu.open}
                        className="hidden max-[640px]:flex w-11 h-11 text-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-md)] text-[rgba(255,255,255,0.8)] cursor-pointer transition-[background-color] duration-[160ms] items-center justify-center hover:bg-[rgba(255,255,255,0.14)]"
                    >
                        ☰
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-1 whitespace-nowrap max-[640px]:hidden max-[860px]:gap-0.5">
                    <NavLink to="/suppliers" className={navLinkClass}>{t("navbar_suppliers")}</NavLink>
                    <NavLink to="/products" className={navLinkClass}>{t("navbar_products")}</NavLink>
                    <NavLink to="/quotations" className={navLinkClass}>{t("navbar_quotations")}</NavLink>
                </div>

                <div className="flex items-center justify-end gap-[0.625rem] max-[640px]:hidden">
                    <LangSwitcher />
                    <Button onClick={logout}>{t("navbar_logout")}</Button>
                </div>
            </nav>

            <MobileMenu
                open={menu.isOpen}
                onClose={menu.close}
                onLogout={logout}
                t={t}
            />
        </>
    )
}

export default Navbar