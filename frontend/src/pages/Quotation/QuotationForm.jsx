import {useState, useEffect, useCallback, useMemo, useRef} from 'react'
import useFetch from '@/hooks/useFetch'
import Alert from '@/components/Alert'
import QuotationCreateStep1 from '@/pages/Quotation/QuotationCreateStep1'
import QuotationCreateStep2 from '@/pages/Quotation/QuotationCreateStep2'
import QuotationCreateStep3 from '@/pages/Quotation/QuotationCreateStep3'
import QuotationCreateStep4 from '@/pages/Quotation/QuotationCreateStep4'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useMobilePage } from '@/contexts/MobilePageContext'
import { Check, X, OctagonAlert, CalendarClock, Package, Users, ClipboardCheck, Clock, Gavel, FileText } from 'lucide-react'
import { formatDateTime } from '@/utils/formatDateTime'
import { ENV } from '@/config/env'

const STEPS = [
    { key: 1, labelKey: "Período", desktopLabel: "Período e modo", sub: "Quando e como", icon: CalendarClock },
    { key: 2, labelKey: "Produtos", desktopLabel: "Produtos", sub: "Itens e quantidades", icon: Package },
    { key: 3, labelKey: "Fornecedores", desktopLabel: "Fornecedores", sub: "Quem participa", icon: Users },
    { key: 4, labelKey: "Revisão", desktopLabel: "Revisão", sub: "Confirmar e salvar", icon: ClipboardCheck }
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
    const { registerPage, unregisterPage } = useMobilePage()
    const mainRef = useRef(null)

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

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' })
        mainRef.current?.scrollTo({ top: 0, behavior: 'instant' })
    }, [step])

    // Usa a mesma barra superior do app (Navbar) no mobile: X para descartar + pílula de etapa
    useEffect(() => {
        registerPage(
            mode === "create" ? "Criar cotação" : "Editar cotação",
            null,
            {
                leftAction: { icon: X, onClick: () => setConfirmExit(true), ariaLabel: "Fechar" },
                rightSlot: (
                    <span className="flex items-center gap-0.5 bg-[var(--color-on-dark-bg)] border border-[var(--color-on-dark-border)] rounded-full px-2.5 py-1 text-white text-[0.75rem] font-bold tabular-nums">
                        {step}<span className="text-[var(--color-on-dark-text-faint)]">/{STEPS.length}</span>
                    </span>
                ),
            }
        )
        return unregisterPage
    }, [mode, step, registerPage, unregisterPage])

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

    // Resumo do rail desktop — período formatado + modo
    const summary = useMemo(() => {
        const startFmt = formatDateTime(quotationData.start)
        const endFmt = formatDateTime(quotationData.end)
        return {
            period: startFmt && endFmt ? `${startFmt.date} ${startFmt.time} → ${endFmt.date} ${endFmt.time}` : "—",
            modeLabel: quotationData.isAuction ? "Leilão" : "Proposta única",
            ModeIcon: quotationData.isAuction ? Gavel : FileText,
        }
    }, [quotationData.start, quotationData.end, quotationData.isAuction])

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

    const CurrentStepIcon = STEPS[step - 1].icon
    const { ModeIcon } = summary

    return (
        <div className="min-h-[calc(100dvh-3.5rem)] md:min-h-0 md:h-dvh md:flex md:flex-col md:bg-[var(--color-surface-card)]">
            {/* ── Desktop header ── */}
            <header className="max-md:hidden flex items-center gap-4 px-6 h-[4.5rem] border-b border-[var(--color-border-default)] flex-shrink-0">
                <button
                    onClick={() => setConfirmExit(true)}
                    className="flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] text-[var(--color-text-muted)] cursor-pointer transition-[background,border-color,color] duration-[160ms] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-body)] flex-shrink-0"
                    aria-label="Fechar"
                >
                    <X size={16} strokeWidth={2.5} />
                </button>

                <div className="w-px h-8 bg-[var(--color-border-default)] flex-shrink-0" />

                <div className="min-w-0">
                    <span className="block text-label font-bold uppercase tracking-[0.08em] text-[var(--color-accent)]">
                        {mode === "create" ? "Nova cotação" : `Editando${initialData ? ` #${initialData.quotationId}` : ''}`}
                    </span>
                    <h1 className="m-0 text-[1.375rem] font-extrabold tracking-[-0.02em] text-[var(--color-text-heading)] leading-tight truncate">
                        {mode === "create" ? "Criar cotação" : "Editar cotação"}
                    </h1>
                </div>

                <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-3 py-1.5 text-caption font-semibold text-[var(--color-text-muted)] flex-shrink-0">
                    <CurrentStepIcon size={14} strokeWidth={2} />
                    Etapa {step} de {STEPS.length}
                </span>
            </header>

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
                                <div className={`relative w-[30px] h-[30px] rounded-full grid place-items-center text-caption font-bold flex-shrink-0 transition-[background-color,color,box-shadow] duration-300 ${isDone ? 'bg-[var(--color-success)] text-white [box-shadow:0_4px_10px_-3px_rgba(5,150,105,0.5)]' : isActive ? 'bg-[var(--color-accent)] text-white [box-shadow:0_4px_12px_-3px_rgba(91,33,182,0.6)]' : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-disabled)]'}`}>
                                    {isDone ? <Check size={13} strokeWidth={3} /> : s.key}
                                    {badges[s.key] && (
                                        <span className="absolute -top-[5px] -right-[7px] bg-[var(--color-text-body)] text-white text-[0.625rem] min-w-[18px] h-[18px] rounded-full grid place-items-center font-bold px-[3px] leading-none border-2 border-[var(--color-surface-card)]">
                                            {badges[s.key]}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-label leading-tight transition-colors duration-200 ${isActive ? 'text-[var(--color-text-body)] font-bold' : 'text-[var(--color-text-disabled)] font-semibold'}`}>
                                    {s.labelKey}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* ── Body: rail esquerdo (desktop) + conteúdo (montagem única) ── */}
            <div className="md:flex md:flex-1 md:items-stretch md:min-h-0">

                {/* Rail: stepper vertical + resumo */}
                <aside className="max-md:hidden w-[300px] flex-shrink-0 flex flex-col gap-8 border-r border-[var(--color-border-default)] bg-[var(--color-surface-subtle)] px-6 py-8 overflow-y-auto">
                    <nav className="flex flex-col" aria-label="Etapas da cotação">
                        {STEPS.map((s, i) => {
                            const isActive = step === s.key
                            const isDone = step > s.key
                            const isVisited = s.key <= step
                            const isLast = i === STEPS.length - 1
                            return (
                                <button
                                    key={s.key}
                                    type="button"
                                    onClick={() => goToStep(s.key)}
                                    disabled={!isVisited}
                                    className={`flex items-stretch gap-3 w-full text-left bg-transparent border-none p-0 ${isVisited ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <div className="flex flex-col items-center flex-shrink-0">
                                        <div className={`w-8 h-8 rounded-full grid place-items-center text-[0.875rem] font-bold transition-[background-color,color,box-shadow] duration-200 ${isDone ? 'bg-[var(--color-success)] text-white' : isActive ? 'bg-[var(--color-accent)] text-white [box-shadow:var(--shadow-step-active)]' : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-disabled)]'}`}>
                                            {isDone ? <Check size={14} strokeWidth={3} /> : s.key}
                                        </div>
                                        {!isLast && (
                                            <div className={`w-px flex-1 min-h-4 my-1 transition-[background-color] duration-200 ${isDone ? 'bg-[var(--color-success)]' : 'bg-[var(--color-border-default)]'}`} />
                                        )}
                                    </div>
                                    <div className={`min-w-0 pt-1.5 ${isLast ? '' : 'pb-7'}`}>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-body font-bold leading-tight transition-colors duration-200 ${isActive ? 'text-[var(--color-text-heading)]' : isDone ? 'text-[var(--color-text-body)]' : 'text-[var(--color-text-disabled)]'}`}>
                                                {s.desktopLabel}
                                            </span>
                                            {badges[s.key] && (
                                                <span className="text-label font-bold text-[var(--color-accent)] bg-[var(--color-highlight-soft)] px-1.5 py-0.5 rounded-full leading-none tabular-nums flex-shrink-0">
                                                    {badges[s.key]}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`block mt-0.5 text-caption ${isVisited ? 'text-[var(--color-text-muted)]' : 'text-[var(--color-text-disabled)]'}`}>
                                            {s.sub}
                                        </span>
                                    </div>
                                </button>
                            )
                        })}
                    </nav>

                    {/* Card resumo */}
                    <div className="mt-auto rounded-[var(--radius-xl)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] [box-shadow:var(--shadow-card-soft)] p-4">
                        <span className="block text-label font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)] mb-3">Resumo</span>
                        <div className="flex items-start gap-2 text-caption font-semibold text-[var(--color-text-body)]">
                            <Clock size={14} strokeWidth={2} className="flex-shrink-0 mt-0.5 text-[var(--color-text-muted)]" />
                            <span className="min-w-0">{summary.period}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-2.5 text-caption font-semibold text-[var(--color-text-body)]">
                            <ModeIcon size={14} strokeWidth={2} className="flex-shrink-0 text-[var(--color-text-muted)]" />
                            {summary.modeLabel}
                        </div>
                        <div className="h-px bg-[var(--color-border-faint)] my-3" />
                        <div className="flex items-center justify-between text-caption">
                            <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                <Package size={14} strokeWidth={2} />Produtos
                            </span>
                            <span className="font-bold tabular-nums text-[var(--color-text-body)]">{quotationData.products.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-caption mt-2">
                            <span className="flex items-center gap-2 text-[var(--color-text-muted)]">
                                <Users size={14} strokeWidth={2} />Fornecedores
                            </span>
                            <span className="font-bold tabular-nums text-[var(--color-text-body)]">{quotationData.suppliers.length}</span>
                        </div>
                    </div>
                </aside>

                {/* Conteúdo — steps montados uma única vez (mobile e desktop trocam por CSS interno) */}
                <main
                    ref={mainRef}
                    className="flex-1 min-w-0 px-4 py-5 max-md:pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:px-10 md:py-8 md:overflow-y-auto"
                >
                    <div className="md:max-w-[960px] md:min-h-full md:flex md:flex-col">
                        {step === 1 && <QuotationCreateStep1 start={quotationData.start} end={quotationData.end} isAuction={quotationData.isAuction} onChange={handleStepChange} onNext={nextStep} loading={loading} />}
                        {step === 2 && <QuotationCreateStep2 selectedProducts={quotationData.products} onChange={handleProductsChange} onBack={prevStep} onNext={nextStep} loading={loading} />}
                        {step === 3 && <QuotationCreateStep3 selectedSuppliers={quotationData.suppliers} onChange={handleSuppliersChange} onBack={prevStep} onFinish={nextStep} loading={loading} />}
                        {step === 4 && <QuotationCreateStep4 quotationData={quotationData} onBack={prevStep} onConfirm={() => handleSave()} onEditStep={goToStep} loading={loading} />}
                        <Alert message={error} />
                    </div>
                </main>
            </div>

            {/* ── Discard confirmation ── */}
            <ConfirmDialog
                isOpen={confirmExit}
                onClose={() => setConfirmExit(false)}
                onConfirm={onClose}
                icon={<OctagonAlert size={28} strokeWidth={2} />}
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
