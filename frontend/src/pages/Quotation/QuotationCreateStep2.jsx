import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import Button from '@/components/Button'
import Alert from '@/components/Alert'
import Select from '@/components/Select'
import Modal from '@/components/Modal'
import LoadMoreButton from '@/components/LoadMoreButton'
import EmptyState from '@/components/EmptyState'
import MobileSearchInput from '@/components/MobileSearchInput'
import ActiveFilterPill from '@/components/ActiveFilterPill'
import WizardActions from '@/components/WizardActions'
import ProductFormBottomSheet from '@/components/ProductFormBottomSheet'
import ProductCreate from '@/pages/Product/ProductCreate'
import { X, Plus, Minus, Package, Pencil, Check, SearchX, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react'
import { ENV } from '@/config/env'

const UNIT_OPTIONS = ['L', 'bag', 'balde', 'CX', 'FD', 'KG', 'PCT', 'UND']

/* ── Inner form — remounted via key when product changes, so state is always fresh ── */
const ProductSheetForm = ({ product, onClose, onConfirm }) => {
    const [qty, setQty] = useState(product._existingQty != null ? String(product._existingQty) : "")
    const [brand, setBrand] = useState(product._existingBrand ?? "")
    const [unitOfMeasure, setUnitOfMeasure] = useState(product._existingUnit ?? "UND")
    const qtyRef = useRef(null)

    useEffect(() => {
        const t = setTimeout(() => qtyRef.current?.focus(), 340)
        return () => clearTimeout(t)
    }, [])

    const isValid = qty !== "" && Number(qty) > 0

    const incQty = () => setQty(q => String((parseInt(q) || 0) + 1))
    const decQty = () => setQty(q => String(Math.max(1, (parseInt(q) || 1) - 1)))

    const handleConfirm = () => {
        if (!isValid) return
        onConfirm({ qty: Math.max(1, Math.floor(Number(qty))), brand, unitOfMeasure })
    }

    const selectCls = "psheet-input appearance-none"

    return (
        <>
            <div className="psheet-header">
                <div>
                    <p className="psheet-title">{product.productName}</p>
                    {product.productDescription && (
                        <p className="psheet-subtitle">{product.productDescription}</p>
                    )}
                </div>
                <button className="psheet-close" onClick={onClose} aria-label="Fechar"><X size={18} strokeWidth={2} /></button>
            </div>
            <div className="psheet-body">
                <div className="flex gap-3">
                    <div className="psheet-field flex-1">
                        <label className="psheet-label">Quantidade *</label>
                        <div className="flex items-center h-[2.875rem] bg-[var(--color-highlight-lighter)] border-[1.5px] border-[var(--color-highlight-border)] rounded-[var(--radius-lg)] overflow-hidden transition-shadow duration-[160ms] focus-within:[box-shadow:var(--shadow-focus-accent)]">
                            <button type="button" onClick={decQty} aria-label="Diminuir" className="w-11 h-full flex items-center justify-center text-[var(--color-accent)] cursor-pointer transition-colors duration-[120ms] hover:bg-[var(--color-highlight-soft)] active:bg-[var(--color-highlight-soft)]">
                                <Minus size={18} strokeWidth={2.5} />
                            </button>
                            <input
                                ref={qtyRef}
                                type="number"
                                className="flex-1 min-w-0 w-full h-full text-center border-none bg-transparent text-[1rem] font-bold text-[var(--color-text-body)] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                value={qty}
                                onChange={e => setQty(e.target.value)}
                                onKeyDown={e => {
                                    if (['-','e','E'].includes(e.key)) e.preventDefault()
                                    if (e.key === 'Enter' && isValid) handleConfirm()
                                }}
                                onFocus={e => e.target.select()}
                                placeholder="0"
                                min="1"
                            />
                            <button type="button" onClick={incQty} aria-label="Aumentar" className="w-11 h-full flex items-center justify-center text-[var(--color-accent)] cursor-pointer transition-colors duration-[120ms] hover:bg-[var(--color-highlight-soft)] active:bg-[var(--color-highlight-soft)]">
                                <Plus size={18} strokeWidth={2.5} />
                            </button>
                        </div>
                    </div>
                    <div className="psheet-field flex-1">
                        <label className="psheet-label">Unidade *</label>
                        <div className="relative">
                            <select className={selectCls} value={unitOfMeasure} onChange={e => setUnitOfMeasure(e.target.value)}>
                                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            </span>
                        </div>
                    </div>
                </div>
                <div className="psheet-field">
                    <label className="psheet-label">Marca <span style={{fontWeight:400,textTransform:'none',letterSpacing:0}}>(opcional)</span></label>
                    <input
                        type="text"
                        className="psheet-input"
                        value={brand}
                        onChange={e => setBrand(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && isValid) handleConfirm() }}
                        placeholder="Ex: Fleischmann"
                    />
                </div>
            </div>
            <div className="psheet-footer">
                <button className="psheet-confirm-btn" onClick={handleConfirm} disabled={!isValid}>
                    <Plus size={18} />
                    {product._existingQty != null ? "Salvar alterações" : "Adicionar produto"}
                </button>
                <button className="psheet-cancel-btn" onClick={onClose}>Cancelar</button>
            </div>
        </>
    )
}

