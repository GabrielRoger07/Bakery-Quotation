import { cn } from '@/utils/cn'
import usePageSurface from '@/hooks/usePageSurface'

/**
 * Wrapper de página — fonte única de proporção/padding das telas.
 *
 * variant:
 *  - list   → container das listas (substitui .page-wrapper)
 *  - detail → container de telas de detalhe
 *  - form   → container neutro para formulários standalone
 *  - auth   → card centralizado (login/registro); o fundo de marca vem do <body>
 */
const containerVariants = {
  list: 'w-full p-0 sm:pb-8 sm:min-h-screen sm:flex sm:flex-col',
  detail: 'max-w-[920px] mx-auto px-4 py-6 max-sm:px-3 max-sm:py-4',
  form: 'w-full',
}

const PageContainer = ({ variant = 'list', children, className }) => {
  // O fundo de tela cheia é pintado no <body> (via usePageSurface), não aqui — só assim
  // a moldura do navegador no mobile (status bar / barra do Safari) acompanha a cor.
  usePageSurface(variant === 'auth' ? 'brand' : 'app')

  if (variant === 'auth') {
    return (
      <div
        className={cn(
          'flex justify-center items-center min-h-[100dvh] px-6 max-sm:px-3',
          '[padding-top:max(1.5rem,env(safe-area-inset-top))] [padding-bottom:max(1.5rem,env(safe-area-inset-bottom))]',
          'max-sm:[padding-top:max(1rem,env(safe-area-inset-top))] max-sm:[padding-bottom:max(1rem,env(safe-area-inset-bottom))]',
        )}
      >
        <div
          className={cn(
            'w-full max-w-[420px] text-center',
            'bg-[var(--color-surface-card)] border border-[var(--color-border-default)]',
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
