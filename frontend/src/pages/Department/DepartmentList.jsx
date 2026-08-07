import { useCallback, useMemo, useState } from 'react'
import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import useResourceList from '@/hooks/useResourceList'
import MobileCardList from '@/components/MobileCardList'
import DepartmentBottomSheet from '@/components/DepartmentBottomSheet'
import DepartmentFormBottomSheet from '@/components/DepartmentFormBottomSheet'
import Modal from '@/components/Modal'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageContainer from '@/components/PageContainer'
import FormActions from '@/components/FormActions'
import PaginationSummary from '@/components/PaginationSummary'
import Select from '@/components/Select'
import ListToolbar from '@/components/ListToolbar'
import MobileSearchInput from '@/components/MobileSearchInput'
import ActiveFilterPill from '@/components/ActiveFilterPill'
import { initials } from '@/utils/initials'
import { getPaginationSummary } from '@/utils/paginationSummary'
import { ENV } from '@/config/env'

export const DepartmentForm = ({ department, onSave, onClose }) => {
    const [name, setName] = useState(department?.departmentName ?? '')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const { request, loading } = useFetch(ENV.API_BASE_URL)

    const isEdit = !!department

    const isDisabled = !name.trim()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        const res = await request(
            isEdit ? 'PUT' : 'POST',
            isEdit ? `/departments/${department.departmentId}` : '/departments',
            { departmentName: name.trim() }
        )

        if (res.ok) {
            setSuccess(isEdit ? 'Departamento atualizado!' : 'Departamento criado!')
            onSave && onSave(res.data)
            setTimeout(() => onClose(), 600)
        } else {
            setError(
                res.status === 409
                    ? 'Já existe um departamento com esse nome.'
                    : 'Não foi possível salvar. Tente novamente.'
            )
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="Nome do departamento"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Ex: Matéria Prima"
                required
            />

            <Alert message={error} />
            <Alert variant="success" message={success} />
            <FormActions>
                <Button type="submit" disabled={isDisabled} loading={loading}>
                    {isEdit ? 'Salvar' : 'Criar'}
                </Button>
            </FormActions>
        </form>
    )
}

