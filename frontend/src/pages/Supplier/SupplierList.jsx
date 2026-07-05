import { useCallback, useMemo, useState } from 'react'
import Table from '@/components/Table'
import MobileCardList from '@/components/MobileCardList'
import SupplierBottomSheet from '@/components/SupplierBottomSheet'
import SupplierFormBottomSheet from '@/components/SupplierFormBottomSheet'
import Modal from '@/components/Modal'
import Alert from '@/components/Alert'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageContainer from '@/components/PageContainer'
import Select from '@/components/Select'
import MobileSearchInput from '@/components/MobileSearchInput'
import ActiveFilterPill from '@/components/ActiveFilterPill'
import SupplierCreate from '@/pages/Supplier/SupplierCreate'
import SupplierEdit from '@/pages/Supplier/SupplierEdit'
import Button from '@/components/Button'
import Pagination from '@/components/Pagination'
import PaginationSummary from '@/components/PaginationSummary'
import { formatCnpj } from '@/utils/formatCnpj'
import { formatPhone } from '@/utils/formatPhone'
import { initials } from '@/utils/initials'
import { getPaginationSummary } from '@/utils/paginationSummary'
import useIsMobile from '@/hooks/useIsMobile'
import useResourceList from '@/hooks/useResourceList'

const SUPPLIER_FILTER_OPTIONS = [
    { value: "supplierName",           label: "Nome" },
    { value: "supplierEmail",          label: "E-mail" },
    { value: "supplierWhatsappNumber", label: "Whatsapp" },
    { value: "employerName",           label: "Empresa" },
    { value: "employerCnpj",           label: "CNPJ" },
]

