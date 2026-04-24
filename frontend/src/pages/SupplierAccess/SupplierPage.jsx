import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import { ENV } from '../../config/env'

const statusCls = {
    scheduled: 'inline-flex items-center px-[0.6rem] py-[0.15rem] text-[0.75rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-accent-strong)] bg-[var(--color-highlight-lighter)] border border-[var(--color-highlight-border)]',
    active: 'inline-flex items-center px-[0.6rem] py-[0.15rem] text-[0.75rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-success-strong)] bg-[var(--color-success-lighter)] border border-[var(--color-success-border)]',
    closed: 'inline-flex items-center px-[0.6rem] py-[0.15rem] text-[0.75rem] font-semibold tracking-[0.03em] rounded-full text-[var(--color-text-muted)] bg-[var(--color-surface-1)] border border-[var(--color-border)]',
}

const SupplierPage = () => {

    const { companyCnpj } = useParams()
    const navigate = useNavigate()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [participations, setParticipations] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        const token = Cookies.get("supplierAccessToken")
        if (!token) {
            navigate(`/supplier/login/${companyCnpj}`)
            return
        }

        const fetchParticipations = async () => {
            setLoading(true)
            const res = await request("GET", `/participations/supplier`)
            if (res.ok) {
                setParticipations(res.data.content)
                setError("")
            } else if (res.status !== 403) {
                setError("Erro ao carregar cotações")
            }
            setLoading(false)
        }

        fetchParticipations()
    }, [companyCnpj, navigate, request])

    const getStatus = (start, end) => {
        const now = new Date()
        if (now < new Date(start)) return { label: "Agendado", cls: statusCls.scheduled }
        if (now > new Date(end)) return { label: "Fechado", cls: statusCls.closed }
        return { label: "Ativo", cls: statusCls.active }
    }

    const handleSelect = (participation) => {
        navigate(`/supplier/quotation?quotationId=${participation.quotationId}&participationId=${participation.participationId}`)
    }

    const containerCls = "page-wrapper text-[var(--color-text-primary)]"

    if (loading) return (
        <div className={containerCls}>
            <p>Carregando...</p>
        </div>
    )

    if (error) return (
        <div className={containerCls}>
            <p>{error}</p>
        </div>
    )

    return (
        <div className={containerCls}>
            <h2 className="text-[var(--color-text-strong)] text-[1.25rem] m-0 mb-4">Suas Cotações</h2>

            {participations.length === 0 ? (
                <p className="text-[var(--color-text-secondary)]">Você não participa de nenhuma cotação.</p>
            ) : (
                <div className="flex flex-col gap-3 w-full max-w-[680px]">
                    {participations.map((p) => {
                        const status = getStatus(p.quotationStart, p.quotationEnd)
                        return (
                            <div
                                key={p.quotationId}
                                className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] [box-shadow:var(--shadow-xs)] px-[1.15rem] py-4 cursor-pointer transition-[transform,box-shadow] duration-[160ms] hover:-translate-y-[2px] hover:[box-shadow:var(--shadow-sm)]"
                                onClick={() => handleSelect(p)}
                            >
                                <div className="flex justify-between items-center mb-[0.6rem]">
                                    <span className="font-semibold text-[1rem] text-[var(--color-text-strong)]">
                                        Cotação {new Date(p.quotationStart).toLocaleDateString("pt-BR")} - #{p.quotationId}
                                    </span>
                                    <span className={status.cls}>{status.label}</span>
                                </div>

                                <div className="flex gap-[1.2rem] mb-2 max-[768px]:flex-col max-[768px]:gap-1">
                                    <p className="m-0 text-[0.875rem] text-[var(--color-text-secondary)]">
                                        <strong className="text-[var(--color-text-strong)]">Início:</strong>{" "}
                                        {new Date(p.quotationStart).toLocaleString()}
                                    </p>
                                    <p className="m-0 text-[0.875rem] text-[var(--color-text-secondary)]">
                                        <strong className="text-[var(--color-text-strong)]">Fim:</strong>{" "}
                                        {new Date(p.quotationEnd).toLocaleString()}
                                    </p>
                                </div>

                                <span className="text-[0.875rem] font-medium text-[var(--color-accent)]">
                                    Visualizar →
                                </span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}

export default SupplierPage
