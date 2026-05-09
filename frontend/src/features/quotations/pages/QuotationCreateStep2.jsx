import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import useCharLimit from '@/hooks/useCharLimit'
import Button from '@/components/ui/Button'
import Alert from '@/components/ui/Alert'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import { X, Plus, Package, ChevronDown, Pencil, Check } from 'lucide-react'
import { ENV } from '@/config/env'

/* ── Create product inline form (used inside Modal on desktop, Modal on mobile too) ── */
const CreateProductModalForm = ({ onSuccess, onClose, request }) => {
    const { value: barcode, onChange: handleBarcodeChange, onBlur: handleBarcodeBlur, warning: barcodeWarning, isInvalid: isBarcodeInvalid } = useCharLimit(13, "Código do Produto")
    const { value: productName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "Nome do Produto")
    const { value: productDescription, onChange: handleDescChange, onBlur: handleDescBlur, warning: descWarning, isInvalid: isDescInvalid } = useCharLimit(255, "Descrição do Produto")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const isDisabled = barcodeWarning || nameWarning || !barcode || !productName || submitting

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!barcode || !productName) { setError("Todos os campos são obrigatórios"); return }
        setError("")
        setSubmitting(true)
        const res = await request("POST", "/products", {
            productBarCodeNumber: barcode,
            productName,
            productDescription: productDescription || null,
        })
        setSubmitting(false)
        if (res.ok) {
            setSuccess("Produto criado! Agora defina a quantidade.")
            setTimeout(() => onSuccess(res.data), 800)
        } else {
            setError("Não foi possível criar o produto. Por favor tente novamente.")
        }
    }

    const warnCls = "text-[var(--color-warning-text)] text-[0.8125rem] -mt-2 mb-1 px-[0.125rem]"

    return (
        <form className="flex flex-col" onSubmit={handleSubmit}>
            <Input label="Código do Produto" type="text" name="productBarCodeNumber" value={barcode} onChange={handleBarcodeChange} onBlur={handleBarcodeBlur} placeholder="Digite o código do produto" isInvalid={isBarcodeInvalid} required />
            {barcodeWarning && <div className={warnCls}>{barcodeWarning.type === "too_short" ? `Mínimo ${barcodeWarning.min} caracteres.` : `Máximo ${barcodeWarning.max} caracteres.`}</div>}
            
            <Input label="Nome do Produto" type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder="Digite o nome do produto" isInvalid={isNameInvalid} required />
            {nameWarning && <div className={warnCls}>{nameWarning.type === "too_short" ? `Mínimo ${nameWarning.min} caracteres.` : `Máximo ${nameWarning.max} caracteres.`}</div>}
            
            <Input label="Descrição do Produto" type="text" name="productDescription" value={productDescription} onChange={handleDescChange} onBlur={handleDescBlur} placeholder="Digite a descrição do produto" isInvalid={isDescInvalid} />
            {productDescription && descWarning && <div className={warnCls}>{descWarning.type === "too_short" ? `Mínimo ${descWarning.min} caracteres.` : `Máximo ${descWarning.max} caracteres.`}</div>}
            
            <Alert message={error} />
            
            {success && <div className="text-[var(--color-success)] font-medium py-2 px-3 bg-[var(--color-success-soft-bg)] rounded-[var(--radius-md)] border border-[var(--color-success-soft-border)] text-center mt-1 text-[0.875rem]">{success}</div>}
            
            <div className="flex justify-end gap-[0.625rem] mt-5 pt-4 border-t border-[var(--color-border)]">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button type="submit" disabled={isDisabled}>{submitting ? "Carregando..." : "Criar"}</Button>
            </div>
        </form>
    )
}

