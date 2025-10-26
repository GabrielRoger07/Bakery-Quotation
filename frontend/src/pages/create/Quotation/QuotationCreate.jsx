import QuotationForm from '../../QuotationForm'

const QuotationCreate = ({ onClose, onSave }) => {
    return (
        <QuotationForm mode="create" onClose={onClose} onSave={onSave} />
    )
}

export default QuotationCreate