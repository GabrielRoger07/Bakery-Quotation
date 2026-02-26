import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import './QuotationCreate.css'

const QuotationCreateStep1 = ({ start, end, isAuction, onChange, onNext, loading }) => {
    
    const { t } = useTranslation()

    const [localStart, setLocalStart] = useState(start || "")
    const [localEnd, setLocalEnd] = useState(end || "")
    const [localIsAuction, setLocalIsAuction] = useState(typeof isAuction === "boolean" ? isAuction : false)
    const [localError, setLocalError] = useState("")

    useEffect(() => {
        setLocalStart(start)
        setLocalEnd(end)
        setLocalIsAuction(typeof isAuction === "boolean" ? isAuction : false)
    }, [start, end, isAuction])

    const handleNextClick = () => {
        onChange("start", localStart)
        onChange("end", localEnd)
        onChange("isAuction", localIsAuction)

        if(!localStart || !localEnd) {
            setLocalError(t("all_fields_required"))
            return
        }

        const now = new Date()
        const s = new Date(localStart)
        const e = new Date(localEnd)

        if(s <= now){
            setLocalError(t("quotation_start_bigger_now"))
            return
        } else if(e <= now) {
            setLocalError(t("quotation_end_lower_now"))
            return
        } else if(e <= s){
            setLocalError(t("quotation_end_lower_start"))
            return
        }

        setLocalError("")
        onNext()
    }
    
    return (
        <div className="step-products">
            <h2>{t("quotation_step_1")}</h2>

            <div className="results-card">
                <h4>{t("quotation_start_date")}</h4>
                <div className="quantity-bonus-group">
                    <Input id="quotation-start" type="datetime-local" value={localStart} onChange={e => setLocalStart(e.target.value)} className={localError && !localStart ? "input-error" : ""} />
                </div>
            </div>

            <div className="results-card">
                <h4>{t("quotation_end_date")}</h4>
                <div className="quantity-bonus-group">
                    <Input id="quotation-end" type="datetime-local" value={localEnd} onChange={e => setLocalEnd(e.target.value)} className={localError && !localEnd ? "input-error" : ""} />
                </div>
            </div>

            <div className="results-card">
                <h4>{t("quotation_mode")}</h4>
                <div className="quotation-mode-options">
                    <div className="quotation-mode-option">
                        <Input label={t("quotation_mode_auction")} type="radio" name="quotationMode" value="auction" checked={localIsAuction} onChange={() => setLocalIsAuction(true)} />
                    </div>

                    <div className="quotation-mode-option">
                        <Input label={t("quotation_mode_single_proposal")} type="radio" name="quotationMode" value="single-proposal" checked={!localIsAuction} onChange={() => setLocalIsAuction(false)} />
                    </div>
                </div>
                <p className="quotation-mode-help">{t("quotation_mode_help")}</p>
            </div>

            {localError && <Alert message={localError}/>}

            <div className="step-navigation">
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>

        </div>
    )
}

export default QuotationCreateStep1