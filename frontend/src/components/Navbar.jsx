import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { RotateCw } from "lucide-react";
import Button from "./Button";
import MobileMenu from "./MobileMenu";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { useMobilePage } from "../contexts/MobilePageContext";

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
    const navigate = useNavigate()
    const [confirmOpen, setConfirmOpen] = useState(false)
    const { pageTitle, reloadFn } = useMobilePage()

    const doLogout = () => {
        Cookies.remove("accessToken")
        navigate("/login")
    }

    return (
        <>
            <nav className="flex justify-between items-center gap-4 px-6 h-[4.5rem] sm:h-[3.375rem] bg-[var(--color-brand)] border-b border-[var(--color-on-dark-border)] sticky top-0 z-[1000] [box-shadow:var(--shadow-md-strong)] max-[640px]:px-4">
                {/* Desktop: links centrados */}
                <div className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-1 whitespace-nowrap max-[640px]:hidden max-[860px]:gap-0.5">
                    <NavLink to="/suppliers" className={navLinkClass}>Fornecedores</NavLink>
                    <NavLink to="/products" className={navLinkClass}>Produtos</NavLink>
                    <NavLink to="/quotations" className={navLinkClass}>Cotações</NavLink>
                </div>

                {/* Mobile: título da página à esquerda */}
                {pageTitle && (
                    <span className="hidden max-[640px]:block text-[var(--color-on-dark-text)] font-semibold text-[1rem] tracking-[-0.01em] truncate">
                        {pageTitle}
                    </span>
                )}

                {/* Desktop: botão Sair */}
                <div className="flex items-center justify-end gap-[0.625rem] ml-auto max-[640px]:hidden">
                    <Button onClick={() => setConfirmOpen(true)}>Sair</Button>
                </div>

                {/* Mobile: botão reload à direita */}
                {reloadFn && (
                    <button
                        onClick={reloadFn}
                        className="hidden max-[640px]:flex ml-auto items-center justify-center w-[2.25rem] h-[2.25rem] rounded-[var(--radius-md)] bg-[var(--color-on-dark-bg-soft)] border border-[var(--color-on-dark-border-light)] text-[var(--color-on-dark-text)] transition-[background-color,transform] duration-[160ms] active:scale-95 hover:bg-[var(--color-on-dark-bg-hover)]"
                        aria-label="Atualizar"
                    >
                        <RotateCw size={17} strokeWidth={2} />
                    </button>
                )}
            </nav>

            <MobileMenu onLogout={doLogout} />

            <LogoutConfirmModal
                open={confirmOpen}
                onConfirm={doLogout}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    )
}

export default Navbar
