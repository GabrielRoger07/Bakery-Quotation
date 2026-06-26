import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Monta className de forma segura: resolve condicionais (clsx) e
 * conflitos de classes Tailwind (tailwind-merge — a última vence).
 *
 * Ex.: cn('px-4 py-2', isActive && 'bg-accent', className)
 */
export const cn = (...inputs) => twMerge(clsx(inputs))

export default cn
