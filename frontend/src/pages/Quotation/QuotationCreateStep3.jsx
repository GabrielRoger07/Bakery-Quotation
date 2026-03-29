import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'
import './QuotationCreate.css'

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish, loading }) => {
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)
    
    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedSuppliers)
    const [error, setError] = useState("")
    const [searchField, setSearchField] = useState("")
    const [searchWord, setSearchWord] = useState("")
    const [currentPage, setCurrentPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected, onChange])

    const fetchSuppliers = useCallback(async (page = 0, field = searchField, word = searchWord) => {
        const excludedIds = localSelected.map(s => s.supplierId)

        let query = `?page=${page}`

        if(field) query += `&field=${field}`
        if(word) query += `&value=${word}`
        if(excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`

        const res = await request("GET", `/suppliers/company${query}`)
        if(res.ok){
            setAvailableSuppliers(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
    }, [request, localSelected, searchField, searchWord])

    useEffect(() => {
        fetchSuppliers(0, "", "")
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        fetchSuppliers(0)
    }, [localSelected, fetchSuppliers])

    const handleSearchSuppliers = () => {
        setCurrentPage(0)
        fetchSuppliers(0)
    }

    const handleAddSupplier = (supplier) => {
        if(localSelected.some(s => s.supplierId === supplier.supplierId)){
            setError(t("quotation_step_3_supplier_already_added"))
            return
        }
        setLocalSelected([...localSelected, supplier])
        setError("")
    }

    const handleRemoveSupplier = (supplierId) => {
        const updatedList = localSelected.filter(s => s.supplierId !== supplierId)
        setLocalSelected(updatedList)
    }

    const handleFinishClick = () => {
        if(localSelected.length === 0) {
            setError(t("quotation_step_3_no_selected_supplier"))
            return
        }

        setError("")
        onFinish(localSelected)
    }

    return (
        <div className="step-products">
            <h2>{t("quotation_step_3")}</h2>

            <div className="search-card">
                <div className="search-row">
                    <div className="search-select-wrapper">
                        <select id="searchField" name="searchField" value={searchField} onChange={(e) => setSearchField(e.target.value)} className="custom-select" required >
                            <option value="" disabled>{t("select_field")}</option>
                            <option value="employerCnpj">{t("company_cnpj")}</option>
                            <option value="employerName">{t("company_name")}</option>
                            <option value="supplierWhatsappNumber">{t("supplier_whatsapp")}</option>
                            <option value="supplierEmail">{t("supplier_email")}</option>
                            <option value="supplierName">{t("supplier_name_label")}</option>
                        </select>
                        <span className="select-arrow"></span>
                    </div>

                    <div className="search-input-wrapper">
                        <Input 
                            type="text"
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            placeholder={t("enter_search")}
                        />
                    </div>

                    <Button onClick={handleSearchSuppliers} disabled={loading}>{t("search_button")}</Button>
                </div>
            </div>

            <div className="results-card">
                {availableSuppliers.length === 0 ? (
                    <p className="empty-state">{t("no_suppliers_available")}</p>
                ) : (
                    <div className="products-results-list">
                        {availableSuppliers.map(s => (
                            <div key={s.supplierId} className="product-result-item">
                                <div className="product-result-main">
                                    <strong>{s.supplierName}</strong>
                                    <span className="secondary-line">{s.employerName}</span>

                                    <div className="supplier-meta">
                                        {s.employerCnpj && <span>CNPJ: {s.employerCnpj}</span>}
                                        {s.supplierWhatsappNumber && <span>• {s.supplierWhatsappNumber}</span>}
                                        {s.supplierEmail && <span>• {s.supplierEmail}</span>}
                                    </div>
                                </div>

                                <Button 
                                    className="add-inline-btn"
                                    onClick={() => handleAddSupplier(s)}
                                    disabled={loading} 
                                >{t("table_add")}</Button>
                            </div>
                        ))}
                    </div>
                )}

                <Pagination 
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => fetchSuppliers(page)}
                />
            </div>

            {error && <Alert message={error} />}

            <div className="selected-products-card">
                <h4>{t("suppliers_added")} ({localSelected.length})</h4>
                
                {localSelected.length === 0 ? (
                    <p className="empty-state">{t("no_suppliers_added")}</p>
                ) : (
                    <ul>
                        {localSelected.map(s => (
                            <li key={s.supplierId} className="selected-product-item">
                                <div>
                                    <strong>{s.supplierName}</strong>
                                    <span>{s.employerName}</span>
                                </div>
                                <Button className="remove-product-btn" onClick={() => handleRemoveSupplier(s.supplierId)} disabled={loading}>{t("remove_button")}</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleFinishClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep3