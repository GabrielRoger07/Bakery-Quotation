import { useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import useCharLimit from '../../hooks/useCharLimit'
import { ENV } from '../../config/env'

const ProductCreate = ({ onClose, onSave }) => {

    const { t } = useTranslation()

    const { value: productBarCodeNumber, onChange: handleBarCodeChange, onBlur: handleBarCodeBlur, warning: barCodeWarning, isInvalid: isBarCodeInvalid } = useCharLimit(13, "barcode_number")
    const { value: productName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(30, "product_name")

    const [unitOfMeasure, setUnitOfMeasure] = useState("")
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch(ENV.API_BASE_URL)

    const isDisabled = 
        barCodeWarning ||
        nameWarning ||
        !productBarCodeNumber ||
        !productName ||
        !unitOfMeasure


    const handleProductCreate = async(e) => {
        e.preventDefault()

        if(!productBarCodeNumber || !productName || !unitOfMeasure){
            setError(t("all_fields_required"))
            setSuccess("")
            return;
        }

        setError("")

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj;

        const product = {
            productBarCodeNumber,
            productName,
            unitOfMeasure,
            companyCnpj: cnpj
        }

        const res = await request("POST", "/products", product)

        if(res.ok){
            setSuccess("product_created_success")
            setError("")
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 800)
        }else{
            setSuccess("")
            setError("product_created_error")
        }
    }

    return (
        <form onSubmit={handleProductCreate}>
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
                        <option value="" disabled>{t("unit_of_measure_select")}</option>
                        <option value="mg">mg</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">l</option>
                        <option value="und">und</option>
                    </select>
                    <span className="select-arrow"></span>
                </div>
            </div>
            <Alert message={error} />
            {success && <div className="success">{success}</div>}
            <Button type="submit" disabled={isDisabled}>{t("create_button")}</Button>
        </form>
    )
}

export default ProductCreate