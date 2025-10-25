import React from 'react'
import './Table.css'
import Button from './Button'

const Table = ({title, columns = [], data = [], idKey = "id", loading = false, emptyMessage = "No records found.", onEdit, onDelete, onAdd, onReload}) => {
  return (
    <div className="table-container">
        <div className="table-header">
            <h1>{title}</h1>
            <div className="table-haeder-buttons">
                {onAdd && <Button onClick={onAdd}>Add</Button>}
                {onReload && <Button onClick={onReload}>Reload</Button>}
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
                            {(onEdit || onDelete) && <th>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={item[idKey] || index}>
                                {columns.map((col) => (
                                    <td key={col.key}>{item[col.key]}</td>
                                ))}
                                {(onEdit || onDelete) && (
                                    <td className="actions">
                                        {onEdit && (
                                            <Button onClick={() => onEdit(item)}>Edit</Button>
                                        )}
                                        {onDelete && (
                                            <Button onClick={() => onDelete(item[idKey])}>Delete</Button>
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