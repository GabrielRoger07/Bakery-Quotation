import { useState } from 'react'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'
import useFetch from '../../hooks/useFetch'
import { useTranslation, Trans } from 'react-i18next'
import Input from '../../components/Input'
import Button from '../../components/Button'
import './SupplierQuotation.css'
import { ENV } from '../../config/env'

const QuotationProductItem = ({ product, participationId, currentLowestBid }) => {
    
    const { t, i18n } = useTranslation()

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

    const locale = i18n.language === "pt" ? "pt-BR" : "en-US"
    const formatDecimal = (value) =>
        new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(Number(value || 0))

    const numericPrice = getNumericValue()
    const bonusUnits = addBonus ? Number(bonus || 0) : 0
    const totalUnits = Number(product.quantity) + bonusUnits
    const estimatedUnitPrice = numericPrice > 0 && totalUnits > 0 ? numericPrice / totalUnits : null
    const validateBonus = (bonusRawValue, isBonusEnabled) => {
        if(!isBonusEnabled){
            return ""
        }

        const bonusValue = Number(bonusRawValue || 0)

        if(bonusValue <= 0){
            return t("bonus_required_valid")
        }

        if(bonusValue > Number(product.bonusLimit)){
            return t("bonus_greater")
        }

        return ""
    }

    const handlePriceInputChange = (e) => {
        if(confirming){
            setConfirming(false)
        }

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
            setError(t("required_price"))
            return
        }

        const quantityUnits = Number(product.quantity)
        const proposedBonusUnits = addBonus ? Number(bonus || 0) : 0
        const proposedTotalUnits = quantityUnits + proposedBonusUnits
        const pricePerUnit = proposedTotalUnits > 0 ? numericPrice / proposedTotalUnits : 0

        if(pricePerUnit < 0.01) {
            setError(t("minimum_bid"))
            return
        }

        if(currentLowestBid && ((currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)) <= pricePerUnit)){
            setError(t("bid_must_be_lower"))
            return
        }

        if(bonus && bonus > product.bonusLimit) {
            setError(t("bonus_greater"))
            return
        }

        setPendingBidValue(pricePerUnit)
        setConfirming(true)
    }

    const handleBonusChange = (e) => {
        if(confirming){
            setConfirming(false)
        }
        
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
            setSuccess(t("bid_success"))
            setPrice("")
            setBonus(0)
            setAddBonus(false)
            setTimeout(() => setSuccess(""), 2000)
        }else{
            setError(t("bid_error"))
        }
    }

    const cancelBid = () => {
        setConfirming(false)
        setError("")
    }

    return (
        <div className={`quotation-product-item ${product.bonusLimit > 0 ? "has-bonus" : "no-bonus"}`}>
            <div>
                <h3>{product.productName}</h3>
                <p className="product-meta-text">{t("quantity")}: {product.quantity} {product.unitOfMeasure}</p>
                <p className="product-meta-text">{t("bonus_limit_max_units")}: {product.bonusLimit}</p>
                <div className="current-lowest-bid">
                    <span className="current-lowest-label">{t("current_lowest_bid")}: </span>
                    <strong className="current-lowest-value">
                        {currentLowestBid ? `R$ ${formatDecimal(currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus))}/${product.unitOfMeasure}` : t("no_bids_yet")}
                    </strong>
                </div>
            </div>
            <form className="bid-form" onSubmit={handleBidSubmit}>
                <Input label={t("price")} type="text" value={price} onChange={handlePriceInputChange} placeholder="R$0,00" />

                {product.bonusLimit > 0 && (
                    <div className="bonus-radio">
                        <p>{t("add_bonus_quantity_label")}</p>
                        <span className="bonus-helper-text">{t("bonus_limit_helper", { max: product.bonusLimit })}</span>
                        <div className="bonus-radio-options">
                            <label>
                                <input type="radio" name={`addBonus-${product.productId}`} value="no" checked={!addBonus} onChange={() => {
                                    if(confirming){
                                    setConfirming(false)
                                }
                                setAddBonus(false)
                                setBonus("")
                                setBonusError("")
                                }} />
                                {t("no")}
                            </label>
                            <label>
                                <input type="radio" name={`addBonus-${product.productId}`} value="yes" checked={addBonus} onChange={() => {
                                    if(confirming){
                                        setConfirming(false)
                                    }
                                    setAddBonus(true)
                                    setBonusError(validateBonus(bonus, true))
                                }} />
                                {t("yes")}
                            </label>
                        </div>
                    </div>
                )}

                {product.bonusLimit <= 0 && (
                    <div className="bonus-unavailable">
                        <p>{t("bonus_not_available")}</p>
                    </div>
                )}

                {addBonus && (
                    <Input 
                        label={t("bonus_quantity")} 
                        type="number" 
                        value={bonus} 
                        onChange={handleBonusChange} 
                        placeholder={t("bonus_quantity_max_placeholder", { max: product.bonusLimit })} 
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }} 
                    />
                )}

                {!confirming && estimatedUnitPrice !== null && (
                    <p className="unit-price-estimate">
                        {t("unit_price_estimate")}: <strong>R$ {formatDecimal(estimatedUnitPrice)}/{product.unitOfMeasure}</strong>
                    </p>
                )}

                {bonusError && <p className="bonus-error">{bonusError}</p>}

                {!confirming ? (
                    <Button type="submit" disabled={loading || Boolean(bonusError)}>{loading ? t("submitting_message") : t("submit_bid")}</Button>
                ) : (
                    <div className="confirm-container">
                        <p><Trans i18nKey="bid_confirm" values={{pricePerUnit: formatDecimal(pendingBidValue), unitOfMeasure: product.unitOfMeasure, productName: product.productName}} components={{strong: <strong />}}/></p>
                        <div className="confirm-buttons">
                            <Button type="button" onClick={cancelBid} variant="danger">{t("cancel_button")}</Button>
                            <Button type="button" onClick={confirmBid} variant="success">{t("confirm_button")}</Button>
                        </div>
                    </div>
                )}

                {error && <p>{error}</p>}
                {success && <p>{success}</p>}
            </form>
        </div>
    )
}

export default QuotationProductItem
