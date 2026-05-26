import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import Table from '@/components/Table'
import MobileCardList from '@/components/MobileCardList'
import ProductBottomSheet from '@/components/ProductBottomSheet'
import ProductFormBottomSheet from '@/components/ProductFormBottomSheet'
import Modal from '@/components/Modal'
import Alert from '@/components/Alert'
import ProductCreate from '@/pages/Product/ProductCreate'
import ProductEdit from '@/pages/Product/ProductEdit'
import Button from '@/components/Button'
import Pagination from '@/components/Pagination'
import { ENV } from '@/config/env'
import useIsMobile from '@/hooks/useIsMobile'

const ProductList = () => {

    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()

    const [products, setProducts] = useState([])
    const [error, setError] = useState("")
    const [status, setStatus] = useState(null)

    const [userDepts, setUserDepts] = useState([])
    const [deptFilter, setDeptFilter] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState(null)

    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formSheetMode, setFormSheetMode] = useState('create')

    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetProduct, setSheetProduct] = useState(null)

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
        ...(userDepts.length > 0 ? [{ key: "departmentName", label: "Departamento" }] : []),
    ]

    const openSheet = (product) => {
        setSheetProduct(product)
        setSheetOpen(true)
    }

    const closeSheet = () => {
        setSheetOpen(false)
        setSheetProduct(null)
    }

    const openEditModal = (product) => {
        setProductToEdit(product)
        if (isMobile) {
            setFormSheetMode('edit')
            setFormSheetOpen(true)
        } else {
            setIsEditModalOpen(true)
        }
    }

    const openCreateForm = () => {
        if (isMobile) {
            setProductToEdit(null)
            setFormSheetMode('create')
            setFormSheetOpen(true)
        } else {
            setIsCreateModalOpen(true)
        }
    }

    const closeFormSheet = () => {
        setFormSheetOpen(false)
        setProductToEdit(null)
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

    const fetchDepartments = useCallback(async () => {
        const res = await request('GET', '/departments/company?size=50&sort=departmentName,asc')
        if (res.ok) {
            const all = res.data.content ?? res.data
            setUserDepts(all.filter(d => d.departmentName !== 'Default'))
        }
    }, [request])

    useEffect(() => {
        fetchDepartments()
    }, [fetchDepartments])

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
            {userDepts.length >= 2 && (
                <div className="relative">
                    <select
                        value={deptFilter === null ? '' : String(deptFilter)}
                        onChange={e => { setDeptFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(0) }}
                        className="h-[2.25rem] pl-[0.75rem] pr-8 border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] appearance-none hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]"
                    >
                        <option value="">Todos os setores</option>
                        {userDepts.map(d => (
                            <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                        ))}
                    </select>
                    <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </span>
                </div>
            )}
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
    ), [userDepts, deptFilter, searchWord, handleSearch, loading])

    const mobileFilterToolbar = useMemo(() => (
        <div className="mf-root">
            {userDepts.length >= 2 && (
                <div className="mf-input-row mb-2">
                    <div className="relative flex-1">
                        <select
                            value={deptFilter === null ? '' : String(deptFilter)}
                            onChange={e => { setDeptFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(0) }}
                            className="w-full h-[2.375rem] pl-[0.75rem] pr-8 border-[1.5px] border-[var(--color-border-strong)] rounded-[var(--radius-md)] text-[0.875rem] text-[var(--color-text-primary)] bg-[var(--color-surface-0)] outline-none transition-[border-color,box-shadow] duration-[160ms] appearance-none hover:border-[var(--color-accent)] focus:border-[var(--color-accent)] focus:[box-shadow:var(--shadow-focus-accent)]"
                        >
                            <option value="">Todos os setores</option>
                            {userDepts.map(d => (
                                <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>
                            ))}
                        </select>
                        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                    </div>
                </div>
            )}
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
    ), [userDepts, deptFilter, searchWord, handleSearch, handleClearSearch, loading, appliedSearch])

    const renderProductCard = (product) => {
        const initials = product.productName
            ? product.productName.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
            : '?'

        return {
            avatar: initials,
            title: product.productName,
            subtitle: product.productDescription || undefined,
            ...(userDepts.length > 0 && product.departmentName ? { tags: [{ label: product.departmentName }] } : {}),
        }
    }

    return (
        <div className="page-wrapper">
            {error && <Alert message={error}/>}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <>
                    <MobileCardList
                        title="Produtos"
                        items={products}
                        idKey="productId"
                        loading={loading}
                        emptyMessage="Nenhum produto encontrado."
                        onReload={() => fetchProducts(currentPage)}
                        onAdd={openCreateForm}
                        onCardClick={openSheet}
                        renderCard={renderProductCard}
                        toolbar={mobileFilterToolbar}
                        filterActive={appliedSearch.word !== "" || deptFilter !== null}
                        sortColumns={columns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleColumnSort}
                        onClearSort={handleClearSort}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    <ProductBottomSheet
                        isOpen={sheetOpen}
                        onClose={closeSheet}
                        product={sheetProduct}
                        onEdit={openEditModal}
                        onDelete={requestRemove}
                    />
                    <ProductFormBottomSheet
                        isOpen={formSheetOpen}
                        onClose={closeFormSheet}
                        mode={formSheetMode}
                        product={productToEdit}
                        onSaveCreate={handleSaveCreate}
                        onSaveEdit={handleSaveEdit}
                        departments={userDepts}
                    />
                </>
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
                    departments={userDepts}
                />
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={"Criar Produto"}>
                <ProductCreate
                    onSave={handleSaveCreate}
                    onClose={closeModals}
                    departments={userDepts}
                />
            </Modal>

            <Modal isOpen={confirmOpen} onClose={closeModals} title={"Confirmar Remoção"}>
                <div>
                    <p className="text-[var(--color-text-secondary)] text-[0.875rem] mb-5">
                        Tem certeza de que você deseja remover o produto <strong>{productToRemove?.productName}</strong>?
                    </p>
                    <div className="flex justify-center gap-3 mt-4">
                        <Button onClick={closeModals}>Cancelar</Button>
                        <Button onClick={confirmRemove} disabled={loading}>Confirmar</Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

export default ProductList
