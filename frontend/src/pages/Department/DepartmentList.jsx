import { useCallback, useEffect, useState } from 'react'
import useFetch from '@/hooks/useFetch'
import useIsMobile from '@/hooks/useIsMobile'
import { useMobilePage } from '@/contexts/MobilePageContext'
import Table from '@/components/Table'
import MobileCardList from '@/components/MobileCardList'
import Modal from '@/components/Modal'
import Alert from '@/components/Alert'
import Button from '@/components/Button'
import Input from '@/components/Input'
import ConfirmDialog from '@/components/ConfirmDialog'
import PageContainer from '@/components/PageContainer'
import FormActions from '@/components/FormActions'
import { initials } from '@/utils/initials'
import { ENV } from '@/config/env'
import { Pencil, Trash2, X } from 'lucide-react'

const DepartmentForm = ({ department, onSave, onClose }) => {
    const [name, setName] = useState(department?.departmentName ?? '')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const { request, loading } = useFetch(ENV.API_BASE_URL)

    const isEdit = !!department

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
                <Button type="submit" disabled={loading || !name.trim()}>
                    {isEdit ? 'Salvar' : 'Criar'}
                </Button>
            </FormActions>
        </form>
    )
}

const DepartmentFormSheet = ({ isOpen, onClose, department, onSave }) => {
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const title = department ? 'Editar Departamento' : 'Novo Departamento'

    return (
        <>
            <div className={`sort-sheet-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
            <div className={`sform-sheet ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
                <div className="sort-sheet-handle" />
                <div className="sform-sheet-header">
                    <span className="sform-sheet-title">{title}</span>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>
                <div className="sform-sheet-body">
                    <DepartmentForm department={department} onSave={onSave} onClose={onClose} />
                </div>
            </div>
        </>
    )
}

const DepartmentDetailSheet = ({ isOpen, onClose, department, onEdit, onDelete }) => {
    useEffect(() => {
        if (!isOpen) return
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [isOpen, onClose])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    return (
        <>
            <div className={`sort-sheet-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
            <div className={`sform-sheet ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true" aria-label="Departamento">
                <div className="sort-sheet-handle" />
                <div className="sform-sheet-header">
                    <span className="sform-sheet-title">{department?.departmentName}</span>
                    <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                        <X size={18} strokeWidth={2} />
                    </button>
                </div>
                <div className="sform-sheet-body">
                    <div className="flex flex-col gap-3 pt-1">
                        <button
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-md)] text-[0.9375rem] font-medium text-[var(--color-text-primary)] bg-[var(--color-surface-1)] hover:bg-[var(--color-surface-2)] transition-colors duration-[160ms] text-left"
                            onClick={() => { onClose(); setTimeout(() => onEdit(department), 200) }}
                        >
                            <Pencil size={18} strokeWidth={2} className="text-[var(--color-accent)]" />
                            Editar
                        </button>
                        <button
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-[var(--radius-md)] text-[0.9375rem] font-medium text-[var(--color-danger)] bg-[var(--color-danger-soft-bg)] hover:bg-[var(--color-danger-soft-bg-hover,var(--color-danger-soft-bg))] transition-colors duration-[160ms] text-left"
                            onClick={() => { onClose(); setTimeout(() => onDelete(department.departmentId), 200) }}
                        >
                            <Trash2 size={18} strokeWidth={2} />
                            Remover
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}

const DepartmentList = () => {
    const { request, loading } = useFetch(ENV.API_BASE_URL)
    const isMobile = useIsMobile()
    const { registerPage, unregisterPage } = useMobilePage()

    const [departments, setDepartments] = useState([])
    const [error, setError] = useState('')

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = useState(false)
    const [departmentToEdit, setDepartmentToEdit] = useState(null)

    const [detailSheetOpen, setDetailSheetOpen] = useState(false)
    const [detailSheetDept, setDetailSheetDept] = useState(null)

    const [formSheetOpen, setFormSheetOpen] = useState(false)
    const [formSheetDept, setFormSheetDept] = useState(null)

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [departmentToRemove, setDepartmentToRemove] = useState(null)

    const columns = [
        { key: 'departmentName', label: 'Nome' },
    ]

    const fetchDepartments = useCallback(async () => {
        const res = await request('GET', '/departments/company?size=50&sort=departmentName,asc')
        if (res.ok) {
            const all = res.data.content ?? res.data
            setDepartments(all.filter(d => d.departmentName !== 'Default'))
            setError('')
        } else {
            setError('Não foi possível carregar os departamentos.')
        }
    }, [request])

    useEffect(() => {
        fetchDepartments()
    }, [fetchDepartments])

    useEffect(() => {
        registerPage('Departamentos', fetchDepartments)
        return () => unregisterPage()
    }, [registerPage, unregisterPage, fetchDepartments])

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
        setConfirmOpen(false)
        setDepartmentToRemove(null)
    }

    const closeFormSheet = () => {
        setFormSheetOpen(false)
        setFormSheetDept(null)
        setDepartmentToEdit(null)
    }

    const handleSave = () => {
        fetchDepartments()
    }

    const handleSaveEdit = (updated) => {
        setDepartments(prev => prev.map(d => d.departmentId === updated.departmentId ? updated : d))
    }

    const requestRemove = (departmentId) => {
        const dept = departments.find(d => d.departmentId === departmentId)
        setDepartmentToRemove(dept)
        setConfirmOpen(true)
    }

    const confirmRemove = async () => {
        if (!departmentToRemove) return
        const res = await request('DELETE', `/departments/${departmentToRemove.departmentId}`)
        if (res.ok) {
            fetchDepartments()
            setError('')
        } else {
            setError('Erro ao remover departamento. Tente novamente.')
        }
        closeModals()
    }

    const renderDepartmentCard = (dept) => ({
        avatar: initials(dept.departmentName, 1),
        title: dept.departmentName,
    })

    return (
        <PageContainer variant="list">
            {error && <Alert message={error} />}

            {isMobile ? (
                <>
                    <MobileCardList
                        title="Departamentos"
                        items={departments}
                        idKey="departmentId"
                        loading={loading}
                        emptyMessage="Nenhum departamento cadastrado."
                        onReload={fetchDepartments}
                        onAdd={openCreateForm}
                        onCardClick={openDetailSheet}
                        renderCard={renderDepartmentCard}
                        sortColumns={columns}
                    />
                    <DepartmentDetailSheet
                        isOpen={detailSheetOpen}
                        onClose={closeDetailSheet}
                        department={detailSheetDept}
                        onEdit={openEditModal}
                        onDelete={requestRemove}
                    />
                    <DepartmentFormSheet
                        isOpen={formSheetOpen}
                        onClose={closeFormSheet}
                        department={formSheetDept}
                        onSave={formSheetDept ? handleSaveEdit : handleSave}
                    />
                </>
            ) : (
                <>
                    <Table
                        title="Departamentos"
                        columns={columns}
                        data={departments}
                        idKey="departmentId"
                        loading={loading}
                        onEdit={openEditModal}
                        onDelete={requestRemove}
                        onAdd={openCreateForm}
                        onReload={fetchDepartments}
                        emptyMessage="Nenhum departamento cadastrado."
                    />
                </>
            )}

            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title="Novo Departamento">
                <DepartmentForm onSave={handleSave} onClose={closeModals} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title="Editar Departamento">
                <DepartmentForm department={departmentToEdit} onSave={handleSaveEdit} onClose={closeModals} />
            </Modal>

            <ConfirmDialog
                isOpen={confirmOpen}
                onClose={closeModals}
                onConfirm={confirmRemove}
                loading={loading}
            >
                Tem certeza de que deseja remover o departamento <strong>{departmentToRemove?.departmentName}</strong>?
                {departments.length === 1 && (
                    <span> O departamento voltará ao estado padrão.</span>
                )}
            </ConfirmDialog>
        </PageContainer>
    )
}

export default DepartmentList
