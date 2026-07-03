import Button from '@/components/Button'
import { Info, ArrowLeft } from 'lucide-react'

/**
 * Barra de ações compartilhada do wizard de cotação (Voltar + ação primária).
 * No desktop renderiza inline no fim do conteúdo; no mobile fica grudada ao rodapé
 * (sticky, acima da bottom-nav) — some quando o conteúdo é curto, evitando espaço
 * vazio, e acompanha o scroll quando o conteúdo é mais longo que a tela.
 */
const WizardActions = ({
    onBack,
    onPrimary,
    primaryLabel,
    primaryVariant = 'primary',
    primaryIcon: PrimaryIcon,
    blocked = false,
    hint,
    loading = false,
}) => {
    const handlePrimary = () => {
        if (blocked || loading) return
        onPrimary()
    }

    const inner = (
        <>
            {blocked && hint && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-warning-lighter)] border border-[var(--color-warning-border)] text-[var(--color-warning-text)] text-caption font-medium max-md:mx-0">
                    <Info size={16} strokeWidth={2} className="flex-shrink-0" />
                    {hint}
                </div>
            )}
            <div className="flex gap-3 max-md:[&>*]:flex-1 md:justify-center">
                {onBack && (
                    <Button variant="secondary" onClick={onBack} disabled={loading} className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap max-md:px-3">
                        <ArrowLeft size={18} strokeWidth={2} />Voltar
                    </Button>
                )}
                <Button
                    variant={primaryVariant}
                    onClick={handlePrimary}
                    disabled={blocked || loading}
                    className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap max-md:px-3"
                >
                    {loading ? 'Carregando...' : primaryLabel}
                    {!loading && PrimaryIcon && <PrimaryIcon size={18} strokeWidth={2} />}
                </Button>
            </div>
        </>
    )

    return (
        <>
            {/* Desktop: inline */}
            <div className="max-md:hidden mt-5">{inner}</div>

            {/* Mobile: sticky footer above bottom-nav (fica junto ao conteúdo quando ele é curto) */}
            <div
                className="md:hidden sticky -mx-4 mt-4 z-20 bg-[var(--color-surface-card)] border-t border-[var(--color-border-default)] [box-shadow:0_-4px_16px_rgba(30,27,75,0.08)] px-4 pt-3"
                style={{
                    bottom: 'calc(4.25rem + env(safe-area-inset-bottom))',
                    paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
                }}
            >
                {inner}
            </div>
        </>
    )
}

export default WizardActions
