import { useState, useEffect, useMemo } from 'react'
import WizardActions from '@/components/WizardActions'
import { Gavel, FileText, Check, CirclePlay, CircleStop, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react'

const QuotationCreateStep1 = ({ start, end, isAuction, onChange, onNext, loading }) => {

    const [localIsAuction, setLocalIsAuction] = useState(typeof isAuction === "boolean" ? isAuction : false)

    // Decompõe "YYYY-MM-DDTHH:mm" → { date: "YYYY-MM-DD", time: "HH:mm" }
    const splitDateTimeLocal = (dateTimeLocal) => {
        if (!dateTimeLocal) return { date: '', time: '' }
        const [date, time = ''] = dateTimeLocal.split('T')
        return { date, time }
    }

    const [startDateValue, setStartDateValue] = useState(splitDateTimeLocal(start).date)
    const [startTimeValue, setStartTimeValue] = useState(splitDateTimeLocal(start).time)
    const [endDateValue,   setEndDateValue]   = useState(splitDateTimeLocal(end).date)
    const [endTimeValue,   setEndTimeValue]   = useState(splitDateTimeLocal(end).time)

    // Sincroniza estado interno quando as props mudarem (ex: modo edição carregando do backend)
    useEffect(() => {
        const { date, time } = splitDateTimeLocal(start)
        setStartDateValue(date) // eslint-disable-line react-hooks/set-state-in-effect
        setStartTimeValue(time)
    }, [start])

    useEffect(() => {
        const { date, time } = splitDateTimeLocal(end)
        setEndDateValue(date) // eslint-disable-line react-hooks/set-state-in-effect
        setEndTimeValue(time)
    }, [end])

    const handleDateTimeChange = (field, newDateValue, newTimeValue) => {
        const combined = newDateValue && newTimeValue ? `${newDateValue}T${newTimeValue}` : ''
        onChange(field, combined)
    }

    const today = new Date().toISOString().split('T')[0]

    // ── Validação ao vivo do período ──
    const period = useMemo(() => {
        const allFilled = startDateValue && startTimeValue && endDateValue && endTimeValue
        if (!allFilled) return { ok: false, tone: null, message: '' }

        const sStart = new Date(`${startDateValue}T${startTimeValue}`)
        const sEnd = new Date(`${endDateValue}T${endTimeValue}`)
        const now = new Date()

        if (!(sEnd.getTime() > sStart.getTime()))
            return { ok: false, tone: 'error', message: 'O fim deve ser depois do início.' }
        if (!(sEnd.getTime() > now.getTime()))
            return { ok: false, tone: 'error', message: 'A data de fim precisa estar no futuro.' }

        return { ok: true, tone: 'success', message: 'Período válido. Tudo certo para avançar.' }
    }, [startDateValue, startTimeValue, endDateValue, endTimeValue])

    const handleNext = () => {
        if (!period.ok) return
        onChange("isAuction", localIsAuction)
        onNext()
    }

    const inputCls = 'w-full min-w-0 max-w-full h-11 border-[1.5px] border-[var(--color-border-default)] rounded-[var(--radius-lg)] px-3 font-sans text-[0.875rem] font-semibold text-[var(--color-text-body)] bg-[var(--color-surface-subtle)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]'
    const sectionLabelCls = 'block text-label font-bold uppercase tracking-[0.1em] text-[var(--color-text-disabled)] mb-2.5 px-0.5'
    const fieldLabelCls = 'block text-label font-semibold text-[var(--color-text-disabled)] mb-1.5'

    const modes = [
        { value: true, icon: <Gavel size={22} strokeWidth={1.75} />, title: "Leilão", desc: "Fornecedores competem em tempo real enviando lances pelo menor preço." },
        { value: false, icon: <FileText size={22} strokeWidth={1.75} />, title: "Proposta única", desc: "Fornecedores enviam apenas uma proposta por item, sem acompanhar lances." },
    ]

    return (
        <div className="md:flex md:flex-col md:flex-1">
            <div className="mb-5">
                <h2 className="m-0 text-title font-bold text-[var(--color-text-body)] tracking-[-0.02em] md:text-[1.75rem] md:font-extrabold md:text-[var(--color-text-heading)]">Período e modo</h2>
                <p className="mt-1 mb-0 text-caption text-[var(--color-text-muted)] leading-[1.5]">
                    Defina quando a cotação abre e como os fornecedores vão participar.
                </p>
            </div>

            {/* ── Período da cotação ── */}
            <span className={sectionLabelCls}>Período da cotação</span>
            <div className="@container/period bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] mb-6 [box-shadow:var(--shadow-md-soft)] p-4 md:p-6">
                {/* O card decide quando dividir: a largura útil pode ser menor que a viewport por causa do rail do wizard. */}
                <div className="grid grid-cols-1 gap-y-4 @xl/period:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] @xl/period:gap-x-6 @xl/period:gap-y-0 @xl/period:items-start">
                    {/* Início */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[var(--color-success)] font-bold text-caption mb-2.5">
                            <CirclePlay size={18} strokeWidth={2} />Início
                        </div>
                        <div className="@container/group min-w-0">
                            <div className="grid grid-cols-1 gap-y-2.5 @sm/group:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @sm/group:gap-x-2.5">
                                <div className="min-w-0">
                                    <label className={fieldLabelCls}>Data</label>
                                    <input type="date" min={today} className={inputCls} value={startDateValue}
                                        onChange={e => { setStartDateValue(e.target.value); handleDateTimeChange("start", e.target.value, startTimeValue) }} />
                                </div>
                                <div className="min-w-0">
                                    <label className={fieldLabelCls}>Hora</label>
                                    <input type="time" className={inputCls} value={startTimeValue}
                                        onChange={e => { setStartTimeValue(e.target.value); handleDateTimeChange("start", startDateValue, e.target.value) }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px w-full bg-[var(--color-border-faint)] my-0 @xl/period:h-auto @xl/period:w-px @xl/period:self-stretch @xl/period:my-0" />

                    {/* Fim */}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 text-[var(--color-danger)] font-bold text-caption mb-2.5">
                            <CircleStop size={18} strokeWidth={2} />Fim
                        </div>
                        <div className="@container/group min-w-0">
                            <div className="grid grid-cols-1 gap-y-2.5 @sm/group:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] @sm/group:gap-x-2.5">
                                <div className="min-w-0">
                                    <label className={fieldLabelCls}>Data</label>
                                    <input type="date" min={today} className={inputCls} value={endDateValue}
                                        onChange={e => { setEndDateValue(e.target.value); handleDateTimeChange("end", e.target.value, endTimeValue) }} />
                                </div>
                                <div className="min-w-0">
                                    <label className={fieldLabelCls}>Hora</label>
                                    <input type="time" className={inputCls} value={endTimeValue}
                                        onChange={e => { setEndTimeValue(e.target.value); handleDateTimeChange("end", endDateValue, e.target.value) }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mensagem de validação ao vivo */}
                {period.message && (
                    <div className={[
                        'flex items-center gap-2 mt-3.5 px-3 py-2.5 rounded-[var(--radius-md)] text-[0.75rem] font-semibold',
                        period.tone === 'success'
                            ? 'bg-[var(--color-success-soft)] text-[var(--color-success)]'
                            : 'bg-[var(--color-danger-soft)] text-[var(--color-danger)]',
                    ].join(' ')}>
                        {period.tone === 'success'
                            ? <CheckCircle size={16} strokeWidth={2} className="flex-shrink-0" />
                            : <AlertCircle size={16} strokeWidth={2} className="flex-shrink-0" />}
                        {period.message}
                    </div>
                )}
            </div>

            {/* ── Modo da cotação ── */}
            <span className={sectionLabelCls}>Modo da cotação</span>
            <div className="flex flex-col gap-2.5 mb-2 md:grid md:grid-cols-2 md:gap-4">
                {modes.map(({ value, icon, title, desc }) => {
                    const selected = localIsAuction === value
                    return (
                        <button
                            key={title}
                            type="button"
                            onClick={() => setLocalIsAuction(value)}
                            className={[
                                'relative w-full text-left rounded-[var(--radius-xl)] p-4 md:p-6 cursor-pointer transition-[background-color,border-color,box-shadow] duration-[160ms] active:scale-[0.99]',
                                selected
                                    ? 'border-2 border-[var(--color-accent)] bg-[var(--color-highlight-lighter)] [box-shadow:0_8px_20px_-12px_rgba(91,33,182,0.5)]'
                                    : 'border-[1.5px] border-[var(--color-border-default)] bg-[var(--color-surface-card)] hover:border-[var(--color-border-strong)]',
                            ].join(' ')}
                        >
                            <div className="flex items-start gap-3 md:flex-col md:gap-4">
                                <div className={[
                                    'w-[42px] h-[42px] rounded-[13px] flex items-center justify-center flex-shrink-0 transition-colors duration-[160ms]',
                                    selected ? 'bg-[var(--color-highlight-soft)] text-[var(--color-accent)]' : 'bg-[var(--color-surface-muted)] text-[var(--color-text-disabled)]',
                                ].join(' ')}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-[1rem] md:text-[1.125rem] text-[var(--color-text-body)] leading-tight mb-0.5 md:mb-1">{title}</div>
                                    <div className="text-[0.78125rem] md:text-body text-[var(--color-text-muted)] leading-[1.45]">{desc}</div>
                                </div>
                                <div className={[
                                    'w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 transition-[background-color,border-color] duration-[160ms] md:absolute md:top-3.5 md:right-3.5',
                                    selected ? 'bg-[var(--color-accent)] border-2 border-[var(--color-accent)] text-white' : 'border-2 border-[var(--color-border-strong)] text-transparent',
                                ].join(' ')}>
                                    <Check size={14} strokeWidth={3} />
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            <WizardActions
                onPrimary={handleNext}
                primaryLabel="Avançar"
                desktopLabel="Continuar para Produtos"
                primaryIcon={ArrowRight}
                blocked={!period.ok}
                loading={loading}
            />
        </div>
    )
}

export default QuotationCreateStep1
