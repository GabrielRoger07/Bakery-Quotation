import { useMemo } from 'react'
import MetaCard from '@/components/MetaCard'
import SectionHeader from '@/components/SectionHeader'
import EmptyState from '@/components/EmptyState'
import WizardActions from '@/components/WizardActions'
import { formatDateTime } from '@/utils/formatDateTime'
import { CalendarClock, CalendarCheck, Gavel, Package, Users, Tag, CheckCircle } from 'lucide-react'

const QuotationCreateStep4 = ({ quotationData, onBack, onConfirm, loading }) => {

    const start = useMemo(() => formatDateTime(quotationData.start), [quotationData.start])
    const end = useMemo(() => formatDateTime(quotationData.end), [quotationData.end])

    const modeLabel = quotationData.isAuction
        ? "Leilão"
        : "Proposta única"

    return (
        <div>
            <div className="mb-5">
                <h2 className="m-0 text-[1.4375rem] font-bold text-[var(--color-text-body)] tracking-[-0.02em]">Revisão</h2>
                <p className="mt-1 mb-0 text-caption text-[var(--color-text-muted)] leading-[1.5]">Confira tudo antes de salvar.</p>
            </div>

            <div className="p-[0.125rem]">
                {/* Meta grid */}
                <div className="grid grid-cols-3 gap-[0.625rem] mb-6 max-sm:grid-cols-1 max-sm:gap-2">
                    <MetaCard icon={<CalendarClock size={18} />} label={"Início"} value={start ? start.date : "-"} sub={start?.time} />
                    <MetaCard icon={<CalendarCheck size={18} />} label={"Fim"} value={end ? end.date : "-"} sub={end?.time} />
                    <MetaCard icon={<Gavel size={18} />} label={"Modo da Cotação"} value={modeLabel} />
                </div>

                {/* Products section */}
                <div className="mt-5">
                    <SectionHeader icon={<Package size={16} />} label="Produtos" count={quotationData.products.length} />
                    {quotationData.products.length === 0 ? (
                        <EmptyState>Nenhum produto adicionado</EmptyState>
                    ) : (
                        <ul className="list-none m-0 pl-0 border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
                            {quotationData.products.map(p => (
                                <li key={p.productId} className="px-[0.875rem] py-[0.625rem] border-b border-[var(--color-border-faint)] last:border-b-0 flex flex-col gap-[0.3rem]">
                                    <span className="text-[0.875rem] font-semibold text-[var(--color-text-neutral)] leading-[1.35]">{p.productName}</span>
                                    <div className="flex items-center gap-2 text-[0.75rem]">
                                        <span className="font-bold text-[var(--color-text-body)]">{p.quantity} {(p.unitOfMeasure).toUpperCase()}{['bag', 'balde'].includes(p.unitOfMeasure) && p.quantity > 1 ? 'S' : ''}</span>
                                        <span className="w-[3px] h-[3px] rounded-full bg-[var(--color-border-strong)] flex-shrink-0" aria-hidden="true" />
                                        {p.brand ? (
                                            <span className="flex items-center gap-1 text-[var(--color-accent)] font-medium">
                                                <Tag size={12} />{p.brand}
                                            </span>
                                        ) : (
                                            <span className="text-[var(--color-text-muted)] italic font-normal">Marca não definida</span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Suppliers section */}
                <div className="mt-5">
                    <SectionHeader icon={<Users size={16} />} label="Fornecedores" count={quotationData.suppliers.length} />
                    {quotationData.suppliers.length === 0 ? (
                        <EmptyState>Nenhum fornecedor adicionado</EmptyState>
                    ) : (
                        <ul className="list-none m-0 pl-0 border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
                            {quotationData.suppliers.map(s => (
                                <li key={s.supplierId} className="px-[0.875rem] py-2 border-b border-[var(--color-border-faint)] last:border-b-0 flex items-center gap-[0.625rem]">
                                    <div className="flex-shrink-0 w-[1.875rem] h-[1.875rem] rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-[0.75rem] font-bold flex items-center justify-center">
                                        {s.supplierName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[0.875rem] font-semibold text-[var(--color-text-neutral)] leading-[1.3]">{s.supplierName}</span>
                                        <span className="text-[0.625rem] text-[var(--color-text-muted)]">{s.employerName}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <WizardActions
                onBack={onBack}
                onPrimary={onConfirm}
                primaryLabel="Salvar cotação"
                primaryVariant="success"
                primaryIcon={CheckCircle}
                loading={loading}
            />
        </div>
    )
}

export default QuotationCreateStep4
