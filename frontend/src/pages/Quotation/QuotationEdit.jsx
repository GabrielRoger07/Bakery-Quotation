import QuotationForm from '@/pages/Quotation/QuotationForm'

const QuotationEdit = ({ quotation, onClose, onSave }) => {
    return (
        <QuotationForm mode="edit" initialData={quotation} onClose={onClose} onSave={onSave}/>
    )
} 

export default QuotationEdit