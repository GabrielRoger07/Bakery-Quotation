import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
    const { t } = useTranslation()

    const { value: barcode, onChange: handleBarcodeChange, onBlur: handleBarcodeBlur, warning: barcodeWarning, isInvalid: isBarcodeInvalid } = useCharLimit(13, "barcode_number")
    const { value: productName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(60, "product_name")
    const { value: productDescription, onChange: handleDescChange, onBlur: handleDescBlur, warning: descWarning, isInvalid: isDescInvalid } = useCharLimit(255, "product_description")

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [submitting, setSubmitting] = useState(false)

    const isDisabled = barcodeWarning || nameWarning || !barcode || !productName || submitting

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!barcode || !productName) {
            setError(t("all_fields_required"))
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
            setSuccess(t("product_created_added"))
            setTimeout(() => onSuccess(res.data), 800)
        } else {
            setError(t("product_created_error"))
        }
    }

    const warnCls = "text-[#b45309] text-[0.8125rem] -mt-2 mb-1 px-[0.125rem]"

    return (
        <form className="flex flex-col" onSubmit={handleSubmit}>
            <Input label={t("barcode_number")} type="text" name="productBarCodeNumber" value={barcode} onChange={handleBarcodeChange} onBlur={handleBarcodeBlur} placeholder={t("enter_barcode_number")} isInvalid={isBarcodeInvalid} required />
            {barcodeWarning && <div className={warnCls}>{barcodeWarning.type === "too_short" ? t("char_limit_too_short", { min: barcodeWarning.min, field: t(barcodeWarning.fieldName) }) : t("char_limit_too_long", { max: barcodeWarning.max, field: t(barcodeWarning.fieldName) })}</div>}

            <Input label={t("product_name")} type="text" name="productName" value={productName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={t("enter_product_name")} isInvalid={isNameInvalid} required />
            {nameWarning && <div className={warnCls}>{nameWarning.type === "too_short" ? t("char_limit_too_short", { min: nameWarning.min, field: t(nameWarning.fieldName) }) : t("char_limit_too_long", { max: nameWarning.max, field: t(nameWarning.fieldName) })}</div>}

            <Input label={t("product_description")} type="text" name="productDescription" value={productDescription} onChange={handleDescChange} onBlur={handleDescBlur} placeholder={t("enter_product_description")} isInvalid={isDescInvalid} />
            {productDescription && descWarning && <div className={warnCls}>{descWarning.type === "too_short" ? t("char_limit_too_short", { min: descWarning.min, field: t(descWarning.fieldName) }) : t("char_limit_too_long", { max: descWarning.max, field: t(descWarning.fieldName) })}</div>}

            <Alert message={error} />
            {success && <div className="text-[var(--color-success)] font-medium py-2 px-3 bg-[rgba(5,150,105,0.08)] rounded-[var(--radius-md)] border border-[rgba(5,150,105,0.2)] text-center mt-1 text-[0.875rem]">{success}</div>}

            <div className="flex justify-end gap-[0.625rem] mt-5 pt-4 border-t border-[var(--color-border)]">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>{t("cancel_button")}</Button>
                <Button type="submit" disabled={isDisabled}>{submitting ? t("loading_message") : t("create_button")}</Button>
            </div>
        </form>
    )
}

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {
    const { t } = useTranslation()
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
        fetchProducts(0)
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
            setError(t("quotation_step_2_no_selected_product"))
            return
        }
        setError("")
        onNext()
    }

    const smallInputCls = 'w-full h-[2.125rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans px-2 text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:0_0_0_2px_rgba(109,40,217,0.12)] placeholder:text-[var(--color-text-disabled)]'
    const iconBtnCls = (color) => `flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms] hover:bg-[${color}] hover:text-[var(--color-${color === 'rgba(220,38,38,0.08)' ? 'danger' : color === 'rgba(91,33,182,0.08)' ? 'accent' : 'success'})]`

    return (
        <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center mt-0 mb-4 text-[var(--color-text-strong)] text-[1.125rem]">{t("quotation_step_2")}</h2>

            {/* Search card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <div className="flex gap-2 items-center">
                    <input type="text" value={searchWord} onChange={e => setSearchWord(e.target.value)} placeholder={t("product_name")} onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                        className="flex-1 min-w-0 min-h-[2.375rem] px-[0.875rem] py-[0.4375rem] border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] font-sans text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)] placeholder:text-[var(--color-text-disabled)]"
                    />
                    <Button onClick={handleSearch}>{t("search_button")}</Button>
                    {appliedSearch && <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>}
                    <div className="w-px h-6 bg-[var(--color-border)] flex-shrink-0 mx-[0.125rem]" />
                    <Button variant="secondary" onClick={() => setShowCreateModal(true)} className="whitespace-nowrap !inline-flex items-center gap-[0.3rem] flex-shrink-0">
                        <Plus size={15} />{t("create_new_product")}
                    </Button>
                </div>
            </div>

            {/* Results card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {availableProducts.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">
                        {appliedSearch ? (<>{t("product_not_found_prompt")}{' '}<button className="bg-none border-none p-0 text-[0.875rem] font-sans font-medium text-[var(--color-accent)] cursor-pointer underline underline-offset-[2px] transition-opacity duration-[160ms] hover:opacity-75" onClick={() => setShowCreateModal(true)}>{t("create_product_inline_link")}</button></>) : t("no_products_available")}
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
                                                    <label className="text-[0.6875rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">{t("quantity")} *</label>
                                                    <input type="number" className={`${smallInputCls} text-center [font-variant-numeric:tabular-nums] appearance-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`} value={pendingQty} onChange={e => setPendingQty(e.target.value)} onKeyDown={e => { if (['-','e','E'].includes(e.key)) e.preventDefault(); if (e.key === "Enter") handleAddProduct(p) }} onFocus={e => e.target.select()} placeholder="0" min="0" autoFocus />
                                                </div>
                                                <div className="flex flex-col gap-[0.2rem] flex-1">
                                                    <label className="text-[0.6875rem] font-semibold text-[var(--color-text-muted)] uppercase tracking-[0.05em]">{t("brand")}</label>
                                                    <input type="text" className={smallInputCls} value={pendingBrand} onChange={e => setPendingBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddProduct(p) }} placeholder={t("brand")} />
                                                </div>
                                            </div>
                                            <Button onClick={() => handleAddProduct(p)} disabled={!pendingQty || Number(pendingQty) <= 0} className="flex-shrink-0 flex items-center gap-[0.3rem] whitespace-nowrap">
                                                <Plus size={15} />{t("add_button")}
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
                    <Package size={16} />{t("products_added")} ({selectedList.length})
                </h4>
                {selectedList.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">{t("no_products_added")}</p>
                ) : (
                    <div className="overflow-x-auto border border-[var(--color-border-light)] rounded-[var(--radius-md)]">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    {[t("product_name"), t("quantity"), t("brand"), ""].map((h, i) => (
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
                                                {isEditing ? <input type="text" className={smallInputCls} value={editBrand} onChange={e => setEditBrand(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleConfirmEdit(p.productId); if (e.key === "Escape") handleCancelEdit() }} placeholder={t("brand")} /> : p.brand ? <span className="inline-flex items-center gap-1 text-[var(--color-text-strong)] font-light text-[0.8125rem]">{p.brand}</span> : <span className="text-[var(--color-text-disabled)]">—</span>}
                                            </td>
                                            <td className="w-9 px-3 py-2 border-b border-[var(--color-border-lighter)] text-center align-middle">
                                                {isEditing ? (
                                                    <div className="flex items-center gap-[0.2rem]">
                                                        <button onClick={() => handleConfirmEdit(p.productId)} title={t("confirm_button")} className="flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-success)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms] hover:bg-[rgba(5,150,105,0.1)] hover:text-[var(--color-success-strong)]"><Check size={14} /></button>
                                                        <button onClick={handleCancelEdit} title={t("cancel_button")} className="flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms] hover:bg-[rgba(220,38,38,0.08)] hover:text-[var(--color-danger)]"><X size={14} /></button>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-[0.2rem]">
                                                        <button onClick={() => handleStartEdit(p)} title={t("edit_button")} className="flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms] hover:bg-[rgba(91,33,182,0.08)] hover:text-[var(--color-accent)]"><Pencil size={13} /></button>
                                                        <button onClick={() => handleRemoveProduct(p.productId)} title={t("remove_button")} className="flex-shrink-0 w-[26px] h-[26px] border-none bg-transparent text-[var(--color-text-muted)] cursor-pointer rounded-[var(--radius-sm)] inline-grid place-items-center transition-[background-color,color] duration-[160ms] hover:bg-[rgba(220,38,38,0.08)] hover:text-[var(--color-danger)]"><X size={14} /></button>
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
                <Button onClick={onBack} disabled={loading} className="max-[768px]:w-full">{t("back_button")}</Button>
                <Button onClick={handleNextClick} disabled={loading} className="max-[768px]:w-full">{loading ? t("loading_message") : t("next_button")}</Button>
            </div>

            <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title={t("create_product_modal_title")}>
                <CreateProductModalForm onSuccess={handleNewProductCreated} onClose={() => setShowCreateModal(false)} request={request} />
            </Modal>
        </div>
    )
}

export default QuotationCreateStep2