const DepartmentList = () => {
    const isMobile = useIsMobile()

    const {
        items: departments, setItems: setDepartments, loading, error, status,
        currentPage, setCurrentPage, totalPages, totalElements, pageSize,
        sortField, sortDirection, setSort,
        appliedSearch, applySearch, clearSearch,
        refetch, confirm,
    } = useResourceList({
        endpoint: '/departments/company',
        idKey: 'departmentId',
        defaultSortField: 'departmentName',
        deletePath: (d) => `/departments/${d.departmentId}`,
        deleteErrorMessage: 'Erro ao remover departamento. Por favor tente novamente.',
    })

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [departmentToEdit, setDepartmentToEdit] = useState(null)

    const [detailSheetOpen, setDetailSheetOpen] = useState(false)
    const [detailSheetDept, setDetailSheetDept] = useState(null)

    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formSheetDept, setFormSheetDept] = useState(null)

    const [searchWord, setSearchWord] = useState("")

    const visibleDepartments = departments.filter(d => d.departmentName !== 'Default')

    const reloadCurrentPage = useCallback(() => refetch(currentPage), [refetch, currentPage])

    const sortOptions = useMemo(() => [
        { key: "name-asc", label: "Nome (A → Z)", shortLabel: "A-Z", field: "departmentName", direction: "asc", icon: <ArrowDownAZ size={18} strokeWidth={2} /> },
        { key: "name-desc", label: "Nome (Z → A)", shortLabel: "Z-A", field: "departmentName", direction: "desc", icon: <ArrowUpAZ size={18} strokeWidth={2} /> },
    ], [])

    const handleSearch = useCallback(() => {
        applySearch("departmentName", searchWord)
    }, [applySearch, searchWord])

    const handleClearSearch = useCallback(() => {
        setSearchWord("")
        clearSearch()
    }, [clearSearch])

    const searchBar = useMemo(() => (
        <>
            <MobileSearchInput
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                onSearch={handleSearch}
                onClear={handleClearSearch}
                placeholder="Buscar por departamento"
                inputDisabled={departments.length === 0}
                searchDisabled={loading || departments.length === 0}
            />
            <ActiveFilterPill label="Nome" value={appliedSearch.word} onClear={handleClearSearch} />
        </>
    ), [searchWord, handleSearch, handleClearSearch, loading, appliedSearch, departments.length])

    const openDetailSheet = (dept) => {
        setDetailSheetDept(dept)
        setDetailSheetOpen(true)
    }

    const closeDetailSheet = () => {
        setDetailSheetOpen(false)
        setDetailSheetDept(null)
    }

    const openCreateForm = () => {
        if (isMobile) {
            setFormSheetDept(null)
            setFormSheetOpen(true)
        } else {
            setIsCreateModalOpen(true)
        }
    }

    const openEditModal = (dept) => {
        setDepartmentToEdit(dept)
        if (isMobile) {
            setFormSheetDept(dept)
            setFormSheetOpen(true)
        } else {
            setIsEditModalOpen(true)
        }
    }

    const closeModals = () => {
        setIsCreateModalOpen(false)
        setIsEditModalOpen(false)
        setDepartmentToEdit(null)
    }

    const closeFormSheet = () => {
        setFormSheetOpen(false)
        setFormSheetDept(null)
        setDepartmentToEdit(null)
    }

    const handleSaveCreate = () => {
        refetch()
    }

    const handleSaveEdit = (updated) => {
        setDepartments(prev => prev.map(d => d.departmentId === updated.departmentId ? updated : d))
    }

    const renderDepartmentCard = (dept) => ({
        avatar: initials(dept.departmentName, 1),
        title: dept.departmentName,
    })

    const { pageLabel, rangeLabel } = getPaginationSummary({
        currentPage, totalPages, totalElements, pageSize,
        pageItemCount: visibleDepartments.length,
    })

    const listEmpty = !loading && visibleDepartments.length === 0

    const activeSortKey = sortOptions.find(opt => opt.field === (sortField ?? 'departmentName') && opt.direction === (sortField ? sortDirection : 'asc'))?.key

    const desktopToolbar = useMemo(() => (
        <ListToolbar
            search={{
                value: searchWord,
                onChange: e => setSearchWord(e.target.value),
                onSearch: handleSearch,
                onClear: handleClearSearch,
                placeholder: "Buscar por departamento",
                ariaLabel: "Buscar departamento",
                disabled: departments.length === 0,
                searchDisabled: loading || departments.length === 0,
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
            activeFilter={{ label: "Nome", value: appliedSearch.word, onClear: handleClearSearch }}
            empty={listEmpty}
        />
    ), [searchWord, handleSearch, handleClearSearch, loading, departments.length, activeSortKey, sortOptions, setSort, pageLabel, rangeLabel, appliedSearch.word, listEmpty])

    return (
        <PageContainer variant="list">
            {error && <Alert message={error} />}
            {status === 0 && <Alert message={"Erro Interno do Servidor"} />}

            <MobileCardList
                title="Departamentos"
                eyebrow="Cadastro"
                addLabel="Novo Departamento"
                items={visibleDepartments}
                idKey="departmentId"
                loading={loading}
                emptyMessage="Nenhum departamento cadastrado."
                onReload={reloadCurrentPage}
                onAdd={openCreateForm}
                onCardClick={openDetailSheet}
                renderCard={renderDepartmentCard}
                searchBar={searchBar}
                desktopToolbar={desktopToolbar}
                filterActive={appliedSearch.word !== ""}
                showCount={false}
                inlineToolbar={<PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />}
                sortOptions={sortOptions}
                sortField={sortField ?? 'departmentName'}
                sortDirection={sortField ? sortDirection : 'asc'}
                onSelectSort={(opt) => setSort(opt.field, opt.direction)}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
            <DepartmentBottomSheet
                isOpen={detailSheetOpen}
                onClose={closeDetailSheet}
                department={detailSheetDept}
                onEdit={openEditModal}
                onDelete={confirm.requestRemove}
            />
            <DepartmentFormBottomSheet
                isOpen={formSheetOpen}
                onClose={closeFormSheet}
                department={formSheetDept}
                onSave={formSheetDept ? handleSaveEdit : handleSaveCreate}
            />

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title="Novo Departamento">
                <DepartmentForm onSave={handleSaveCreate} onClose={closeModals} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Editar Departamento">
                <DepartmentForm department={departmentToEdit} onSave={handleSaveEdit} onClose={closeModals} />
            </Modal>

            <ConfirmDialog
                isOpen={confirm.isOpen}
                onClose={confirm.cancel}
                onConfirm={confirm.confirm}
                loading={loading}
                confirmVariant="danger"
            >
                Tem certeza de que deseja remover o departamento <strong>{confirm.item?.departmentName}</strong>?
                {totalElements === 2 && (
                    <span> O departamento voltará ao estado padrão.</span>
                )}
            </ConfirmDialog>
        </PageContainer>
    )
}

export default DepartmentList
