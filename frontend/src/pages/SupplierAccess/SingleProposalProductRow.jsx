import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Tag, Package } from 'lucide-react'
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
            <div className="single-proposal-item-header">
                <strong className="single-proposal-item-name">{product.productName}</strong>
                {product.productDescription && (
                    <span className="single-proposal-item-desc">{product.productDescription}</span>
                )}
            </div>

            <div className="single-proposal-item-tags">
                <span className="single-proposal-tag">
                    {product.quantity} UN
                </span>
                <span className="single-proposal-tag">
                    <Tag size={12} />
                    {product.brand || t("brand_not_defined")}
                </span>
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
