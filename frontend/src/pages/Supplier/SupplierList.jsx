import { useCallback, useMemo, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ, Building2 } from 'lucide-react'
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
import ListToolbar from '@/components/ListToolbar'
import SupplierCreate from '@/pages/Supplier/SupplierCreate'
import SupplierEdit from '@/pages/Supplier/SupplierEdit'
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
        sortField, sortDirection, setSort,
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

    const sortOptions = useMemo(() => [
        { key: "name-asc", label: "Nome (A → Z)", shortLabel: "A-Z", field: "supplierName", direction: "asc", icon: <ArrowDownAZ size={18} strokeWidth={2} /> },
        { key: "name-desc", label: "Nome (Z → A)", shortLabel: "Z-A", field: "supplierName", direction: "desc", icon: <ArrowUpAZ size={18} strokeWidth={2} /> },
        { key: "company", label: "Nome da Empresa", shortLabel: "Empresa", field: "employerName", direction: "asc", icon: <Building2 size={18} strokeWidth={2} /> },
    ], [])

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

    const searchBar = useMemo(() => (
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
                onClear={handleClearSearch}
                placeholder={searchField ? `Buscar por ${SUPPLIER_FILTER_OPTIONS.find(o => o.value === searchField)?.label ?? '...'}` : "Selecione um campo acima"}
                inputDisabled={!searchField || suppliers.length === 0}
                searchDisabled={loading || !searchField || suppliers.length === 0}
            />
            <ActiveFilterPill
                label={SUPPLIER_FILTER_OPTIONS.find(o => o.value === appliedSearch.field)?.label}
                value={appliedSearch.word}
                onClear={handleClearSearch}
            />
        </>
    ), [searchField, searchWord, handleSearch, handleClearSearch, loading, appliedSearch, suppliers.length])

    const formattedSuppliers = suppliers.map((supplier) => ({
        ...supplier,
        supplierWhatsappNumber: supplier.supplierWhatsappNumber ? formatPhone(supplier.supplierWhatsappNumber) : "-",
        employerCnpj: supplier.employerCnpj ? formatCnpj(supplier.employerCnpj) : "-"
    }))

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: suppliers.length,
        emptyLabel: "Nenhum fornecedor encontrado.",
        loading,
    })

    const activeSortKey = sortOptions.find(opt => opt.field === (sortField ?? 'supplierName') && opt.direction === (sortField ? sortDirection : 'asc'))?.key

    const desktopToolbar = useMemo(() => (
        <ListToolbar
            before={(
                <Select
                    bare
                    className="w-[12rem] shrink-0"
                    value={searchField}
                    onChange={(e) => setSearchField(e.target.value)}
                    placeholder="Filtrar por"
                    selectClassName="h-[2.5rem]"
                    options={SUPPLIER_FILTER_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                />
            )}
            search={{
                value: searchWord,
                onChange: e => setSearchWord(e.target.value),
                onSearch: handleSearch,
                onClear: handleClearSearch,
                placeholder: searchField ? `Buscar por ${SUPPLIER_FILTER_OPTIONS.find(o => o.value === searchField)?.label ?? '...'}` : "Selecione um campo",
                ariaLabel: "Buscar fornecedor",
                disabled: !searchField || suppliers.length === 0,
                searchDisabled: loading || !searchField || suppliers.length === 0,
            }}
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
            activeFilter={{
                label: SUPPLIER_FILTER_OPTIONS.find(o => o.value === appliedSearch.field)?.label,
                value: appliedSearch.word,
                onClear: handleClearSearch,
            }}
        />
    ), [searchField, searchWord, handleSearch, handleClearSearch, loading, suppliers.length, activeSortKey, setSort, pageLabel, rangeLabel, appliedSearch, sortOptions])

    const renderSupplierCard = (supplier) => ({
        avatar: initials(supplier.supplierName),
        title: supplier.supplierName,
        subtitle: supplier.employerName || undefined,
    })

    return (
        <PageContainer variant="list">
            {error && <Alert message={error}/>}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            <MobileCardList
                title="Fornecedores"
                eyebrow="Cadastro"
                addLabel="Novo Fornecedor"
                items={formattedSuppliers}
                idKey="supplierId"
                loading={loading}
                emptyMessage="Nenhum fornecedor encontrado."
                onReload={reloadCurrentPage}
                onAdd={openCreateForm}
                onCardClick={openSheet}
                renderCard={renderSupplierCard}
                searchBar={searchBar}
                desktopToolbar={desktopToolbar}
                filterActive={appliedSearch.word !== "" || appliedSearch.field !== ""}
                sortOptions={sortOptions}
                sortField={sortField ?? 'supplierName'}
                sortDirection={sortField ? sortDirection : 'asc'}
                onSelectSort={(opt) => setSort(opt.field, opt.direction)}
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
                confirmVariant="danger"
            >
                Tem certeza de que você deseja remover o fornecedor <strong>{confirm.item?.supplierName}</strong> da empresa <strong>{confirm.item?.employerName}</strong>?
            </ConfirmDialog>
        </PageContainer>
    )
}

export default SupplierList
