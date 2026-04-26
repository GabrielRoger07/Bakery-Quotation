import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { useMemo, useState } from 'react'
import Button from './Button'
import { decodeJwt } from '../utils/decodeJwt'
import LogoutConfirmModal from './LogoutConfirmModal'

const SupplierNavbar = () => {
    const navigate = useNavigate()
    const [confirmOpen, setConfirmOpen] = useState(false)

    const supplierName = useMemo(() => {
        const token = Cookies.get("supplierAccessToken")
        if (!token) return null
        const payload = decodeJwt(token)
        return payload?.supplierName ?? null
    }, [])

    const initial = supplierName ? supplierName.trim().charAt(0).toUpperCase() : '?'

    const doLogout = () => {
        const cnpj = Cookies.get("supplierCompanyCnpj")
        Cookies.remove("supplierAccessToken")
        Cookies.remove("supplierCompanyCnpj")
        navigate(`/supplier/login/${cnpj}`)
    }

    return (
        <>
            <nav className="flex justify-between items-center gap-4 px-6 h-[4.5rem] sm:h-[3.375rem] bg-[var(--color-brand)] border-b border-[var(--color-on-dark-border)] sticky top-0 z-[1000] [box-shadow:var(--shadow-md-strong)] max-[640px]:px-4">
                <div className="flex items-center">
                    {supplierName && (
                        <div className="flex items-center gap-[0.6rem] px-[0.75rem] py-[0.3rem] pl-[0.3rem] rounded-full bg-[var(--color-on-dark-bg)] border border-[var(--color-on-dark-border-soft)] [animation:supplierAppear_0.4s_ease_both]">
                            <div className="w-[1.875rem] h-[1.875rem] rounded-full bg-gradient-to-br from-[var(--color-avatar-from)] to-[var(--color-avatar-to)] [box-shadow:0_0_0_2px_var(--color-avatar-ring)] flex items-center justify-center text-[0.8125rem] font-bold text-[var(--color-avatar-text)] flex-shrink-0 select-none" aria-hidden="true">
                                {initial}
                            </div>
                            <div className="flex flex-col leading-[1.2]">
                                <span className="text-[0.625rem] font-medium tracking-[0.06em] uppercase text-[var(--color-on-dark-text-faint)]">Conectado como</span>
                                <span className="text-[0.8125rem] font-semibold text-[var(--color-on-dark-text)] max-w-[14rem] overflow-hidden text-ellipsis whitespace-nowrap">{supplierName}</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-[0.625rem] ml-auto">
                    <Button onClick={() => setConfirmOpen(true)}>Sair</Button>
                </div>
            </nav>

            <LogoutConfirmModal
                open={confirmOpen}
                onConfirm={doLogout}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    )
}

export default SupplierNavbar
