import {useState, useEffect, useCallback, useMemo} from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import QuotationCreateStep1 from './QuotationCreateStep1'
import QuotationCreateStep2 from './QuotationCreateStep2'
import QuotationCreateStep3 from './QuotationCreateStep3'
import QuotationCreateStep4 from './QuotationCreateStep4'
import { Check } from 'lucide-react'
import { ENV } from '../../config/env'
import './QuotationCreate.css'

const STEPS = [
    { key: 1, labelKey: "stepper_dates" },
    { key: 2, labelKey: "stepper_products" },
    { key: 3, labelKey: "stepper_suppliers" },
    { key: 4, labelKey: "stepper_review" }
]

const QuotationForm = ({ mode = "create", initialData = null, onClose, onSave }) => {

    const { t } = useTranslation()

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch(ENV.API_BASE_URL)

    const [quotationData, setQuotationData] = useState({
        start: "",
        end: "",
        isAuction: false,
        products: [],
        suppliers: []
    })

    const fetchEditData = useCallback(async () => {
        if(!initialData || mode !== "edit") return

        setLoading(true)

        const productsRes = await request("GET", `/contains/${initialData.quotationId}`)
        const products = productsRes.ok ? productsRes.data : []

        const suppliersRes = await request("GET", `/participations/quotations/${initialData.quotationId}`)
        const suppliers = suppliersRes.ok ? suppliersRes.data : []

        setQuotationData({
            start: initialData.quotationStart,
            end: initialData.quotationEnd,
            isAuction: initialData.isAuction ?? false,
            products: products,
            suppliers: suppliers
        })

        setLoading(false)
    }, [initialData, mode, request])

    useEffect(() => {
        fetchEditData()
    }, [fetchEditData])

    const handleStepChange = useCallback((field, value) => {
        setQuotationData(prev => ({...prev, [field]: value}))
    }, [])

    const handleProductsChange = useCallback((products) => {
        handleStepChange("products", products)
    }, [handleStepChange])

    const handleSuppliersChange = useCallback((suppliers) => {
        handleStepChange("suppliers", suppliers)
    }, [handleStepChange])

    const nextStep = () => {
        setError("")
        setStep(step + 1)
    }

    const prevStep = () => setStep(step - 1)

    const badges = useMemo(() => ({
        2: quotationData.products.length || null,
        3: quotationData.suppliers.length || null
    }), [quotationData.products.length, quotationData.suppliers.length])

    const handleSave = async (suppliers = null) => {
        const finalData = suppliers ? {...quotationData, suppliers} : quotationData
        setError("")
        setSuccess("")
        setLoading(true)

        let quotationRes = null
        let updatedQuotation = null

        if(mode === "create"){
            const quotation = {
                quotationStart: finalData.start,
                quotationEnd: finalData.end,
                isAuction: finalData.isAuction
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
                isAuction: finalData.isAuction
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
        setSuccess(`${t("quotation")} ${mode === "create" ? t("created") : t("updated")} ${t("successfully")}!`)
        onSave && onSave(updatedQuotation)

        setTimeout(() => onClose(), 800)
    }

    const saveRelatedData = async (quotationId, mode, data) => {
        const productsPayload = data.products.map(p => ({
            productId: p.productId,
            quotationId,
            quantity: p.quantity,
            bonusLimit: Number(0),
            brand: p.brand
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
            <nav className="form-stepper">
                {STEPS.map((s, i) => (
                    <div key={s.key} className="form-stepper-segment">
                        <div className={`form-step-item${step === s.key ? " form-step-active" : ""}${step > s.key ? " form-step-done" : ""}`}>
                            <div className="form-step-circle">
                                {step > s.key ? <Check size={14} strokeWidth={3} /> : s.key}
                                {badges[s.key] && <span className="form-step-badge">{badges[s.key]}</span>}
                            </div>
                            <span className="form-step-label">{t(s.labelKey)}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`form-step-connector${step > s.key ? " form-step-connector-done" : ""}`} />
                        )}
                    </div>
                ))}
            </nav>

            {step === 1 && (
                <QuotationCreateStep1
                    start={quotationData.start}
                    end={quotationData.end}
                    isAuction={quotationData.isAuction}
                    onChange={handleStepChange}
                    onNext={nextStep}
                    loading={loading}
                />
            )}

            {step === 2 && (
                <QuotationCreateStep2
                    selectedProducts={quotationData.products}
                    onChange={handleProductsChange}
                    onBack={prevStep}
                    onNext={nextStep}
                    loading={loading}
                />
            )}

            {step === 3 && (
                <QuotationCreateStep3
                    selectedSuppliers={quotationData.suppliers}
                    onChange={handleSuppliersChange}
                    onBack={prevStep}
                    onFinish={nextStep}
                    loading={loading}
                />
            )}

            {step === 4 && (
                <QuotationCreateStep4
                    quotationData={quotationData}
                    onBack={prevStep}
                    onConfirm={() => handleSave()}
                    loading={loading}
                />
            )}

            <Alert message={error} />
            {success && <p className="success">{success}</p>}
        </div>
    )
}

export default QuotationForm
