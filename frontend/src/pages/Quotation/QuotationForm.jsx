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
        <div>
            {/* Stepper */}
            <nav className="flex items-center justify-center pt-3 pb-5 gap-0 max-w-[1000px] mx-auto overflow-x-auto max-[768px]:justify-start max-[768px]:pt-[0.65rem] max-[768px]:pb-4 max-[768px]:px-1">
                {STEPS.map((s, i) => {
                    const isActive = step === s.key
                    const isDone = step > s.key
                    return (
                        <div key={s.key} className="flex items-center">
                            <div className={`flex items-center gap-[0.4rem] px-2 py-[0.3rem] rounded-[var(--radius-md)] select-none whitespace-nowrap`}>
                                <div className={`relative w-7 h-7 rounded-full grid place-items-center text-[0.8125rem] font-bold flex-shrink-0 transition-[background-color,color,box-shadow] duration-200 ${isDone ? 'bg-[var(--color-success)] text-white' : isActive ? 'bg-[var(--color-accent)] text-white [box-shadow:var(--shadow-step-active)]' : 'bg-[var(--color-surface-1)] text-[var(--color-text-muted)]'}`}>
                                    {isDone ? <Check size={14} strokeWidth={3} /> : s.key}
                                    {badges[s.key] && (
                                        <span className="absolute -top-[5px] -right-[7px] bg-[var(--color-accent)] text-white text-[0.6rem] min-w-4 h-4 rounded-full grid place-items-center font-bold px-[3px] leading-none border-[1.5px] border-[var(--color-surface-0)]">
                                            {badges[s.key]}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[0.8125rem] font-medium transition-colors duration-200 max-[768px]:hidden ${isActive || isDone ? 'text-[var(--color-text-strong)]' : 'text-[var(--color-text-muted)]'}`}>
                                    {t(s.labelKey)}
                                </span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <div className={`w-8 h-0.5 mx-[0.15rem] flex-shrink-0 rounded-px transition-[background-color] duration-200 max-[768px]:w-6 ${isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />
                            )}
                        </div>
                    )
                })}
            </nav>

            {step === 1 && <QuotationCreateStep1 start={quotationData.start} end={quotationData.end} isAuction={quotationData.isAuction} onChange={handleStepChange} onNext={nextStep} loading={loading} />}
            {step === 2 && <QuotationCreateStep2 selectedProducts={quotationData.products} onChange={handleProductsChange} onBack={prevStep} onNext={nextStep} loading={loading} />}
            {step === 3 && <QuotationCreateStep3 selectedSuppliers={quotationData.suppliers} onChange={handleSuppliersChange} onBack={prevStep} onFinish={nextStep} loading={loading} />}
            {step === 4 && <QuotationCreateStep4 quotationData={quotationData} onBack={prevStep} onConfirm={() => handleSave()} loading={loading} />}

            <Alert message={error} />
            {success && <p className="text-[var(--color-success)] font-medium text-[0.875rem]">{success}</p>}
        </div>
    )
}

export default QuotationForm
