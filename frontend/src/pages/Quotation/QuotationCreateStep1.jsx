import { useState } from 'react'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { Gavel, FileText, Check } from 'lucide-react'

const QuotationCreateStep1 = ({ start, end, isAuction, onChange, onNext, loading }) => {

    const [localStart, setLocalStart] = useState(start || "")
    const [localEnd, setLocalEnd] = useState(end || "")
    const [localIsAuction, setLocalIsAuction] = useState(typeof isAuction === "boolean" ? isAuction : false)
    const [localError, setLocalError] = useState("")

const handleNextClick = () => {
        onChange("start", localStart)
        onChange("end", localEnd)
        onChange("isAuction", localIsAuction)

        if(!localStart || !localEnd) {
            setLocalError("Todos os campos são obrigatórios")
            return
        }

        const now = new Date()
        const s = new Date(localStart)
        const e = new Date(localEnd)

        if(s <= now){
            setLocalError("Data de início deve ser posterior à data atual")
            return
        } else if(e <= now) {
            setLocalError("Data de fim deve ser posterior à data atual")
            return
        } else if(e <= s){
            setLocalError("Data de fim deve ser posterior à data de início")
            return
        }

        setLocalError("")
        onNext()
    }

    const inputCls = (hasError) => [
        'w-full h-[2.375rem] border-[1.5px] rounded-[var(--radius-md)] px-3 font-sans text-[0.875rem] text-[var(--color-text-primary)] bg-transparent outline-none transition-[border-color,box-shadow] duration-[160ms]',
        hasError ? 'border-[var(--color-danger)]' : 'border-[var(--color-border-strong)] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]',
    ].join(' ')

    const modeCardCls = (selected) => [
        'border-[1.5px] rounded-[var(--radius-md)] p-4 cursor-pointer relative transition-[background-color,border-color,box-shadow] duration-[160ms]',
        selected ? 'border-[var(--color-accent)] bg-[var(--color-selected-card-bg)] [box-shadow:0_0_0_1px_var(--color-accent)]' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-1)]',
    ].join(' ')

    const modeCheckCls = (selected) => [
        'absolute top-2 right-2 w-5 h-5 border-[1.5px] rounded-full grid place-items-center transition-[background-color,border-color,color] duration-[160ms]',
        selected ? 'bg-[var(--color-accent)] border-[var(--color-accent)] text-white' : 'border-[var(--color-border)] text-transparent',
    ].join(' ')

    return (
        <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center mt-0 mb-4 text-[var(--color-text-strong)] text-[1.125rem]">Etapa 1: Datas da Cotação</h2>

            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] mb-3 [box-shadow:var(--shadow-xs)] overflow-hidden">
                <div className="px-5 pt-4 pb-[0.6rem] flex flex-col gap-[0.15rem]">
                    <span className="text-[0.875rem] font-semibold text-[var(--color-text-strong)]">Selecione as datas de início e fim da cotação.</span>
                    <span className="text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.4]">Lembre-se que elas precisam estar no futuro.</span>
                </div>
                <div className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-[0.85rem] max-[768px]:grid-cols-1">
                        <div className="flex flex-col gap-[0.35rem]">
                            <label className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">Data de Início</label>
                            <input type="datetime-local" className={inputCls(localError && !localStart)} value={localStart} onChange={e => setLocalStart(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-[0.35rem]">
                            <label className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)]">Data de Fim</label>
                            <input type="datetime-local" className={inputCls(localError && !localEnd)} value={localEnd} onChange={e => setLocalEnd(e.target.value)} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] mb-3 [box-shadow:var(--shadow-xs)] overflow-hidden">
                <div className="px-5 pt-4 pb-[0.6rem] flex flex-col gap-[0.15rem]">
                    <span className="text-[0.875rem] font-semibold text-[var(--color-text-strong)]">Modo da Cotação</span>
                    <span className="text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.4]">Escolha como os fornecedores enviarão suas propostas</span>
                </div>
                <div className="px-5 pb-5">
                    <div className="grid grid-cols-2 gap-2 max-[768px]:grid-cols-1">
                        {[{ selected: localIsAuction, set: true, icon: <Gavel size={22} />, title: "Leilão", desc: "Fornecedores competem em tempo real enviando lances pelo menor preço" },
                          { selected: !localIsAuction, set: false, icon: <FileText size={22} />, title: "Proposta única", desc: "Fornecedores enviam apenas uma proposta por item, sem acompanhar lances" }
                        ].map(({ selected, set, icon, title, desc }) => (
                            <div key={title} className={modeCardCls(selected)} onClick={() => setLocalIsAuction(set)}>
                                <div className={modeCheckCls(selected)}><Check size={11} strokeWidth={3} /></div>
                                <span className={`block mb-[0.35rem] ${selected ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-muted)]'}`}>{icon}</span>
                                <span className="font-semibold text-[0.875rem] text-[var(--color-text-strong)] block mb-[0.2rem]">{title}</span>
                                <span className="text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.4] block">{desc}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {localError && <Alert message={localError} />}

            <div className="flex justify-center gap-3 mt-5 max-[768px]:flex-col max-[768px]:gap-[0.65rem]">
                <Button onClick={handleNextClick} disabled={loading} className="max-[768px]:w-full">{loading ? "Carregando..." : "Próximo"}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep1
