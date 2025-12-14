import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import useFetch from '../../hooks/useFetch'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Alert from '../../components/Alert'
import '../../components/Auth.css'
import useCharLimit from '../../hooks/useCharLimit'
import usePhoneMask from '../../hooks/usePhoneMask'
import useCnpjMask from '../../hooks/useCnpjMask'
import { ENV } from '../../config/env'

const CompanyCreate = () => {

    const { t } = useTranslation()

    const { value: companyCnpj, handleChange: handleCnpjChange, handleBlur: handleCnpjBlur, getNumericValue: getCnpjRaw, isInvalid: isCnpjInvalid } = useCnpjMask("")
    const { value: companyName, onChange: handleNameChange, onBlur: handleNameBlur, warning: nameWarning, isInvalid: isNameInvalid } = useCharLimit(45, "company_name")
    const { value: companyEmail, onChange: handleEmailChange, onBlur: handleEmailBlur, warning: emailWarning, isInvalid: isEmailInvalid } = useCharLimit(60, "company_email")
    const { value: companyWhatsappNumber, handleChange: handleWhatsappChange, handleBlur: handleWhatsappBlur, getNumericValue: getWhatsappRaw, isInvalid: isWhatsappInvalid } = usePhoneMask("")
    const { value: companyPassword, onChange: handlePasswordChange, onBlur: handlePasswordBlur, warning: passwordWarning, isInvalid: isPasswordInvalid } = useCharLimit(255, "company_password", 6)

    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const { request } = useFetch(ENV.API_BASE_URL)
    const navigate = useNavigate();

    const isDisabled = 
        nameWarning ||
        emailWarning ||
        passwordWarning ||
        !companyCnpj ||
        !companyName ||
        !companyEmail ||
        !companyWhatsappNumber ||
        !companyPassword ||
        isCnpjInvalid ||
        isWhatsappInvalid

    const handleCreateCompany = async (e) => {
        e.preventDefault();

        if (!/\S+@\S+\.\S+/.test(companyEmail)) {
            setError(t("invalid_email"));
            setSuccess("");
            return;
        }

        setError("")

        const company = {
            companyCnpj: getCnpjRaw(),
            companyName,
            companyEmail,
            companyWhatsappNumber: getWhatsappRaw(),
            companyPassword
        }

        const res = await request("POST", "/companies/register", company)

        if(res.ok){
            setSuccess(t("company_created_success"))
            setError("")
            setTimeout(() => navigate("/"), 1000)
        }else{
            setSuccess("")
            setError(t("company_created_error"))
        }
    }

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h1>{t("create_company")}</h1>
                <form onSubmit={handleCreateCompany}>
                    <Input label="CNPJ" type="text" value={companyCnpj} onChange={handleCnpjChange} onBlur={handleCnpjBlur} placeholder={t("enter_cnpj")} isInvalid={isCnpjInvalid} required />
                    {isCnpjInvalid && <div className="warning">{t("invalid_cnpj")}</div>}

                    <Input label={t("company_name")} type="text" value={companyName} onChange={handleNameChange} onBlur={handleNameBlur} placeholder={t("enter_company_name")} isInvalid={isNameInvalid} required />
                    {nameWarning && (
                        <div className="warning">
                            {nameWarning.type === "too_short" &&
                                t("char_limit_too_short", { min: nameWarning.min, field: t(nameWarning.fieldName) })
                            }

                            {nameWarning.type === "too_long" &&
                                t("char_limit_too_long", { max: nameWarning.max, field: t(nameWarning.fieldName) })
                            }
                        </div>
                    )}

                    <Input label={t("company_email")} type="text" value={companyEmail} onChange={handleEmailChange} onBlur={handleEmailBlur} placeholder={t("enter_company_email")} isInvalid={isEmailInvalid} required />
                    {emailWarning && (
                        <div className="warning">
                            {emailWarning.type === "too_short" &&
                                t("char_limit_too_short", { min: emailWarning.min, field: t(emailWarning.fieldName) })
                            }

                            {emailWarning.type === "too_long" &&
                                t("char_limit_too_long", { max: emailWarning.max, field: t(emailWarning.fieldName) })
                            }
                        </div>
                    )}

                    <Input label={t("company_whatsapp")} type="text" value={companyWhatsappNumber} onChange={handleWhatsappChange} onBlur={handleWhatsappBlur} placeholder={t("enter_company_whatsapp")} isInvalid={isWhatsappInvalid} required />
                    {isWhatsappInvalid && <div className="warning">{t("invalid_whatsapp")}</div>}

                    <Input label={t("company_password")} type="password" value={companyPassword} onChange={handlePasswordChange} onBlur={handlePasswordBlur} placeholder={t("enter_company_password")} isInvalid={isPasswordInvalid} required />
                    {passwordWarning && (
                        <div className="warning">
                            {passwordWarning.type === "too_short" &&
                                t("char_limit_too_short", { min: passwordWarning.min, field: t(passwordWarning.fieldName) })
                            }

                            {passwordWarning.type === "too_long" &&
                                t("char_limit_too_long", { max: passwordWarning.max, field: t(passwordWarning.fieldName) })
                            }
                        </div>
                    )}

                    <Alert message={error} />
                    {success && <div className="success">{success}</div>}
                    <Button type="submit" disabled={isDisabled}>{t("create_company")}</Button>
                </form>
                <p>
                    <Link to="/login">{t("already_have_account")}</Link>
                </p>
            </div>
        </div>
    )
}

export default CompanyCreate