import { useEffect, useState } from 'react'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import './SupplierQuotation.css'
import { ENV } from '../../config/env'

const QuotationProductItem = ({ product, participationId, currentLowestBid }) => {
    
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
    }, [price, addBonus, bonus])

    const handleBidSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess("")

        const numericPrice = getNumericValue()

        if(!numericPrice){
            setError("Price is required")
            return
        }

        const pricePerUnit = numericPrice / (product.quantity + (addBonus ? bonus : 0))

        if(pricePerUnit < 0.01) {
            setError("Bid per unit must be at least R$0,01")
            return
        }

        if(currentLowestBid && ((currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)) <= pricePerUnit)){
            setError("Bid must be lower than the lowest bid")
            return
        }

        if(bonus && bonus > product.bonusLimit) {
            setError("Bonus bid cannot be higher than the bonus limit")
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
            setSuccess("Bid submitted successfully!")
            setPrice("")
            setBonus(0)
            setAddBonus(false)
            setTimeout(() => setSuccess(""), 2000)
        }else{
            setError(res.data?.message || "Failed to submit bid")
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
                <p>Bar Code Number: <strong>{product.productBarCodeNumber}</strong></p>
                <p>Quantity: {product.quantity} {product.unitOfMeasure}</p>
                <p>Bonus limit: {product.bonusLimit}</p>
                <p>Current Lowest Bid: {currentLowestBid ? `R$ ${(currentLowestBid.price / (currentLowestBid.quantity + currentLowestBid.bonus)).toFixed(2)}/${product.unitOfMeasure}` : "No bids yet"}</p>
            </div>
            <form className="bid-form" onSubmit={handleBidSubmit}>
                <Input label="Price" type="text" value={price} onChange={handlePriceChange} placeholder="R$0,00" />

                <div className="bonus-radio">
                    <p>Add bonus quantity?</p>
                    <label>
                        <input type="radio" name={`addBonus-${product.productId}`} value="no" checked={!addBonus} onChange={() => setAddBonus(false)} />
                        No
                    </label>
                    <label>
                        <input type="radio" name={`addBonus-${product.productId}`} value="yes" checked={addBonus} onChange={() => setAddBonus(true)} />
                        Yes
                    </label>
                </div>

                {addBonus && (
                    <Input 
                        label="Bonus Quantity" 
                        type="number" 
                        value={bonus} 
                        onChange={handleBonusChange} 
                        placeholder="Enter Bonus Quantity" 
                        onKeyDown={e => {
                            if(e.key === '-' || e.key === 'e' || e.key === 'E') e.preventDefault()
                        }} 
                    />
                )}

                {!confirming ? (
                    <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Bid"}</Button>
                ) : (
                    <div className="confirm-container">
                        <p>Confirm bid of{" "} <strong>R$ {pendingBidValue.toFixed(2)}/{product.unitOfMeasure}</strong>{" "} for <strong>{product.productName}</strong>?</p>
                        <div className="confirm-buttons">
                        <Button type="button" onClick={confirmBid} variant="success">Yes</Button>
                        <Button type="button" onClick={cancelBid} variant="danger">Cancel</Button>
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