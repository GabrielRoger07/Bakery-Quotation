import React, { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Button from '../../components/Button'
import { useNavigate } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import Modal from '../../components/Modal'
import ProductEdit from '../edit/ProductEdit'

const ProductList = () => {

    const { request, loading } = useFetch("http://localhost:8080/api/v1")
    const navigate = useNavigate();

    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState(null)

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
        <h1>All Products</h1>

        {loading && <p>Loading products...</p>}
        {error && <Alert message={error} />}
        {status === 0 && <Alert message="Server Internal Error" />}
        {!loading && !error && status !== 0 && products.length === 0 && <p>No products found.</p>}

        {console.log(products)}

        <div className='product-list'>
            <ul>
                {products.map((product) => (
                    <li key={product.productId} className="product-card">Name: {product.productName} - Unit of Measure: {product.unitOfMeasure}
                    <Button onClick={() => openEditModal(product)}>Edit</Button>
                    <Button onClick={() => handleDelete(product.productId)}>Delete</Button>
                    </li>
                ))}
            </ul>
        </div>

        <Button onClick={() => window.location.reload()}>Reload</Button>
        <Button onClick={() => createProduct()}>Add Product</Button>

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