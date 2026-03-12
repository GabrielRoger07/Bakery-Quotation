import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'
import './QuotationCreate.css'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [availableProducts, setAvailableProducts] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedProducts)
    const [selectedProductId, setSelectedProductId] = useState("")
    const [selectedProduct, setSelectedProduct] = useState(null)
    const [quantity, setQuantity] = useState(1)
    const [bonus, setBonus] = useState(0)
    const [error, setError] = useState("")
    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected, onChange])

    const fetchProducts = useCallback(async (page = 0, field = searchField, word = searchWord) => {
        const excludedIds = localSelected.map(p => p.productId)

        let query = `?page=${page}`
        if(field) query += `&field=${field}`
        if(word) query += `&value=${word}`
        if(excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`

        const res = await request("GET", `/products/company${query}`)

        if(res.ok) {
            setAvailableProducts(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
    }, [request, localSelected, searchField, searchWord])

    useEffect(() => {
        fetchProducts(0, "", "")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        fetchProducts(0)
    }, [localSelected, fetchProducts])

    const handleSearchProducts = () => {
        setCurrentPage(0)
        fetchProducts(0)
    }

    const handleSelectProduct = (product) => {
        setSelectedProductId(product.productId)
        setSelectedProduct(product)
    }

    const handleAddProduct = () => {

        if(!selectedProduct){
            setError(t("quotation_step_2_no_product_selected"))
            return
        }

        const product = availableProducts.find(p => p.productId === selectedProductId)
        if(!product) {
            setError(t("quotation_step_2_invalid_product"))
            return
        }

        if(localSelected.find(p => p.productId === selectedProductId)){
            setError(t("quotation_step_2_product_already_added"))
            return
        }

        if(quantity <= 0) {
            setError(t("quotation_step_2_low_quantity"))
            return
        }
        
        const updatedList = [...localSelected, { ...selectedProduct, quantity: Number(quantity), bonusLimit: Number(bonus)}]
        setLocalSelected(updatedList)
        setSelectedProductId("")
        setSelectedProduct(null)
        setQuantity(1)
        setBonus(0)
        setError("")
    }

    const handleRemoveProduct = (productId) => {
        const updatedList = localSelected.filter(p => p.productId !== productId)
        setLocalSelected(updatedList)
    }

    const handleNextClick = () => {
        if(localSelected.length === 0) {
            setError(t("quotation_step_2_no_selected_product"))
            return
        }

        setError("")
        onChange(localSelected)
        onNext()
    }

    return (
        <div className="step-products">
            <h2>{t("quotation_step_2")}</h2>

            <div className="search-card">
                <div className="search-row">
                    <div className="search-select-wrapper">
                        <select id="searchField" name="searchField" value={searchField} onChange={(e) => setSearchField(e.target.value)} className="custom-select" required >
                            <option value="" disabled>{t("select_field")}</option>
                            <option value="productBarCodeNumber">{t("barcode_number")}</option>
                            <option value="productName">{t("product_name")}</option>
                        </select>
                        <span className="select-arrow"></span>
                    </div>

                    <div className="search-input-wrapper">
                        <Input 
                            type="text"
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            placeholder={t("enter_search")}
                        />
                    </div>
                    <Button onClick={handleSearchProducts} disabled={loading}>{t("search_button")}</Button>
                </div>
            </div>
            
            <div className="results-card">

                {availableProducts.length === 0 ? (
                    <p className="empty-state">{t("no_products_available")}</p>
                ) : (
                    <div className="products-results-list">
                        {availableProducts.map(p => (
                            <div
                                key={p.productId}
                                className={`product-result-item ${
                                    selectedProductId === p.productId ? "selected" : ""
                                }`}
                                onClick={() => handleSelectProduct(p)}
                            >
                                <div className="product-result-main">
                                    <strong>{p.productName}</strong>
                                    <span>{p.productBarCodeNumber}</span>
                                </div>

                                {selectedProductId === p.productId && (
                                    <span className="selected-indicator"></span>
                                )}

                            </div>
                        ))}
                    </div>
                )}

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchProducts(page)}
                />
            </div>

            {selectedProduct && (
                <div className="add-config-card">

                    <div className="selected-product-summary">
                        <span className="summary-label">
                            {t("selected_product")}
                        </span>
                        <strong>
                            {selectedProduct.productBarCodeNumber} - {selectedProduct.productName}
                        </strong>
                    </div>

                    <div className="quantity-bonus-group">
                        <Input 
                            label={t("quantity")}
                            type="number"
                            value={quantity}
                            onChange={e => setQuantity(e.target.value)}
                            min="1"
                            onKeyDown={e => {
                                if(['-', 'e', 'E'].includes(e.key)) e.preventDefault()
                            }}
                        />
                        <Input 
                            label={t("bonus_limit")}
                            type="number"
                            value={bonus}
                            onChange={e => setBonus(e.target.value)}
                            min="0"
                            onKeyDown={e => {
                                if(['-', 'e', 'E'].includes(e.key)) e.preventDefault()
                            }}
                        />
                    </div>
                
                    <Button onClick={handleAddProduct} disabled={loading}>{t("table_add")}</Button>
                </div>
            )}

            {error && <Alert message={error} />}

            <div className="selected-products-card">
                <h4>{t("products_added")} ({localSelected.length})</h4>
                
                {localSelected.length === 0 ? (
                    <p className="empty-state">{t("no_products_added")}</p>
                ) : (
                    <ul>
                        {localSelected.map(p => (
                            <li key={p.productId} className="selected-product-item">
                                <div>
                                    <strong>{p.productName}</strong>
                                    <span>Qtd: {p.quantity} • Bonus: {p.bonusLimit}</span>
                                </div>
                                <Button className="remove-product-btn" onClick={() => handleRemoveProduct(p.productId)}>{t("remove_button")}</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep2