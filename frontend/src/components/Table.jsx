import { useState } from 'react'
import './Table.css'
import { useTranslation } from 'react-i18next'
import Button from './Button'
import { Pencil, Trash, Eye, Activity, SlidersHorizontal } from 'lucide-react'

const Table = ({title, columns = [], data = [], idKey = "id", loading = false, emptyMessage = "No records found.", onEdit, onDelete, onAdd, onView, onReload, onMonitor, onSort, sortField, sortDirection, toolbar, filterActive = false }) => {

    const { t } = useTranslation()
    const [toolbarOpen, setToolbarOpen] = useState(false)

    return (
        <div className="table-container">
            <div className="table-header">
                <h1 className="table-title">{title}</h1>
                <div className="table-header-buttons">
                    {loading && <div className="loading-spinner"></div>}
                    {toolbar && (
                        <div className="filter-toggle-wrapper">
                            <Button
                                variant="secondary"
                                className={`filter-toggle-btn${toolbarOpen ? " filter-toggle-active" : ""}`}
                                onClick={() => setToolbarOpen(prev => !prev)}
                            >
                                <SlidersHorizontal size={16} />
                            </Button>
                            {filterActive && !toolbarOpen && <span className="filter-active-dot" />}
                        </div>
                    )}
                    {onReload && <Button onClick={onReload}>{t("table_reload")}</Button>}
                    {onAdd && <Button onClick={onAdd}>{t("table_add")}</Button>}
                </div>
            </div>

            {toolbar && (
                <div className={`table-toolbar-wrapper${toolbarOpen ? " open" : ""}`}>
                    <div className="table-toolbar-inner">
                        <div className="table-toolbar">
                            {toolbar}
                        </div>
                    </div>
                </div>
            )}

            {loading && <p>Loading...</p>}

            {!loading && data.length === 0 &&(
                <p className="empty-message">{emptyMessage}</p>
            )}

            {!loading && data.length > 0 &&(
                <div className="table-wrapper">
                    <table className="custom-table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col.key} onClick={() => onSort && onSort(col.key)} className="sortable-column">{col.label} {sortField === col.key && (
                                        <span className="sort-indicator">{sortDirection === "asc" ? "▲" : "▼"}</span>
                                    )}</th>
                                ))}
                                {(onEdit || onDelete || onView || onMonitor) && (
                                    <th className="actions-header">
                                        <span className="actions-header-label">{t("table_actions")}</span>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={item[idKey] || index}>
                                    {columns.map((col) => (
                                        <td key={col.key}>{item[col.key]}</td>
                                    ))}
                                    {(onEdit || onDelete || onView || onMonitor) && (
                                        <td className="actions">
                                            {onEdit && (
                                                <Button onClick={() => onEdit(item)}><Pencil size={18}/></Button>
                                            )}
                                            {onDelete && (
                                                <Button onClick={() => onDelete(item[idKey])} variant="danger"><Trash size={18}/></Button>
                                            )}
                                            {onView && (
                                                <Button onClick={() => onView(item)}><Eye size={18}/></Button>
                                            )}
                                            {onMonitor && (
                                                <Button onClick={() => onMonitor(item)}><Activity size={18}/></Button>
                                            )}
                                        </td>

                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default Table