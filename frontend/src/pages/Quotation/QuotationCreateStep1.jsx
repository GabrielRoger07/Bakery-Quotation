import React from 'react'
import Input from '../../components/Input'
import Button from '../../components/Button'

const QuotationCreateStep1 = ({ start, end, onChange, onNext }) => {
    return (
        <div className="step-dates">
            <h2>Step 1: Quotation Dates</h2>
            <Input label="Start Date" type="datetime-local" value={start} onChange={e => onChange("start", e.target.value)}></Input>
            <Input label="End Date" type="datetime-local" value={end} onChange={e => onChange("end", e.target.value)}></Input>
            <Button onClick={onNext}>Next</Button>
        </div>
    )
}

export default QuotationCreateStep1