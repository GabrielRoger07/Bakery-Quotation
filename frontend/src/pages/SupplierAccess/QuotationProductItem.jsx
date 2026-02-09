import { useEffect, useState } from 'react'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'
import useFetch from '../../hooks/useFetch'
import { useTranslation, Trans } from 'react-i18next'
import Input from '../../components/Input'
import Button from '../../components/Button'
import './SupplierQuotation.css'
import { ENV } from '../../config/env'

const QuotationProductItem = ({ product, participationId, currentLowestBid }) => {
    
    const { t } = useTranslation()

    const {request} = useFetch(ENV.API_BASE_URL)

    const { value: price, handleChange: handlePriceChange, getNumericValue, setValue: setPrice } = useCurrencyMask("")

    const [bonus, setBonus] = useState("")
    const [addBonus, setAddBonus] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)
    const [confirming, setConfirming] = useState(false)
    const [pendingBidValue, setPendingBidValue] = useState(null)

    useEffect(() => {
        if(confirming){
            setConfirming(false)
        }
    }, [price, addBonus, bonus, confirming])

    const handleBidSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const numericPrice = getNumericValue()

        if(!numericPrice){
            setError(t("required_price"))
            return
        }

        const pricePerUnit = numericPrice / (product.quantity + (addBonus ? bonus : 0))

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
        
        const value = e.target.value

        if(value === ""){
            setBonus("")
            return
        }

        const numericValue = value.replace(/\D/g, "")

        setBonus(numericValue)
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
        <div className="quotation-product-item">
            <div>
                <h3>{product.productName}</h3>
                <p>{t("barcode_number")}: <strong>{product.productBarCodeNumber}</strong></p>
                <p>{t("quantity")}: {product.quantity} {product.unitOfMeasure}</p>
                <p>{t("bonus_limit")}: {product.bonusLimit}</p>
                <p>{t("current_lowest_bid")}: {currentLowestBid ? `R$ ${(currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)).toFixed(2)}/${product.unitOfMeasure}` : t("no_bids_yet")}</p>
            </div>
            <form className="bid-form" onSubmit={handleBidSubmit}>
                <Input label={t("price")} type="text" value={price} onChange={handlePriceChange} placeholder="R$0,00" />

                {product.bonusLimit > 0 && (
                    <div className="bonus-radio">
                        <p>{t("add_bonus_quantity")}</p>
                        <label>
                            <input type="radio" name={`addBonus-${product.productId}`} value="no" checked={!addBonus} onChange={() => setAddBonus(false)} />
                            {t("no")}
                        </label>
                        <label>
                            <input type="radio" name={`addBonus-${product.productId}`} value="yes" checked={addBonus} onChange={() => setAddBonus(true)} />
                            {t("yes")}
                        </label>
                    </div>
                )}

                {addBonus && (
                    <Input 
                        label={t("bonus_quantity")} 
                        type="number" 
                        value={bonus} 
                        onChange={handleBonusChange} 
                        placeholder={t("enter_bonus_quantity")} 
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }} 
                    />
                )}

                {!confirming ? (
                    <Button type="submit" disabled={loading}>{loading ? t("submitting_message") : t("submit_bid")}</Button>
                ) : (
                    <div className="confirm-container">
                        <p><Trans i18nKey="bid_confirm" values={{pricePerUnit: pendingBidValue.toFixed(2), unitOfMeasure: product.unitOfMeasure, productName: product.productName}} components={{strong: <strong />}}/></p>
                        <div className="confirm-buttons">
                            <Button type="button" onClick={confirmBid} variant="success">{t("yes")}</Button>
                            <Button type="button" onClick={cancelBid} variant="danger">{t("cancel_button")}</Button>
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