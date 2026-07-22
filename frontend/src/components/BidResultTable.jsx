import { useEffect } from 'react'
import { Gift, Package } from 'lucide-react'
import { cn } from '@/utils/cn'
import { formatMoney } from '@/utils/formatMoney'
import { formatQuantity } from '@/utils/formatQuantity'
import { useCurrencyMask } from '@/hooks/useCurrencyMask'

/**
 * Tabela de resultado de lances (desktop). Não é uma lista genérica e não substitui
 * o `Table`: cada linha é um produto (avatar + nome + marca), com quantidade e bônus
 * em chips, preço unitário e total, e uma linha de rodapé com o valor total.
 *
 * Colunas: Produto (nome + descrição) · Marca · Quantidade · Unitário · Total.
 * `items`: [{ productName, productDescription, brand, quantity, bonus, unitOfMeasure, pricePerUnit, price }]
 * - `noPrice: true` → linha esmaecida, pílula "Sem preço" e travessões em unitário/total.
 * - `showAvatar={false}` → oculta o quadrado com ícone (nome+descrição ocupam a largura).
 * - `editable` + `onPriceChange(productId, numeric)` → coluna Unitário vira um input de
 *   preço por linha (usa `item.productId` e `item.pricePerUnit` como valor inicial), com
 *   o total calculado ao vivo. O `totalValue` do rodapé continua vindo do pai. As linhas
 *   ganham uma faixa lateral: accent (com preço) ou cinza (sem preço).
 * - `statusBar` (modo exibição) → faixa lateral por linha: accent (produto cotado) ou
 *   warning (produto sem lance/`noPrice`), espelhando o card de proposta enviada do mobile.
 */
const numericCls = 'text-right [font-variant-numeric:tabular-nums] whitespace-nowrap'

const headCls = 'px-5 py-3.5 text-label font-bold uppercase tracking-[0.07em] text-[var(--color-text-muted)] whitespace-nowrap'

const ProductCell = ({ item, showAvatar, showNoPriceTag = true, barColor }) => (
    <td
        className="px-5 py-3.5 transition-[box-shadow] duration-200"
        style={barColor ? { boxShadow: `inset 3px 0 0 0 ${barColor}` } : undefined}
    >
        <div className="flex items-center gap-3">
            {showAvatar && (
                <span className="flex items-center justify-center w-10 h-10 shrink-0 rounded-[var(--radius-md)] bg-[var(--color-highlight-soft)] text-[var(--color-accent)]">
                    <Package size={18} strokeWidth={1.75} />
                </span>
            )}
            <div className="min-w-0">
                <span className="flex items-center gap-2 text-body font-bold text-[var(--color-text-heading)] leading-tight">
                    {item.productName}
                    {showNoPriceTag && item.noPrice && (
                        <span className="inline-flex items-center rounded-full border border-[var(--color-warning-border)] bg-[var(--color-warning-lighter)] px-2 py-0.5 text-label font-semibold text-[var(--color-warning-strong)] whitespace-nowrap">
                            Sem preço
                        </span>
                    )}
                </span>
                {item.productDescription && (
                    <span className="mt-0.5 block text-label font-normal text-[var(--color-text-muted)] [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
                        {item.productDescription}
                    </span>
                )}
            </div>
        </div>
    </td>
)

const BrandCell = ({ item }) => (
    <td className="px-5 py-3.5">
        <span className={cn(
            'text-body text-[var(--color-text-body)]',
            !item.brand && 'text-[var(--color-text-muted)]'
        )}>
            {item.brand || '—'}
        </span>
    </td>
)

const QuantityCell = ({ item }) => (
    <td className="px-5 py-3.5">
        <div className="flex items-center justify-center gap-1.5">
            <span className="inline-flex items-center rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-muted)] px-2.5 py-1 text-caption font-semibold text-[var(--color-text-neutral)] [font-variant-numeric:tabular-nums] whitespace-nowrap">
                {formatQuantity(item)}
            </span>
            {item.bonus > 0 && (
                <span
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-highlight-border)] bg-[var(--color-highlight-soft)] px-2.5 py-1 text-caption font-semibold text-[var(--color-accent)] [font-variant-numeric:tabular-nums] whitespace-nowrap"
                    title={`${item.bonus} de bônus`}
                >
                    <Gift size={12} strokeWidth={2} />
                    +{item.bonus}
                </span>
            )}
        </div>
    </td>
)

