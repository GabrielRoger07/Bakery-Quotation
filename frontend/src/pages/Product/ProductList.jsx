import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import ProductCreate from './ProductCreate'
import ProductEdit from './ProductEdit'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import './ProductList.css'
import { ENV } from '../../config/env'

const ProductList = () => {
    
    const { t } = useTranslation()

    const { request, loading } = useFetch(ENV.API_BASE_URL)

    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [productToRemove, setProductToRemove] = useState(null)

    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    const [sortField, setSortField] = useState(null)
    const [sortDirection, setSortDirection] = useState("asc")

    const [searchWord, setSearchWord] = useState("")
    const [appliedSearch, setAppliedSearch] = useState({ field: "", word: "" })

    const columns = [
        { key: "productBarCodeNumber", label: t("barcode_number") },
        { key: "productName", label: t("product_name") },
        { key: "productDescription", label: t("product_description")},
    ]

    const openEditModal = (product) => {
        setProductToEdit(product)
        setIsEditModalOpen(true)
    }

    const closeModals = () => {
        setProductToEdit(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
        setConfirmOpen(false)
        setProductToRemove(null)
    }

    const handleSaveCreate = () => {
        fetchProducts()
    }

    const handleSaveEdit = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))
    }

    const requestRemove = (productId) => {
        const product = products.find(p => p.productId === productId)
        setProductToRemove(product)
        setConfirmOpen(true)
    }

    const confirmRemove = async () => {

        if(!productToRemove) return

        const res = await request("DELETE", `/products/${productToRemove.productId}`)
        if(res.ok){
            fetchProducts(currentPage)
            setError("")
        }else{
            setError(t("delete_product_error"))
        }
        closeModals()
    }

    const fetchProducts = useCallback(async (page = 0) => {

        let query = `?page=${page}`
        if(sortField) query += `&sort=${sortField},${sortDirection}`
        if(appliedSearch.field) query += `&field=${appliedSearch.field}`
        if(appliedSearch.word) query += `&value=${appliedSearch.word}`

        const res = await request("GET", `/products/company${query}`)

        if(res.ok){
            setProducts(res.data.content);
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }, [request, sortField, sortDirection, appliedSearch])

    const handleSearch = useCallback(() => {
        setCurrentPage(0)
        setAppliedSearch({ field: "productName", word: searchWord })
    }, [searchWord])

    const handleColumnSort = (columnKey) => {
        if(sortField === columnKey){
            setSortDirection(prev => (prev === "asc" ? "desc" : "asc"))
        } else {
            setSortField(columnKey)
            setSortDirection("asc")
        }

        setCurrentPage(0)
    }

    useEffect(() => {
        fetchProducts(currentPage);
    }, [fetchProducts, currentPage])

    const filterToolbar = useMemo(() => (
        <>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={t("product_name")}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <Button onClick={handleSearch} disabled={loading}>{t("search_button")}</Button>
        </>
    ), [searchWord, handleSearch, loading, t])

    return (
    <div className="product-list-container">
        {error && <Alert message={error}/>}
        {status === 0 && <Alert message={t("server_internal_error")} />}

        <Table
            title={t("products_title_list")}
            columns={columns}
            data={products}
            idKey="productId"
            loading={loading}
            onEdit={openEditModal}
            onDelete={requestRemove}
            onAdd={() => setIsCreateModalOpen(true)}
            onReload={() => fetchProducts(currentPage)}
            onSort={handleColumnSort}
            sortField={sortField}
            sortDirection={sortDirection}
            emptyMessage={t("products_empty")}
            toolbar={filterToolbar}
            filterActive={appliedSearch.word !== ""}
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage}/>

        <Modal isOpen={isEditModalOpen} onClose={closeModals} title={t("products_title_edit")}>
            <ProductEdit 
                product={productToEdit} 
                onSave={handleSaveEdit} 
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={t("products_title_create")}>
            <ProductCreate
                onSave={handleSaveCreate} 
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={confirmOpen} onClose={closeModals} title={t("confirm_removal")}>
            <div className="confirm-container">
                <p className="confirm-message"><Trans i18nKey="product_remove_confirm" values={{product: productToRemove?.productName}} components={{strong: <strong />}}/></p>
                <div className="confirm-buttons">
                    <Button onClick={closeModals}>{t("cancel_button")}</Button>
                    <Button onClick={confirmRemove} disabled={loading}>{t("confirm_button")}</Button>
                </div>
            </div>

        </Modal>
    </div>
  )
}

export default ProductList