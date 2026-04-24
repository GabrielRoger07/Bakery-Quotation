import { useEffect } from 'react'
import { Tag } from 'lucide-react'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'
import { formatMoney } from '../../utils/formatMoney'
import Input from '../../components/Input'

const SingleProposalProductRow = ({ product, disabled, initialNumericValue, onNumericChange }) => {
    const { value, handleChange, getNumericValue, setValue } = useCurrencyMask()

    useEffect(() => {
        if (initialNumericValue > 0) {
            setValue(formatMoney(initialNumericValue))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        onNumericChange(product.productId, getNumericValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className="border border-[var(--color-border-light)] rounded-[var(--radius-md)] p-3 bg-[var(--color-surface-1)]">
            <div className="flex flex-col gap-[0.15rem] mb-[0.45rem]">
                <strong className="text-[var(--color-text-strong)] text-[1rem] leading-[1.3]">{product.productName}</strong>
                {product.productDescription && (
                    <span className="text-[var(--color-text-muted)] text-[0.875rem] leading-[1.35]">{product.productDescription}</span>
                )}
            </div>

            <div className="flex flex-wrap gap-[0.4rem] mb-[0.55rem]">
                <span className="text-[var(--color-text-secondary)]">Quantidade:</span>
                <span className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.18rem] text-[0.75rem] font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-3)] rounded-full whitespace-nowrap">{product.quantity} UN</span>
                <span className="inline-flex items-center gap-[0.3rem] px-[0.55rem] py-[0.18rem] text-[0.75rem] font-medium text-[var(--color-text-secondary)] bg-[var(--color-surface-3)] rounded-full whitespace-nowrap">
                    <Tag size={12} />
                    {product.brand || "Marca não definida"}
                </span>
            </div>

            <Input
                label={"Preço da unidade" + `:`}
                type="text"
                value={value}
                onChange={(e) => handleChange(e)}
                disabled={disabled}
                placeholder="R$ 0,00"
            />
        </div>
    )
}

export default SingleProposalProductRow
