import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { RotateCw } from "lucide-react";
import MobileMenu from "@/components/MobileMenu";
import { useMobilePage } from "@/contexts/MobilePageContext";

/**
 * Barra de navegação do contexto empresa — só mobile (título da página +
 * ações); a partir de `sm:` a navegação vira a `Sidebar` fixa lateral, então
 * essa barra inteira desaparece (`sm:hidden`).
 */
const Navbar = () => {
    const navigate = useNavigate()
    const { pageTitle, reloadFn, leftAction, rightSlot } = useMobilePage()

    const doLogout = () => {
        Cookies.remove("accessToken")
        navigate("/login")
    }

    return (
        <>
            <nav className="sm:hidden flex justify-between items-center gap-4 px-4 h-[4.5rem] bg-[var(--color-brand)] border-b border-[var(--color-on-dark-border)] sticky top-0 z-[1000] [box-shadow:var(--shadow-md-strong)]">
                {/* Mobile: botão de ação à esquerda (opcional, ex.: fechar wizard) */}
                {leftAction && (
                    <button
                        onClick={leftAction.onClick}
                        aria-label={leftAction.ariaLabel}
                        className="hidden max-sm:flex items-center justify-center w-[2.25rem] h-[2.25rem] rounded-[var(--radius-md)] bg-[var(--color-on-dark-bg)] border border-[var(--color-on-dark-border-strong)] text-[var(--color-on-dark-text)] transition-[background-color,transform] duration-[160ms] active:scale-95 hover:bg-[var(--color-on-dark-bg-hover)] flex-shrink-0"
                    >
                        <leftAction.icon size={18} strokeWidth={2.5} />
                    </button>
                )}

                {/* Mobile: título da página à esquerda */}
                {pageTitle && (
                    <span className="hidden max-sm:block text-[var(--color-on-dark-text)] font-semibold text-[1rem] tracking-[-0.01em] truncate">
                        {pageTitle}
                    </span>
                )}

                {/* Mobile: slot customizado à direita, ou botão reload */}
                {rightSlot ? (
                    <div className="hidden max-sm:flex items-center ml-auto flex-shrink-0">{rightSlot}</div>
                ) : reloadFn && (
                    <button
                        onClick={reloadFn}
                        className="hidden max-sm:flex ml-auto items-center justify-center w-[2.25rem] h-[2.25rem] rounded-[var(--radius-md)] bg-[var(--color-on-dark-bg)] border border-[var(--color-on-dark-border-strong)] text-[var(--color-on-dark-text)] transition-[background-color,transform] duration-[160ms] active:scale-95 hover:bg-[var(--color-on-dark-bg-hover)]"
                        aria-label="Atualizar"
                    >
                        <RotateCw size={17} strokeWidth={2} />
                    </button>
                )}
            </nav>

            <MobileMenu onLogout={doLogout} />
        </>
    )
}

export default Navbar
