import React from 'react'
import './Table.css'
import Button from './Button'

const Table = ({title, columns = [], data = [], idKey = "id", loading = false, emptyMessage = "No records found.", onEdit, onDelete, onAdd, onView, onReload}) => {
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
                            {columns.map((col) => (
                                <th key={col.key}>{col.label}</th>
                            ))}
                            {(onEdit || onDelete || onView) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item[idKey] || index}>
                                {columns.map((col) => (
                                    <td key={col.key}>{item[col.key]}</td>
                                ))}
                                {(onEdit || onDelete | onView) && (
                                    <td className="actions">
                                        {onEdit && (
                                            <Button onClick={() => onEdit(item)}>Edit</Button>
                                        )}
                                        {onDelete && (
                                            <Button onClick={() => onDelete(item[idKey])}>Delete</Button>
                                        )}
                                        {onView && (
                                            <Button onClick={() => onView(item)}>View</Button>
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