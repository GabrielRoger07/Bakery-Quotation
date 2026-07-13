import { useEffect, useState, useCallback } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import Alert from '@/components/Alert'
import Select from '@/components/Select'
import LoadMoreButton from '@/components/LoadMoreButton'
import EmptyState from '@/components/EmptyState'
import MobileSearchInput from '@/components/MobileSearchInput'
import WizardActions from '@/components/WizardActions'
import { X, Plus, UserRoundSearch, UserRoundPlus, ArrowRight } from 'lucide-react'
import { ENV } from '@/config/env'

// Campos de busca — mesmo conjunto da listagem de fornecedores (SupplierList)
const SUPPLIER_FILTER_OPTIONS = [
    { value: 'supplierName', label: 'Nome' },
    { value: 'supplierEmail', label: 'E-mail' },
    { value: 'supplierWhatsappNumber', label: 'Whatsapp' },
    { value: 'employerName', label: 'Nome da Empresa' },
    { value: 'employerCnpj', label: 'CNPJ da Empresa' },
]

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish, loading }) => {
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile(768)

    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [suppliersLoading, setSuppliersLoading] = useState(true)
    const [localSelected, setLocalSelected] = useState(() =>
        [...selectedSuppliers].sort((a, b) => a.supplierName.localeCompare(b.supplierName))
    )
    const [error, setError] = useState("")
    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // Mobile tab
    const [mobileTab, setMobileTab] = useState("available")

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected, onChange])

    const fetchSuppliers = useCallback(async (page = 0, field = searchField, word = searchWord, append = false) => {
        const excludedIds = localSelected.map(s => s.supplierId)
        let query = `?page=${page}&sort=supplierName,asc`
        if (field) query += `&field=${field}`
        if (word) query += `&value=${word}`
        if (excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`
        const res = await request("GET", `/suppliers/company${query}`)
        if (res.ok) {
            setAvailableSuppliers(prev => append ? [...prev, ...res.data.content] : res.data.content)
            setCurrentPage(res.data.number)
            setTotalElements(res.data.totalElements ?? res.data.content.length)
            setError("")
        } else {
            setError(res.data?.message)
        }
        setSuppliersLoading(false)
    }, [request, localSelected, searchField, searchWord])

    const handleLoadMoreSuppliers = () => fetchSuppliers(currentPage + 1, searchField, searchWord, true)

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

    const handleClearSupSearch = () => {
        setSearchWord("")
        setCurrentPage(0)
        fetchSuppliers(0, searchField, "")
    }

    const handleAddSupplier = (supplier) => {
        if (localSelected.some(s => s.supplierId === supplier.supplierId)) {
            setError("Fornecedor já adicionado!")
            return
        }
        setLocalSelected([...localSelected, supplier].sort((a, b) => a.supplierName.localeCompare(b.supplierName)))
        setError("")
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

    // Desktop: eyebrows das colunas
    const colLabelCls = 'flex items-center gap-1.5 text-label font-bold uppercase tracking-[0.1em] text-[var(--color-text-disabled)] mb-2.5 px-0.5'
    const colBadgeCls = 'text-label font-bold text-[var(--color-accent)] bg-[var(--color-highlight-soft)] px-1.5 py-0.5 rounded-full leading-none tabular-nums tracking-normal'

    /* ── Search panel ── */
    const renderAvailablePanel = () => (
        <>
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {isMobile ? (
                    <div className="flex flex-col gap-2.5">
                        <div className="relative w-full">
                            <select
                                id="searchField"
                                name="searchField"
                                value={searchField}
                                onChange={e => setSearchField(e.target.value)}
                                className="toolbar-select w-full"
                            >
                                <option value="" disabled>Buscar por…</option>
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
                        <MobileSearchInput
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            onSearch={handleSearchSuppliers}
                            onClear={handleClearSupSearch}
                            placeholder="Digite o termo de busca"
                            searchDisabled={loading}
                        />
                    </div>
                ) : (
                    /* Desktop: mesmo padrão da toolbar da listagem de fornecedores (Select bare + busca dense) */
                    <div className="flex items-center gap-4 flex-wrap">
                        <Select
                            bare
                            className="w-[12rem] shrink-0"
                            value={searchField}
                            onChange={e => setSearchField(e.target.value)}
                            placeholder="Filtrar por"
                            selectClassName="h-[2.5rem]"
                            options={SUPPLIER_FILTER_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                        />
                        <MobileSearchInput
                            dense
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            onSearch={handleSearchSuppliers}
                            onClear={handleClearSupSearch}
                            placeholder={searchField ? `Buscar por ${SUPPLIER_FILTER_OPTIONS.find(o => o.value === searchField)?.label ?? '...'}` : "Selecione um campo"}
                            ariaLabel="Buscar fornecedor"
                            inputDisabled={!searchField}
                            searchDisabled={loading || !searchField}
                        />
                    </div>
                )}
            </div>

            {suppliersLoading ? (
                <EmptyState className="mb-3">Carregando fornecedores...</EmptyState>
            ) : availableSuppliers.length === 0 ? (
                <EmptyState
                    icon={<UserRoundSearch size={28} strokeWidth={1.75} />}
                    title="Nenhum fornecedor encontrado"
                    description={searchWord ? "Tente outro termo de busca." : "Nenhum fornecedor disponível."}
                    className="mb-3"
                />
            ) : (
                <>
                <div className="text-[0.75rem] font-semibold text-[var(--color-text-disabled)] mb-2.5 px-0.5">Mostrando {availableSuppliers.length} de {totalElements} fornecedores</div>
                <div className="mb-3">
                    {isMobile ? (
                        <div className="border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface-card)] mb-1">
                            {availableSuppliers.map(s => (
                                <div key={s.supplierId} className="flex items-center gap-3 px-3 py-2.5 border-b border-[var(--color-border-faint)] last:border-b-0">
                                    <div className="sup-row-avatar">{s.supplierName.charAt(0).toUpperCase()}</div>
                                    <div className="sup-row-body">
                                        <p className="sup-row-name">{s.supplierName}</p>
                                        <p className="sup-row-company">{s.employerName}</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAddSupplier(s)}
                                        disabled={loading}
                                        aria-label="Adicionar"
                                        className="w-9 h-9 rounded-[11px] bg-[var(--color-accent)] text-white flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform duration-[120ms] active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-card)] mb-[0.4rem]">
                            {availableSuppliers.map(s => (
                                <div
                                    key={s.supplierId}
                                    className="flex items-center gap-3 px-3 py-2.5 bg-[var(--color-surface-card)] transition-[background-color] duration-[160ms] border-b border-[var(--color-border-faint)] last:border-b-0 hover:bg-[var(--color-surface-subtle)]"
                                >
                                    <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-highlight-lighter)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 font-bold text-[0.9375rem]">
                                        {s.supplierName.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <strong className="text-[0.875rem] text-[var(--color-text-heading)] overflow-hidden text-ellipsis whitespace-nowrap">{s.supplierName}</strong>
                                        <span className="text-[0.75rem] text-[var(--color-text-neutral)] overflow-hidden text-ellipsis whitespace-nowrap">{s.employerName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => handleAddSupplier(s)}
                                        disabled={loading}
                                        aria-label="Adicionar"
                                        className="w-9 h-9 rounded-[var(--radius-md)] border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-card)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 cursor-pointer transition-[background-color,border-color] duration-[160ms] hover:border-[var(--color-accent)] hover:bg-[var(--color-highlight-lighter)] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Plus size={18} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <LoadMoreButton remaining={totalElements - availableSuppliers.length} onClick={handleLoadMoreSuppliers} />
                </div>
                </>
            )}
        </>
    )

    /* ── Selected suppliers panel ── */
    const renderParticipatingPanel = () => {
        if (localSelected.length === 0) {
            return (
                <EmptyState
                    icon={<UserRoundPlus size={28} strokeWidth={1.75} />}
                    title="Nenhum fornecedor adicionado"
                    description="Adicione fornecedores na aba Disponíveis."
                    className="mb-3"
                />
            )
        }
        if (isMobile) {
            return (
                <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                    <ul className="list-none m-0 p-0 flex flex-col gap-[0.5rem]">
                        {localSelected.map(s => (
                            <li key={s.supplierId} className="sup-row-card">
                                <div className="sup-row-avatar" style={{ background: 'linear-gradient(150deg, var(--color-accent), var(--color-accent-strong))', color: '#fff' }}>{s.supplierName.charAt(0).toUpperCase()}</div>
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
                </div>
            )
        }
        /* Desktop: cards individuais */
        return (
            <ul className="list-none m-0 p-0 flex flex-col gap-2.5 mb-3">
                {localSelected.map(s => (
                    <li
                        key={s.supplierId}
                        className="flex items-center gap-3 p-3 bg-[var(--color-surface-card)] border border-[var(--color-border-subtle)] rounded-[var(--radius-xl)] [box-shadow:var(--shadow-card-soft)]"
                    >
                        <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-accent)] text-white flex items-center justify-center flex-shrink-0 font-bold text-[0.9375rem]">
                            {s.supplierName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                            <strong className="text-[0.875rem] text-[var(--color-text-heading)] overflow-hidden text-ellipsis whitespace-nowrap">{s.supplierName}</strong>
                            <span className="text-[0.75rem] text-[var(--color-text-muted)] overflow-hidden text-ellipsis whitespace-nowrap">{s.employerName}</span>
                        </div>
                        <button
                            type="button"
                            title="Remover"
                            aria-label="Remover"
                            onClick={() => handleRemoveSupplier(s.supplierId)}
                            disabled={loading}
                            className="w-8 h-8 rounded-[var(--radius-md)] border-none bg-[var(--color-danger-soft)] text-[var(--color-danger)] inline-grid place-items-center flex-shrink-0 cursor-pointer transition-[background-color,color] duration-[160ms] hover:bg-[var(--color-danger)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <X size={16} strokeWidth={2.25} />
                        </button>
                    </li>
                ))}
            </ul>
        )
    }

    return (
        <div className="md:flex md:flex-col md:flex-1">
            <div className="mb-5">
                <h2 className="m-0 text-title font-bold text-[var(--color-text-body)] tracking-[-0.02em] md:text-[1.75rem] md:font-extrabold md:text-[var(--color-text-heading)]">Fornecedores</h2>
                <p className="mt-1 mb-0 text-caption text-[var(--color-text-muted)] leading-[1.5]">Escolha quem vai participar da cotação.</p>
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
                /* ── Desktop layout: duas colunas Disponíveis | Participando ── */
                <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <span className={colLabelCls}>Disponíveis</span>
                        {renderAvailablePanel()}
                    </div>
                    <div className="min-w-0">
                        <span className={colLabelCls}>
                            Participando
                            {localSelected.length > 0 && (
                                <span className={colBadgeCls}>{localSelected.length}</span>
                            )}
                        </span>
                        {renderParticipatingPanel()}
                    </div>
                </div>
            )}

            <Alert message={error} />

            <WizardActions
                onBack={onBack}
                onPrimary={handleFinishClick}
                primaryLabel="Avançar"
                desktopLabel="Revisar cotação"
                primaryIcon={ArrowRight}
                blocked={localSelected.length === 0}
                hint="Adicione pelo menos um fornecedor para avançar."
                loading={loading}
            />
        </div>
    )
}

export default QuotationCreateStep3
