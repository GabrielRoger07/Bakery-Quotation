import { useState, useEffect } from 'react'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import { Gavel, FileText, Check, Calendar, Clock } from 'lucide-react'

const QuotationCreateStep1 = ({ start, end, isAuction, onChange, onNext, loading }) => {

    const [localIsAuction, setLocalIsAuction] = useState(typeof isAuction === "boolean" ? isAuction : false)
    const [localError, setLocalError] = useState("")

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

    const handleNextClick = () => {
        onChange("isAuction", localIsAuction)

        if (!startDateValue || !startTimeValue || !endDateValue || !endTimeValue) {
            setLocalError("Todos os campos são obrigatórios")
            return
        }

        const now = new Date()
        const s = new Date(start)
        const e = new Date(end)

        if (s <= now) {
            setLocalError("Data de início deve ser posterior à data atual")
            return
        } else if (e <= now) {
            setLocalError("Data de fim deve ser posterior à data atual")
            return
        } else if (e <= s) {
            setLocalError("Data de fim deve ser posterior à data de início")
            return
        }

        setLocalError("")
        onNext()
    }

    const inputCls = (hasError) => [
        'w-full h-[2.5rem] border-[1.5px] rounded-[var(--radius-md)] px-3 font-sans text-[0.875rem] text-[var(--color-text-primary)] bg-transparent outline-none transition-[border-color,box-shadow] duration-[160ms]',
        hasError
            ? 'border-[var(--color-danger)] focus:[box-shadow:var(--shadow-focus-danger)]'
            : 'border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]',
    ].join(' ')

    return (
        <div>
            {/* Section label */}
            <div className="mb-5">
                <h2 className="m-0 text-[1.0625rem] font-bold text-[var(--color-text-strong)] tracking-[-0.015em]">Período e modo</h2>
                <p className="mt-1 mb-0 text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.5]">
                    Defina quando a cotação estará aberta e como os fornecedores irão participar.
                </p>
            </div>

            {/* Dates card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-xl)] mb-4 [box-shadow:var(--shadow-xs)] overflow-hidden">
                <div className="px-5 pt-4 pb-3 flex items-center gap-2.5 border-b border-[var(--color-border-light)]">
                    <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                        <Calendar size={14} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="m-0 text-[0.875rem] font-semibold text-[var(--color-text-strong)] leading-tight">Período da cotação</p>
                        <p className="m-0 text-[0.75rem] text-[var(--color-text-muted)] leading-tight mt-0.5">As datas precisam estar no futuro</p>
                    </div>
                </div>
                <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-4 max-[600px]:grid-cols-1">
                        {/* Início */}
                        <div className="flex flex-col gap-[0.375rem]">
                            <span className="text-[0.75rem] font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                                <Calendar size={11} strokeWidth={2.5} />
                                Início
                            </span>
                            <div className="flex gap-2">
                                <div className="flex flex-col gap-[0.375rem] flex-1 min-w-0">
                                    <span className="text-[0.6875rem] font-medium text-[var(--color-text-muted)]">Data</span>
                                    <input
                                        type="date"
                                        min={today}
                                        className={inputCls(localError && !startDateValue)}
                                        value={startDateValue}
                                        onChange={e => {
                                            setStartDateValue(e.target.value)
                                            handleDateTimeChange("start", e.target.value, startTimeValue)
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-[0.375rem] flex-1 min-w-0">
                                    <span className="text-[0.6875rem] font-medium text-[var(--color-text-muted)]">Hora</span>
                                    <input
                                        type="time"
                                        className={inputCls(localError && !startTimeValue)}
                                        value={startTimeValue}
                                        onChange={e => {
                                            setStartTimeValue(e.target.value)
                                            handleDateTimeChange("start", startDateValue, e.target.value)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Fim */}
                        <div className="flex flex-col gap-[0.375rem]">
                            <span className="text-[0.75rem] font-semibold text-[var(--color-text-secondary)] flex items-center gap-1.5">
                                <Clock size={11} strokeWidth={2.5} />
                                Fim
                            </span>
                            <div className="flex gap-2">
                                <div className="flex flex-col gap-[0.375rem] flex-1 min-w-0">
                                    <span className="text-[0.6875rem] font-medium text-[var(--color-text-muted)]">Data</span>
                                    <input
                                        type="date"
                                        min={today}
                                        className={inputCls(localError && !endDateValue)}
                                        value={endDateValue}
                                        onChange={e => {
                                            setEndDateValue(e.target.value)
                                            handleDateTimeChange("end", e.target.value, endTimeValue)
                                        }}
                                    />
                                </div>
                                <div className="flex flex-col gap-[0.375rem] flex-1 min-w-0">
                                    <span className="text-[0.6875rem] font-medium text-[var(--color-text-muted)]">Hora</span>
                                    <input
                                        type="time"
                                        className={inputCls(localError && !endTimeValue)}
                                        value={endTimeValue}
                                        onChange={e => {
                                            setEndTimeValue(e.target.value)
                                            handleDateTimeChange("end", endDateValue, e.target.value)
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mode selector card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-xl)] mb-4 [box-shadow:var(--shadow-xs)] overflow-hidden">
                <div className="px-5 pt-4 pb-3 flex items-center gap-2.5 border-b border-[var(--color-border-light)]">
                    <div className="w-7 h-7 rounded-[var(--radius-md)] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)] flex items-center justify-center flex-shrink-0 text-[var(--color-accent)]">
                        <Gavel size={14} strokeWidth={2} />
                    </div>
                    <div>
                        <p className="m-0 text-[0.875rem] font-semibold text-[var(--color-text-strong)] leading-tight">Modo da cotação</p>
                        <p className="m-0 text-[0.75rem] text-[var(--color-text-muted)] leading-tight mt-0.5">Como os fornecedores enviarão suas propostas</p>
                    </div>
                </div>
                <div className="px-5 py-4">
                    <div className="grid grid-cols-2 gap-3 max-[600px]:grid-cols-1">
                        {[
                            {
                                value: true,
                                icon: <Gavel size={20} strokeWidth={1.75} />,
                                title: "Leilão",
                                desc: "Fornecedores competem em tempo real enviando lances pelo menor preço"
                            },
                            {
                                value: false,
                                icon: <FileText size={20} strokeWidth={1.75} />,
                                title: "Proposta única",
                                desc: "Fornecedores enviam apenas uma proposta por item, sem acompanhar lances"
                            }
                        ].map(({ value, icon, title, desc }) => {
                            const selected = localIsAuction === value
                            return (
                                <button
                                    key={title}
                                    type="button"
                                    onClick={() => setLocalIsAuction(value)}
                                    className={[
                                        'relative text-left border-[1.5px] rounded-[var(--radius-lg)] p-4 cursor-pointer transition-[background-color,border-color,box-shadow] duration-[160ms] w-full',
                                        selected
                                            ? 'border-[var(--color-accent)] bg-[var(--color-selected-card-bg)] [box-shadow:0_0_0_1px_var(--color-accent)]'
                                            : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-1)]',
                                    ].join(' ')}
                                >
                                    {/* check indicator */}
                                    <span className={[
                                        'absolute top-3 right-3 w-[18px] h-[18px] border-[1.5px] rounded-full grid place-items-center transition-[background-color,border-color] duration-[160ms] flex-shrink-0',
                                        selected ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'border-[var(--color-border-strong)] text-transparent',
                                    ].join(' ')}>
                                        <Check size={10} strokeWidth={3} />
                                    </span>

                                    <span className={`block mb-2.5 ${selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>
                                        {icon}
                                    </span>
                                    <span className="font-semibold text-[0.875rem] text-[var(--color-text-strong)] block mb-1 leading-tight pr-5">{title}</span>
                                    <span className="text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.45] block">{desc}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>

            {localError &&
                <div className='flex justify-center gap-3 mt-4'>
                    <Alert message={localError} />
                </div>
            }

            <div className="flex justify-end mt-5 max-[768px]:justify-stretch">
                <Button onClick={handleNextClick} disabled={loading} className="max-[768px]:w-full">
                    {loading ? "Carregando..." : "Próximo"}
                </Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep1
