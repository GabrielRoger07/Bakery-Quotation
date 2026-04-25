import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '../../hooks/useFetch'
import Table from '../../components/Table'
import MobileCardList from '../../components/MobileCardList'
import Modal from '../../components/Modal'
import Alert from '../../components/Alert'
import ProductCreate from './ProductCreate'
import ProductEdit from './ProductEdit'
import Button from '../../components/Button'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'
import { Barcode } from 'lucide-react'
import useIsMobile from '../../hooks/useIsMobile'

const ProductList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()

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
        { key: "productBarCodeNumber", label: "Código do Produto" },
        { key: "productName", label: "Nome do Produto" },
        { key: "productDescription", label: "Descrição do Produto" },
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
            setError("Erro ao remover produto. Por favor tente novamente.")
        }
        closeModals()
    }

    const fetchProducts = useCallback(async (page = 0) => {

        let query = `?page=${page}`
        sortField ? query += `&sort=${sortField},${sortDirection}` : query += `&sort=productName,${sortDirection}`
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

    const handleClearSort = () => {
        setSortField(null)
        setSortDirection("asc")
        setCurrentPage(0)
    }

    useEffect(() => {
        fetchProducts(currentPage);
    }, [fetchProducts, currentPage])

    const handleClearSearch = useCallback(() => {
        setSearchWord("")
        setAppliedSearch({ field: "", word: "" })
        setCurrentPage(0)
    }, [])

    const filterToolbar = useMemo(() => (
        <>
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={"Nome do Produto"}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <Button onClick={handleSearch} disabled={loading}>Buscar</Button>
        </>
    ), [searchWord, handleSearch, loading])

    const mobileFilterToolbar = useMemo(() => (
        <div className="mf-root">
            <div className="mf-input-row">
                <div className="mf-input-wrap">
                    <svg className="mf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <input
                        type="text"
                        className="mf-input"
                        value={searchWord}
                        onChange={e => setSearchWord(e.target.value)}
                        placeholder="Buscar por nome do produto"
                        onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
                    />
                    {searchWord && (
                        <button type="button" className="mf-input-clear" onClick={() => setSearchWord("")} aria-label="Limpar texto">
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    className="mf-search-btn"
                    onClick={handleSearch}
                    disabled={loading}
                >
                    Buscar
                </button>
            </div>
            {appliedSearch.word && (
                <div className="mf-active-row">
                    <span className="mf-active-pill">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5"/><path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        Nome: <strong>{appliedSearch.word}</strong>
                    </span>
                    <button type="button" className="mf-clear-btn" onClick={handleClearSearch}>
                        <svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/></svg>
                        Limpar
                    </button>
                </div>
            )}
        </div>
    ), [searchWord, handleSearch, handleClearSearch, loading, appliedSearch])

    const renderProductCard = (product) => {
        const initials = product.productName
            ? product.productName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : '?'

        const tags = []
        if (product.productBarCodeNumber) {
            tags.push({
                label: product.productBarCodeNumber,
                icon: <Barcode size={10} strokeWidth={2.5} />,
                variant: 'accent',
            })
        }

        return {
            avatar: initials,
            title: product.productName,
            subtitle: product.productDescription || undefined,
            tags,
        }
    }

    return (
        <div className="page-wrapper">
            {error && <Alert message={error}/>}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <MobileCardList
                    title="Produtos"
                    items={products}
                    idKey="productId"
                    loading={loading}
                    emptyMessage="Nenhum produto encontrado."
                    onReload={() => fetchProducts(currentPage)}
                    onAdd={() => setIsCreateModalOpen(true)}
                    onEdit={openEditModal}
                    onDelete={requestRemove}
                    renderCard={renderProductCard}
                    toolbar={mobileFilterToolbar}
                    filterActive={appliedSearch.word !== ""}
                    sortColumns={columns}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={handleColumnSort}
                    onClearSort={handleClearSort}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                />
            ) : (
                <>
                    <Table
                        title={"Produtos"}
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
                        emptyMessage={"Nenhum produto encontrado."}
                        toolbar={filterToolbar}
                        filterActive={appliedSearch.word !== ""}
                    />
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                </>
            )}

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title={"Editar Produto"}>
                <ProductEdit
                    product={productToEdit}
                    onSave={handleSaveEdit}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={"Criar Produto"}>
                <ProductCreate
                    onSave={handleSaveCreate}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={confirmOpen} onClose={closeModals} title={"Confirmar Remoção"}>
                <div>
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                        Tem certeza de que você deseja remover o produto <strong>{productToRemove?.productName}</strong>?
                    </p>
                    <div className="flex justify-end gap-3">
                        <Button onClick={closeModals}>Cancelar</Button>
                        <Button onClick={confirmRemove} disabled={loading}>Confirmar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default ProductList