/* ── Inner form — remounted via key when product changes, so state is always fresh ── */
const ProductSheetForm = ({ product, onClose, onConfirm }) => {
    const [qty, setQty] = useState(product._existingQty != null ? String(product._existingQty) : "")
    const [brand, setBrand] = useState(product._existingBrand ?? "")
    const qtyRef = useRef(null)

    useEffect(() => {
        const t = setTimeout(() => qtyRef.current?.focus(), 340)
        return () => clearTimeout(t)
    }, [])

    const isValid = qty !== "" && Number(qty) > 0

    const handleConfirm = () => {
        if (!isValid) return
        onConfirm({ qty: Math.max(1, Math.floor(Number(qty))), brand })
    }

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
                <div className="psheet-field">
                    <label className="psheet-label">Quantidade *</label>
                    <input
                        ref={qtyRef}
                        type="number"
                        className="psheet-input"
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

    const [availableProducts, setAvailableProducts] = useState([])
    const [localSelected, setLocalSelected] = useState(() => {
        const map = {}
        selectedProducts.forEach(p => {
            map[p.productId] = { quantity: p.quantity, brand: p.brand || "", _product: p }
        })
        return map
    })
    const [error, setError] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    // Desktop: inline expand
    const [expandedId, setExpandedId] = useState(null)
    const [pendingQty, setPendingQty] = useState("")
    const [pendingBrand, setPendingBrand] = useState("")

    // Desktop: inline table edit
    const [editingId, setEditingId] = useState(null)
    const [editQty, setEditQty] = useState("")
    const [editBrand, setEditBrand] = useState("")

    // Mobile: tab ("search" | "selected") + bottom sheet
    const [mobileTab, setMobileTab] = useState("search")
    const [sheetProduct, setSheetProduct] = useState(null)

    const [showCreateModal, setShowCreateModal] = useState(false)

    const excludedIds = useMemo(() => Object.keys(localSelected), [localSelected])

    const fetchProducts = useCallback(async (page = 0) => {
        let query = `?page=${page}&sort=productName,asc`
        if (appliedSearch) query += `&field=productName&value=${appliedSearch}`
        if (excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`
        const res = await request("GET", `/products/company${query}`)
        if (res.ok) {
            setAvailableProducts(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
        }
    }, [request, appliedSearch, excludedIds])

    useEffect(() => {
        fetchProducts(0) // eslint-disable-line react-hooks/set-state-in-effect
    }, [fetchProducts])

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
    }, [expandedId, localSelected])

    const handleAddProduct = useCallback((product) => {
        const qty = Math.max(0, Math.floor(Number(pendingQty)) || 0)
        if (qty === 0) return
        setLocalSelected(prev => ({
            ...prev,
            [product.productId]: { quantity: qty, brand: pendingBrand, _product: product }
        }))
        setExpandedId(null)
        setPendingQty("")
        setPendingBrand("")
    }, [pendingQty, pendingBrand])

    // Desktop table edit
    const handleStartEdit = useCallback((product) => {
        setEditingId(product.productId)
        setEditQty(String(product.quantity))
        setEditBrand(product.brand || "")
    }, [])

    const handleConfirmEdit = useCallback((productId) => {
        const qty = Math.max(1, Math.floor(Number(editQty)) || 1)
        setLocalSelected(prev => {
            const entry = prev[productId]
            if (!entry) return prev
            return { ...prev, [productId]: { ...entry, quantity: qty, brand: editBrand } }
        })
        setEditingId(null)
    }, [editQty, editBrand])

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
        })
    }, [])

    const handleSheetConfirm = useCallback(({ qty, brand }) => {
        if (!sheetProduct) return
        setLocalSelected(prev => ({
            ...prev,
            [sheetProduct.productId]: {
                quantity: qty,
                brand,
                _product: sheetProduct._raw ?? prev[sheetProduct.productId]?._product,
            }
        }))
        setSheetProduct(null)
        // after adding, jump to selected tab so the user sees the item
        setMobileTab("selected")
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
                brand: entry.brand
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

    // shared small input class (desktop table)
    const smallInputCls = 'w-full h-[2.125rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans px-2 text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:0_0_0_2px_var(--color-accent-soft-bg-focus)] placeholder:text-[var(--color-text-disabled)]'
    const iconBtnBase = 'flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms]'
    const iconBtnAccent  = `${iconBtnBase} hover:bg-[var(--color-accent-soft-bg)] hover:text-[var(--color-accent)]`
    const iconBtnDanger  = `${iconBtnBase} hover:bg-[var(--color-danger-soft-bg)] hover:text-[var(--color-danger)]`
    const iconBtnSuccess = `${iconBtnBase} text-[var(--color-success)] hover:bg-[var(--color-success-soft-bg-2)] hover:text-[var(--color-success-strong)]`

    /* ── Search panel (shared between desktop and mobile search tab) ── */
    const renderSearchPanel = () => (
        <>
            {/* Search bar */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <div className="flex gap-2 items-center">
                    <input
                        type="text"
                        value={searchWord}
                        onChange={e => setSearchWord(e.target.value)}
                        placeholder="Nome do Produto"
                        onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                        className="flex-1 min-w-0 min-h-[2.375rem] px-[0.875rem] py-[0.4375rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)] placeholder:text-[var(--color-text-disabled)]"
                    />
                    <Button onClick={handleSearch}>Buscar</Button>
                    {appliedSearch && <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>}
                    <div className="w-px h-6 bg-[var(--color-border)] flex-shrink-0 mx-[0.125rem]" />
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="whitespace-nowrap !inline-flex items-center gap-[0.3rem] flex-shrink-0">
                        <Plus size={15} />Novo
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {availableProducts.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">
                        {appliedSearch ? (
                            <>Produto não encontrado.{' '}
                                <button className="bg-none border-none p-0 text-[0.875rem] font-sans font-medium text-[var(--color-accent)] cursor-pointer underline underline-offset-[2px] transition-opacity duration-[160ms] hover:opacity-75" onClick={() => setShowCreateModal(true)}>Criar agora</button>
                            </>
                        ) : "Nenhum produto disponível"}
                    </p>
                ) : (
                    <>
                        <div className="border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden mb-1">
                            {availableProducts.map(p => {
                                const isExpanded = !isMobile && expandedId === p.productId
                                return (
                                    <div key={p.productId} className="border-b border-[var(--color-border-lighter)] last:border-b-0">
                                        <div
                                            onClick={() => isMobile
                                                ? handleOpenSheet(p, null)
                                                : handleExpandProduct(p)
                                            }
                                            className={`flex items-center justify-between px-3 py-[0.6rem] cursor-pointer gap-2 transition-[background-color] duration-[160ms] ${isExpanded ? 'bg-[var(--color-highlight-lighter)]' : 'hover:bg-[var(--color-surface-1)]'}`}
                                        >
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-medium text-[0.875rem] text-[var(--color-text-strong)] overflow-hidden text-ellipsis whitespace-nowrap">{p.productName}</span>
                                                {p.productDescription && <span className="text-[0.8125rem] text-[var(--color-text-muted)] mt-px">{p.productDescription}</span>}
                                            </div>
                                            {isMobile ? (
                                                <Plus size={16} className="text-[var(--color-accent)] flex-shrink-0" />
                                            ) : (
                                                <ChevronDown size={16} className={`text-[var(--color-text-muted)] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                            )}
                                        </div>
                                        {/* Desktop inline expand */}
                                        {!isMobile && isExpanded && (
                                            <div className="px-3 py-2 pb-3 bg-[var(--color-highlight-lighter)] border-t border-[var(--color-border-lighter)] flex items-end gap-[0.625rem] [animation:step2ExpandIn_0.15s_ease]">
                                                <div className="flex gap-2 flex-1">
                                                    <div className="flex flex-col gap-[0.2rem] flex-1">
                                                        <label className="text-[0.6875rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Quantidade *</label>
                                                        <input type="number" className={`${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} value={pendingQty} onChange={e => setPendingQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleAddProduct(p) }} onFocus={e => e.target.select()} placeholder="0" min="0" autoFocus />
                                                    </div>
                                                    <div className="flex flex-col gap-[0.2rem] flex-1">
                                                        <label className="text-[0.6875rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Marca</label>
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
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchProducts(page)} />
                    </>
                )}
            </div>
        </>
    )

    /* ── Selected products panel ── */
    const renderSelectedPanel = () => (
        <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
            {!isMobile && (
                <h4 className="m-0 mb-[0.6rem] text-[var(--color-text-secondary)] text-[0.9375rem] flex items-center gap-[0.4rem]">
                    <Package size={16} />Produtos Adicionados ({selectedList.length})
                </h4>
            )}
            {selectedList.length === 0 ? (
                <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">Nenhum produto adicionado</p>
            ) : isMobile ? (
                /* Mobile card list */
                <ul className="list-none m-0 p-0 flex flex-col gap-[0.5rem]">
                    {selectedList.map(p => {
                        const rawProduct = localSelected[p.productId]?._product
                        return (
                            <li key={p.productId} className="sel-product-card">
                                <div className="sel-product-icon">
                                    <Package size={18} />
                                </div>
                                <div className="sel-product-body">
                                    <p className="sel-product-name">{p.productName}</p>
                                    <div className="sel-product-meta">
                                        <span className="sel-product-qty">{p.quantity} UN</span>
                                        <span className="sel-product-dot" aria-hidden="true" />
                                        {p.brand
                                            ? <span className="sel-product-brand">{p.brand}</span>
                                            : <span className="sel-product-no-brand">Sem marca</span>
                                        }
                                    </div>
                                </div>
                                <div className="sel-product-actions">
                                    <button
                                        className="sel-product-btn edit"
                                        title="Editar"
                                        onClick={() => handleOpenSheet(rawProduct ?? p, { quantity: p.quantity, brand: p.brand })}
                                    >
                                        <Pencil size={14} />
                                    </button>
                                    <button
                                        className="sel-product-btn remove"
                                        title="Remover"
                                        onClick={() => handleRemoveProduct(p.productId)}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            ) : (
                /* Desktop table */
                <div className="overflow-x-auto border border-[var(--color-border-light)] rounded-[var(--radius-md)]">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr>
                                {["Nome do Produto", "Quantidade", "Marca", ""].map((h, i) => (
                                    <th key={i} className={`bg-[var(--color-surface-2)] text-left px-3 py-2 text-[0.6875rem] font-bold text-[var(--color-text-muted)] uppercase tracking-[0.06em] border-b border-[var(--color-border-light)] ${i === 1 ? 'text-center' : ''}`}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {selectedList.map(p => {
                                const isEditing = editingId === p.productId
                                return (
                                    <tr key={p.productId} className={isEditing ? '[&>td]:bg-[var(--color-highlight-lighter)]' : ''}>
                                        <td className="px-3 py-2 border-b border-[var(--color-border-lighter)] text-[0.875rem] text-[var(--color-text-neutral-strong)] align-middle last:border-b-0"><span className="font-medium text-[var(--color-text-strong)]">{p.productName}</span></td>
                                        <td className="px-3 py-2 border-b border-[var(--color-border-lighter)] text-[0.875rem] align-middle text-center">
                                            {isEditing
                                                ? <input type="number" className={`w-[70px] ${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`} value={editQty} onChange={e => setEditQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} onFocus={e => e.target.select()} min="1" autoFocus />
                                                : <span className="font-bold [font-variant-numeric:tabular-nums] text-[var(--color-text-primary)]">{p.quantity} UN</span>
                                            }
                                        </td>
                                        <td className="px-3 py-2 border-b border-[var(--color-border-lighter)] text-[0.875rem] align-middle">
                                            {isEditing
                                                ? <input type="text" className={smallInputCls} value={editBrand} onChange={e => setEditBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} placeholder="Marca" />
                                                : p.brand ? <span className="text-[var(--color-text-strong)] font-light text-[0.8125rem]">{p.brand}</span> : <span className="text-[var(--color-text-disabled)]">—</span>
                                            }
                                        </td>
                                        <td className="w-9 px-3 py-2 border-b border-[var(--color-border-lighter)] text-center align-middle">
                                            {isEditing ? (
                                                <div className="flex items-center gap-[0.2rem]">
                                                    <button onClick={() => handleConfirmEdit(p.productId)} title="Confirmar" className={iconBtnSuccess}><Check size={14} /></button>
                                                    <button onClick={handleCancelEdit} title="Cancelar" className={iconBtnDanger}><X size={14} /></button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-[0.2rem]">
                                                    <button onClick={() => handleStartEdit(p)} title="Editar" className={iconBtnAccent}><Pencil size={13} /></button>
                                                    <button onClick={() => handleRemoveProduct(p.productId)} title="Remover" className={iconBtnDanger}><X size={14} /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )

    return (
        <div>
            <div className="mb-5">
                <h2 className="m-0 text-[1.0625rem] font-bold text-[var(--color-text-strong)] tracking-[-0.015em]">Produtos</h2>
                <p className="mt-1 mb-0 text-[0.8125rem] text-[var(--color-text-muted)] leading-[1.5]">Selecione os produtos que serão cotados e defina as quantidades.</p>
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
                                <span className="step-tab-badge">{selectedList.length}</span>
                            )}
                        </button>
                    </div>

                    {mobileTab === 'search' && renderSearchPanel()}
                    {mobileTab === 'selected' && renderSelectedPanel()}
                </>
            ) : (
                /* ── Desktop layout: stacked ── */
                <>
                    {renderSearchPanel()}
                    {renderSelectedPanel()}
                </>
            )}

            {error && 
                <div className="flex justify-center gap-3 mt-4">
                    <Alert message={error} />
                </div>
            }

            <div className="flex justify-center gap-3 mt-5">
                <Button onClick={onBack} disabled={loading} className="max-[768px]:w-full">Voltar</Button>
                <Button onClick={handleNextClick} disabled={loading} className="max-[768px]:w-full">{loading ? "Carregando..." : "Próximo"}</Button>
            </div>

            {/* Create product modal */}
            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Criar Novo Produto">
                <CreateProductModalForm onSuccess={handleNewProductCreated} onClose={() => setShowCreateModal(false)} request={request} />
            </Modal>

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
