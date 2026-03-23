import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useCurrencyMask } from '../../hooks/useCurrencyMask'
import { formatMoney } from '../../utils/formatMoney'
import Input from '../../components/Input'

const SingleProposalProductRow = ({ product, disabled, initialNumericValue, onNumericChange }) => {
    const { t, i18n } = useTranslation()
    const { value, handleChange, getNumericValue, setValue } = useCurrencyMask()

    useEffect(() => {
        if (initialNumericValue > 0) {
            setValue(formatMoney(initialNumericValue, i18n.language))
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        onNumericChange(product.productId, getNumericValue())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value])

    return (
        <div className="single-proposal-item">
            <div className="single-proposal-item-meta">
                <strong>{product.productName}</strong>
                <span>{t("quantity")}: {product.quantity}</span>
            </div>
            <Input
                label={t("single_proposal_price_without_unit_label") + `:`}
                type="text"
                value={value}
                onChange={handleChange}
                disabled={disabled}
                placeholder="R$ 0,00"
            />
        </div>
    )
}

export default SingleProposalProductRow
