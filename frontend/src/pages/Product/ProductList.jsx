import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import ProductCreate from './ProductCreate'
import ProductEdit from './ProductEdit'
import './ProductList.css'

const ProductList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")

    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState(null)

    const columns = [
        { key: "productId", label: "ID" },
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
    }

    const handleSaveCreate = (newProduct) => {
        setProducts(prev => [...prev, newProduct])
    }

    const handleSaveEdit = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))
    }

    const handleDelete = async (productId) => {
        const res = await request("DELETE", `/products/${productId}`)
        if(res.ok){
            setProducts(prevProducts => prevProducts.filter(p => p.productId !== productId))
            setError("")
        }else{
            setError(res.data?.message || "Failed to delete product")
        }
    }

    const fetchProducts = async () => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj
        const res = await request("GET", `/products/company/${cnpj}`)
        if(res.ok){
            setProducts(res.data);
            setError("")
        }else{
            setError(res.data?.message)
        }
        setStatus(res.status)
    }

    useEffect(() => {
        fetchProducts();
    }, [])

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
            onDelete={handleDelete}
            onAdd={() => setIsCreateModalOpen(true)}
            onReload={fetchProducts}
            emptyMessage="No products found."
        />

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
    </div>
  )
}

export default ProductList