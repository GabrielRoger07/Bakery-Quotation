import { NavLink } from 'react-router-dom'
import LangSwitcher from './LangSwitcher'
import Button from './Button'

const mobileNavLinkClass = ({ isActive }) =>
    [
        'px-[0.875rem] py-[0.6875rem] rounded-[var(--radius-md)] no-underline font-medium text-[0.875rem]',
        'transition-[background-color,color] duration-[160ms] ease-[ease]',
        isActive
            ? 'bg-[var(--color-accent)] text-white font-semibold'
            : 'text-[rgba(255,255,255,0.6)] hover:bg-[rgba(255,255,255,0.07)] hover:text-[rgba(255,255,255,0.9)]',
    ].join(' ')

const MobileMenu = ({ open, onClose, onLogout, t }) => {
    if (!open) return null

    return (
        <>
            <div className="fixed inset-0 bg-[rgba(15,13,35,0.4)] [backdrop-filter:blur(4px)] z-[998]" onClick={onClose} />

            <aside className="fixed top-0 left-0 w-64 h-dvh bg-[var(--color-brand)] border-r border-[rgba(255,255,255,0.06)] p-5 flex flex-col transition-[left] duration-[260ms] ease-[ease] z-[1001] [box-shadow:var(--shadow-navbar-drawer)] overflow-y-auto">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <span className="text-[0.8125rem] font-bold text-[rgba(255,255,255,0.5)] tracking-[0.08em] uppercase">Cota Fácil</span>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 text-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[var(--radius-sm)] cursor-pointer text-[rgba(255,255,255,0.7)] transition-[background-color] duration-[160ms] flex items-center justify-center hover:bg-[rgba(255,255,255,0.14)]"
                    >
                        x
                    </button>
                </div>

                <nav className="flex flex-col gap-1 pb-3">
                    <NavLink to="/suppliers" onClick={onClose} className={mobileNavLinkClass}>{t("navbar_suppliers")}</NavLink>
                    <NavLink to="/products" onClick={onClose} className={mobileNavLinkClass}>{t("navbar_products")}</NavLink>
                    <NavLink to="/quotations" onClick={onClose} className={mobileNavLinkClass}>{t("navbar_quotations")}</NavLink>
                </nav>

                <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-row items-center gap-[0.625rem]">
                    <div className="flex-shrink-0">
                        <LangSwitcher />
                    </div>
                    <Button onClick={onLogout} className="flex-1 text-center !bg-[rgba(255,255,255,0.08)] !border-[rgba(255,255,255,0.15)] !text-[rgba(255,255,255,0.75)] ![box-shadow:none] hover:!bg-[rgba(255,255,255,0.14)] hover:!border-[rgba(255,255,255,0.25)] hover:!text-white hover:![translate:none] hover:![box-shadow:none]">{t("navbar_logout")}</Button>
                </div>
            </aside>
        </>
    )
}

export default MobileMenu