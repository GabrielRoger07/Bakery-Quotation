import { useState } from 'react'
import { useCurrencyMask } from '@/hooks/useCurrencyMask'
import useFetch from '@/hooks/useFetch'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { ENV } from '@/config/env'
import { formatDecimal, formatMoney } from '@/utils/formatMoney'

const QuotationProductItem = ({ product, participationId, currentLowestBid }) => {

    const {request} = useFetch(ENV.API_BASE_URL)

    const { value: price, handleChange: handlePriceChange, getNumericValue, setValue: setPrice } = useCurrencyMask("")

    const [bonus, setBonus] = useState("")
    const [addBonus, setAddBonus] = useState(false)
    const [error, setError] = useState("")
    const [bonusError, setBonusError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [pendingBidValue, setPendingBidValue] = useState(null)

    const numericPrice = getNumericValue()
    const bonusUnits = addBonus ? Number(bonus || 0) : 0
    const totalUnits = Number(product.quantity) + bonusUnits
    const estimatedUnitPrice = numericPrice > 0 && totalUnits > 0 ? numericPrice / totalUnits : null
    const isSupplierLowestBid = currentLowestBid?.participationId === participationId
    const lowestBidColor = currentLowestBid
        ? (isSupplierLowestBid ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')
        : ''

    const validateBonus = (bonusRawValue, isBonusEnabled) => {
        if(!isBonusEnabled) return ""
        const bonusValue = Number(bonusRawValue || 0)
        if(bonusValue <= 0) return "Informe uma quantidade bônus válida (maior que zero)."
        if(bonusValue > Number(product.bonusLimit)) return "Seu bônus não pode ser maior que o limite de bônus"
        return ""
    }

    const handlePriceInputChange = (e) => {
        if(confirming) setConfirming(false)
        handlePriceChange(e)
    }

    const handleBidSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const nextBonusError = validateBonus(bonus, addBonus)
        if(nextBonusError){
            setBonusError(nextBonusError)
            return
        }

        const numericPrice = getNumericValue()

        if(!numericPrice){
            setError("Preço é obrigatório")
            return
        }

        const quantityUnits = Number(product.quantity)
        const proposedBonusUnits = addBonus ? Number(bonus || 0) : 0
        const proposedTotalUnits = quantityUnits + proposedBonusUnits
        const pricePerUnit = proposedTotalUnits > 0 ? numericPrice / proposedTotalUnits : 0

        if(pricePerUnit < 0.01) {
            setError("Lance unitário deve ser de pelo menos R$0,01")
            return
        }

        if(currentLowestBid && ((currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)) <= pricePerUnit)){
            setError("Seu lance precisa ser mais baixo que o menor lance")
            return
        }

        if(bonus && bonus > product.bonusLimit) {
            setError("Seu bônus não pode ser maior que o limite de bônus")
            return
        }

        setPendingBidValue(pricePerUnit)
        setConfirming(true)
    }

    const handleBonusChange = (e) => {
        if(confirming) setConfirming(false)

        const value = e.target.value

        if(value === ""){
            setBonus("")
            setBonusError(validateBonus("", addBonus))
            return
        }

        const numericValue = value.replace(/\D/g, "")
        setBonus(numericValue)
        setBonusError(validateBonus(numericValue, addBonus))
    }

    const confirmBid = async () => {
        setConfirming(false)
        setLoading(true)

        const body = {
            participationId,
            productId: product.productId,
            price: getNumericValue(),
            quantity: parseFloat(product.quantity),
            bonus: addBonus ? parseFloat(bonus) : 0
        }

        const res = await request("POST", "/bids", body)
        setLoading(false)

        if(res.ok){
            setSuccess("Lance enviado com sucesso!")
            setPrice("")
            setBonus(0)
            setAddBonus(false)
            setTimeout(() => setSuccess(""), 2000)
        }else{
            setError("Falha ao submeter lance")
        }
    }

    const cancelBid = () => {
        setConfirming(false)
        setError("")
    }

    return (
        <div className="bg-[var(--color-surface-0)] px-4 pt-4 pb-[0.7rem] rounded-[var(--radius-lg)] border border-[var(--color-border)] [box-shadow:var(--shadow-card-soft)] transition-[transform,box-shadow] duration-[160ms] h-full flex flex-col hover:-translate-y-[2px] hover:[box-shadow:var(--shadow-sm)]">
            <div>
                <h3 className="text-[var(--color-text-strong)] m-0 mb-[0.7rem] text-base text-center">{product.productName}</h3>
                <p className="text-[var(--color-text-secondary)] m-0 mb-[0.25rem] text-[0.875rem] font-medium">Quantidade: {product.quantity}</p>
                <p className="text-[var(--color-text-secondary)] m-0 mb-[0.7rem] text-[0.875rem] font-medium">Bônus máximo permitido (unidades): {product.bonusLimit}</p>
                <div className="mt-0 px-[0.65rem] py-[0.58rem] border border-[var(--color-highlight-border)] bg-[var(--color-highlight-lighter)] rounded-[var(--radius-md)] flex flex-col justify-center items-center text-center min-h-[4.5rem]">
                    <span className="block text-[0.75rem] text-[var(--color-text-muted)] mb-[0.2rem]">Menor Lance Atual: </span>
                    <strong className={`text-[1rem] ${lowestBidColor || 'text-[var(--color-accent-strong)]'}`}>
                        {currentLowestBid ? `${formatMoney(currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus))}/UN` : "Sem lances"}
                    </strong>
                </div>
            </div>

            <form className="flex flex-col h-full" onSubmit={handleBidSubmit}>
                <Input label={"Preço"} type="text" value={price} onChange={handlePriceInputChange} placeholder="R$0,00" />

                {product.bonusLimit > 0 && (
                    <div className="m-0 mb-[0.85rem] font-sans">
                        <p className="mb-[0.35rem] font-medium text-[0.875rem] text-center">Deseja oferecer unidades extras (bônus)?</p>
                        <span className="block text-center text-[var(--color-text-muted)] text-[0.75rem] mb-[0.45rem]">Você pode adicionar até ${product.bonusLimit} unidades de bônus neste item.</span>
                        <div className="flex justify-center gap-[0.65rem]">
                            <label className="inline-flex items-center cursor-pointer text-[0.875rem] text-[var(--color-text-secondary)] min-w-[4.8rem] justify-center">
                                <input type="radio" name={`addBonus-${product.productId}`} value="no" checked={!addBonus} className="mr-[0.35rem] accent-[var(--color-accent)]" onChange={() => {
                                    if(confirming) setConfirming(false)
                                    setAddBonus(false)
                                    setBonus("")
                                    setBonusError("")
                                }} />
                                Não
                            </label>
                            <label className="inline-flex items-center cursor-pointer text-[0.875rem] text-[var(--color-text-secondary)] min-w-[4.8rem] justify-center">
                                <input type="radio" name={`addBonus-${product.productId}`} value="yes" checked={addBonus} className="mr-[0.35rem] accent-[var(--color-accent)]" onChange={() => {
                                    if(confirming) setConfirming(false)
                                    setAddBonus(true)
                                    setBonusError(validateBonus(bonus, true))
                                }} />
                                Sim
                            </label>
                        </div>
                    </div>
                )}

                {product.bonusLimit <= 0 && (
                    <div className="m-0 mb-[0.85rem] min-h-[4.1rem] flex items-center justify-center border border-dashed border-[var(--color-border-strong)] rounded-[var(--radius-md)] bg-[var(--color-surface-1)]">
                        <p className="m-0 text-center text-[var(--color-text-muted)] text-[0.75rem]">Bônus não disponível para este item.</p>
                    </div>
                )}

                {addBonus && (
                    <Input
                        label={"Quantidade Bônus" + ` (em UN)`}
                        type="number"
                        value={bonus}
                        onChange={handleBonusChange}
                        placeholder={`Digite a quantidade bônus (máx. ${product.bonusLimit})`}
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }}
                    />
                )}

                {!confirming && estimatedUnitPrice !== null && (
                    <p className="mt-[0.7rem] px-[0.65rem] py-[0.55rem] border border-[var(--color-highlight-border)] bg-[var(--color-highlight-lighter)] rounded-[var(--radius-md)] text-center text-[0.875rem]">
                        Preço unitário estimado: <strong className="text-[var(--color-accent-strong)]">{formatMoney(estimatedUnitPrice)}/UN</strong>
                    </p>
                )}

                {bonusError && <p className="mt-[0.15rem] mb-2 text-center text-[var(--color-danger-strong)] text-[0.875rem]">{bonusError}</p>}

                {!confirming ? (
                    <Button type="submit" disabled={loading || Boolean(bonusError)} className="block mt-auto mb-0">{loading ? "Enviando..." : "Enviar Lance"}</Button>
                ) : (
                    <div className="mt-[0.55rem] p-[0.65rem] bg-[var(--color-surface-4)] rounded-[var(--radius-md)] border border-[var(--color-border-light)] text-center">
                        <p className="text-[0.875rem] mb-2 text-[var(--color-text-default)]">
                            Confirmar lance de <strong>R$ ${formatDecimal(pendingBidValue)}/UN</strong> para <strong>${product.productName}</strong>?",
                        </p>
                        <div className="flex justify-center gap-[0.55rem]">
                            <Button type="button" onClick={cancelBid} variant="danger">Cancelar</Button>
                            <Button type="button" onClick={confirmBid} variant="success">Confirmar</Button>
                        </div>
                    </div>
                )}

                {error && <p className="mt-[0.2rem] mb-[0.45rem] pt-2 text-center text-[0.875rem] text-[var(--color-danger-strong)]">{error}</p>}
                {success && <p className="mt-[0.2rem] mb-[0.45rem] pt-2 text-center text-[0.875rem] text-[var(--color-success-strong)]">{success}</p>}
            </form>
        </div>
    )
}

export default QuotationProductItem
