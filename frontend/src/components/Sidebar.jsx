import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { Croissant } from "lucide-react";
import LogoutConfirmModal from "@/components/LogoutConfirmModal";
import { SuppliersIcon, ProductsIcon, DepartmentsIcon, QuotationsIcon, LogoutIcon } from "@/components/icons/NavIcons";

const items = [
    { to: '/suppliers',   label: 'Fornec.',   Icon: SuppliersIcon   },
    { to: '/products',    label: 'Produtos',  Icon: ProductsIcon    },
    { to: '/quotations',  label: 'Cotações',  Icon: QuotationsIcon  },
    { to: '/departments', label: 'Deptos',    Icon: DepartmentsIcon },
]

/**
 * Rail de navegação do contexto empresa — versão desktop (`sm:` e acima) do
 * que `MobileMenu` oferece no mobile. Convive com `Navbar` (que passa a só
 * aparecer abaixo de `sm:`); cada um visível só no seu breakpoint via CSS.
 */
const Sidebar = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [confirmOpen, setConfirmOpen] = useState(false)

    const doLogout = () => {
        Cookies.remove("accessToken")
        navigate("/login")
    }

    return (
        <>
            <nav
                className="hidden sm:flex fixed inset-y-0 left-0 z-[1000] w-24 flex-col items-center gap-1 py-5 bg-[var(--color-brand)] border-r border-[var(--color-on-dark-border)]"
                style={{ boxShadow: 'var(--shadow-navbar-drawer)' }}
            >
                <div className="flex items-center justify-center w-11 h-11 rounded-[var(--radius-lg)] bg-[var(--color-accent)] text-white mb-4 shrink-0">
                    <Croissant size={22} strokeWidth={2} />
                </div>

                {items.map(({ to, label, Icon }) => {
                    const active = location.pathname.startsWith(to)
                    const ItemIcon = Icon
                    return (
                        <NavLink
                            key={to}
                            to={to}
                            className="flex flex-col items-center justify-center gap-1 w-[4.25rem] py-2.5 rounded-[var(--radius-md)] no-underline transition-[background-color,color] duration-[160ms]"
                            style={{
                                color: active ? 'var(--color-on-dark-text)' : 'var(--color-on-dark-text-muted)',
                                background: active ? 'var(--color-accent)' : 'transparent',
                                fontWeight: active ? 600 : 500,
                                boxShadow: active ? 'var(--shadow-accent)' : 'none',
                            }}
                        >
                            <ItemIcon active={active} />
                            <span className="text-[0.7rem] tracking-[0.01em] leading-none">{label}</span>
                        </NavLink>
                    )
                })}

                <button
                    onClick={() => setConfirmOpen(true)}
                    className="flex flex-col items-center justify-center gap-1 w-[4.25rem] py-2.5 mt-auto rounded-[var(--radius-md)] bg-transparent border-none cursor-pointer transition-[background-color,color] duration-[160ms] hover:bg-[var(--color-on-dark-bg-hover)]"
                    style={{ color: 'var(--color-on-dark-text-muted)' }}
                >
                    <LogoutIcon active={false} />
                    <span className="text-[0.7rem] tracking-[0.01em] leading-none">Sair</span>
                </button>
            </nav>

            <LogoutConfirmModal
                open={confirmOpen}
                onConfirm={doLogout}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    )
}

export default Sidebar
