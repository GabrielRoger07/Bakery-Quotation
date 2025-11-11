import React, { useEffect, useState } from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'

const QuotationCreateStep1 = ({ start, end, onChange, onNext, loading }) => {
    
    const [localStart, setLocalStart] = useState(start || "")
    const [localEnd, setLocalEnd] = useState(end || "")
    const [localError, setLocalError] = useState("")

    useEffect(() => {
        setLocalStart(start)
        setLocalEnd(end)
    }, [start, end])

    const handleNextClick = () => {
        onChange("start", localStart)
        onChange("end", localEnd)

        if(!localStart || !localEnd) {
            setLocalError("All fields are required")
            return
        }

        const now = new Date()
        const s = new Date(localStart)
        const e = new Date(localEnd)

        if(s <= now){
            setLocalError("Start date must be later than the current date")
            return
        } else if(e <= now) {
            setLocalError("End date must be later than the current date")
            return
        } else if(e <= s){
            setLocalError("End date must be later than the start date")
            return
        }

        setLocalError("")
        onNext()
    }
    
    return (
        <div className="step-dates-container">
            <h2 className="step-title">Step 1: Quotation Dates</h2>

            <p className="step-subtitle">
                Select the start and end dates for your quotation period. <br />
                Make sure they are future dates.
            </p>

            <div className="date-inputs">
                <div className="date-input-item">
                    <label htmlFor="quotation-start">Start Date & Time</label>
                    <Input id="quotation-start" type="datetime-local" value={localStart} onChange={e => setLocalStart(e.target.value)} className={localError && !localStart ? "input-error" : ""} />
                </div>
            </div>
            <div className="date-inputs">
                <div className="date-input-item">
                    <label htmlFor="quotation-end">End Date & Time</label>
                    <Input id="quotation-end" type="datetime-local" value={localEnd} onChange={e => setLocalEnd(e.target.value)} className={localError && !localEnd ? "input-error" : ""} />
                </div>
            </div>

            {localError && <Alert message={localError}/>}

            <div className="step-navigation">
                <Button onClick={handleNextClick} disabled={loading}>{loading ? "Loading..." : "Next"}</Button>
            </div>

        </div>
    )
}

export default QuotationCreateStep1