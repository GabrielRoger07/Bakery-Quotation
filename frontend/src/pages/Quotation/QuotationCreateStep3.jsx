import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'
import Input from '../../components/Input'

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
    }, [localSelected])

    const fetchSuppliers = async (page = 0) => {

        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const excludedIds = localSelected.map(s => s.supplierId)

        let query = `?page=${page}`

        if(searchField) query += `&field=${searchField}`
        if(searchWord) query += `&value=${searchWord}`
        if(excludedIds.length > 0) query += `&excludedIds=${excludedIds.join(",")}`

        const res = await request("GET", `/suppliers/company/${cnpj}${query}`)
        if(res.ok){
            setAvailableSuppliers(res.data.content)
            setCurrentPage(res.data.number)
            setTotalPages(res.data.totalPages)
            setError("")
        }else{
            setError(res.data?.message)
        }
    }

    useEffect(() => {
        fetchSuppliers(0)
    }, [])

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
        fetchSuppliers(currentPage)
    }

    const handleRemoveSupplier = (supplierId) => {
        const updatedList = localSelected.filter(s => s.supplierId !== supplierId)
        setLocalSelected(updatedList)
        fetchSuppliers(currentPage)
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
        <div className="step-suppliers">
            <h2>{t("quotation_step_3")}</h2>

            <div className="select-wrapper">
                <select id="searchField" name="searchField" value={searchField} onChange={(e) => setSearchField(e.target.value)} className="custom-select" required >
                    <option value="" disabled>{t("select_field")}</option>
                    <option value="productBarCodeNumber">{t("barcode_number")}</option>
                    <option value="productName">{t("product_name")}</option>
                </select>
                <span className="select-arrow"></span>
            </div>

            <Input 
                label={t("quantity")}
                type="text"
                value={searchWord}
                onChange={e => setSearchWord(e.target.value)}
                placeholder={t("enter_search")}
            />

            <Button onClick={handleSearchSuppliers} disabled={loading}>{t("search_button")}</Button>

            <div className="available-suppliers">
                <ul>

                    {availableSuppliers.length === 0 && (
                        <li className="empty-message">
                            {t("no_suppliers_available")}
                        </li>
                    )}

                    {availableSuppliers.map(s => (
                        <li key={s.supplierId} className="available-supplier-item">
                            {s.supplierName} ({s.employerName})
                            <Button 
                                className="add-supplier-btn"
                                onClick={() => handleAddSupplier(s)}
                                disabled={loading} 
                            >{t("table_add")}</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => fetchSuppliers(page)}
            />

            {error && <Alert message={error} />}

            <div className="selected-suppliers">
                <h3>{t("suppliers_added")} ({localSelected.length})</h3>
                <ul>
                    {localSelected.map(s => (
                        <li key={s.supplierId} className="selected-supplier-item">
                            {s.supplierName} ({s.employerName}){" "}
                            <Button className="remove-supplier-btn" onClick={() => handleRemoveSupplier(s.supplierId)} disabled={loading}>{t("remove_button")}</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="step-navigation">
                <Button onClick={onBack} disabled={loading}>{t("back_button")}</Button>
                <Button onClick={handleFinishClick} disabled={loading}>{loading ? t("saving_message") : t("save_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep3