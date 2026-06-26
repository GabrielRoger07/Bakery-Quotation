import { cn } from '@/utils/cn'

/**
 * Wrapper de página — fonte única de proporção/padding das telas.
 *
 * variant:
 *  - list   → container das listas (substitui .page-wrapper)
 *  - detail → container de telas de detalhe
 *  - form   → container neutro para formulários standalone
 *  - auth   → fundo de marca + card centralizado (login/registro)
 */
const containerVariants = {
  list: 'max-w-[1200px] mx-auto px-4 py-6 max-sm:p-0',
  detail: 'max-w-[920px] mx-auto px-4 py-6 max-sm:px-3 max-sm:py-4',
  form: 'w-full',
}

// Gradiente decorativo do fundo de auth (tom do accent) — colocado aqui junto do componente.
const authBgStyle = {
  backgroundImage:
    'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(91,33,182,0.25) 0%, transparent 55%),' +
    'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(91,33,182,0.15) 0%, transparent 55%)',
}

const PageContainer = ({ variant = 'list', children, className }) => {
  if (variant === 'auth') {
    return (
      <div
        className={cn(
          'flex justify-center items-center min-h-[100dvh] px-6 max-sm:px-3 bg-[var(--color-brand)]',
          '[padding-top:max(1.5rem,env(safe-area-inset-top))] [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]',
          'max-sm:[padding-top:max(1rem,env(safe-area-inset-top))] max-sm:[padding-bottom:max(1rem,env(safe-area-inset-bottom))]',
        )}
        style={authBgStyle}
      >
        <div
          className={cn(
            'w-full max-w-[420px] text-center',
            'bg-[var(--color-surface-0)] border border-[var(--color-border)]',
            'rounded-[var(--radius-2xl)] max-sm:rounded-[var(--radius-xl)]',
            'p-[2.5rem_2.25rem_2rem] max-sm:p-[1.75rem_1.25rem_1.5rem]',
            '[box-shadow:0_24px_64px_rgba(15,13,35,0.4)] [animation:authIn_0.3s_ease-out]',
            className,
          )}
        >
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className={cn(containerVariants[variant] ?? containerVariants.list, className)}>
      {children}
    </div>
  )
}

export default PageContainer
