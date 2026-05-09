import { useEffect, useState, useCallback } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Pagination from '@/components/ui/Pagination'
import { X } from 'lucide-react'
import { ENV } from '@/config/env'

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish, loading }) => {
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile(768)

    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [localSelected, setLocalSelected] = useState(() =>
        [...selectedSuppliers].sort((a, b) => a.supplierName.localeCompare(b.supplierName))
    )
    const [error, setError] = useState("")
    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Mobile tab
    const [mobileTab, setMobileTab] = useState("available")

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected, onChange])

    const fetchSuppliers = useCallback(async (page = 0, field = searchField, word = searchWord) => {
        const excludedIds = localSelected.map(s => s.supplierId)
        let query = `?page=${page}&sort=supplierName,asc`
        if (field) query += `&field=${field}`
        if (word) query += `&value=${word}`
        if (excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`
        const res = await request("GET", `/suppliers/company${query}`)
        if (res.ok) {
            setAvailableSuppliers(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
            setError("")
        } else {
            setError(res.data?.message)
        }
    }, [request, localSelected, searchField, searchWord])

    useEffect(() => {
        fetchSuppliers(0, "", "") // eslint-disable-line react-hooks/set-state-in-effect
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        fetchSuppliers(0) // eslint-disable-line react-hooks/set-state-in-effect
    }, [localSelected, fetchSuppliers])

    const handleSearchSuppliers = () => {
        setCurrentPage(0)
        fetchSuppliers(0)
    }

    const handleAddSupplier = (supplier) => {
        if (localSelected.some(s => s.supplierId === supplier.supplierId)) {
            setError("Fornecedor já adicionado!")
            return
        }
        setLocalSelected([...localSelected, supplier].sort((a, b) => a.supplierName.localeCompare(b.supplierName)))
        setError("")
        if (isMobile) setMobileTab("participating")
    }

    const handleRemoveSupplier = (supplierId) => {
        setLocalSelected(localSelected.filter(s => s.supplierId !== supplierId))
    }

    const handleFinishClick = () => {
        if (localSelected.length === 0) {
            setError("Selecione ao menos 1 fornecedor")
            return
        }
        setError("")
        onFinish(localSelected)
    }

    /* ── Search panel ── */
    const renderAvailablePanel = () => (
        <>
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <div className="flex gap-3 items-end max-[768px]:flex-col max-[768px]:items-stretch">
                    <div className="flex-[0_0_220px] relative max-[768px]:flex-none max-[768px]:w-full">
                        <select
                            id="searchField"
                            name="searchField"
                            value={searchField}
                            onChange={e => setSearchField(e.target.value)}
                            className="toolbar-select w-full"
                        >
                            <option value="" disabled>Selecione</option>
                            <option value="supplierName">Nome</option>
                            <option value="supplierEmail">E-mail</option>
                            <option value="supplierWhatsappNumber">Whatsapp</option>
                            <option value="employerName">Nome da Empresa</option>
                            <option value="employerCnpj">CNPJ da Empresa</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                    </div>
                    <div className="flex-1 min-w-[200px] max-[768px]:min-w-0 [&_.input-container]:mb-0">
                        <Input
                            type="text"
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            placeholder="Digite o campo"
                        />
                    </div>
                    <Button onClick={handleSearchSuppliers} disabled={loading} className="whitespace-nowrap">Buscar</Button>
                </div>
            </div>

            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {availableSuppliers.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">Nenhum fornecedor disponível</p>
                ) : isMobile ? (
                    <>
                        <ul className="list-none m-0 p-0 flex flex-col gap-[0.5rem] mb-2">
                            {availableSuppliers.map(s => (
                                <li key={s.supplierId} className="sup-row-card">
                                    <div className="sup-row-avatar">{s.supplierName.charAt(0).toUpperCase()}</div>
                                    <div className="sup-row-body">
                                        <p className="sup-row-name">{s.supplierName}</p>
                                        <p className="sup-row-company">{s.employerName}</p>
                                    </div>
                                    <Button onClick={() => handleAddSupplier(s)} disabled={loading}>
                                        Adicionar
                                    </Button>
                                </li>
                            ))}
                        </ul>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={page => fetchSuppliers(page)} />
                    </>
                ) : (
                    <>
                        <div className="border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface-0)] mb-[0.4rem]">
                            {availableSuppliers.map(s => (
                                <div
                                    key={s.supplierId}
                                    className="flex justify-between items-center px-[0.72rem] py-[0.55rem] bg-[var(--color-surface-0)] transition-[background-color] duration-[160ms] border-b border-[var(--color-border-lighter)] last:border-b-0 hover:bg-[var(--color-surface-1)]"
                                >
                                    <div className="flex flex-col">
                                        <strong className="text-[0.875rem] text-[var(--color-text-strong)]">{s.supplierName}</strong>
                                        <span className="text-[0.75rem] text-[var(--color-text-subtle)]">{s.employerName}</span>
                                    </div>
                                    <Button onClick={() => handleAddSupplier(s)} disabled={loading}>Adicionar</Button>
                                </div>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={page => fetchSuppliers(page)} />
                    </>
                )}
            </div>
        </>
    )

    /* ── Selected suppliers panel ── */
    const renderParticipatingPanel = () => (
        <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
            {!isMobile && (
                <h4 className="m-0 mb-[0.6rem] text-[var(--color-text-secondary)] text-[1rem] font-semibold">
                    Fornecedores Adicionados ({localSelected.length})
                </h4>
            )}
            {localSelected.length === 0 ? (
                <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">Nenhum fornecedor adicionado</p>
            ) : isMobile ? (
                <ul className="list-none m-0 p-0 flex flex-col gap-[0.5rem]">
                    {localSelected.map(s => (
                        <li key={s.supplierId} className="sup-row-card">
                            <div className="sup-row-avatar">{s.supplierName.charAt(0).toUpperCase()}</div>
                            <div className="sup-row-body">
                                <p className="sup-row-name">{s.supplierName}</p>
                                <p className="sup-row-company">{s.employerName}</p>
                            </div>
                            <button
                                className="sel-product-btn remove"
                                title="Remover"
                                onClick={() => handleRemoveSupplier(s.supplierId)}
                                disabled={loading}
                            >
                                <X size={15} />
                            </button>
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="list-none p-0 m-0">
                    {localSelected.map(s => (
                        <li key={s.supplierId} className="flex justify-between items-center py-2 border-b border-[var(--color-border-lighter)] last:border-b-0">
                            <div>
                                <strong className="text-[0.875rem] block text-[var(--color-text-strong)]">{s.supplierName}</strong>
                                <span className="text-[0.75rem] text-[var(--color-text-muted)]">{s.employerName}</span>
                            </div>
                            <Button variant="danger" onClick={() => handleRemoveSupplier(s.supplierId)} disabled={loading}>Remover</Button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )

    return (
        <div>
            <div className="mb-5">
                <h2 className="m-0 text-[1.0625rem] font-bold text-[var(--color-text-strong)] tracking-[-0.015em]">Fornecedores</h2>
                <p className="mt-1 mb-0 text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.5]">Adicione os fornecedores que irão participar desta cotação.</p>
            </div>

            {isMobile ? (
                <>
                    <div className="step-tabs mb-4">
                        <button
                            className={`step-tab ${mobileTab === 'available' ? 'active' : ''}`}
                            onClick={() => setMobileTab('available')}
                        >
                            Disponíveis
                        </button>
                        <button
                            className={`step-tab ${mobileTab === 'participating' ? 'active' : ''}`}
                            onClick={() => setMobileTab('participating')}
                        >
                            Participando
                            {localSelected.length > 0 && (
                                <span className="step-tab-badge">{localSelected.length}</span>
                            )}
                        </button>
                    </div>

                    {mobileTab === 'available' && renderAvailablePanel()}
                    {mobileTab === 'participating' && renderParticipatingPanel()}
                </>
            ) : (
                <>
                    {renderAvailablePanel()}
                    {renderParticipatingPanel()}
                </>
            )}

            {error &&
                <div className='flex justify-center gap-3 mt-4'>
                    <Alert message={error} />
                </div>
            }

            <div className="flex justify-center gap-3 mt-5">
                <Button onClick={onBack} disabled={loading} className="max-[768px]:w-full">Voltar</Button>
                <Button onClick={handleFinishClick} disabled={loading} className="max-[768px]:w-full">
                    {loading ? "Carregando..." : "Próximo"}
                </Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep3
