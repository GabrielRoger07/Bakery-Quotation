import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import Button from './Button'
import LangSwitcher from './LangSwitcher'
import { decodeJwt } from '../utils/decodeJwt'
import useMobileMenu from '../hooks/useMobileMenu'
import SupplierMobileMenu from './SupplierMobileMenu'

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
            <nav className="flex justify-between items-center gap-4 px-6 h-[3.375rem] bg-[var(--color-brand)] border-b border-[rgba(255,255,255,0.06)] sticky top-0 z-[1000] [box-shadow:0_2px_16px_rgba(15,13,35,0.3)] max-[640px]:px-4">
                <div className="flex items-center">
                    {supplierName && (
                        <div className="flex items-center gap-[0.6rem] px-[0.75rem] py-[0.3rem] pl-[0.3rem] rounded-full bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.1)] [animation:supplierAppear_0.4s_ease_both]">
                            <div className="w-[1.875rem] h-[1.875rem] rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] [box-shadow:0_0_0_2px_rgba(245,158,11,0.3)] flex items-center justify-center text-[0.8125rem] font-bold text-[#1a1200] flex-shrink-0 select-none" aria-hidden="true">
                                {initial}
                            </div>
                            <div className="flex flex-col leading-[1.2]">
                                <span className="text-[0.625rem] font-medium tracking-[0.06em] uppercase text-[rgba(255,255,255,0.45)]">{t("supplier_logged_in_as")}</span>
                                <span className="text-[0.8125rem] font-semibold text-[rgba(255,255,255,0.92)] max-w-[14rem] overflow-hidden text-ellipsis whitespace-nowrap">{supplierName}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-[0.625rem] max-[640px]:hidden">
                    <LangSwitcher />
                    <Button onClick={logout}>{t("navbar_logout")}</Button>
                </div>

                <button
                    onClick={menu.toggle}
                    aria-label={t("navbar_open_menu")}
                    className="hidden max-[640px]:flex w-11 h-11 text-xl bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] rounded-[var(--radius-md)] text-[rgba(255,255,255,0.8)] cursor-pointer transition-[background-color] duration-[160ms] items-center justify-center hover:bg-[rgba(255,255,255,0.14)]"
                >
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