const SupplierList = () => {

    const isMobile = useIsMobile()

    const {
        items: suppliers, setItems: setSuppliers, loading, error, status,
        currentPage, setCurrentPage, totalPages, totalElements, pageSize,
        sortField, sortDirection, handleSort, clearSort,
        appliedSearch, applySearch, clearSearch, refetch, confirm,
    } = useResourceList({
        endpoint: '/suppliers/company',
        idKey: 'supplierId',
        defaultSortField: 'supplierName',
        deletePath: (s) => `/suppliers/${s.supplierId}`,
        deleteErrorMessage: 'Erro ao remover fornecedor. Por favor tente novamente.',
    })

    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [supplierToEdit, setSupplierToEdit] = useState(null)

    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formSheetMode, setFormSheetMode] = useState('create')

    const [sheetOpen, setSheetOpen] = useState(false)
    const [sheetSupplier, setSheetSupplier] = useState(null)

    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")

    const columns = [
        { key: "supplierName", label: "Nome"},
        { key: "supplierEmail", label: "E-mail"},
        { key: "supplierWhatsappNumber", label: "Whatsapp"},
        { key: "employerName", label: "Nome da Empresa"},
        { key: "employerCnpj", label: "CNPJ da Empresa"}
    ]

    const openSheet = (supplier) => {
        setSheetSupplier(supplier)
        setSheetOpen(true)
    }

    const closeSheet = () => {
        setSheetOpen(false)
        setSheetSupplier(null)
    }

    const openEditModal = (supplier) => {
        setSupplierToEdit(supplier)
        if (isMobile) {
            setFormSheetMode('edit')
            setFormSheetOpen(true)
        } else {
            setIsEditModalOpen(true)
        }
    }

    const openCreateForm = () => {
        if (isMobile) {
            setSupplierToEdit(null)
            setFormSheetMode('create')
            setFormSheetOpen(true)
        } else {
            setIsCreateModalOpen(true)
        }
    }

    const closeFormSheet = () => {
        setFormSheetOpen(false)
        setSupplierToEdit(null)
    }

    const closeModals = () => {
        setSupplierToEdit(null)
        setIsEditModalOpen(false)
        setIsCreateModalOpen(false)
    }

    const handleSaveCreate = () => {
        refetch()
    }

    const reloadCurrentPage = useCallback(() => refetch(currentPage), [refetch, currentPage])

    const handleSaveEdit = (updatedSupplier) => {
        setSuppliers(prev => prev.map(s => s.supplierId === updatedSupplier.supplierId ? updatedSupplier : s))
    }

    const handleSearch = useCallback(() => {
        applySearch(searchField, searchWord)
    }, [applySearch, searchField, searchWord])

    const handleClearSearch = useCallback(() => {
        setSearchField("")
        setSearchWord("")
        clearSearch()
    }, [clearSearch])

    const filterToolbar = useMemo(() => (
        <>
            <Select
                bare
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                placeholder="Selecione"
                options={SUPPLIER_FILTER_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
            />
            <input
                type="text"
                className="toolbar-input"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={"Digite o campo"}
                onKeyDown={e => { if (e.key === "Enter") handleSearch() }}
            />
            <Button onClick={handleSearch} disabled={loading || !searchField}>Buscar</Button>
        </>
    ), [searchField, searchWord, handleSearch, loading])

    const mobileSearchBar = useMemo(() => (
        <>
            <p className="mf-label">Filtrar por</p>
            <div className="mf-chips mf-chips--scroll">
                {SUPPLIER_FILTER_OPTIONS.map(opt => (
                    <button
                        key={opt.value}
                        type="button"
                        className={`mf-chip ${searchField === opt.value ? 'selected' : ''}`}
                        onClick={() => setSearchField(prev => prev === opt.value ? "" : opt.value)}
                    >
                        {opt.label}
                    </button>
                ))}
            </div>
            <MobileSearchInput
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                onSearch={handleSearch}
                onClear={() => setSearchWord("")}
                placeholder={searchField ? `Buscar por ${SUPPLIER_FILTER_OPTIONS.find(o => o.value === searchField)?.label ?? '...'}` : "Selecione um campo acima"}
                inputDisabled={!searchField}
                searchDisabled={loading || !searchField}
            />
            <ActiveFilterPill
                label={SUPPLIER_FILTER_OPTIONS.find(o => o.value === appliedSearch.field)?.label}
                value={appliedSearch.word}
                onClear={handleClearSearch}
            />
        </>
    ), [searchField, searchWord, handleSearch, handleClearSearch, loading, appliedSearch])

    const formattedSuppliers = suppliers.map((supplier) => ({
        ...supplier,
        supplierWhatsappNumber: supplier.supplierWhatsappNumber ? formatPhone(supplier.supplierWhatsappNumber) : "-",
        employerCnpj: supplier.employerCnpj ? formatCnpj(supplier.employerCnpj) : "-"
    }))

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: suppliers.length,
        emptyLabel: "Nenhum fornecedor encontrado.",
    })

    const renderSupplierCard = (supplier) => ({
        avatar: initials(supplier.supplierName),
        title: supplier.supplierName,
        subtitle: supplier.employerName || undefined,
    })

    return (
        <PageContainer variant="list">
            {error && <Alert message={error}/>}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            {isMobile ? (
                <>
                    <MobileCardList
                        title="Fornecedores"
                        items={formattedSuppliers}
                        idKey="supplierId"
                        loading={loading}
                        emptyMessage="Nenhum fornecedor encontrado."
                        onReload={reloadCurrentPage}
                        onAdd={openCreateForm}
                        onCardClick={openSheet}
                        renderCard={renderSupplierCard}
                        searchBar={mobileSearchBar}
                        sortColumns={columns}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        onSort={handleSort}
                        onClearSort={clearSort}
                        showCount={false}
                        inlineToolbar={<PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />}
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                    <SupplierBottomSheet
                        isOpen={sheetOpen}
                        onClose={closeSheet}
                        supplier={sheetSupplier}
                        onEdit={openEditModal}
                        onDelete={confirm.requestRemove}
                    />
                    <SupplierFormBottomSheet
                        isOpen={formSheetOpen}
                        onClose={closeFormSheet}
                        mode={formSheetMode}
                        supplier={supplierToEdit}
                        onSaveCreate={handleSaveCreate}
                        onSaveEdit={handleSaveEdit}
                    />
                </>
            ) : (
                <>
                    <Table
                        title={"Fornecedores"}
                        columns={columns}
                        data={formattedSuppliers}
                        idKey="supplierId"
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={confirm.requestRemove}
                        onAdd={() => setIsCreateModalOpen(true)}
                        onReload={reloadCurrentPage}
                        onSort={handleSort}
                        sortField={sortField}
                        sortDirection={sortDirection}
                        emptyMessage={"Nenhum fornecedor encontrado."}
                        toolbar={filterToolbar}
                        filterActive={appliedSearch.word !== "" || appliedSearch.field !== ""}
                    />
                    <div className="flex items-center justify-between gap-2 px-1">
                        <PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                    </div>
                </>
            )}

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title={"Editar Fornecedor"}>
                <SupplierEdit
                    supplier={supplierToEdit}
                    onSave={handleSaveEdit}
                    onClose={closeModals}
                />
            </Modal>

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={"Criar Fornecedor"}>
                <SupplierCreate
                    onSave={handleSaveCreate}
                    onClose={closeModals}
                />
            </Modal>

            <ConfirmDialog
                isOpen={confirm.isOpen}
                onClose={confirm.cancel}
                onConfirm={confirm.confirm}
                loading={loading}
            >
                Tem certeza de que você deseja remover o fornecedor <strong>{confirm.item?.supplierName}</strong> da empresa <strong>{confirm.item?.employerName}</strong>?
            </ConfirmDialog>
        </PageContainer>
    )
}

export default SupplierList