/* ── Sheet shell — handles backdrop + slide animation + scroll lock ── */
const ProductBottomSheet = ({ isOpen, product, onClose, onConfirm }) => {
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    return (
        <>
            <div className={`psheet-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
            <div className={`psheet ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Definir quantidade">
                <div className="psheet-handle" />
                {isOpen && product && (
                    <ProductSheetForm
                        key={product.productId}
                        product={product}
                        onClose={onClose}
                        onConfirm={onConfirm}
                    />
                )}
            </div>
        </>
    )
}

/* ── Main Step 2 component ── */
const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {
    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile(768)

    const [userDepts, setUserDepts] = useState([])
    const [deptFilter, setDeptFilter] = useState(null)

    const [availableProducts, setAvailableProducts] = useState([])
    const [productsLoading, setProductsLoading] = useState(true)
    const [localSelected, setLocalSelected] = useState(() => {
        const map = {}
        selectedProducts.forEach(p => {
            map[p.productId] = { quantity: p.quantity, brand: p.brand || "", unitOfMeasure: p.unitOfMeasure || "UND", _product: p }
        })
        return map
    })
    const [error, setError] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // Desktop: inline expand
    const [expandedId, setExpandedId] = useState(null)
    const [pendingQty, setPendingQty] = useState("")
    const [pendingBrand, setPendingBrand] = useState("")
    const [pendingUnit, setPendingUnit] = useState("UND")

    // Desktop: inline table edit
    const [editingId, setEditingId] = useState(null)
    const [editQty, setEditQty] = useState("")
    const [editBrand, setEditBrand] = useState("")
    const [editUnit, setEditUnit] = useState("UND")

    // Mobile: tab ("search" | "selected") + bottom sheet
    const [mobileTab, setMobileTab] = useState("search")
    const [sheetProduct, setSheetProduct] = useState(null)
    const [selectedBadgePulse, setSelectedBadgePulse] = useState(0)

    const [showCreateModal, setShowCreateModal] = useState(false)

    const excludedIds = useMemo(() => Object.keys(localSelected), [localSelected])

    const fetchProducts = useCallback(async (page = 0, append = false) => {
        let query = `?page=${page}&sort=productName,asc`
        if (appliedSearch) query += `&field=productName&value=${appliedSearch}`
        if (excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`
        if (deptFilter !== null) query += `&departmentId=${deptFilter}`
        const res = await request("GET", `/products/company${query}`)
        if (res.ok) {
            setAvailableProducts(prev => append ? [...prev, ...res.data.content] : res.data.content)
            setCurrentPage(res.data.number)
            setTotalElements(res.data.totalElements ?? res.data.content.length)
        }
        setProductsLoading(false)
    }, [request, appliedSearch, excludedIds, deptFilter])

    const handleLoadMoreProducts = () => fetchProducts(currentPage + 1, true)

    useEffect(() => {
        fetchProducts(0) // eslint-disable-line react-hooks/set-state-in-effect
    }, [appliedSearch, excludedIds, deptFilter]) // eslint-disable-line react-hooks/exhaustive-deps

    const fetchDepartments = useCallback(async () => {
        const res = await request('GET', '/departments/company?size=50&sort=departmentName,asc')
        if (res.ok) {
            const all = res.data.content ?? res.data
            setUserDepts(all.filter(d => d.departmentName !== 'Default'))
        }
    }, [request])

    useEffect(() => {
        fetchDepartments() // eslint-disable-line react-hooks/set-state-in-effect
    }, [fetchDepartments])

    const handleSearch = useCallback(() => {
        setCurrentPage(0)
        setAppliedSearch(searchWord)
    }, [searchWord])

    const handleClearSearch = useCallback(() => {
        setSearchWord("")
        setAppliedSearch("")
    }, [])

    // Desktop expand
    const handleExpandProduct = useCallback((product) => {
        if (expandedId === product.productId) { setExpandedId(null); return }
        const existing = localSelected[product.productId]
        setExpandedId(product.productId)
        setPendingQty(existing ? String(existing.quantity) : "")
        setPendingBrand(existing ? existing.brand : "")
        setPendingUnit(existing ? existing.unitOfMeasure : "UND")
    }, [expandedId, localSelected])

    const handleAddProduct = useCallback((product) => {
        const qty = Math.max(0, Math.floor(Number(pendingQty)) || 0)
        if (qty === 0) return
        setLocalSelected(prev => ({
            ...prev,
            [product.productId]: { quantity: qty, brand: pendingBrand, unitOfMeasure: pendingUnit, _product: product }
        }))
        setExpandedId(null)
        setPendingQty("")
        setPendingBrand("")
        setPendingUnit("UND")
    }, [pendingQty, pendingBrand, pendingUnit])

    // Desktop table edit
    const handleStartEdit = useCallback((product) => {
        setEditingId(product.productId)
        setEditQty(String(product.quantity))
        setEditBrand(product.brand || "")
        setEditUnit(product.unitOfMeasure || "UND")
    }, [])

    const handleConfirmEdit = useCallback((productId) => {
        const qty = Math.max(1, Math.floor(Number(editQty)) || 1)
        setLocalSelected(prev => {
            const entry = prev[productId]
            if (!entry) return prev
            return { ...prev, [productId]: { ...entry, quantity: qty, brand: editBrand, unitOfMeasure: editUnit } }
        })
        setEditingId(null)
    }, [editQty, editBrand, editUnit])

    const handleCancelEdit = useCallback(() => setEditingId(null), [])

    const handleRemoveProduct = useCallback((productId) => {
        setLocalSelected(prev => {
            const next = { ...prev }
            delete next[productId]
            return next
        })
    }, [])

    // Mobile: open sheet for add or edit
    const handleOpenSheet = useCallback((product, existing) => {
        setSheetProduct({
            productId: product.productId,
            productName: product.productName,
            productDescription: product.productDescription,
            _raw: product,
            _existingQty: existing?.quantity ?? null,
            _existingBrand: existing?.brand ?? "",
            _existingUnit: existing?.unitOfMeasure ?? "UND",
        })
    }, [])

    const handleSheetConfirm = useCallback(({ qty, brand, unitOfMeasure }) => {
        if (!sheetProduct) return
        setLocalSelected(prev => ({
            ...prev,
            [sheetProduct.productId]: {
                quantity: qty,
                brand,
                unitOfMeasure,
                _product: sheetProduct._raw ?? prev[sheetProduct.productId]?._product,
            }
        }))
        setSheetProduct(null)
        if (sheetProduct._existingQty == null) setSelectedBadgePulse(prev => prev + 1)
    }, [sheetProduct])

    const handleNewProductCreated = useCallback((newProduct) => {
        setShowCreateModal(false)
        setSearchWord(newProduct.productName)
        setAppliedSearch(newProduct.productName)
        setCurrentPage(0)
        if (isMobile) {
            setMobileTab("search")
            // open sheet directly for newly created product
            setSheetProduct({
                productId: newProduct.productId,
                productName: newProduct.productName,
                productDescription: newProduct.productDescription,
                _raw: newProduct,
                _existingQty: null,
                _existingBrand: "",
                _existingUnit: "UND",
            })
        } else {
            setExpandedId(newProduct.productId)
            setPendingQty("")
            setPendingBrand("")
        }
    }, [isMobile])

    const selectedList = useMemo(() => {
        return Object.entries(localSelected).map(([id, entry]) => {
            const product = entry._product
            return {
                productId: Number(id),
                productName: product?.productName || "",
                productDescription: product?.productDescription || "",
                quantity: entry.quantity,
                brand: entry.brand,
                unitOfMeasure: entry.unitOfMeasure || "UND",
            }
        }).sort((a, b) => a.productName.localeCompare(b.productName))
    }, [localSelected])

    const onChangeRef = useRef(onChange)
    useEffect(() => { onChangeRef.current = onChange }, [onChange])
    useEffect(() => { onChangeRef.current(selectedList) }, [selectedList])

    const handleNextClick = () => {
        if (selectedList.length === 0) { setError("Selecione ao menos 1 produto"); return }
        setError("")
        onNext()
    }

    // shared small input class (desktop inline edit)
    const smallInputCls = 'w-full h-[2.125rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans px-2 text-[var(--color-text-body)] bg-[var(--color-surface-card)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:0_0_0_2px_var(--color-accent-soft-strong)] placeholder:text-[var(--color-text-disabled)]'
    const iconBtnBase = 'flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms]'
    const iconBtnDanger  = `${iconBtnBase} hover:bg-[var(--color-danger-soft)] hover:text-[var(--color-danger)]`
    const iconBtnSuccess = `${iconBtnBase} text-[var(--color-success)] hover:bg-[var(--color-success-soft)] hover:text-[var(--color-success-strong)]`

    // Desktop: eyebrows das colunas + ações dos produtos selecionados
    const colLabelCls = 'flex items-center gap-1.5 text-label font-bold uppercase tracking-[0.1em] text-[var(--color-text-disabled)] mb-2.5 px-0.5'
    const colBadgeCls = 'text-label font-bold text-[var(--color-accent)] bg-[var(--color-highlight-soft)] px-1.5 py-0.5 rounded-full leading-none tabular-nums tracking-normal'
    const cardBtnBase = 'flex-shrink-0 w-8 h-8 rounded-[var(--radius-md)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] cursor-pointer inline-grid place-items-center transition-[background-color,border-color,color] duration-[160ms]'
    const cardBtnEdit = `${cardBtnBase} text-[var(--color-text-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-highlight-lighter)]`
    const cardBtnDelete = `${cardBtnBase} text-[var(--color-danger)] hover:border-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]`
    const productListShellCls = 'border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden bg-[var(--color-surface-card)]'
    const productListRowCls = 'flex items-center gap-3 px-3 py-2.5'
    const productListDividerCls = 'border-b border-[var(--color-border-faint)] last:border-b-0'

    /* ── Search panel (shared between desktop and mobile search tab) ── */
    const renderSearchPanel = () => (
        <>
            {/* Search bar */}
            <div className="bg-[var(--color-surface-card)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {isMobile ? (
                    <>
                        {userDepts.length > 1 && (
                            <div className="relative mb-2.5 max-sm:w-full w-fit">
                                <select
                                    value={deptFilter === null ? 'all' : String(deptFilter)}
                                    onChange={e => { setDeptFilter(e.target.value === 'all' ? null : Number(e.target.value)); setCurrentPage(0) }}
                                    aria-label="Filtrar por departamento"
                                    className="w-full min-w-[12rem] max-w-[16rem] max-sm:max-w-full h-[2.375rem] pl-[0.75rem] pr-8 border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans text-[var(--color-text-body)] bg-[var(--color-surface-card)] outline-none transition-[border-color,box-shadow] duration-[160ms] appearance-none cursor-pointer hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]"
                                >
                                    <option value="all">Todos os departamentos</option>
                                    {userDepts.map(d => (
                                        <option key={d.departmentId} value={String(d.departmentId)}>{d.departmentName}</option>
                                    ))}
                                </select>
                                <span className="pointer-events-none absolute right-[0.625rem] top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                </span>
                            </div>
                        )}

                        <MobileSearchInput
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            placeholder="Nome do Produto"
                        />
                        <ActiveFilterPill label="Busca" value={appliedSearch} onClear={handleClearSearch} />
                    </>
                ) : (
                    /* Desktop: mesmo padrão da toolbar da listagem de produtos (busca dense + Select de setor) */
                    <>
                        <div className="flex items-center gap-4 flex-wrap">
                            <MobileSearchInput
                                dense
                                value={searchWord}
                                onChange={e => setSearchWord(e.target.value)}
                                onSearch={handleSearch}
                                onClear={handleClearSearch}
                                placeholder="Buscar por nome do produto"
                                ariaLabel="Buscar produto"
                            />
                            {userDepts.length > 1 && (
                                <Select
                                    bare
                                    className="flex-1 min-w-[12rem]"
                                    value={deptFilter === null ? '' : String(deptFilter)}
                                    onChange={e => { setDeptFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(0) }}
                                    placeholder="Todos os setores"
                                    selectClassName="h-[2.5rem]"
                                    options={userDepts.map(d => ({ value: d.departmentId, label: d.departmentName }))}
                                />
                            )}
                        </div>
                        <ActiveFilterPill label="Nome" value={appliedSearch} onClear={handleClearSearch} />
                    </>
                )}

                <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-dashed border-[var(--color-highlight-border)] bg-[var(--color-highlight-lighter)] text-[var(--color-accent)] text-caption font-semibold cursor-pointer transition-[background-color,border-color] duration-[160ms] hover:bg-[var(--color-highlight-soft)] active:scale-[0.99]"
                >
                    <Plus size={16} strokeWidth={2.25} />Cadastrar novo produto
                </button>
            </div>

            {/* Results */}
            {productsLoading ? (
                <EmptyState className="mb-3">Carregando produtos...</EmptyState>
            ) : availableProducts.length === 0 ? (
                <EmptyState
                    icon={<SearchX size={28} strokeWidth={1.75} />}
                    title="Nenhum produto encontrado"
                    description={appliedSearch ? "Tente outro termo de busca ou cadastre um novo produto." : "Nenhum produto disponível no catálogo."}
                    action={appliedSearch ? <Button onClick={() => setShowCreateModal(true)}>Cadastrar produto</Button> : null}
                    className="mb-3"
                />
            ) : (
                <>
                <div className="text-[0.75rem] font-semibold text-[var(--color-text-disabled)] mb-2.5 px-0.5">Mostrando {availableProducts.length} de {totalElements} produtos</div>
                <div className="mb-3">
                    {isMobile ? (
                        <div className={`${productListShellCls} mb-1`}>
                            {availableProducts.map(p => (
                                <div key={p.productId} className={`${productListRowCls} ${productListDividerCls}`}>
                                    <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-highlight-lighter)] flex items-center justify-center flex-shrink-0 text-[var(--color-highlight-border)]">
                                        <Package size={20} strokeWidth={2} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-[0.875rem] text-[var(--color-text-body)] truncate">{p.productName}</div>
                                        {p.productDescription && <div className="text-[0.75rem] text-[var(--color-text-disabled)] mt-px truncate">{p.productDescription}</div>}
                                    </div>
                                    <button type="button" onClick={() => handleOpenSheet(p, null)} aria-label="Adicionar" className="w-9 h-9 rounded-[11px] bg-[var(--color-accent)] text-white flex items-center justify-center flex-shrink-0 cursor-pointer transition-transform duration-[120ms] active:scale-90">
                                        <Plus size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className={`${productListShellCls} mb-1`}>
                            {availableProducts.map(p => {
                                const isExpanded = expandedId === p.productId
                                return (
                                    <div key={p.productId} className={productListDividerCls}>
                                        <div className={`${productListRowCls} transition-[background-color] duration-[160ms] ${isExpanded ? 'bg-[var(--color-highlight-lighter)]' : ''}`}>
                                            <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-highlight-lighter)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                                                <Package size={20} strokeWidth={2} />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-bold text-[0.875rem] text-[var(--color-text-heading)] overflow-hidden text-ellipsis whitespace-nowrap">{p.productName}</span>
                                                {p.productDescription && <span className="text-caption text-[var(--color-text-muted)] mt-px overflow-hidden text-ellipsis whitespace-nowrap">{p.productDescription}</span>}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleExpandProduct(p)}
                                                className={`flex-shrink-0 inline-flex items-center gap-1 px-3 h-9 rounded-[var(--radius-md)] border-[1.5px] text-caption font-semibold cursor-pointer transition-[background-color,border-color] duration-[160ms] ${isExpanded ? 'border-[var(--color-accent)] bg-[var(--color-highlight-soft)] text-[var(--color-accent)]' : 'border-[var(--color-border-strong)] bg-[var(--color-surface-card)] text-[var(--color-accent)] hover:border-[var(--color-accent)] hover:bg-[var(--color-highlight-lighter)]'}`}
                                            >
                                                <Plus size={15} strokeWidth={2.5} />Adicionar
                                            </button>
                                        </div>
                                        {/* Desktop inline expand */}
                                        {isExpanded && (
                                            <div className="px-3 py-2 pb-3 bg-[var(--color-highlight-lighter)] border-t border-[var(--color-border-faint)] flex items-end gap-[0.625rem] [animation:step2ExpandIn_0.15s_ease]">
                                                <div className="flex gap-2 flex-1">
                                                    <div className="flex flex-col gap-[0.2rem] flex-1">
                                                        <label className="text-label font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Quantidade *</label>
                                                        <input type="number" className={`${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} value={pendingQty} onChange={e => setPendingQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleAddProduct(p) }} onFocus={e => e.target.select()} placeholder="0" min="0" autoFocus />
                                                    </div>
                                                    <div className="flex flex-col gap-[0.2rem] flex-1">
                                                        <label className="text-label font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Unidade</label>
                                                        <div className="relative">
                                                            <select className={`${smallInputCls} appearance-none pr-6`} value={pendingUnit} onChange={e => setPendingUnit(e.target.value)}>
                                                                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                                            </select>
                                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-col gap-[0.2rem] flex-1">
                                                        <label className="text-label font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Marca</label>
                                                        <input type="text" className={smallInputCls} value={pendingBrand} onChange={e => setPendingBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddProduct(p) }} placeholder="Marca" />
                                                    </div>
                                                </div>
                                                <Button onClick={() => handleAddProduct(p)} disabled={!pendingQty || Number(pendingQty) <= 0} className="flex-shrink-0 flex items-center gap-[0.3rem] whitespace-nowrap">
                                                    <Plus size={15} />Adicionar
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    <LoadMoreButton remaining={totalElements - availableProducts.length} onClick={handleLoadMoreProducts} />
                </div>
                </>
            )}
        </>
    )

    /* ── Selected products panel ── */
    const renderSelectedPanel = () => {
        if (selectedList.length === 0) {
            return (
                <EmptyState
                    icon={<ShoppingCart size={28} strokeWidth={1.75} />}
                    title="Nenhum produto selecionado"
                    description="Use a busca para adicionar produtos à cotação."
                    action={isMobile ? <Button onClick={() => setMobileTab('search')}>Buscar produtos</Button> : null}
                    className="mb-3"
                />
            )
        }
        if (isMobile) {
            return (
                <div className="mb-3">
                    <ul className={`${productListShellCls} list-none m-0 p-0`}>
                        {selectedList.map(p => {
                            const rawProduct = localSelected[p.productId]?._product
                            return (
                                <li key={p.productId} className={`${productListRowCls} ${productListDividerCls}`}>
                                    <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-highlight-lighter)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                                        <Package size={20} strokeWidth={2} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="font-bold text-[0.875rem] text-[var(--color-text-heading)] overflow-hidden text-ellipsis whitespace-nowrap">{p.productName}</span>
                                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                            <span className="text-label font-bold uppercase bg-[var(--color-highlight-soft)] text-[var(--color-accent)] px-2 py-0.5 rounded-full tabular-nums">{p.quantity} {p.unitOfMeasure}</span>
                                            {p.brand
                                                ? <span className="text-label font-semibold border border-[var(--color-border-default)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap">{p.brand}</span>
                                                : <span className="text-caption italic text-[var(--color-text-disabled)]">Sem marca</span>
                                            }
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5 flex-shrink-0">
                                        <button
                                            type="button"
                                            className={cardBtnEdit}
                                            title="Editar"
                                            aria-label={`Editar ${p.productName}`}
                                            onClick={() => handleOpenSheet(rawProduct ?? p, { quantity: p.quantity, brand: p.brand })}
                                        >
                                            <Pencil size={14} strokeWidth={2} />
                                        </button>
                                        <button
                                            type="button"
                                            className={cardBtnDelete}
                                            title="Remover"
                                            aria-label={`Remover ${p.productName}`}
                                            onClick={() => handleRemoveProduct(p.productId)}
                                        >
                                            <Trash2 size={14} strokeWidth={2} />
                                        </button>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )
        }
        /* Desktop: mesma lista contínua do catálogo */
        return (
            <ul className={`${productListShellCls} list-none m-0 p-0 mb-3`}>
                {selectedList.map(p => {
                    const isEditing = editingId === p.productId
                    return (
                        <li
                            key={p.productId}
                            className={`${productListRowCls} ${productListDividerCls} transition-[background-color] duration-[160ms] ${isEditing ? 'bg-[var(--color-highlight-lighter)]' : ''}`}
                        >
                            <div className="w-[38px] h-[38px] rounded-[11px] bg-[var(--color-highlight-lighter)] text-[var(--color-accent)] flex items-center justify-center flex-shrink-0">
                                <Package size={20} strokeWidth={2} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-[0.875rem] text-[var(--color-text-heading)] overflow-hidden text-ellipsis whitespace-nowrap">{p.productName}</div>
                                {isEditing ? (
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <input type="number" className={`!w-[70px] ${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`} value={editQty} onChange={e => setEditQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} onFocus={e => e.target.select()} min="1" autoFocus />
                                        <div className="relative w-[80px] flex-shrink-0">
                                            <select className={`${smallInputCls} appearance-none pr-5`} value={editUnit} onChange={e => setEditUnit(e.target.value)}>
                                                {UNIT_OPTIONS.map(u => <option key={u} value={u}>{u}</option>)}
                                            </select>
                                            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                            </span>
                                        </div>
                                        <input type="text" className={`${smallInputCls} max-w-[160px]`} value={editBrand} onChange={e => setEditBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} placeholder="Marca" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                        <span className="text-label font-bold uppercase bg-[var(--color-highlight-soft)] text-[var(--color-accent)] px-2 py-0.5 rounded-full tabular-nums">{p.quantity} {p.unitOfMeasure}</span>
                                        {p.brand
                                            ? <span className="text-label font-semibold border border-[var(--color-border-default)] text-[var(--color-text-secondary)] px-2 py-0.5 rounded-full">{p.brand}</span>
                                            : <span className="text-caption italic text-[var(--color-text-disabled)]">Sem marca</span>
                                        }
                                    </div>
                                )}
                            </div>
                            {isEditing ? (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button type="button" onClick={() => handleConfirmEdit(p.productId)} title="Confirmar" aria-label={`Confirmar edição de ${p.productName}`} className={iconBtnSuccess}><Check size={14} /></button>
                                    <button type="button" onClick={handleCancelEdit} title="Cancelar" aria-label={`Cancelar edição de ${p.productName}`} className={iconBtnDanger}><X size={14} /></button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <button type="button" onClick={() => handleStartEdit(p)} title="Editar" aria-label={`Editar ${p.productName}`} className={cardBtnEdit}><Pencil size={14} strokeWidth={2} /></button>
                                    <button type="button" onClick={() => handleRemoveProduct(p.productId)} title="Remover" aria-label={`Remover ${p.productName}`} className={cardBtnDelete}><Trash2 size={14} strokeWidth={2} /></button>
                                </div>
                            )}
                        </li>
                    )
                })}
            </ul>
        )
    }

    return (
        <div className="md:flex md:flex-col md:flex-1">
            <div className="mb-5">
                <h2 className="m-0 text-title font-bold text-[var(--color-text-body)] tracking-[-0.02em] md:text-[1.75rem] md:font-extrabold md:text-[var(--color-text-heading)]">Produtos</h2>
                <p className="mt-1 mb-0 text-caption text-[var(--color-text-muted)] leading-[1.5]">Selecione os itens e defina as quantidades.</p>
            </div>

            {isMobile ? (
                /* ── Mobile layout: tabs ── */
                <>
                    <div className="step-tabs mb-4">
                        <button
                            className={`step-tab ${mobileTab === 'search' ? 'active' : ''}`}
                            onClick={() => setMobileTab('search')}
                        >
                            Buscar
                        </button>
                        <button
                            className={`step-tab ${mobileTab === 'selected' ? 'active' : ''}`}
                            onClick={() => setMobileTab('selected')}
                        >
                            Selecionados
                            {selectedList.length > 0 && (
                                <span
                                    key={selectedBadgePulse}
                                    className={`step-tab-badge ${selectedBadgePulse > 0 ? 'step-tab-badge--added' : ''}`}
                                    aria-live="polite"
                                >
                                    {selectedList.length}
                                </span>
                            )}
                        </button>
                    </div>

                    {mobileTab === 'search' && renderSearchPanel()}
                    {mobileTab === 'selected' && renderSelectedPanel()}
                </>
            ) : (
                /* ── Desktop layout: duas colunas Catálogo | Selecionados ── */
                <div className="grid gap-6 items-start lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                    <div className="min-w-0">
                        <span className={colLabelCls}>Catálogo</span>
                        {renderSearchPanel()}
                    </div>
                    <div className="min-w-0">
                        <span className={colLabelCls}>
                            Selecionados
                            {selectedList.length > 0 && (
                                <span className={colBadgeCls}>{selectedList.length}</span>
                            )}
                        </span>
                        {renderSelectedPanel()}
                    </div>
                </div>
            )}

            <Alert message={error} />

            <WizardActions
                onBack={onBack}
                onPrimary={handleNextClick}
                primaryLabel="Avançar"
                desktopLabel="Continuar para Fornecedores"
                primaryIcon={ArrowRight}
                blocked={selectedList.length === 0}
                hint="Adicione pelo menos um produto para avançar."
                loading={loading}
            />

            {/* Create product — formulário compartilhado com a listagem de produtos: bottom sheet no mobile, Modal no desktop */}
            {isMobile ? (
                <ProductFormBottomSheet
                    isOpen={showCreateModal}
                    onClose={() => setShowCreateModal(false)}
                    mode="create"
                    title="Criar Produto"
                    onSaveCreate={handleNewProductCreated}
                    departments={userDepts}
                    initialDepartmentId={deptFilter !== null ? String(deptFilter) : ''}
                    successMessage="Produto criado! Agora defina a quantidade."
                />
            ) : (
                <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Criar Produto">
                    <ProductCreate
                        onSave={handleNewProductCreated}
                        onClose={() => setShowCreateModal(false)}
                        departments={userDepts}
                        initialDepartmentId={deptFilter !== null ? String(deptFilter) : ''}
                        successMessage="Produto criado! Agora defina a quantidade."
                    />
                </Modal>
            )}

            {/* Mobile product bottom sheet */}
            <ProductBottomSheet
                isOpen={sheetProduct !== null}
                product={sheetProduct}
                onClose={() => setSheetProduct(null)}
                onConfirm={handleSheetConfirm}
            />
        </div>
    )
}

export default QuotationCreateStep2
