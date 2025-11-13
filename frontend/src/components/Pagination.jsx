import React from 'react'
import Button from './Button'
import './Pagination.css'

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    
    if(totalPages <= 1) return null

    const getPageNumbers = () => {
        const pages = []
        const lastPage = totalPages - 1

        pages.push(0)

        if(currentPage > 2){
            pages.push("ellipsis-start")
        }

        if(currentPage > 1){
            pages.push(currentPage - 1)
        }

        if(currentPage !== 0 && currentPage !== lastPage){
            pages.push(currentPage)
        }

        if(currentPage < lastPage - 1){
            pages.push(currentPage + 1)
        }

        if(currentPage < lastPage - 2){
            pages.push("ellipsis-end")
        }

        if(lastPage !== 0){
            pages.push(lastPage)
        }

        return [...new Set(pages)]
    }

    const pages = getPageNumbers()

    return (
        <div className="pagination-container">
            <Button disabled={currentPage === 0} onClick={() => onPageChange(currentPage - 1)}>← Previous</Button>
            <div className="pagination-pages">
                {pages.map((page, index) => {
                    if(page === "ellipsis-start" || page === "ellipsis-end"){
                        return <span key={index} className="ellipsis">...</span>
                    }

                    return (
                        <button key={index} className={page === currentPage ? "page-button active" : "page-button"} onClick={() => onPageChange(page)}>
                        {page + 1}
                        </button>
                    )
                })}
            </div>
            <Button disabled={currentPage === totalPages - 1} onClick={() => onPageChange(currentPage + 1)}>Next →</Button>
        </div>
    )
}

export default Pagination