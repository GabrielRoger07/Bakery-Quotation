import { useEffect, useState } from 'react'
import Button from '@/components/ui/Button'
import { Pencil, Trash, Eye, Activity, SlidersHorizontal, Plus } from 'lucide-react'
import { useMobilePage } from '@/contexts/MobilePageContext'


const Table = ({ title, columns = [], data = [], idKey = "id", loading = false, emptyMessage = "No records found.", onEdit, onDelete, onAdd, onView, onReload, onMonitor, onSort, sortField, sortDirection, toolbar, filterActive = false, filterSlot }) => {
    const [toolbarOpen, setToolbarOpen] = useState(false)
    const { registerPage, unregisterPage } = useMobilePage()

    useEffect(() => {
        if (title && onReload) {
            registerPage(title, onReload)
        }
        return () => unregisterPage()
    }, [title, onReload, registerPage, unregisterPage])

    return (
        <>
        <div className="w-full max-w-[1200px] mx-auto mb-5 px-[1.625rem] py-6 bg-[var(--color-surface-0)] rounded-[var(--radius-xl)] border border-[var(--color-border)] [box-shadow:var(--shadow-card-soft)] hover:[box-shadow:var(--shadow-card-md)] transition-[box-shadow] duration-[160ms] max-sm:px-[0.75rem] max-sm:py-[0.875rem] max-sm:rounded-[var(--radius-md)] max-[768px]:px-[1.125rem] max-[768px]:rounded-[var(--radius-lg)]">
            {/* Header — oculto no mobile (título e botões vão para a navbar) */}
            <div className="flex justify-between items-center mb-5 max-[640px]:hidden max-[768px]:flex-col max-[768px]:items-start max-[768px]:gap-[0.875rem]">
                <h1 className="m-0 text-[1.125rem] text-[var(--color-text-strong)] font-bold tracking-[-0.02em]">{title}</h1>
                <div className="flex items-center gap-2 max-[768px]:w-full max-[768px]:justify-start max-[768px]:flex-wrap">
                    {loading && (
                        <div className="w-[0.9375rem] h-[0.9375rem] border-2 border-[var(--color-border-spinner)] border-t-[var(--color-accent)] rounded-full [animation:spin_0.65s_linear_infinite] mr-1" />
                    )}
                    {toolbar && (
                        <div className="relative inline-flex">
                            <Button
                                variant={toolbarOpen ? 'primary' : 'secondary'}
                                className="!p-[0.4375rem] !min-w-[2.375rem] !min-h-[2.375rem] flex items-center justify-center"
                                onClick={() => setToolbarOpen(prev => !prev)}
                            >
                                <SlidersHorizontal size={16} />
                            </Button>
                            {filterActive && !toolbarOpen && (
                                <span className="absolute top-[2px] right-[2px] w-[7px] h-[7px] rounded-full bg-[var(--color-accent)] border-[1.5px] border-[var(--color-surface-0)] pointer-events-none" />
                            )}
                        </div>
                    )}
                    {onReload && <Button onClick={onReload}>Atualizar</Button>}
                    {onAdd && <Button onClick={onAdd}>Adicionar</Button>}
                </div>
            </div>

            {/* Mobile: botão de filtro + spinner (título/reload/add foram para navbar) */}
            <div className="hidden max-[640px]:flex items-center gap-2 mb-3">
                {toolbar && (
                    <div className="relative inline-flex">
                        <Button
                            variant={toolbarOpen ? 'primary' : 'secondary'}
                            className="!p-[0.4375rem] !min-w-[2.375rem] !min-h-[2.375rem] flex items-center justify-center"
                            onClick={() => setToolbarOpen(prev => !prev)}
                        >
                            <SlidersHorizontal size={16} />
                        </Button>
                        {filterActive && !toolbarOpen && (
                            <span className="absolute top-[2px] right-[2px] w-[7px] h-[7px] rounded-full bg-[var(--color-accent)] border-[1.5px] border-[var(--color-surface-0)] pointer-events-none" />
                        )}
                    </div>
                )}
                {loading && (
                    <div className="w-[0.9375rem] h-[0.9375rem] border-2 border-[var(--color-border-spinner)] border-t-[var(--color-accent)] rounded-full [animation:spin_0.65s_linear_infinite]" />
                )}
            </div>

            {/* Toolbar (animated) */}
            {toolbar && (
                <div className={`grid transition-[grid-template-rows] duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${toolbarOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                        <div className="flex gap-[0.625rem] items-center py-[0.875rem] pb-[calc(0.875rem+1.125rem)] border-t border-b border-[var(--color-border-lighter)] max-[600px]:flex-wrap">
                            {toolbar}
                        </div>
                    </div>
                </div>
            )}

            {filterSlot && (
                <div className="mb-4">
                    {filterSlot}
                </div>
            )}

            {!loading && data.length === 0 && (
                <p className="text-[var(--color-text-muted)] text-center py-10 px-6 text-[0.875rem]">{emptyMessage}</p>
            )}

            {!loading && data.length > 0 && (
                <div className="overflow-x-auto overflow-y-visible [-webkit-overflow-scrolling:touch] rounded-[var(--radius-lg)] border border-[var(--color-border-light)]">
                    <table className="w-full border-collapse min-w-[600px]">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => onSort && onSort(col.key)}
                                        className="sticky top-0 z-[1] bg-[var(--color-accent)] text-[var(--color-on-dark-text)] text-left px-4 py-3 font-semibold text-[0.8125rem] uppercase tracking-[0.07em] border-r border-[var(--color-on-dark-border-light)] whitespace-nowrap cursor-pointer select-none transition-[background-color,color] duration-[160ms] hover:bg-[var(--color-accent-hover)] hover:text-[var(--color-on-dark-text-hover)] last:border-r-0 max-[768px]:px-3 max-[768px]:py-[0.625rem] max-[768px]:text-[0.8125rem]"
                                    >
                                        {col.label}
                                        {sortField === col.key && (
                                            <span className="ml-[5px] text-[0.6875rem] opacity-70">{sortDirection === "asc" ? "▲" : "▼"}</span>
                                        )}
                                    </th>
                                ))}
                                {(onEdit || onDelete || onView || onMonitor) && (
                                    <th className="sticky top-0 z-[1] bg-[var(--color-accent)] text-[var(--color-on-dark-text)] text-left px-4 py-3 font-semibold text-[0.8125rem] uppercase tracking-[0.07em]">
                                        <span className="block text-center">Ações</span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item[idKey] || index} className="even:[&>td]:bg-[var(--color-surface-1)] hover:[&>td]:bg-[var(--color-highlight-lighter)] hover:[&>td]:transition-[background-color] hover:[&>td]:duration-[160ms]">
                                    {columns.map((col) => (
                                        <td key={col.key} className="px-4 py-[0.875rem] border-b border-r border-[var(--color-border-lighter)] text-[var(--color-text-neutral-strong)] text-[0.875rem] leading-[1.4] bg-[var(--color-surface-0)] last:border-r-0 max-[768px]:px-3 max-[768px]:py-[0.625rem] max-[768px]:text-[0.8125rem]">
                                            {item[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete || onView || onMonitor) && (
                                        <td className="px-4 py-[0.875rem] border-b border-[var(--color-border-lighter)] bg-[var(--color-surface-0)] max-[768px]:px-3 max-[768px]:py-[0.625rem]">
                                            <div className="flex flex-row justify-center items-center gap-[0.375rem] whitespace-nowrap flex-nowrap">
                                                {onEdit && (
                                                    <Button onClick={() => onEdit(item)} className="!min-w-[2.125rem] !p-[0.375rem] text-[0.875rem] flex-shrink-0 max-[768px]:!min-w-[2.75rem] max-[768px]:!min-h-[2.75rem] max-[768px]:!p-2">
                                                        <Pencil size={18} />
                                                    </Button>
                                                )}
                                                {onDelete && (
                                                    <Button onClick={() => onDelete(item[idKey])} variant="danger" className="!min-w-[2.125rem] !p-[0.375rem] text-[0.875rem] flex-shrink-0 max-[768px]:!min-w-[2.75rem] max-[768px]:!min-h-[2.75rem] max-[768px]:!p-2">
                                                        <Trash size={18} />
                                                    </Button>
                                                )}
                                                {onView && (
                                                    <Button onClick={() => onView(item)} className="!min-w-[2.125rem] !p-[0.375rem] text-[0.875rem] flex-shrink-0 max-[768px]:!min-w-[2.75rem] max-[768px]:!min-h-[2.75rem] max-[768px]:!p-2">
                                                        <Eye size={18} />
                                                    </Button>
                                                )}
                                                {onMonitor && (
                                                    <Button onClick={() => onMonitor(item)} className="!min-w-[2.125rem] !p-[0.375rem] text-[0.875rem] flex-shrink-0 max-[768px]:!min-w-[2.75rem] max-[768px]:!min-h-[2.75rem] max-[768px]:!p-2">
                                                        <Activity size={18} />
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>

        {/* FAB mobile: botão + fixo acima do bottom nav */}
        {onAdd && (
            <button
                onClick={onAdd}
                className="hidden max-[640px]:flex fixed right-5 items-center justify-center w-[3.25rem] h-[3.25rem] rounded-full bg-[var(--color-accent)] text-white [box-shadow:var(--shadow-accent)] transition-[transform,box-shadow] duration-[160ms] active:scale-95 hover:[box-shadow:var(--shadow-hover-accent)] z-[999]"
                style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom) + 1rem)' }}
                aria-label="Adicionar"
            >
                <Plus size={26} strokeWidth={2.5} />
            </button>
        )}
        </>
    )
}

export default Table