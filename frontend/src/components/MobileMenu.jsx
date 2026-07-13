import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import LogoutConfirmModal from '@/components/LogoutConfirmModal'
import { SuppliersIcon, ProductsIcon, DepartmentsIcon, QuotationsIcon, LogoutIcon } from '@/components/icons/NavIcons'

/**
 * Drawer de navegação mobile do contexto empresa.
 */
const MobileMenu = ({ onLogout }) => {
    const location = useLocation()
    const [logoutOpen, setLogoutOpen] = useState(false)

    const tabs = [
        { to: '/suppliers',   label: 'Fornecedores',    Icon: SuppliersIcon   },
        { to: '/products',    label: 'Produtos',        Icon: ProductsIcon    },
        { to: '/quotations',  label: 'Cotações',        Icon: QuotationsIcon  },
        { to: '/departments', label: 'Departamentos',         Icon: DepartmentsIcon },
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
