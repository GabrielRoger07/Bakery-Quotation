import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'

const QuotationCreateStep2 = ({ selectedProducts, onChange, onNext, onBack, loading }) => {

    const { t } = useTranslation()

    const { request } = useFetch(ENV.API_BASE_URL)
    const [availableProducts, setAvailableProducts] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedProducts)
    const [selectedProductId, setSelectedProductId] = useState("")
    const [quantity, setQuantity] = useState(1)
    const [bonus, setBonus] = useState(0)
    const [error, setError] = useState("")
    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected])

    const fetchProducts = async (page = 0) => {

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const excludedIds = localSelected.map(p => p.productId)

        let query = `?page=${page}`
        if(searchField) query += `&field=${searchField}`
        if(searchWord) query += `&value=${searchWord}`
        if(excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`

        const res = await request("GET", `/products/company/${cnpj}${query}`)

        if(res.ok) {
            setAvailableProducts(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
    }

    const handleSearchProducts = () => {
        setCurrentPage(0)
        fetchProducts(0)
    }

    const handleAddProduct = () => {

        if(!selectedProductId){
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
        
        const updatedList = [...localSelected, { ...product, quantity: Number(quantity), bonusLimit: Number(bonus)}]
        setLocalSelected(updatedList)
        setSelectedProductId("")
        setQuantity(1)
        setBonus(0)
        setError("")

        fetchProducts(currentPage)
    }

    const handleRemoveProduct = (productId) => {
        const updatedList = localSelected.filter(p => p.productId !== productId)
        setLocalSelected(updatedList)

        fetchProducts(currentPage)
    }

    const handleNextClick = () => {
        if(localSelected.length === 0) {
            setError("quotation_step_2_no_selected_product")
            return
        }

        setError("")
        onChange(localSelected)
        onNext()
    }

    return (
        <div className="step-products">
            <h2>{t("quotation_step_2")}</h2>

            <div className="select-wrapper">
                <select id="searchField" name="searchField" value={searchField} onChange={(e) => setSearchField(e.target.value)} className="custom-select" required >
                    <option value="" disabled>{t("select_field")}</option>
                    <option value="productBarCodeNumber">{t("barcode_number")}</option>
                    <option value="productName">{t("product_name")}</option>
                </select>
                <span className="select-arrow"></span>
            </div>

            <Input 
                label={t("quantity")}
                type="text"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={t("enter_search")}
            />

            <Button onClick={handleSearchProducts} disabled={loading}>{t("search_button")}</Button>
            
            <div className="product-add-form">
                <select value={selectedProductId} onChange={e => setSelectedProductId(Number(e.target.value))} className="custom-select">
                    
                    <option value="" disabled>
                        {availableProducts.length === 0 ? t("no_products_available") : t("select_field")}
                    </option>

                    {availableProducts.map(p => (
                        <option key={p.productId} value={p.productId}>
                            {p.productBarCodeNumber} - {p.productName}
                        </option>
                    ))}
                </select>

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchProducts(page)}
                />

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

            {error && <Alert message={error} />}

            <div className="selected-products">
                <h3>{t("products_added")} ({localSelected.length})</h3>
                <ul>
                    {localSelected.map(p => (
                        <li key={p.productId} className="selected-product-item">
                            {p.productName} - Qtd: {p.quantity} | Bonus: {p.bonusLimit}
                            <Button className="remove-product-btn" onClick={() => handleRemoveProduct(p.productId)}>{t("remove_button")}</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep2