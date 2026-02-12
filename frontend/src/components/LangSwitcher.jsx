import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'
import './LangSwitcher.css'

const LangSwitcher = () => {
    const { i18n, t } = useTranslation()
    const [open, setOpen] = useState(false)
    const dropdownRef = useRef(null)

    const changeLang = (lang) => {
        i18n.changeLanguage(lang)
        setOpen(false)
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if(dropdownRef.current && !dropdownRef.current.contains(event.target)){
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    return (
        <div className='lang-dropdown' ref={dropdownRef}>
            <button className="lang-trigger" onClick={() => setOpen(!open)}>🌐</button>
            {open && (
                <div className='lang-menu'>
                    <button className={i18n.language === "pt" ? "active" : ""} onClick={() => changeLang("pt")}>
                        <span className='fi fi-br flag' />
                        <span>{t("language_portuguese")}</span>
                    </button>
                    <button className={i18n.language === "en" ? "active" : ""} onClick={() => changeLang("en")}>
                        <span className='fi fi-us flag' />
                        <span>{t("language_english")}</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default LangSwitcher