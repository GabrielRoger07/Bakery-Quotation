import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import useFetch from '@/hooks/useFetch'
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
import ListToolbar from '@/components/ListToolbar'
import ProductCreate from '@/pages/Product/ProductCreate'
import ProductEdit from '@/pages/Product/ProductEdit'
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
        sortField, sortDirection, setSort,
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

    const sortOptions = useMemo(() => [
        { key: "name-asc", label: "Nome (A → Z)", shortLabel: "A-Z", field: "productName", direction: "asc", icon: <ArrowDownAZ size={18} strokeWidth={2} /> },
        { key: "name-desc", label: "Nome (Z → A)", shortLabel: "Z-A", field: "productName", direction: "desc", icon: <ArrowUpAZ size={18} strokeWidth={2} /> },
    ], [])

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

    const searchBar = useMemo(() => (
        <>
            <MobileSearchInput
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Buscar por nome do produto"
                inputDisabled={products.length === 0}
                searchDisabled={loading || products.length === 0}
            />
            <ActiveFilterPill label="Nome" value={appliedSearch.word} onClear={handleClearSearch} />
        </>
    ), [searchWord, handleSearch, handleClearSearch, loading, appliedSearch, products.length])

    const filterToolbar = useMemo(() => (
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
        loading,
    })

    const activeSortKey = sortOptions.find(opt => opt.field === (sortField ?? 'productName') && opt.direction === (sortField ? sortDirection : 'asc'))?.key

    const desktopToolbar = useMemo(() => (
        <ListToolbar
            search={{
                value: searchWord,
                onChange: e => setSearchWord(e.target.value),
                onSearch: handleSearch,
                onClear: handleClearSearch,
                placeholder: "Buscar por nome do produto",
                ariaLabel: "Buscar produto",
                disabled: products.length === 0,
                searchDisabled: loading || products.length === 0,
            }}
            after={userDepts.length >= 2 && (
                <Select
                    bare
                    className="flex-1 min-w-[12rem]"
                    value={deptFilter === null ? '' : String(deptFilter)}
                    onChange={e => { setDeptFilter(e.target.value === '' ? null : Number(e.target.value)); setCurrentPage(0) }}
                    placeholder="Todos os setores"
                    selectClassName="h-[2.5rem]"
                    options={userDepts.map(d => ({ value: d.departmentId, label: d.departmentName }))}
                />
            )}
            sort={(
                <Select
                    bare
                    className="w-[12rem] shrink-0"
                    value={activeSortKey}
                    onChange={e => {
                        const opt = sortOptions.find(o => o.key === e.target.value)
                        if (opt) setSort(opt.field, opt.direction)
                    }}
                    selectClassName="h-[2.5rem]"
                    options={sortOptions.map(opt => ({ value: opt.key, label: opt.label }))}
                />
            )}
            pageLabel={pageLabel}
            rangeLabel={rangeLabel}
            activeFilter={{ label: "Nome", value: appliedSearch.word, onClear: handleClearSearch }}
        />
    ), [searchWord, handleSearch, handleClearSearch, loading, products.length, userDepts, deptFilter, setCurrentPage, activeSortKey, setSort, pageLabel, rangeLabel, appliedSearch.word, sortOptions])

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

            <MobileCardList
                title="Produtos"
                eyebrow="Catálogo"
                addLabel="Novo Produto"
                items={products}
                idKey="productId"
                loading={loading}
                emptyMessage="Nenhum produto encontrado."
                onReload={reloadCurrentPage}
                onAdd={openCreateForm}
                onCardClick={openSheet}
                renderCard={renderProductCard}
                toolbar={filterToolbar}
                searchBar={searchBar}
                desktopToolbar={desktopToolbar}
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
                confirmVariant="danger"
            >
                Tem certeza de que você deseja remover o produto <strong>{confirm.item?.productName}</strong>?
            </ConfirmDialog>
        </PageContainer>
    )
}

export default ProductList
