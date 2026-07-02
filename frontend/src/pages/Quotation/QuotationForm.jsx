import {useState, useEffect, useCallback, useMemo} from 'react'
import useFetch from '@/hooks/useFetch'
import Alert from '@/components/Alert'
import QuotationCreateStep1 from '@/pages/Quotation/QuotationCreateStep1'
import QuotationCreateStep2 from '@/pages/Quotation/QuotationCreateStep2'
import QuotationCreateStep3 from '@/pages/Quotation/QuotationCreateStep3'
import QuotationCreateStep4 from '@/pages/Quotation/QuotationCreateStep4'
import ConfirmDialog from '@/components/ConfirmDialog'
import { Check, X } from 'lucide-react'
import { ENV } from '@/config/env'

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
    const [confirmExit, setConfirmExit] = useState(false)

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

    // Permite voltar a etapas já visitadas pelo stepper (nunca pula adiante)
    const goToStep = (target) => {
        if (target <= step) {
            setError("")
            setStep(target)
        }
    }

    const badges = useMemo(() => ({
        2: quotationData.products.length || null,
        3: quotationData.suppliers.length || null
    }), [quotationData.products.length, quotationData.suppliers.length])

    const handleSave = async (suppliers = null) => {
        const finalData = suppliers ? {...quotationData, suppliers} : quotationData
        setError("")
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
        // onSave navega de volta para a lista com o estado de sucesso (banner)
        onSave && onSave(updatedQuotation)
    }

    const saveRelatedData = async (quotationId, mode, data) => {
        const productsPayload = data.products.map(p => ({
            productId: p.productId,
            quotationId,
            quantity: p.quantity,
            bonusLimit: Number(0),
            brand: p.brand,
            unitOfMeasure: p.unitOfMeasure 
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
            {/* ── Desktop header strip ── */}
            <div className="max-md:hidden bg-[var(--color-surface-card)] border-b border-[var(--color-border-default)] [box-shadow:0_1px_0_var(--color-border-subtle)]">
                <div className="max-w-[1200px] mx-auto px-6 h-14 flex items-center gap-3">
                    <button
                        onClick={() => setConfirmExit(true)}
                        className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-body)] flex-shrink-0"
                        aria-label="Fechar"
                    >
                        <X size={14} strokeWidth={2.5} />
                    </button>

                    {/* breadcrumb */}
                    <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[0.8125rem] text-[var(--color-text-muted)] whitespace-nowrap">Cotações</span>
                        <span className="text-[var(--color-border-strong)] text-[0.75rem]">/</span>
                        <span className="text-[0.8125rem] font-semibold text-[var(--color-text-heading)] truncate">
                            {mode === "create" ? "Nova Cotação" : `Editar Cotação${initialData ? ` #${initialData.quotationId}` : ''}`}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Mobile navy header ── */}
            <div className="md:hidden bg-[var(--color-brand)]">
                <div className="px-4 pb-3.5 flex items-center gap-3" style={{ paddingTop: 'max(0.875rem, env(safe-area-inset-top))' }}>
                    <button
                        onClick={() => setConfirmExit(true)}
                        aria-label="Fechar"
                        className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-lg)] border border-[var(--color-on-dark-border)] bg-[var(--color-on-dark-bg)] text-white flex-shrink-0 transition-[background-color] duration-[160ms] active:scale-95"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="text-[1.125rem] font-bold text-white leading-tight truncate">
                            {mode === "create" ? "Criar cotação" : "Editar cotação"}
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 bg-[var(--color-on-dark-bg)] border border-[var(--color-on-dark-border)] rounded-full px-2.5 py-1 text-white text-[0.75rem] font-bold tabular-nums flex-shrink-0">
                        {step}<span className="text-[var(--color-on-dark-text-faint)]">/{STEPS.length}</span>
                    </div>
                </div>
            </div>

            {/* ── Mobile stepper bar ── */}
            <div className="md:hidden bg-[var(--color-surface-card)] border-b border-[var(--color-border-subtle)] px-4 pt-4 pb-3">
                <div className="relative flex items-start">
                    {/* progress track + animated fill (behind the circles, aligned to their center = 15px) */}
                    <div className="absolute left-0 right-0 top-[13.5px] h-[3px] rounded-full bg-[var(--color-border-default)] mx-[calc(12.5%)]" />
                    <div
                        className="absolute top-[13.5px] h-[3px] rounded-full bg-[var(--color-success)] transition-[width] duration-[350ms] ease-[cubic-bezier(.4,0,.2,1)]"
                        style={{ left: '12.5%', width: `${((step - 1) / (STEPS.length - 1)) * 75}%` }}
                    />
                    {STEPS.map((s) => {
                        const isActive = step === s.key
                        const isDone = step > s.key
                        const isVisited = s.key <= step
                        return (
                            <button
                                key={s.key}
                                type="button"
                                onClick={() => goToStep(s.key)}
                                disabled={!isVisited}
                                className={`relative z-10 flex flex-col items-center gap-1.5 flex-1 bg-transparent border-none p-0 ${isVisited ? 'cursor-pointer' : 'cursor-default'}`}
                            >
                                <div className={`relative w-[30px] h-[30px] rounded-full grid place-items-center text-[0.8125rem] font-bold flex-shrink-0 transition-[background-color,color,box-shadow] duration-300 ${isDone ? 'bg-[var(--color-success)] text-white [box-shadow:0_4px_10px_-3px_rgba(5,150,105,0.5)]' : isActive ? 'bg-[var(--color-accent)] text-white [box-shadow:0_4px_12px_-3px_rgba(91,33,182,0.6)]' : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-disabled)]'}`}>
                                    {isDone ? <Check size={13} strokeWidth={3} /> : s.key}
                                    {badges[s.key] && (
                                        <span className="absolute -top-[5px] -right-[7px] bg-[var(--color-text-body)] text-white text-[0.625rem] min-w-[18px] h-[18px] rounded-full grid place-items-center font-bold px-[3px] leading-none border-2 border-[var(--color-surface-card)]">
                                            {badges[s.key]}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[0.6875rem] leading-tight transition-colors duration-200 ${isActive ? 'text-[var(--color-text-body)] font-bold' : 'text-[var(--color-text-disabled)] font-semibold'}`}>
                                    {s.labelKey}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Desktop layout ── */}
            <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col gap-8 max-md:[display:none]">

                {/* Top horizontal stepper */}
                <div className="flex items-center">
                    {STEPS.map((s, i) => {
                        const isActive = step === s.key
                        const isDone = step > s.key
                        return (
                            <div key={s.key} className="flex items-center flex-1">
                                <div className="flex flex-col items-center gap-2 flex-1">
                                    <div className={`relative w-8 h-8 rounded-full grid place-items-center text-[0.875rem] font-bold flex-shrink-0 transition-[background-color,color,box-shadow] duration-200 ${isDone ? 'bg-[var(--color-success)] text-white' : isActive ? 'bg-[var(--color-accent)] text-white [box-shadow:var(--shadow-step-active)]' : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-disabled)]'}`}>
                                        {isDone ? <Check size={14} strokeWidth={3} /> : s.key}
                                        {badges[s.key] && (
                                            <span className="absolute -top-[5px] -right-[7px] bg-[var(--color-accent)] text-white text-[0.6rem] min-w-4 h-4 rounded-full grid place-items-center font-bold px-[3px] leading-none border-[1.5px] border-[var(--color-surface-card)]">
                                                {badges[s.key]}
                                            </span>
                                        )}
                                    </div>
                                    <span className={`text-[0.8125rem] font-semibold leading-tight transition-colors duration-200 ${isActive ? 'text-[var(--color-accent)]' : isDone ? 'text-[var(--color-text-heading)]' : 'text-[var(--color-text-disabled)]'}`}>
                                        {s.labelKey}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`h-px flex-1 mx-3 mb-6 transition-[background-color] duration-200 ${isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border-default)]'}`} />
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
                </div>
            </div>

            {/* ── Mobile single-column layout ── */}
            <div className="[display:none] max-md:[display:block] px-4 py-5" style={{ paddingBottom: 'calc(4.25rem + env(safe-area-inset-bottom) + 7rem)' }}>
                {step === 1 && <QuotationCreateStep1 start={quotationData.start} end={quotationData.end} isAuction={quotationData.isAuction} onChange={handleStepChange} onNext={nextStep} loading={loading} />}
                {step === 2 && <QuotationCreateStep2 selectedProducts={quotationData.products} onChange={handleProductsChange} onBack={prevStep} onNext={nextStep} loading={loading} />}
                {step === 3 && <QuotationCreateStep3 selectedSuppliers={quotationData.suppliers} onChange={handleSuppliersChange} onBack={prevStep} onFinish={nextStep} loading={loading} />}
                {step === 4 && <QuotationCreateStep4 quotationData={quotationData} onBack={prevStep} onConfirm={() => handleSave()} loading={loading} />}
                <Alert message={error} />
            </div>

            {/* ── Discard confirmation ── */}
            <ConfirmDialog
                isOpen={confirmExit}
                onClose={() => setConfirmExit(false)}
                onConfirm={onClose}
                title={mode === "edit" ? "Descartar alterações?" : "Descartar cotação?"}
                confirmLabel="Descartar"
                cancelLabel="Continuar editando"
                confirmVariant="danger"
                cancelVariant="secondary"
            >
                {mode === "edit"
                    ? "As alterações feitas nesta cotação serão perdidas e não poderão ser recuperadas."
                    : "As informações preenchidas serão perdidas e não poderão ser recuperadas."}
            </ConfirmDialog>
        </div>
    )
}

export default QuotationForm
