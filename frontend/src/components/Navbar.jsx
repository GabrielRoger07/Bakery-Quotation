import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Button from "./Button";
import MobileMenu from "./MobileMenu";
import LogoutConfirmModal from "./LogoutConfirmModal";

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

    const doLogout = () => {
        Cookies.remove("accessToken")
        navigate("/login")
    }

    return (
        <>
            <nav className="flex justify-between items-center gap-4 px-6 h-[3.375rem] bg-[var(--color-brand)] border-b border-[var(--color-on-dark-border)] sticky top-0 z-[1000] [box-shadow:var(--shadow-md-strong)] max-[640px]:px-4">
                <div className="absolute left-1/2 -translate-x-1/2 flex justify-center gap-1 whitespace-nowrap max-[640px]:hidden max-[860px]:gap-0.5">
                    <NavLink to="/suppliers" className={navLinkClass}>Fornecedores</NavLink>
                    <NavLink to="/products" className={navLinkClass}>Produtos</NavLink>
                    <NavLink to="/quotations" className={navLinkClass}>Cotações</NavLink>
                </div>

                <div className="flex items-center justify-end gap-[0.625rem] ml-auto max-[640px]:hidden">
                    <Button onClick={() => setConfirmOpen(true)}>Sair</Button>
                </div>
            </nav>

            <MobileMenu onLogout={() => setConfirmOpen(true)} />

            <LogoutConfirmModal
                open={confirmOpen}
                onConfirm={doLogout}
                onCancel={() => setConfirmOpen(false)}
            />
        </>
    )
}

export default Navbar
