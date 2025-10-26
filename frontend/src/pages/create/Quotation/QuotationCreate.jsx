import { useState } from 'react'
import QuotationCreateStep1 from './QuotationCreateStep1'
import QuotationCreateStep2 from './QuotationCreateStep2'
import QuotationCreateStep3 from './QuotationCreateStep3'
import Button from '../../../components/Button'
import useFetch from '../../../hooks/useFetch'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Alert from '../../../components/Alert'

const QuotationCreate = ({ onClose, onSave }) => {

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [quotationData, setQuotationData] = useState({
        start: "",
        end: "",
        products: [],
        suppliers: []
    })

    const { request } = useFetch("http://localhost:8080/api/v1")

    const nextStep = () => {
        
        if(step === 1 && (!quotationData.start || !quotationData.end)){
            setError("All fields are required")
            return
        }

        if(step === 2 && quotationData.products.length === 0){
            setError("Select at least one product")
            return
        }

        if(step === 3 && quotationData.suppliers.length === 0){
            setError("Select at least one supplier")
            return
        }
        
        setError("")
        setStep(step + 1)
    }

    const prevStep = () => {
        setStep(step - 1)
    }

    const handleSave = async () => {
        setError("")
        setSuccess("")
        setLoading(true)

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj;

        const quotation = {
            quotationStart: quotationData.start,
            quotationEnd: quotationData.end,
            companyCnpj: cnpj
        }

        const quotationRes = await request("POST", "/quotations", quotation)

        if(!quotationRes.ok){
            setLoading(false)
            setSuccess("")
            setError(quotationRes.data?.message)
            return
        }

        const quotationId = quotationRes.data.quotationId;

        const productsPayload = quotationData.products.map((p) => ({
            productId: p.productId,
            quotationId,
            quantity: p.quantity,
            bonusLimit: p.bonus
        }))

        const productsRes = await request("POST", "/contains/batch", productsPayload)

        if(!productsRes.ok){
            setSuccess("")
            setError(productsRes.data?.message)
            return
        }

        const suppliersPayload = quotationData.suppliers.map((s) => ({
            supplierId: s.supplierId,
            quotationId,
        }))

        const suppliersRes = await request("POST", "/participations/batch", suppliersPayload)

        if(!suppliersRes.ok){
            setSuccess("")
            setError(suppliersRes.data?.message)
            return
        }

        setLoading(false)

        setSuccess("Quotation created successfully!")
        setError("")
        onSave && onSave()
        setTimeout(() => onClose(), 800)
    }

    return (
        <div className="quotation-create-container">
            {step === 1 && (
                <QuotationCreateStep1 start={quotationData.start} end={quotationData.end} onChange={(field, value) => setQuotationData({ ...quotationData, [field]: value})} onNext={nextStep} loading={loading}/>
            )}
            <Alert message={error} />
            {success && <p className="success">{success}</p>}

            {step === 2 && (
                <QuotationCreateStep2 selectedProducts={quotationData.products} onChange={(products) => setQuotationData({ ...quotationData, products})} onBack={prevStep} onNext={nextStep} loading={loading}/>
            )}

            {step === 3 && (
                <QuotationCreateStep3 selectedSuppliers={quotationData.suppliers} onChange={(suppliers) => setQuotationData({ ...quotationData, suppliers})} onBack={prevStep} onFinish={handleSave} loading={loading}/>
            )}

            {step > 1 && step < 3 && (
                <Button onClick={onClose} style={{ marginTop: '1rem'}}>Cancel</Button>
            )}
        </div>
    )
}

export default QuotationCreate