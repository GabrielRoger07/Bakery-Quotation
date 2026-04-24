import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'
import { formatDateTime } from '../../utils/formatDateTime'
import { CalendarClock, CalendarCheck, Gavel, Package, Users, Tag } from 'lucide-react'

const MetaCard = ({ icon, label, value, sub }) => (
    <div className="flex items-start gap-[0.625rem] p-[0.75rem_0.875rem] bg-[var(--color-highlight-lighter)] border border-[var(--color-border-lighter)] rounded-[var(--radius-lg)]">
        <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-[var(--color-highlight-soft)] rounded-[var(--radius-md)] text-[var(--color-accent)]">
            {icon}
        </div>
        <div className="flex flex-col gap-[0.1rem] min-w-0">
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.06em] text-[var(--color-text-muted)]">{label}</span>
            <span className="text-[0.875rem] font-bold text-[var(--color-text-strong)] leading-[1.3]">{value}</span>
            {sub && <span className="text-[0.875rem] text-[var(--color-text-primary)] font-semibold">{sub}</span>}
        </div>
    </div>
)

const SectionHeader = ({ icon, label, count }) => (
    <div className="flex items-center gap-[0.4rem] mb-[0.625rem] text-[var(--color-text-muted)]">
        {icon}
        <h4 className="m-0 text-[var(--color-text-muted)] text-[0.75rem] font-bold uppercase tracking-[0.07em]">{label}</h4>
        <span className="text-[0.625rem] font-bold text-[var(--color-accent)] bg-[var(--color-highlight-soft)] px-2 py-[0.125rem] rounded-full tracking-[0.02em]">{count}</span>
    </div>
)

const QuotationDetails = ({ quotation }) => {
    const { request } = useFetch(ENV.API_BASE_URL)

    const [products, setProducts] = useState([])
    const [suppliers, setSuppliers] = useState([])
    const [error, setError] = useState("")

    useEffect(() => {
        if(!quotation) return

        const load = async () => {
            const resProducts = await request("GET", `/contains/${quotation.quotationId}`)

            if(resProducts.ok){
                setProducts(resProducts.data)
                setError("")
            }else{
                setError("Erro ao buscar produtos")
            }

            const resSuppliers = await request("GET", `/participations/quotations/${quotation.quotationId}`)

            if(resSuppliers.ok){
                setSuppliers(resSuppliers.data)
                setError("")
            }else{
                setError("Erro ao buscar fornecedores")
            }
        }

        load()
    }, [quotation, request])

    if(!quotation) return null

    const start = formatDateTime(quotation.quotationStart)
    const end = formatDateTime(quotation.quotationEnd)
    const quotationMode = quotation.isAuction ? "Leilão" : "Proposta única"

    return (
        <div className="p-[0.125rem]">
            {error && <Alert message={error}/>}

            <div className="grid grid-cols-3 gap-[0.625rem] mb-6 max-[560px]:grid-cols-1 max-[560px]:gap-2">
                <MetaCard icon={<CalendarClock size={18} />} label={"Início"} value={start ? start.date : "-"} sub={start?.time} />
                <MetaCard icon={<CalendarCheck size={18} />} label={"Fim"} value={end ? end.date : "-"} sub={end?.time} />
                <MetaCard icon={<Gavel size={18} />} label={"Modo da Cotação"} value={quotationMode} />
            </div>

            {/* Products */}
            <div className="mt-5">
                <SectionHeader icon={<Package size={16} />} label={"Produtos"} count={products.length} />
                {products.length === 0 ? (
                    <p className="m-0 p-4 text-center text-[var(--color-text-muted)] text-[0.875rem] bg-[var(--color-surface-1)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]">
                        Nenhum produto atrelado a essa cotação.
                    </p>
                ) : (
                    <ul className="list-none m-0 pl-0 border border-[var(--color-border-light)] rounded-[var(--radius-lg)] overflow-hidden">
                        {products.map(p => (
                            <li key={p.productId} className="px-[0.875rem] py-[0.625rem] border-b border-[var(--color-border-lighter)] last:border-b-0 flex flex-col gap-[0.3rem]">
                                <span className="text-[0.875rem] font-semibold text-[var(--color-text-neutral-strong)] leading-[1.35]">{p.productName}</span>
                                <div className="flex items-center gap-2 text-[0.75rem]">
                                    <span className="font-bold text-[var(--color-text-primary)]">{p.quantity} UN</span>
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

            {/* Suppliers */}
            <div className="mt-5">
                <SectionHeader icon={<Users size={16} />} label={"Fornecedores"} count={suppliers.length} />
                {suppliers.length === 0 ? (
                    <p className="m-0 p-4 text-center text-[var(--color-text-muted)] text-[0.875rem] bg-[var(--color-surface-1)] border border-dashed border-[var(--color-border)] rounded-[var(--radius-lg)]">
                        Nenhum fornecedor atrelado a essa cotação.
                    </p>
                ) : (
                    <ul className="list-none m-0 pl-0 border border-[var(--color-border-light)] rounded-[var(--radius-lg)] overflow-hidden">
                        {suppliers.map(s => (
                            <li key={s.supplierId} className="px-[0.875rem] py-2 border-b border-[var(--color-border-lighter)] last:border-b-0 flex items-center gap-[0.625rem]">
                                <div className="flex-shrink-0 w-[1.875rem] h-[1.875rem] rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-[0.75rem] font-bold flex items-center justify-center">
                                    {s.supplierName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[0.875rem] font-semibold text-[var(--color-text-neutral-strong)] leading-[1.3]">{s.supplierName}</span>
                                    <span className="text-[0.625rem] text-[var(--color-text-muted)]">{s.employerName}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}

export default QuotationDetails
