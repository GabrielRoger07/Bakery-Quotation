import { useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import Alert from '@/components/Alert'
import MetaCard from '@/components/MetaCard'
import SectionHeader from '@/components/SectionHeader'
import EmptyState from '@/components/EmptyState'
import { ENV } from '@/config/env'
import { formatDateTime } from '@/utils/formatDateTime'
import { CirclePlay, CircleStop, Gavel, FileText, Package, Users, Tag } from 'lucide-react'

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
    const ModeIcon = quotation.isAuction ? Gavel : FileText

    return (
        <div className="p-[0.125rem]">
            {error && <Alert message={error}/>}

            <div className="grid grid-cols-2 gap-2 mb-6 sm:grid-cols-3 sm:gap-[0.625rem]">
                <MetaCard tone="success" icon={<CirclePlay size={16} strokeWidth={2} />} label={"Início"} value={start ? start.date : "-"} sub={start?.time} />
                <MetaCard tone="danger" icon={<CircleStop size={16} strokeWidth={2} />} label={"Fim"} value={end ? end.date : "-"} sub={end?.time} />
                <div className="col-span-2 sm:col-span-1">
                    <MetaCard icon={<ModeIcon size={16} strokeWidth={2} />} label={"Modo da Cotação"} value={quotationMode} />
                </div>
            </div>

            {/* Products */}
            <div className="mt-5">
                <SectionHeader icon={<Package size={16} />} label={"Produtos"} count={products.length} />
                {products.length === 0 ? (
                    <EmptyState>Nenhum produto atrelado a essa cotação.</EmptyState>
                ) : (
                    <ul className="list-none m-0 pl-0 bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
                        {products.map(p => (
                            <li key={p.productId} className="px-[0.875rem] py-[0.625rem] border-b border-[var(--color-border-faint)] last:border-b-0 flex flex-col gap-[0.3rem]">
                                <span className="text-body font-semibold text-[var(--color-text-neutral)] leading-[1.35]">{p.productName}</span>
                                <div className="flex items-center gap-2 text-caption">
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

            {/* Suppliers */}
            <div className="mt-5">
                <SectionHeader icon={<Users size={16} />} label={"Fornecedores"} count={suppliers.length} />
                {suppliers.length === 0 ? (
                    <EmptyState>Nenhum fornecedor atrelado a essa cotação.</EmptyState>
                ) : (
                    <ul className="list-none m-0 pl-0 bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
                        {suppliers.map(s => (
                            <li key={s.supplierId} className="px-[0.875rem] py-2 border-b border-[var(--color-border-faint)] last:border-b-0 flex items-center gap-[0.625rem]">
                                <div className="flex-shrink-0 w-[1.875rem] h-[1.875rem] rounded-full bg-[var(--color-accent)] text-[var(--color-text-inverse)] text-[0.75rem] font-bold flex items-center justify-center">
                                    {s.supplierName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-body font-semibold text-[var(--color-text-neutral)] leading-[1.3]">{s.supplierName}</span>
                                    <span className="text-caption text-[var(--color-text-muted)]">{s.employerName}</span>
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
