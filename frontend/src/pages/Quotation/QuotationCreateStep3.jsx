import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { ENV } from '../../config/env'

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish, loading }) => {
    
    const { t } = useTranslation()
    
    const { request } = useFetch(ENV.API_BASE_URL)
    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [localSelected, setLocalSelected] = useState(selectedSuppliers)
    const [error, setError] = useState("")

    useEffect(() => {
        const token = Cookies.get("token")
        const decoded = jwtDecode(token)
        const cnpj = decoded.companyCnpj

        const fetchSuppliers = async () => {
            const res = await request("GET", `/suppliers/company/${cnpj}`)
            if(res.ok){
                setAvailableSuppliers(res.data.content)
            }
        }
        fetchSuppliers()
    }, [request])

    useEffect(() => {
        onChange(localSelected)
    }, [localSelected])

    const handleAddSupplier = (supplier) => {
        if(localSelected.find(s => s.supplierId === supplier.supplierId)){
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
        <div className="step-suppliers">
            <h2>{t("quotation_step_3")}</h2>

            <div className="available-suppliers">
                <ul>
                    {availableSuppliers.filter(s => !localSelected.some(sel => sel.supplierId === s.supplierId)).map(s => (
                        <li key={s.supplierId} className="available-supplier-item">
                            {s.supplierName} ({s.employerName}){" "}
                            <Button className="add-supplier-btn" onClick={() => handleAddSupplier(s)} disabled={loading}>{t("table_add")}</Button>
                        </li>
                    ))}
                </ul>
            </div>

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