import {useState, useEffect, useCallback, useMemo} from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import QuotationCreateStep1 from './QuotationCreateStep1'
import QuotationCreateStep2 from './QuotationCreateStep2'
import QuotationCreateStep3 from './QuotationCreateStep3'
import QuotationCreateStep4 from './QuotationCreateStep4'
import { Check, ArrowLeft } from 'lucide-react'
import { ENV } from '../../config/env'

const STEPS = [
    { key: 1, labelKey: "Datas" },
    { key: 2, labelKey: "Produtos" },
    { key: 3, labelKey: "Fornecedores" },
    { key: 4, labelKey: "Revisão" }
]

const toLocalDateTimeInputValue = (isoString) => {
    if (!isoString) return ""
    const d = new Date(isoString)
    const pad = n => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const QuotationForm = ({ mode = "create", initialData = null, onClose, onSave }) => {

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
            start: toLocalDateTimeInputValue(initialData.quotationStart),
            end: toLocalDateTimeInputValue(initialData.quotationEnd),
            isAuction: initialData.isAuction ?? false,
            products: products,
            suppliers: suppliers
        })

        setLoading(false)
    }, [initialData, mode, request])

    useEffect(() => {
        fetchEditData() // eslint-disable-line react-hooks/set-state-in-effect
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
                quotationStart: new Date(finalData.start).toISOString(),
                quotationEnd: new Date(finalData.end).toISOString(),
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
                quotationStart: new Date(finalData.start).toISOString(),
                quotationEnd: new Date(finalData.end).toISOString(),
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
        setSuccess(`Cotação ${mode === "create" ? "criada" : "atualizada"} "com sucesso"!`)
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
        <div className="min-h-[calc(100dvh-3.5rem)]">
            {/* ── Page header strip ── */}
            <div className="bg-[var(--color-surface-0)] border-b border-[var(--color-border)] [box-shadow:0_1px_0_var(--color-border-light)]">
                <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center gap-3 max-[768px]:px-4 max-[768px]:h-12">
                    <button
                        onClick={onClose}
                        className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-1)] text-[var(--color-text-muted)] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text-primary)] flex-shrink-0"
                        aria-label="Voltar"
                    >
                        <ArrowLeft size={14} strokeWidth={2.5} />
                    </button>

                    {/* breadcrumb */}
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[0.8125rem] text-[var(--color-text-muted)] whitespace-nowrap">Cotações</span>
                        <span className="text-[var(--color-border-strong)] text-[0.75rem]">/</span>
                        <span className="text-[0.8125rem] font-semibold text-[var(--color-text-strong)] truncate">
                            {mode === "create" ? "Nova Cotação" : `Editar Cotação${initialData ? ` #${initialData.quotationId}` : ''}`}
                        </span>
                    </div>

                    {/* Step pill — mobile only */}
                    <div className="ml-auto [display:none] max-[768px]:[display:flex] items-center gap-1.5 bg-[var(--color-surface-2)] rounded-full px-3 py-1 flex-shrink-0">
                        <span className="text-[0.6875rem] font-bold text-[var(--color-accent)] tabular-nums">{step}</span>
                        <span className="text-[0.6875rem] text-[var(--color-text-muted)]">/</span>
                        <span className="text-[0.6875rem] font-medium text-[var(--color-text-muted)] tabular-nums">{STEPS.length}</span>
                        <span className="text-[0.6875rem] text-[var(--color-text-muted)] max-[400px]:hidden">— {STEPS[step - 1].labelKey}</span>
                    </div>
                </div>
            </div>

            {/* ── Mobile stepper bar ── */}
            <div className="[display:none] max-[768px]:[display:block] bg-[var(--color-surface-0)] border-b border-[var(--color-border-light)] px-4 py-3">
                <div className="flex items-center gap-0">
                    {STEPS.map((s, i) => {
                        const isActive = step === s.key
                        const isDone = step > s.key
                        return (
                            <div key={s.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-1 flex-1">
                                    <div className={`relative w-6 h-6 rounded-full grid place-items-center text-[0.6875rem] font-bold flex-shrink-0 transition-[background-color,color] duration-200 ${isDone ? 'bg-[var(--color-success)] text-white' : isActive ? 'bg-[var(--color-accent)] text-white' : 'bg-[var(--color-surface-3)] text-[var(--color-text-disabled)]'}`}>
                                        {isDone ? <Check size={11} strokeWidth={3} /> : s.key}
                                        {badges[s.key] && (
                                            <span className="absolute -top-[4px] -right-[5px] bg-[var(--color-accent)] text-white text-[0.5rem] min-w-[14px] h-[14px] rounded-full grid place-items-center font-bold px-[2px] leading-none border border-[var(--color-surface-0)]">
                                                {badges[s.key]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-px flex-1 mx-1 transition-[background-color] duration-200 ${isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* ── Desktop layout ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-8 max-[768px]:[display:none]">

                {/* Top horizontal stepper */}
                <div className="flex items-center">
                    {STEPS.map((s, i) => {
                        const isActive = step === s.key
                        const isDone = step > s.key
                        return (
                            <div key={s.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`relative w-8 h-8 rounded-full grid place-items-center text-[0.875rem] font-bold flex-shrink-0 transition-[background-color,color,box-shadow] duration-200 ${isDone ? 'bg-[var(--color-success)] text-white' : isActive ? 'bg-[var(--color-accent)] text-white [box-shadow:var(--shadow-step-active)]' : 'bg-[var(--color-surface-3)] text-[var(--color-text-disabled)]'}`}>
                                        {isDone ? <Check size={14} strokeWidth={3} /> : s.key}
                                        {badges[s.key] && (
                                            <span className="absolute -top-[5px] -right-[7px] bg-[var(--color-accent)] text-white text-[0.6rem] min-w-4 h-4 rounded-full grid place-items-center font-bold px-[3px] leading-none border-[1.5px] border-[var(--color-surface-0)]">
                                                {badges[s.key]}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[0.8125rem] font-semibold leading-tight transition-colors duration-200 ${isActive ? 'text-[var(--color-accent)]' : isDone ? 'text-[var(--color-text-strong)]' : 'text-[var(--color-text-disabled)]'}`}>
                                        {s.labelKey}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-px flex-1 mx-3 mb-6 transition-[background-color] duration-200 ${isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border)]'}`} />
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Content */}
                <div className="min-w-0">
                    {step === 1 && <QuotationCreateStep1 start={quotationData.start} end={quotationData.end} isAuction={quotationData.isAuction} onChange={handleStepChange} onNext={nextStep} loading={loading} />}
                    {step === 2 && <QuotationCreateStep2 selectedProducts={quotationData.products} onChange={handleProductsChange} onBack={prevStep} onNext={nextStep} loading={loading} />}
                    {step === 3 && <QuotationCreateStep3 selectedSuppliers={quotationData.suppliers} onChange={handleSuppliersChange} onBack={prevStep} onFinish={nextStep} loading={loading} />}
                    {step === 4 && <QuotationCreateStep4 quotationData={quotationData} onBack={prevStep} onConfirm={() => handleSave()} loading={loading} />}
                    <Alert message={error} />
                    {success && <p className="text-[var(--color-success)] font-medium text-[0.875rem]">{success}</p>}
                </div>
            </div>

            {/* ── Mobile single-column layout ── */}
            <div className="[display:none] max-[768px]:[display:block] px-4 py-5" style={{ paddingBottom: 'calc(4.25rem + env(safe-area-inset-bottom) + 1.5rem)' }}>
                {step === 1 && <QuotationCreateStep1 start={quotationData.start} end={quotationData.end} isAuction={quotationData.isAuction} onChange={handleStepChange} onNext={nextStep} loading={loading} />}
                {step === 2 && <QuotationCreateStep2 selectedProducts={quotationData.products} onChange={handleProductsChange} onBack={prevStep} onNext={nextStep} loading={loading} />}
                {step === 3 && <QuotationCreateStep3 selectedSuppliers={quotationData.suppliers} onChange={handleSuppliersChange} onBack={prevStep} onFinish={nextStep} loading={loading} />}
                {step === 4 && <QuotationCreateStep4 quotationData={quotationData} onBack={prevStep} onConfirm={() => handleSave()} loading={loading} />}
                <Alert message={error} />
                {success && <p className="text-[var(--color-success)] font-medium text-[0.875rem]">{success}</p>}
            </div>
        </div>
    )
}

export default QuotationForm
