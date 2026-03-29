import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'
import { X } from 'lucide-react'
import { ENV } from '../../config/env'
import './QuotationCreate.css'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [availableProducts, setAvailableProducts] = useState([])
    const [localSelected, setLocalSelected] = useState(() => {
        const map = {}
        selectedProducts.forEach(p => {
            map[p.productId] = { quantity: p.quantity, brand: p.brand || "" }
        })
        return map
    })
    const [error, setError] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const fetchProducts = useCallback(async (page = 0) => {
        let query = `?page=${page}`
        if (appliedSearch) query += `&field=productName&value=${appliedSearch}`

        const res = await request("GET", `/products/company${query}`)
        if (res.ok) {
            setAvailableProducts(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
        }
    }, [request, appliedSearch])

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

    const handleQtyChange = useCallback((product, value) => {
        const qty = Math.max(0, Math.floor(Number(value)) || 0)
        setLocalSelected(prev => {
            const next = { ...prev }
            if (qty === 0) {
                delete next[product.productId]
            } else {
                next[product.productId] = {
                    quantity: qty,
                    brand: prev[product.productId]?.brand || "",
                    _product: product
                }
            }
            return next
        })
    }, [])

    const handleBrandChange = useCallback((product, value) => {
        setLocalSelected(prev => {
            const entry = prev[product.productId]
            if (!entry) return prev
            return {
                ...prev,
                [product.productId]: { ...entry, brand: value, _product: product }
            }
        })
    }, [])

    const handleRemoveProduct = useCallback((productId) => {
        setLocalSelected(prev => {
            const next = { ...prev }
            delete next[productId]
            return next
        })
    }, [])

    const selectedList = useMemo(() => {
        return Object.entries(localSelected).map(([id, entry]) => {
            const product = entry._product
                || availableProducts.find(p => p.productId === Number(id))
                || selectedProducts.find(p => p.productId === Number(id))
            return {
                productId: Number(id),
                productName: product?.productName || "",
                productDescription: product?.productDescription || "",
                quantity: entry.quantity,
                brand: entry.brand
            }
        })
    }, [localSelected, availableProducts, selectedProducts])

    useEffect(() => {
        onChange(selectedList)
    }, [selectedList, onChange])

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
                </div>
            </div>

            <div className="results-card">
                {availableProducts.length === 0 ? (
                    <p className="empty-state">{t("no_products_available")}</p>
                ) : (
                    <div className="step2-product-list">
                        {availableProducts.map(p => {
                            const entry = localSelected[p.productId]
                            const hasQty = entry && entry.quantity > 0
                            return (
                                <div key={p.productId} className={`step2-product-row${hasQty ? " step2-row-active" : ""}`}>
                                    <div className="step2-product-info">
                                        <span className="step2-product-name">{p.productName}</span>
                                        {p.productDescription && (
                                            <span className="step2-product-desc">{p.productDescription}</span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        className="step2-brand-input"
                                        value={entry?.brand || ""}
                                        onChange={e => handleBrandChange(p, e.target.value)}
                                        placeholder={t("brand")}
                                    />
                                    <div className="step2-qty-wrap">
                                        <input
                                            type="number"
                                            className={`step2-qty-input${hasQty ? " step2-qty-active" : ""}`}
                                            value={entry?.quantity || ""}
                                            onChange={e => handleQtyChange(p, e.target.value)}
                                            onFocus={e => e.target.select()}
                                            onKeyDown={e => { if (['-', 'e', 'E'].includes(e.key)) e.preventDefault() }}
                                            placeholder={t("quantity")}
                                            min="0"
                                        />
                                    </div>
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
                <h4>{t("products_added")} ({selectedList.length})</h4>

                {selectedList.length === 0 ? (
                    <p className="empty-state">{t("no_products_added")}</p>
                ) : (
                    <ul className="step2-selected-list">
                        {selectedList.map(p => (
                            <li key={p.productId} className="step2-selected-item">
                                <div className="step2-selected-info">
                                    <strong>{p.productName}</strong>
                                    <span>
                                        {p.quantity} un
                                        {p.brand && ` · ${p.brand}`}
                                    </span>
                                </div>
                                <button
                                    className="step2-remove-btn"
                                    onClick={() => handleRemoveProduct(p.productId)}
                                    title={t("remove_button")}
                                >
                                    <X size={14} />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {error && <Alert message={error} />}

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep2
