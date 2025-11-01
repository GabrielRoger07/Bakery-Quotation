import {useState, useEffect} from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import QuotationCreateStep1 from './QuotationCreateStep1'
import QuotationCreateStep2 from './QuotationCreateStep2'
import QuotationCreateStep3 from './QuotationCreateStep3'

const QuotationForm = ({ mode = "create", initialData = null, onClose, onSave }) => {
    
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch("http://localhost:8080/api/v1")

    const [quotationData, setQuotationData] = useState({
        start: "",
        end: "",
        products: [],
        suppliers: []
    })

    const fetchEditData = async () => {
        if(!initialData || mode !== "edit") return

        setLoading(true)

        const productsRes = await request("GET", `/contains/${initialData.quotationId}`)
        const products = productsRes.ok ? productsRes.data : []

        const suppliersRes = await request("GET", `/participations/quotations/${initialData.quotationId}`)
        const suppliers = suppliersRes.ok ? suppliersRes.data : []

        setQuotationData({
            start: initialData.quotationStart,
            end: initialData.quotationEnd,
            products: products,
            suppliers: suppliers
        })
        
        setLoading(false)
    }

    useEffect(() => {
        fetchEditData()
    }, [initialData, mode, request])

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

    const prevStep = () => setStep(step - 1)

    const handleSave = async (suppliers = null) => {
        const finalData = suppliers ? {...quotationData, suppliers} : quotationData
        console.log("valor de finalData: ")
        console.log(finalData)
        console.log("valor de quotationData: ")
        console.log(quotationData)
        setError("")
        setSuccess("")
        setLoading(true)

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        let quotationRes = null
        let updatedQuotation = null

        if(mode === "create"){
            const quotation = {
                quotationStart: finalData.start,
                quotationEnd: finalData.end,
                companyCnpj: cnpj
            }

            quotationRes = await request("POST", "/quotations", quotation)
            if(!quotationRes.ok){
                setLoading(false)
                setError(quotationRes.data?.message)
                return
            }

            const quotationId = quotationRes.data.quotationId
            updatedQuotation = quotationRes.data
            await saveRelatedData(quotationId, mode, finalData)
        }else if(mode === "edit" && initialData){
            const quotation = {
                quotationStart: finalData.start,
                quotationEnd: finalData.end,
                companyCnpj: cnpj
            }

            quotationRes = await request("PUT", `/quotations/${initialData.quotationId}`, quotation)
            if(!quotationRes.ok){
                setLoading(false)
                setError(quotationRes.data?.message)
                return
            }

            updatedQuotation = quotationRes.data
            await saveRelatedData(initialData.quotationId, mode, finalData)
        }

        setLoading(false)
        setSuccess(`Quotation ${mode === "create" ? "created" : "updated"} successfully!`)
        onSave && onSave(updatedQuotation)

        setTimeout(() => onClose(), 800)
    }

    const saveRelatedData = async (quotationId, mode, data) => {
        console.log("valor de data: ")
        console.log(data)
        const productsPayload = data.products.map(p => ({
            productId: p.productId,
            quotationId,
            quantity: p.quantity,
            bonusLimit: p.bonusLimit
        }))

        const suppliersPayload = data.suppliers.map(s => ({
            supplierId: s.supplierId,
            quotationId
        }))

        const method = mode === "create" ? "POST" : "PUT"

        const productsRes = await request(method, "/contains/batch", productsPayload)

        if(!productsRes.ok){
            setError(productsRes.data?.message)
            return
        }

        const suppliersRes = await request(method, "/participations/batch", suppliersPayload)
        
        if(!suppliersRes.ok){
            setError(suppliersRes.data?.message)
            return
        }
    }

    return (
        <div className="quotation-form-container">
            {step === 1 && (
                <QuotationCreateStep1 
                    start={quotationData.start} 
                    end={quotationData.end} 
                    onChange={(field, value) => setQuotationData({...quotationData, [field]: value})}
                    onNext={nextStep}
                    loading={loading}
                />
            )}

            <Alert message={error} />
            {success && <p className="success">{success}</p>}

            {step === 2 && (
                <QuotationCreateStep2
                    selectedProducts={quotationData.products} 
                    onChange={(products) => setQuotationData({...quotationData, products})}
                    onBack={prevStep}
                    onNext={nextStep}
                    loading={loading}
                />
            )}

            {step === 3 && (
                <QuotationCreateStep3
                    selectedSuppliers={quotationData.suppliers} 
                    onChange={(suppliers) => setQuotationData({...quotationData, suppliers})}
                    onBack={prevStep}
                    onFinish={handleSave}
                    loading={loading}
                />
            )}
        </div>
    )
}

export default QuotationForm