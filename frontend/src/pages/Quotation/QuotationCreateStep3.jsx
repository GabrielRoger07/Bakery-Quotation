import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import Pagination from '../../components/Pagination'
import { ENV } from '../../config/env'

const QuotationCreateStep3 = ({ selectedSuppliers, onChange, onBack, onFinish, loading }) => {
    const { t } = useTranslation()
    const { request } = useFetch(ENV.API_BASE_URL)

    const [availableSuppliers, setAvailableSuppliers] = useState([])
    const [localSelected, setLocalSelected] = useState(() => [...selectedSuppliers].sort((a, b) => a.supplierName.localeCompare(b.supplierName)))
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

        let query = `?page=${page}&sort=supplierName,asc`

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
        setLocalSelected([...localSelected, supplier].sort((a, b) => a.supplierName.localeCompare(b.supplierName)))
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
        <div className="max-w-[1000px] mx-auto">
            <h2 className="text-center mt-0 mb-4 text-[var(--color-text-strong)] text-[1.125rem]">{t("quotation_step_3")}</h2>

            {/* Search card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <div className="flex gap-3 items-end max-[768px]:flex-col max-[768px]:items-stretch">
                    <div className="flex-[0_0_220px] relative max-[768px]:flex-none max-[768px]:w-full">
                        <select
                            id="searchField"
                            name="searchField"
                            value={searchField}
                            onChange={(e) => setSearchField(e.target.value)}
                            className="toolbar-select w-full"
                            required
                        >
                            <option value="" disabled>{t("select_field")}</option>
                            <option value="supplierName">{t("supplier_name")}</option>
                            <option value="supplierEmail">{t("supplier_email")}</option>
                            <option value="supplierWhatsappNumber">{t("supplier_whatsapp")}</option>
                            <option value="employerName">{t("employer_name")}</option>
                            <option value="employerCnpj">{t("employer_cnpj")}</option>
                        </select>
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                    </div>

                    <div className="flex-1 min-w-[200px] max-[768px]:min-w-0 [&_.input-container]:mb-0">
                        <Input
                            type="text"
                            value={searchWord}
                            onChange={e => setSearchWord(e.target.value)}
                            placeholder={t("enter_search")}
                        />
                    </div>

                    <Button onClick={handleSearchSuppliers} disabled={loading} className="whitespace-nowrap">{t("search_button")}</Button>
                </div>
            </div>

            {/* Results card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                {availableSuppliers.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">{t("no_suppliers_available")}</p>
                ) : (
                    <div className="border border-[var(--color-border-light)] rounded-[var(--radius-md)] overflow-hidden bg-[var(--color-surface-0)] mb-[0.4rem]">
                        {availableSuppliers.map(s => (
                            <div
                                key={s.supplierId}
                                className="flex justify-between items-center px-[0.72rem] py-[0.55rem] bg-[var(--color-surface-0)] transition-[background-color] duration-[160ms] border-b border-[var(--color-border-lighter)] last:border-b-0 hover:bg-[var(--color-surface-1)]"
                            >
                                <div className="flex flex-col">
                                    <strong className="text-[0.875rem] text-[var(--color-text-strong)]">{s.supplierName}</strong>
                                    <span className="text-[0.75rem] text-[var(--color-text-subtle)]">{s.employerName}</span>
                                </div>

                                <Button
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

            {/* Selected suppliers card */}
            <div className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-lg)] p-4 mb-3 [box-shadow:var(--shadow-xs)]">
                <h4 className="m-0 mb-[0.6rem] text-[var(--color-text-secondary)] text-[1rem] font-semibold">
                    {t("suppliers_added")} ({localSelected.length})
                </h4>

                {localSelected.length === 0 ? (
                    <p className="text-[0.875rem] text-[var(--color-text-muted)] mt-[0.2rem]">{t("no_suppliers_added")}</p>
                ) : (
                    <ul className="list-none p-0 m-0">
                        {localSelected.map(s => (
                            <li key={s.supplierId} className="flex justify-between items-center py-2 border-b border-[var(--color-border-lighter)] last:border-b-0">
                                <div>
                                    <strong className="text-[0.875rem] block text-[var(--color-text-strong)]">{s.supplierName}</strong>
                                    <span className="text-[0.75rem] text-[var(--color-text-muted)]">{s.employerName}</span>
                                </div>
                                <Button variant="danger" onClick={() => handleRemoveSupplier(s.supplierId)} disabled={loading}>{t("remove_button")}</Button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div className="flex justify-center gap-3 mt-5 max-[768px]:flex-col max-[768px]:gap-[0.65rem]">
                <Button onClick={onBack} disabled={loading} className="max-[768px]:w-full">{t("back_button")}</Button>
                <Button onClick={handleFinishClick} disabled={loading} className="max-[768px]:w-full">{loading ? t("loading_message") : t("next_button")}</Button>
            </div>
        </div>
    )
}

export default QuotationCreateStep3
