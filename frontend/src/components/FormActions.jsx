import { cn } from '@/utils/cn'

const alignments = {
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  start: 'justify-start',
}

/**
 * Linha de ações de formulário/diálogo (botões).
 * Substitui o bloco `flex justify-center gap-3 mt-4` repetido pelas telas.
 */
const FormActions = ({ children, align = 'center', className }) => (
  <div className={cn('flex items-center gap-3 mt-4', alignments[align] ?? alignments.center, className)}>
    {children}
  </div>
)

export default FormActions
