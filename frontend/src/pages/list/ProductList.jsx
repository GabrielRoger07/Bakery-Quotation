import React, { useEffect, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Alert from '../../components/Alert'
import Button from '../../components/Button'

const ProductList = () => {

    const { request, loading, errors } = useFetch("http://localhost:8080/api/v1")
    
    const [products, setProducts] = useState([])
    const [error, setError] = useState("")

    const handleDelete = async (productId) => {
        const res = await request("DELETE", `/products/${productId}`)
        if(res.ok){
            setProducts(prevProducts => prevProducts.filter(p => p.productId !== productId))
            setError("")
        }else{
            setError(res.data?.message || "Failed to delete product")
        }
    }

    useEffect(() => {
        const fetchProducts = async () => {
            const res = await request("GET", "/products")
            if(res.ok){
                setProducts(res.data);
                setError("")
                console.log("ola")
            }else{
                setError(res.data?.message)
            }
        }

        fetchProducts();
    }, [request])

    return (
    <div className="product-list-container">
        <h1>All Products</h1>

        {loading && <p>Loading products...</p>}
        {error && <Alert message={error} />}
        {!loading && !error && products.length === 0 && <p>No products found.</p>}

        {console.log(products)}
        {console.log("oi")}

        <div className='product-list'>
            <ul>
                {products.map((product) => (
                    <li key={product.productId} className="product-card">Name: {product.productName} - Unit of Measure: {product.unitOfMeasure}
                    <Button onClick={() => handleDelete(product.productId)}>Delete</Button>
                    </li>
                ))}
            </ul>
        </div>

        <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  )
}

export default ProductList