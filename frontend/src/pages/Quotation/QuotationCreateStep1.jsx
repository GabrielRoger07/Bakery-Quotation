import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import { Gavel, FileText, Check } from 'lucide-react'
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

            <div className="step1-card">
                <div className="step1-card-header">
                    <span className="step1-card-title">{t("quotation_step_1_subtitle_1")}</span>
                    <span className="step1-card-desc">{t("quotation_step_1_subtitle_2")}</span>
                </div>
                <div className="step1-card-content">
                    <div className="step1-date-grid">
                        <div className="step1-field">
                            <label className="step1-label">{t("quotation_start_date")}</label>
                            <input
                                type="datetime-local"
                                className={`step1-input${localError && !localStart ? " step1-input-error" : ""}`}
                                value={localStart}
                                onChange={e => setLocalStart(e.target.value)}
                            />
                        </div>
                        <div className="step1-field">
                            <label className="step1-label">{t("quotation_end_date")}</label>
                            <input
                                type="datetime-local"
                                className={`step1-input${localError && !localEnd ? " step1-input-error" : ""}`}
                                value={localEnd}
                                onChange={e => setLocalEnd(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="step1-card">
                <div className="step1-card-header">
                    <span className="step1-card-title">{t("quotation_mode")}</span>
                    <span className="step1-card-desc">{t("quotation_mode_help")}</span>
                </div>
                <div className="step1-card-content">
                    <div className="step1-mode-grid">
                        <div
                            className={`step1-mode-card${localIsAuction ? " step1-mode-selected" : ""}`}
                            onClick={() => setLocalIsAuction(true)}
                        >
                            <div className="step1-mode-check">
                                <Check size={11} strokeWidth={3} />
                            </div>
                            <Gavel size={22} className="step1-mode-icon" />
                            <span className="step1-mode-title">{t("quotation_mode_auction")}</span>
                            <span className="step1-mode-desc">{t("quotation_mode_auction_desc")}</span>
                        </div>
                        <div
                            className={`step1-mode-card${!localIsAuction ? " step1-mode-selected" : ""}`}
                            onClick={() => setLocalIsAuction(false)}
                        >
                            <div className="step1-mode-check">
                                <Check size={11} strokeWidth={3} />
                            </div>
                            <FileText size={22} className="step1-mode-icon" />
                            <span className="step1-mode-title">{t("quotation_mode_single_proposal")}</span>
                            <span className="step1-mode-desc">{t("quotation_mode_single_proposal_desc")}</span>
                        </div>
                    </div>
                </div>
            </div>

            {localError && <Alert message={localError}/>}

            <div className="step-navigation">
                <Button onClick={handleNextClick} disabled={loading}>{loading ? t("loading_message") : t("next_button")}</Button>
            </div>

        </div>
    )
}

export default QuotationCreateStep1
