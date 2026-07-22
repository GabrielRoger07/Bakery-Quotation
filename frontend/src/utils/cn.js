import { clsx } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * O tailwind-merge só conhece a escala de fonte padrão do Tailwind (text-xs, text-sm...).
 * Sem registrar a nossa (`@theme` em styles/index.css), ele lê `text-caption` como classe
 * de COR e a descarta quando vem um `text-[var(--color-...)]` depois — o texto perde o
 * tamanho. Registrar aqui mantém tamanho e cor em grupos separados.
 */
const twMerge = extendTailwindMerge({
    extend: {
        theme: {
            text: ['title', 'heading', 'body', 'caption', 'label'],
        },
    },
})

/**
 * Monta className de forma segura: resolve condicionais (clsx) e
 * conflitos de classes Tailwind (tailwind-merge — a última vence).
 *
 * Ex.: cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export const cn = (...inputs) => twMerge(clsx(inputs))

export default cn
