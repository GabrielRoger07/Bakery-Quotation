import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import useCharLimit from '../../hooks/useCharLimit'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Input from '../../components/Input'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { X, Plus, Package, ChevronDown, Pencil, Check } from 'lucide-react'
import { ENV } from '../../config/env'

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
        if (!barcode || !productName) {
            setError("Todos os campos são obrigatórios")
            return
        }
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
            <Input label={"Código do Produto"} type="text" name="productBarCodeNumber" value={barcode} onChange={handleBarcodeChange} onBlur={handleBarcodeBlur} placeholder={"Digite o código do produto"} isInvalid={isBarcodeInvalid} required />
            {barcodeWarning && <div className={warnCls}>{barcodeWarning.type === "too_short" ? `É permitido ter no mínimo ${barcodeWarning.min} caracteres para ${barcodeWarning.fieldName}.` : `É permitido ter no máximo ${barcodeWarning.max} caracteres para ${barcodeWarning.fieldName}.`}</div>}

            <Input label={"Nome do Produto"} type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={"Digite o nome do produto"} isInvalid={isNameInvalid} required />
            {nameWarning && <div className={warnCls}>{nameWarning.type === "too_short" ? `É permitido ter no mínimo ${nameWarning.min} caracteres para ${nameWarning.fieldName}.` : `É permitido ter no máximo ${nameWarning.max} caracteres para ${nameWarning.fieldName}.`}</div>}

            <Input label={"Descrição do Produto"} type="text" name="productDescription" value={productDescription} onChange={handleDescChange} onBlur={handleDescBlur} placeholder={"Digite a descrição do produto"} isInvalid={isDescInvalid} />
            {productDescription && descWarning && <div className={warnCls}>{descWarning.type === "too_short" ? `É permitido ter no mínimo ${descWarning.min} caracteres para ${descWarning.fieldName}.` : `É permitido ter no máximo ${descWarning.max} caracteres para ${descWarning.fieldName}.`}</div>}

            <Alert message={error} />
            {success && <div className="text-[var(--color-success)] font-medium py-2 px-3 bg-[var(--color-success-soft-bg)] rounded-[var(--radius-md)] border border-[var(--color-success-soft-border)] text-center mt-1 text-[0.875rem]">{success}</div>}

            <div className="flex justify-end gap-[0.625rem] mt-5 pt-4 border-t border-[var(--color-border)]">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>Cancelar</Button>
                <Button type="submit" disabled={isDisabled}>{submitting ? "Carregando..." : "Criar"}</Button>
            </div>
        </form>
    )
}

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {
    const { request } = useFetch(ENV.API_BASE_URL)

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

    const [expandedId, setExpandedId] = useState(null)
    const [pendingQty, setPendingQty] = useState("")
    const [pendingBrand, setPendingBrand] = useState("")

    const [editingId, setEditingId] = useState(null)
    const [editQty, setEditQty] = useState("")
    const [editBrand, setEditBrand] = useState("")

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

    const handleExpandProduct = useCallback((product) => {
        if (expandedId === product.productId) {
            setExpandedId(null)
            return
        }
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
            [product.productId]: {
                quantity: qty,
                brand: pendingBrand,
                _product: product
            }
        }))
        setExpandedId(null)
        setPendingQty("")
        setPendingBrand("")
    }, [pendingQty, pendingBrand])

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

    const handleCancelEdit = useCallback(() => {
        setEditingId(null)
    }, [])

    const handleRemoveProduct = useCallback((productId) => {
        setLocalSelected(prev => {
            const next = { ...prev }
            delete next[productId]
            return next
        })
    }, [])

    const handleNewProductCreated = useCallback((newProduct) => {
        setShowCreateModal(false)
        setSearchWord(newProduct.productName)
        setAppliedSearch(newProduct.productName)
        setCurrentPage(0)
        setExpandedId(newProduct.productId)
        setPendingQty("")
        setPendingBrand("")
    }, [])

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

    useEffect(() => {
        onChangeRef.current(selectedList)
    }, [selectedList])

    const handleNextClick = () => {
        if (selectedList.length === 0) {
            setError("Selecione ao menos 1 produto")
            return
        }
        setError("")
        onNext()
    }

    const smallInputCls = 'w-full h-[2.125rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans px-2 text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:0_0_0_2px_var(--color-accent-soft-bg-focus)] placeholder:text-[var(--color-text-disabled)]'
    const iconBtnBase = 'flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms]'
    const iconBtnAccent  = `${iconBtnBase} hover:bg-[var(--color-accent-soft-bg)] hover:text-[var(--color-accent)]`
    const iconBtnDanger  = `${iconBtnBase} hover:bg-[var(--color-danger-soft-bg)] hover:text-[var(--color-danger)]`
    const iconBtnSuccess = `${iconBtnBase} text-[var(--color-success)] hover:bg-[var(--color-success-soft-bg-2)] hover:text-[var(--color-success-strong)]`

    return (
        <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center mt-0 mb-4 text-[var(--color-text-strong)] text-[1.125rem]">Etapa 2: Produtos</h2>

            {/* Search card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <div className="flex gap-2 items-center">
                    <input type="text" value={searchWord} onChange={e => setSearchWord(e.target.value)} placeholder={"Nome do Produto"} onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                        className="flex-1 min-w-0 min-h-[2.375rem] px-[0.875rem] py-[0.4375rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)] placeholder:text-[var(--color-text-disabled)]"
                    />
                    <Button onClick={handleSearch}>Buscar</Button>
                    {appliedSearch && <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>}
                    <div className="w-px h-6 bg-[var(--color-border)] flex-shrink-0 mx-[0.125rem]" />
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="whitespace-nowrap !inline-flex items-center gap-[0.3rem] flex-shrink-0">
                        <Plus size={15} />Novo Produto
                    </Button>
                </div>
            </div>

            {/* Results card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {availableProducts.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">
                        {appliedSearch ? (<>{"Produto não encontrado."}{' '}<button className="bg-none border-none p-0 text-[0.875rem] font-sans font-medium text-[var(--color-accent)] cursor-pointer underline underline-offset-[2px] transition-opacity duration-[160ms] hover:opacity-75" onClick={() => setShowCreateModal(true)}>Criar agora</button></>) : "Nenhum produto disponível"}
                    </p>
                ) : (
                    <div className="border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden mb-1">
                        {availableProducts.map(p => {
                            const isExpanded = expandedId === p.productId
                            return (
                                <div key={p.productId} className="border-b border-[var(--color-border-lighter)] last:border-b-0">
                                    <div onClick={() => handleExpandProduct(p)} className={`flex items-center justify-between px-3 py-[0.6rem] cursor-pointer gap-2 transition-[background-color] duration-[160ms] ${isExpanded ? 'bg-[var(--color-highlight-lighter)]' : 'hover:bg-[var(--color-surface-1)]'}`}>
                                        <div className="flex flex-col min-w-0 flex-1">
                                            <span className="font-medium text-[0.875rem] text-[var(--color-text-strong)] overflow-hidden text-ellipsis whitespace-nowrap">{p.productName}</span>
                                            {p.productDescription && <span className="text-[0.8125rem] text-[var(--color-text-muted)] mt-px">{p.productDescription}</span>}
                                        </div>
                                        <ChevronDown size={16} className={`text-[var(--color-text-muted)] flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                                    </div>
                                    {isExpanded && (
                                        <div className="px-3 py-2 pb-3 bg-[var(--color-highlight-lighter)] border-t border-[var(--color-border-lighter)] flex items-end gap-[0.625rem] [animation:step2ExpandIn_0.15s_ease] max-[768px]:flex-col max-[768px]:items-stretch">
                                            <div className="flex gap-2 flex-1">
                                                <div className="flex flex-col gap-[0.2rem] flex-1">
                                                    <label className="text-[0.6875rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Quantidade *</label>
                                                    <input type="number" className={`${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} value={pendingQty} onChange={e => setPendingQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleAddProduct(p) }} onFocus={e => e.target.select()} placeholder="0" min="0" autoFocus />
                                                </div>
                                                <div className="flex flex-col gap-[0.2rem] flex-1">
                                                    <label className="text-[0.6875rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">Marca</label>
                                                    <input type="text" className={smallInputCls} value={pendingBrand} onChange={e => setPendingBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddProduct(p) }} placeholder={"Marca"} />
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
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchProducts(page)} />
            </div>
            {/* Selected products */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <h4 className="m-0 mb-[0.6rem] text-[var(--color-text-secondary)] text-[0.9375rem] flex items-center gap-[0.4rem]">
                    <Package size={16} />Produtos Adicionados ({selectedList.length})
                </h4>
                {selectedList.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">Nenhum produto adicionado</p>
                ) : (
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
                                                {isEditing ? <input type="number" className={`w-[70px] ${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none`} value={editQty} onChange={e => setEditQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} onFocus={e => e.target.select()} min="1" autoFocus /> : <span className="font-bold [font-variant-numeric:tabular-nums] text-[var(--color-text-primary)]">{p.quantity} UN</span>}
                                            </td>
                                            <td className="px-3 py-2 border-b border-[var(--color-border-lighter)] text-[0.875rem] align-middle">
                                                {isEditing ? <input type="text" className={smallInputCls} value={editBrand} onChange={e => setEditBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} placeholder={"Marca"} /> : p.brand ? <span className="inline-flex items-center gap-1 text-[var(--color-text-strong)] font-light text-[0.8125rem]">{p.brand}</span> : <span className="text-[var(--color-text-disabled)]">—</span>}
                                            </td>
                                            <td className="w-9 px-3 py-2 border-b border-[var(--color-border-lighter)] text-center align-middle">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-[0.2rem]">
                                                        <button onClick={() => handleConfirmEdit(p.productId)} title={"Confirmar"} className={iconBtnSuccess}><Check size={14} /></button>
                                                        <button onClick={handleCancelEdit} title={"Cancelar"} className={iconBtnDanger}><X size={14} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-[0.2rem]">
                                                        <button onClick={() => handleStartEdit(p)} title={"Editar"} className={iconBtnAccent}><Pencil size={13} /></button>
                                                        <button onClick={() => handleRemoveProduct(p.productId)} title={"Remover"} className={iconBtnDanger}><X size={14} /></button>
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

            {error && <Alert message={error} />}

            <div className="flex justify-center gap-3 mt-5 max-[768px]:flex-col max-[768px]:gap-[0.65rem]">
                <Button onClick={onBack} disabled={loading} className="max-[768px]:w-full">Voltar</Button>
                <Button onClick={handleNextClick} disabled={loading} className="max-[768px]:w-full">{loading ? "Carregando..." : "Próximo"}</Button>
            </div>

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={"Criar Novo Produto"}>
                <CreateProductModalForm onSuccess={handleNewProductCreated} onClose={() => setShowCreateModal(false)} request={request} />
            </Modal>
        </div>
    )
}

export default QuotationCreateStep2
