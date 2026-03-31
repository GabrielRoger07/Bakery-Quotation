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
import './QuotationCreate.css'

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

    return (
        <form className="step2-modal-form" onSubmit={handleSubmit}>
            <Input
                label={t("barcode_number")}
                type="text"
                name="productBarCodeNumber"
                value={barcode}
                onChange={handleBarcodeChange}
                onBlur={handleBarcodeBlur}
                placeholder={t("enter_barcode_number")}
                isInvalid={isBarcodeInvalid}
                required
            />
            {barcodeWarning && (
                <div className="step2-modal-warning">
                    {barcodeWarning.type === "too_short" && t("char_limit_too_short", { min: barcodeWarning.min, field: t(barcodeWarning.fieldName) })}
                    {barcodeWarning.type === "too_long" && t("char_limit_too_long", { max: barcodeWarning.max, field: t(barcodeWarning.fieldName) })}
                </div>
            )}

            <Input
                label={t("product_name")}
                type="text"
                name="productName"
                value={productName}
                onChange={handleNameChange}
                onBlur={handleNameBlur}
                placeholder={t("enter_product_name")}
                isInvalid={isNameInvalid}
                required
            />
            {nameWarning && (
                <div className="step2-modal-warning">
                    {nameWarning.type === "too_short" && t("char_limit_too_short", { min: nameWarning.min, field: t(nameWarning.fieldName) })}
                    {nameWarning.type === "too_long" && t("char_limit_too_long", { max: nameWarning.max, field: t(nameWarning.fieldName) })}
                </div>
            )}

            <Input
                label={t("product_description")}
                type="text"
                name="productDescription"
                value={productDescription}
                onChange={handleDescChange}
                onBlur={handleDescBlur}
                placeholder={t("enter_product_description")}
                isInvalid={isDescInvalid}
            />
            {productDescription && descWarning && (
                <div className="step2-modal-warning">
                    {descWarning.type === "too_short" && t("char_limit_too_short", { min: descWarning.min, field: t(descWarning.fieldName) })}
                    {descWarning.type === "too_long" && t("char_limit_too_long", { max: descWarning.max, field: t(descWarning.fieldName) })}
                </div>
            )}

            <Alert message={error} />
            {success && <div className="step2-modal-success">{success}</div>}

            <div className="step2-modal-actions">
                <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
                    {t("cancel_button")}
                </Button>
                <Button type="submit" disabled={isDisabled}>
                    {submitting ? t("loading_message") : t("create_button")}
                </Button>
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

    return (
        <div className="step-products">
            <h2>{t("quotation_step_2")}</h2>

            <div className="search-card">
                <div className="step2-search-row">
                    <input
                        type="text"
                        className="toolbar-input"
                        value={searchWord}
                        onChange={e => setSearchWord(e.target.value)}
                        placeholder={t("product_name")}
                        onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                    />
                    <Button onClick={handleSearch}>{t("search_button")}</Button>
                    {appliedSearch && (
                        <Button variant="danger" onClick={handleClearSearch}><X size={16} /></Button>
                    )}
                    <div className="step2-search-divider" />
                    <Button
                        variant="secondary"
                        onClick={() => setShowCreateModal(true)}
                        className="step2-new-product-btn"
                    >
                        <Plus size={15} />
                        {t("create_new_product")}
                    </Button>
                </div>
            </div>

            <div className="results-card">
                {availableProducts.length === 0 ? (
                    <p className="empty-state">
                        {appliedSearch ? (
                            <>
                                {t("product_not_found_prompt")}{' '}
                                <button
                                    className="step2-create-product-link"
                                    onClick={() => setShowCreateModal(true)}
                                >
                                    {t("create_product_inline_link")}
                                </button>
                            </>
                        ) : (
                            t("no_products_available")
                        )}
                    </p>
                ) : (
                    <div className="step2-product-list">
                        {availableProducts.map(p => {
                            const isExpanded = expandedId === p.productId
                            return (
                                <div key={p.productId} className="step2-product-entry">
                                    <div
                                        className={`step2-product-row${isExpanded ? " step2-row-expanded" : ""}`}
                                        onClick={() => handleExpandProduct(p)}
                                    >
                                        <div className="step2-product-info">
                                            <span className="step2-product-name">{p.productName}</span>
                                            {p.productDescription && (
                                                <span className="step2-product-desc">{p.productDescription}</span>
                                            )}
                                        </div>
                                        <div className="step2-row-right">
                                            <ChevronDown size={16} className={`step2-chevron${isExpanded ? " step2-chevron-open" : ""}`} />
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="step2-expand-form">
                                            <div className="step2-expand-fields">
                                                <div className="step2-expand-field">
                                                    <label>{t("quantity")} *</label>
                                                    <input
                                                        type="number"
                                                        className="step2-qty-input"
                                                        value={pendingQty}
                                                        onChange={e => setPendingQty(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (['-', 'e', 'E'].includes(e.key)) e.preventDefault()
                                                            if (e.key === "Enter") handleAddProduct(p)
                                                        }}
                                                        onFocus={e => e.target.select()}
                                                        placeholder="0"
                                                        min="0"
                                                        autoFocus
                                                    />
                                                </div>
                                                <div className="step2-expand-field">
                                                    <label>{t("brand")}</label>
                                                    <input
                                                        type="text"
                                                        className="step2-brand-input"
                                                        value={pendingBrand}
                                                        onChange={e => setPendingBrand(e.target.value)}
                                                        onKeyDown={e => { if (e.key === "Enter") handleAddProduct(p) }}
                                                        placeholder={t("brand")}
                                                    />
                                                </div>
                                            </div>
                                            <Button onClick={() => handleAddProduct(p)} disabled={!pendingQty || Number(pendingQty) <= 0}>
                                                <Plus size={15} />
                                                {t("add_button")}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchProducts(page)}
                />
            </div>

            <div className="selected-products-card">
                <h4>
                    <Package size={16} />
                    {t("products_added")} ({selectedList.length})
                </h4>

                {selectedList.length === 0 ? (
                    <p className="empty-state">{t("no_products_added")}</p>
                ) : (
                    <div className="step2-table-wrap">
                        <table className="step2-table">
                            <thead>
                                <tr>
                                    <th>{t("product_name")}</th>
                                    <th className="step2-th-center">{t("quantity")}</th>
                                    <th>{t("brand")}</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedList.map(p => {
                                    const isEditing = editingId === p.productId
                                    return (
                                        <tr key={p.productId} className={isEditing ? "step2-row-editing" : ""}>
                                            <td>
                                                <span className="step2-table-name">{p.productName}</span>
                                            </td>
                                            <td className="step2-td-center">
                                                {isEditing ? (
                                                    <input
                                                        type="number"
                                                        className="step2-table-edit-input step2-table-edit-qty"
                                                        value={editQty}
                                                        onChange={e => setEditQty(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (['-', 'e', 'E'].includes(e.key)) e.preventDefault()
                                                            if (e.key === "Enter") handleConfirmEdit(p.productId)
                                                            if (e.key === "Escape") handleCancelEdit()
                                                        }}
                                                        onFocus={e => e.target.select()}
                                                        min="1"
                                                        autoFocus
                                                    />
                                                ) : (
                                                    <span className="step2-table-qty">{p.quantity} UN</span>
                                                )}
                                            </td>
                                            <td>
                                                {isEditing ? (
                                                    <input
                                                        type="text"
                                                        className="step2-table-edit-input"
                                                        value={editBrand}
                                                        onChange={e => setEditBrand(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === "Enter") handleConfirmEdit(p.productId)
                                                            if (e.key === "Escape") handleCancelEdit()
                                                        }}
                                                        placeholder={t("brand")}
                                                    />
                                                ) : (
                                                    p.brand ? (
                                                        <span className="step2-table-brand">{p.brand}</span>
                                                    ) : (
                                                        <span className="step2-table-no-brand">—</span>
                                                    )
                                                )}
                                            </td>
                                            <td className="step2-td-action">
                                                {isEditing ? (
                                                    <div className="step2-action-btns">
                                                        <button
                                                            className="step2-confirm-btn"
                                                            onClick={() => handleConfirmEdit(p.productId)}
                                                            title={t("confirm_button")}
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                        <button
                                                            className="step2-remove-btn"
                                                            onClick={handleCancelEdit}
                                                            title={t("cancel_button")}
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="step2-action-btns">
                                                        <button
                                                            className="step2-edit-btn"
                                                            onClick={() => handleStartEdit(p)}
                                                            title={t("edit_button")}
                                                        >
                                                            <Pencil size={13} />
                                                        </button>
                                                        <button
                                                            className="step2-remove-btn"
                                                            onClick={() => handleRemoveProduct(p.productId)}
                                                            title={t("remove_button")}
                                                        >
                                                            <X size={14} />
                                                        </button>
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

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>

            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title={t("create_product_modal_title")}
            >
                <CreateProductModalForm
                    onSuccess={handleNewProductCreated}
                    onClose={() => setShowCreateModal(false)}
                    request={request}
                />
            </Modal>
        </div>
    )
}

export default QuotationCreateStep2
