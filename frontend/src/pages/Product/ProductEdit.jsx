import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { useTranslation } from 'react-i18next'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'
import { ENV } from '../../config/env'

const ProductEdit = ({product, onSave, onClose}) => {

    const { t } = useTranslation()

    const {value: productBarCodeNumber, setValue: setProductBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "barcode_number")
    const {value: productName, setValue: setProductName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "product_name")

    const { request } = useFetch(ENV.API_BASE_URL)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [unitOfMeasure, setUnitOfMeasure] = useState("")

    useEffect(() => {
        if(product){
            setProductBarCodeNumber(product.productBarCodeNumber || "")
            setProductName(product.productName || "")
            setUnitOfMeasure(product.unitOfMeasure || "")
        }
    }, [product, setProductBarCodeNumber, setProductName])

    const isDisabled = 
        barCodeWarning ||
        nameWarning ||
        !productBarCodeNumber ||
        !productName ||
        !unitOfMeasure

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!product) return

        if(!productBarCodeNumber.trim() || !productName.trim() || !unitOfMeasure){
            setError(t("all_fields_required"))
            setSuccess("")
            return;
        }

        setError("")

        const body = {
            productBarCodeNumber: productBarCodeNumber.trim(),
            productName: productName.trim(),
            unitOfMeasure,
            companyCnpj: product.companyCnpj
        }

        const res = await request("PUT", `/products/${product.productId}`, body)

        if(res.ok){
            setSuccess(t("product_updated_success"))
            setError("")
            onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError("product_updated_error")
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input label={t("barcode_number")} type="text" name="productBarCodeNumber" value={productBarCodeNumber} onChange={handleBarCodeChange} onBlur={handleBarCodeBlur} placeholder={t("enter_barcode_number")} isInvalid={isBarCodeInvalid} required />
            {barCodeWarning && (
                <div className="warning">
                    {barCodeWarning.type === "too_short" &&
                        t("char_limit_too_short", { min: barCodeWarning.min, field: t(barCodeWarning.fieldName) })
                    }

                    {barCodeWarning.type === "too_long" &&
                        t("char_limit_too_long", { max: barCodeWarning.max, field: t(barCodeWarning.fieldName) })
                    }
                </div>
            )}
            
            <Input label={t("product_name")} type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={t("enter_product_name")} isInvalid={isNameInvalid} required />
            {nameWarning && (
                <div className="warning">
                    {nameWarning.type === "too_short" &&
                        t("char_limit_too_short", { min: nameWarning.min, field: t(nameWarning.fieldName) })
                    }

                    {nameWarning.type === "too_long" &&
                        t("char_limit_too_long", { max: nameWarning.max, field: t(nameWarning.fieldName) })
                    }
                </div>
            )}

            <div className="input-container">
                <label htmlFor="unitOfMeasure">
                {t("unit_of_measure")}<span className={`required-asterisk ${!unitOfMeasure ? "empty" : "filled"}`}>*</span>
                </label>
                <div className="select-wrapper">
                    <select id="unitOfMeasure" name="unitOfMeasure" value={unitOfMeasure} onChange={(e) => setUnitOfMeasure(e.target.value)} className="custom-select" required >
                        <option value="" disabled>{t("select_field")}</option>
                        <option value="mg">mg</option> 
                        <option value="g">g</option> 
                        <option value="kg">kg</option> 
                        <option value="mL">mL</option> 
                        <option value="L">L</option> 
                        <option value="und">und</option> 
                    </select>
                    <span className="select-arrow"></span>
                </div>
            </div>
            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>{t("save_button")}</Button>
        </form>
    )
}

export default ProductEdit