import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
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

    const columns = [
        { key: "productBarCodeNumber", label: "Barcode Number" },
        { key: "productName", label: "Name" },
        { key: "unitOfMeasure", label: "Unit of Measure" }
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
            setError(res.data?.message || "Failed to delete product")
        }
        closeModals()
    }

    const fetchProducts = async (page = 0) => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        let sortQuery = ""
        if(sortField) {
            sortQuery = `&sort=${sortField},${sortDirection}`
        }

        const res = await request("GET", `/products/company/${cnpj}?page=${page}${sortQuery}`)
        if(res.ok){
            setProducts(res.data.content);
            setTotalPages(res.data.totalPages)
            setCurrentPage(res.data.number)
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }

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
    }, [sortField, sortDirection, currentPage])

    return (
    <div className="product-list-container">
        {error && <Alert message={error}/>}
        {status === 0 && <Alert message="Server Internal Error" />}

        <Table 
            title="All Products" 
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
            emptyMessage="No products found."
        />

        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(page) => fetchProducts(page)}/>

        <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Edit Product">
            <ProductEdit 
                product={productToEdit} 
                onSave={handleSaveEdit} 
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={isCreateModalOpen} onClose={closeModals} title="Create Product">
            <ProductCreate
                onSave={handleSaveCreate} 
                onClose={closeModals} 
            />
        </Modal>

        <Modal isOpen={confirmOpen} onClose={closeModals} title="Confirm Removal">
            <div className="confirm-container">
                <p className="confirm-message">Are you sure you want to remove product <strong>{productToRemove?.productName}</strong>?</p>
                <div className="confirm-buttons">
                    <Button onClick={closeModals}>Cancel</Button>
                    <Button onClick={confirmRemove} disabled={loading}>Confirm</Button>
                </div>
            </div>

        </Modal>
    </div>
  )
}

export default ProductList