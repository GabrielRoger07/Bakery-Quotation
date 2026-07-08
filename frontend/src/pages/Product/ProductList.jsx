import { useCallback, useEffect, useMemo, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import Table from '@/components/Table'
import MobileCardList from '@/components/MobileCardList'
import ProductBottomSheet from '@/components/ProductBottomSheet'
import ProductFormBottomSheet from '@/components/ProductFormBottomSheet'
import Modal from '@/components/Modal'
import Alert from '@/components/Alert'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageContainer from '@/components/PageContainer'
import Select from '@/components/Select'
import MobileSearchInput from '@/components/MobileSearchInput'
import ActiveFilterPill from '@/components/ActiveFilterPill'
import ProductCreate from '@/pages/Product/ProductCreate'
import ProductEdit from '@/pages/Product/ProductEdit'
import Button from '@/components/Button'
import Pagination from '@/components/Pagination'
import PaginationSummary from '@/components/PaginationSummary'
import { ENV } from '@/config/env'
import useIsMobile from '@/hooks/useIsMobile'
import useResourceList from '@/hooks/useResourceList'
import { initials } from '@/utils/initials'
import { getPaginationSummary } from '@/utils/paginationSummary'

const ProductList = () => {

    const { request } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()

    const {
        items: products, setItems: setProducts, loading, error, status,
        currentPage, setCurrentPage, totalPages, totalElements, pageSize,
        sortField, sortDirection, handleSort, setSort,
        appliedSearch, applySearch, clearSearch, refetch, confirm,
    } = useResourceList({
        endpoint: '/products/company',
        idKey: 'productId',
        defaultSortField: 'productName',
        deletePath: (p) => `/products/${p.productId}`,
        deleteErrorMessage: 'Erro ao remover produto. Por favor tente novamente.',
    })

    const [userDepts, setUserDepts] = useState([])
    const [deptFilter, setDeptFilter] = useState(null)

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [productToEdit, setProductToEdit] = useState(null)

    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formSheetMode, setFormSheetMode] = useState('create')

    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetProduct, setSheetProduct] = useState(null)

    const [searchWord, setSearchWord] = useState("")

    const columns = [
        { key: "productBarCodeNumber", label: "Código do Produto" },
        { key: "productName", label: "Nome do Produto" },
        { key: "productDescription", label: "Descrição do Produto" },
        ...(userDepts.length > 0 ? [{ key: "departmentName", label: "Departamento" }] : []),
    ]

    const sortOptions = [
        { key: "name-asc", label: "Nome (A → Z)", shortLabel: "A-Z", field: "productName", direction: "asc" },
        { key: "name-desc", label: "Nome (Z → A)", shortLabel: "Z-A", field: "productName", direction: "desc" },
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
    }

    const handleSaveCreate = () => {
        refetch()
    }

    const reloadCurrentPage = useCallback(() => refetch(currentPage), [refetch, currentPage])

    const handleSaveEdit = (updatedProduct) => {
        setProducts(prev => prev.map(p => p.productId === updatedProduct.productId ? updatedProduct : p))
    }

    const handleSearch = useCallback(() => {
        applySearch("productName", searchWord)
    }, [applySearch, searchWord])

    const handleClearSearch = useCallback(() => {
        setSearchWord("")
        clearSearch()
    }, [clearSearch])

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

    const filterToolbar = useMemo(() => (
        <>
            {userDepts.length >= 2 && (
                <Select
                    bare
                    value={deptFilter === null ? '' : String(deptFilter)}
                    onChange={e => { setDeptFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(0) }}
                    placeholder="Todos os setores"
                    selectClassName="h-[2.25rem]"
                    options={userDepts.map(d => ({ value: d.departmentId, label: d.departmentName }))}
                />
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
    ), [userDepts, deptFilter, searchWord, handleSearch, loading, setCurrentPage])

    const mobileSearchBar = useMemo(() => (
        <>
            <MobileSearchInput
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                onSearch={handleSearch}
                onClear={() => setSearchWord("")}
                placeholder="Buscar por nome do produto"
                searchDisabled={loading}
            />
            <ActiveFilterPill label="Nome" value={appliedSearch.word} onClear={handleClearSearch} />
        </>
    ), [searchWord, handleSearch, handleClearSearch, loading, appliedSearch])

    const mobileFilterToolbar = useMemo(() => (
        userDepts.length >= 2 ? (
            <div className="mf-root">
                <Select
                    bare
                    className="flex-1"
                    value={deptFilter === null ? '' : String(deptFilter)}
                    onChange={e => { setDeptFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(0) }}
                    placeholder="Todos os setores"
                    options={userDepts.map(d => ({ value: d.departmentId, label: d.departmentName }))}
                />
            </div>
        ) : null
    ), [userDepts, deptFilter, setCurrentPage])

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: products.length,
        emptyLabel: "Nenhum produto encontrado.",
    })

    const renderProductCard = (product) => ({
        avatar: initials(product.productName),
        title: product.productName,
        subtitle: product.productDescription || undefined,
        ...(userDepts.length > 0 && product.departmentName ? { tags: [{ label: product.departmentName }] } : {}),
    })

    return (
        <PageContainer variant="list">
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
                        onReload={reloadCurrentPage}
                        onAdd={openCreateForm}
                        onCardClick={openSheet}
                        renderCard={renderProductCard}
                        toolbar={mobileFilterToolbar}
                        searchBar={mobileSearchBar}
                        filterActive={deptFilter !== null}
                        sortOptions={sortOptions}
                        sortField={sortField ?? 'productName'}
                        sortDirection={sortField ? sortDirection : 'asc'}
                        onSelectSort={(opt) => setSort(opt.field, opt.direction)}
                        showCount={false}
                        inlineToolbar={<PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    <ProductBottomSheet
                        isOpen={sheetOpen}
                        onClose={closeSheet}
                        product={sheetProduct}
                        onEdit={openEditModal}
                        onDelete={confirm.requestRemove}
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
                        onDelete={confirm.requestRemove}
                        onAdd={() => setIsCreateModalOpen(true)}
                        onReload={reloadCurrentPage}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        emptyMessage={"Nenhum produto encontrado."}
                        toolbar={filterToolbar}
                        filterActive={appliedSearch.word !== ""}
                    />
                    <div className="flex items-center justify-between gap-2 px-1">
                        <PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
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

            <ConfirmDialog
                isOpen={confirm.isOpen}
                onClose={confirm.cancel}
                onConfirm={confirm.confirm}
                loading={loading}
            >
                Tem certeza de que você deseja remover o produto <strong>{confirm.item?.productName}</strong>?
            </ConfirmDialog>
        </PageContainer>
    )
}

export default ProductList
