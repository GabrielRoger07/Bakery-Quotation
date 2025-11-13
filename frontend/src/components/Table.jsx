import React from 'react'
import './Table.css'
import Button from './Button'
import { Pencil, Trash, Eye, Activity } from 'lucide-react'

const Table = ({title, columns = [], data = [], idKey = "id", loading = false, emptyMessage = "No records found.", onEdit, onDelete, onAdd, onView, onReload, onMonitor, onSort, sortField, sortDirection }) => {
  return (
    <div className="table-container">
        <div className="table-header">
            <h1>{title}</h1>
            <div className="table-header-buttons">
                {onReload && <Button onClick={onReload}>Reload</Button>}
                {onAdd && <Button onClick={onAdd}>Add</Button>}
            </div>
        </div>

        {loading && <p>Loading...</p>}

        {!loading && data.length === 0 &&(
            <p className="empty-message">{emptyMessage}</p>
        )}

        {!loading && data.length > 0 &&(
            <div className="table-wrapper">
                <table className="custom-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            {columns.map((col) => (
                                <th key={col.key} onClick={() => onSort && onSort(col.key)} className="sortable-column">{col.label} {sortField === col.key && (
                                    <span className="sort-indicator">{sortDirection == "asc" ? "▲" : "▼"}</span>
                                )}</th>
                            ))}
                            {(onEdit || onDelete || onView || onMonitor) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item[idKey] || index}>
                                <td>{index + 1}</td>
                                {columns.map((col) => (
                                    <td key={col.key}>{item[col.key]}</td>
                                ))}
                                {(onEdit || onDelete || onView || onMonitor) && (
                                    <td className="actions">
                                        {onEdit && (
                                            <Button onClick={() => onEdit(item)}><Pencil size={18}/></Button>
                                        )}
                                        {onDelete && (
                                            <Button onClick={() => onDelete(item[idKey])}><Trash size={18}/></Button>
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