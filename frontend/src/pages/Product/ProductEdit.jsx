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

    useEffect(() => {
        if(product){
            setProductBarCodeNumber(product.productBarCodeNumber || "")
            setProductName(product.productName || "")
        }
    }, [product, setProductBarCodeNumber, setProductName])

    const isDisabled = 
        barCodeWarning ||
        nameWarning ||
        !productBarCodeNumber ||
        !productName

    const handleSubmit = async (e) => {
        e.preventDefault()
        if(!product) return

        if(!productBarCodeNumber.trim() || !productName.trim()){
            setError(t("all_fields_required"))
            setSuccess("")
            return;
        }

        setError("")

        const body = {
            productBarCodeNumber: productBarCodeNumber.trim(),
            productName: productName.trim()
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

            <Alert message={error} />
            {success && <div className="success">{success}</div>}

            <Button type="submit" disabled={isDisabled}>{t("save_button")}</Button>
        </form>
    )
}

export default ProductEdit