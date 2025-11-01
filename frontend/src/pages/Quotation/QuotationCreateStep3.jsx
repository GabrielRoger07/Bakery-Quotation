import { useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import useFetch from '../../hooks/useFetch'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish }) => {
    const { request } = useFetch("http://localhost:8080/api/v1")
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
                setAvailableSuppliers(res.data)
            }
        }
        fetchSuppliers()
    }, [request])

    const handleAddSupplier = (supplier) => {
        if(localSelected.find(s => s.supplierId === supplier.supplierId)){
            setError("Supplier already added!")
            return
        }
        setLocalSelected([...localSelected, supplier])
        setError("")
    }

    const handleRemoveSupplier = (supplierId) => {
        setLocalSelected(localSelected.filter(s => s.supplierId !== supplierId))
    }

    return (
        <div className="step-suppliers">
            <h2>Step 3: Select Suppliers</h2>

            <div className="available-suppliers">
                <ul>
                    {availableSuppliers.map(s => (
                        <li key={s.supplierId} className="available-supplier-item">
                            {s.supplierName} ({s.employerName}){" "}
                            <Button className="add-supplier-btn" onClick={() => handleAddSupplier(s)}>Add</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <Alert message={error} />

            <div className="selected-suppliers">
                <h3>Suppliers Added ({localSelected.length})</h3>
                <ul>
                    {localSelected.map(s => (
                        <li key={s.supplierId} className="selected-supplier-item">
                            {s.supplierName} ({s.employerName}){" "}
                            <Button className="remove-supplier-btn" onClick={() => handleRemoveSupplier(s.supplierId)}>Remove</Button>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="step-navigation">
                <Button onClick={onBack}>Back</Button>
                <Button onClick={() => {
                    onFinish(localSelected)
                }}>Finish</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep3