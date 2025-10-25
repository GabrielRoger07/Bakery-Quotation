import { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Modal from '../../components/Modal'
import ProductEdit from '../edit/ProductEdit'
import Table from '../../components/Table'
import './ProductList.css'

const ProductList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState(null)

    const columns = [
        { key: "productId", label: "ID" },
        { key: "productName", label: "Name" },
        { key: "unitOfMeasure", label: "Unit of Measure" }
    ]

    const openEditModal = (product) => {
        setProductToEdit(product)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setProductToEdit(null)
        setIsModalOpen(false)
    }

    const handleSave = (updatedProduct) => {
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

    const createProduct = () => {
        navigate("/create-product")
    }

    useEffect(() => {
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

        fetchProducts();
    }, [request])

    return (
    <div className="product-list-container">
        <Table 
            title="All Products" 
            columns={columns}
            data={products}
            idKey="productId"
            loading={loading}
            onEdit={openEditModal}
            onDelete={handleDelete}
            onAdd={createProduct}
            onReload={() => window.location.reload()}
            emptyMessage="No products found."
        />

        <Modal isOpen={isModalOpen} onClose={closeModal} title="Edit Product">
            <ProductEdit 
                product={productToEdit} 
                onSave={handleSave} 
                onClose={closeModal} 
            />
        </Modal>
    </div>
  )
}

export default ProductList