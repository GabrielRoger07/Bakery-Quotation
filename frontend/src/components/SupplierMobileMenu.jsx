import LangSwitcher from './LangSwitcher'
import Button from './Button'

const SupplierMobileMenu = ({ open, onClose, onLogout, supplierName, initial, t }) => {
    if (!open) return null

    return (
        <>
            <div className="fixed inset-0 bg-[rgba(15,13,35,0.4)] [backdrop-filter:blur(4px)] z-[998]" onClick={onClose} />

            <aside className="fixed top-0 left-0 w-64 h-dvh bg-[var(--color-brand)] border-r border-[rgba(255,255,255,0.06)] p-5 flex flex-col z-[1001] [box-shadow:var(--shadow-navbar-drawer)] overflow-y-auto">
                <div className="flex justify-between items-center mb-5 pb-4 border-b border-[rgba(255,255,255,0.08)]">
                    <span className="text-[0.8125rem] font-bold text-[rgba(255,255,255,0.5)] tracking-[0.08em] uppercase">Cota Fácil</span>
                    <button
                        onClick={onClose}
                        className="w-11 h-11 text-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.12)] rounded-[var(--radius-sm)] cursor-pointer text-[rgba(255,255,255,0.7)] transition-[background-color] duration-[160ms] flex items-center justify-center hover:bg-[rgba(255,255,255,0.14)]"
                    >
                        x
                    </button>
                </div>

                {supplierName && (
                    <div className="flex items-center gap-3 px-[0.875rem] py-3 rounded-[var(--radius-md)] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] [box-shadow:0_0_0_2px_rgba(245,158,11,0.35)] flex items-center justify-center text-base font-bold text-[#1a1200] flex-shrink-0 select-none" aria-hidden="true">
                            {initial}
                        </div>
                        <div className="flex flex-col leading-[1.2]">
                            <span className="text-[0.625rem] font-medium tracking-[0.06em] uppercase text-[rgba(255,255,255,0.45)]">{t("supplier_logged_in_as")}</span>
                            <span className="text-[0.8125rem] font-semibold text-[rgba(255,255,255,0.92)]">{supplierName}</span>
                        </div>
                    </div>
                )}

                <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-row items-center gap-[0.625rem]">
                    <LangSwitcher />
                    <Button onClick={onLogout}>{t("navbar_logout")}</Button>
                </div>
            </aside>
        </>
    )
}

export default SupplierMobileMenu
