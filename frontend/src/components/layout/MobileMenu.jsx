import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import LogoutConfirmModal from '@/components/layout/LogoutConfirmModal'

const SuppliersIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
)

const ProductsIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
)

const QuotationsIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
    </svg>
)

const LogoutIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

const MobileMenu = ({ onLogout }) => {
    const location = useLocation()
    const [logoutOpen, setLogoutOpen] = useState(false)

    const tabs = [
        { to: '/suppliers', label: 'Fornecedores', Icon: SuppliersIcon },
        { to: '/products',  label: 'Produtos',     Icon: ProductsIcon  },
        { to: '/quotations',label: 'Cotações',     Icon: QuotationsIcon },
    ]

    return (
        <>
            <nav
                className="fixed bottom-0 left-0 right-0 z-[1000] sm:hidden"
                style={{
                    background: 'var(--color-brand)',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 -4px 24px rgba(15,13,35,0.3)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                <div className="flex items-stretch h-[4.25rem]">
                    {tabs.map(({ to, label, Icon }) => {
                        const active = location.pathname.startsWith(to)
                        const TabIcon = Icon
                        return (
                            <NavLink
                                key={to}
                                to={to}
                                className="flex-1 flex flex-col items-center justify-center gap-[0.3rem] no-underline relative transition-[color] duration-[160ms]"
                                style={{ color: active ? '#c4b5fd' : 'rgba(255,255,255,0.45)' }}
                            >
                                {active && (
                                    <span
                                        className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full"
                                        style={{
                                            width: '2rem',
                                            background: '#8b5cf6',
                                            boxShadow: '0 0 8px rgba(139,92,246,0.7)',
                                        }}
                                    />
                                )}
                                <TabIcon active={active} />
                                <span
                                    className="text-[0.65rem] font-medium tracking-[0.02em] leading-none"
                                    style={{ fontWeight: active ? 600 : 400 }}
                                >
                                    {label}
                                </span>
                            </NavLink>
                        )
                    })}

                    <button
                        onClick={() => setLogoutOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-[0.3rem] bg-transparent border-none cursor-pointer relative transition-[color] duration-[160ms]"
                        style={{ color: 'rgba(255,255,255,0.45)' }}
                    >
                        <LogoutIcon active={false} />
                        <span className="text-[0.65rem] font-medium tracking-[0.02em] leading-none">
                            Sair
                        </span>
                    </button>
                </div>
            </nav>

            <LogoutConfirmModal
                open={logoutOpen}
                onConfirm={onLogout}
                onCancel={() => setLogoutOpen(false)}
            />
        </>
    )
}

export default MobileMenu