const BidResultDisplayRow = ({ item, showAvatar, statusBar }) => (
    <tr
        className={cn(
            'border-b border-[var(--color-border-faint)] transition-[background-color] duration-[160ms]',
            item.noPrice
                ? 'opacity-60 bg-[var(--color-surface-subtle)]'
                : 'hover:bg-[var(--color-highlight-lighter)]'
        )}
    >
        <ProductCell
            item={item}
            showAvatar={showAvatar}
            barColor={statusBar ? (item.noPrice ? 'var(--color-warning)' : 'var(--color-accent)') : undefined}
        />
        <BrandCell item={item} />
        <QuantityCell item={item} />

        {item.noPrice ? (
            <>
                <td className={cn('px-5 py-3.5 text-body text-[var(--color-text-muted)]', numericCls)}>—</td>
                <td className={cn('px-5 py-3.5 text-[1rem] text-[var(--color-text-muted)]', numericCls)}>—</td>
            </>
        ) : (
            <>
                <td className={cn('px-5 py-3.5 text-body font-bold tracking-[-0.01em] text-[var(--color-text-heading)]', numericCls)}>
                    {formatMoney(item.pricePerUnit)}
                    {item.unitOfMeasure && (
                        <span className="font-semibold text-[var(--color-text-muted)]">
                            /{item.unitOfMeasure.toUpperCase()}
                        </span>
                    )}
                </td>

                <td className={cn('px-5 py-3.5 text-[1rem] font-bold tracking-[-0.01em] text-[var(--color-text-heading)]', numericCls)}>
                    {formatMoney(item.price)}
                </td>
            </>
        )}
    </tr>
)

const BidResultInputRow = ({ item, showAvatar, onPriceChange }) => {
    const { value, handleChange, getNumericValue, setValue } = useCurrencyMask()

    useEffect(() => {
        if (item.pricePerUnit > 0) setValue(formatMoney(item.pricePerUnit))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        onPriceChange(item.productId, getNumericValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    const numeric = getNumericValue()
    const hasPrice = numeric > 0
    const total = numeric * Number(item.quantity)

    return (
        <tr className="border-b border-[var(--color-border-faint)] transition-[background-color] duration-[160ms] hover:bg-[var(--color-highlight-lighter)]">
            <ProductCell
                item={item}
                showAvatar={showAvatar}
                showNoPriceTag={false}
                barColor={hasPrice ? 'var(--color-accent)' : 'var(--color-border-subtle)'}
            />
            <BrandCell item={item} />
            <QuantityCell item={item} />

            <td className="px-5 py-3.5">
                <div className="ml-auto flex items-stretch h-[2.625rem] w-[13rem] max-w-full overflow-hidden rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-subtle)] transition-[border-color,box-shadow,background] duration-[160ms] focus-within:border-[var(--color-accent)] focus-within:[box-shadow:var(--shadow-focus-accent-soft)] focus-within:bg-[var(--color-surface-card)]">
                    <input
                        type="text"
                        inputMode="numeric"
                        value={value}
                        onChange={handleChange}
                        placeholder="R$ 0,00"
                        aria-label={`Preço unitário de ${item.productName}`}
                        className="min-w-0 flex-1 border-none bg-transparent px-3.5 text-right text-body font-semibold text-[var(--color-text-body)] [font-variant-numeric:tabular-nums] outline-none placeholder:font-normal placeholder:text-[var(--color-text-disabled)]"
                    />
                    {(item.unitLabel || item.unitOfMeasure) && (
                        <span className="flex shrink-0 items-center border-l-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-2.5 text-caption font-bold text-[var(--color-accent)] whitespace-nowrap">
                            / {item.unitLabel || item.unitOfMeasure}
                        </span>
                    )}
                </div>
            </td>

            <td className={cn(
                'px-5 py-3.5 text-[1rem] font-bold tracking-[-0.01em]',
                numericCls,
                hasPrice ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-muted)]'
            )}>
                {hasPrice ? formatMoney(total) : '—'}
            </td>
        </tr>
    )
}

const BidResultTable = ({
    items = [],
    totalValue = 0,
    totalLabel = 'Valor total',
    showAvatar = true,
    editable = false,
    onPriceChange,
    statusBar = false,
}) => (
    <div className="w-full overflow-x-auto bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-card-soft)]">
        <table className="w-full border-collapse min-w-[760px]">
            <thead>
                <tr className="bg-[var(--color-surface-subtle)] border-b border-[var(--color-border-subtle)]">
                    <th className={cn(headCls, 'text-left')}>Produto</th>
                    <th className={cn(headCls, 'text-left')}>Marca</th>
                    <th className={cn(headCls, 'text-center')}>Quantidade</th>
                    <th className={cn(headCls, numericCls)}>Unitário</th>
                    <th className={cn(headCls, numericCls)}>Total</th>
                </tr>
            </thead>

            <tbody>
                {items.map((item, index) => editable ? (
                    <BidResultInputRow
                        key={item.productId ?? index}
                        item={item}
                        showAvatar={showAvatar}
                        onPriceChange={onPriceChange}
                    />
                ) : (
                    <BidResultDisplayRow
                        key={`${item.productName}-${index}`}
                        item={item}
                        showAvatar={showAvatar}
                        statusBar={statusBar}
                    />
                ))}
            </tbody>

            <tfoot>
                <tr className="bg-[var(--color-surface-subtle)]">
                    <td colSpan={4} className="px-5 py-4 text-label font-bold uppercase tracking-[0.07em] text-[var(--color-text-muted)]">
                        {totalLabel}
                    </td>
                    <td className={cn('px-5 py-4 text-[1.25rem] font-bold text-[var(--color-text-heading)] tracking-[-0.02em]', numericCls)}>
                        {formatMoney(totalValue)}
                    </td>
                </tr>
            </tfoot>
        </table>
    </div>
)

export default BidResultTable
