import { useTranslation } from 'react-i18next'
import { useEffect, useRef, useState } from 'react'

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
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const menuBtnBase = 'bg-transparent border-none text-left px-[0.45rem] py-[0.45rem] cursor-pointer text-[0.875rem] text-[var(--color-text-secondary)] rounded-[0.35rem] transition-[background-color,color] duration-[160ms] flex items-center gap-[0.45rem] w-full hover:bg-[var(--color-surface-2)]'
    const menuBtnActive = 'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)]'

    return (
        <div className="relative inline-block" ref={dropdownRef}>
            <button
                onClick={() => setOpen(!open)}
                className="bg-[var(--color-surface-0)] border border-[var(--color-border)] rounded-[var(--radius-md)] text-base leading-none cursor-pointer px-[0.52rem] py-[0.45rem] transition-[border-color,background-color] duration-[160ms] ease-[ease] hover:border-[var(--color-accent)] hover:bg-[var(--color-highlight-lighter)]"
            >
                🌐
            </button>
            {open && (
                <div className="absolute top-[2.4rem] right-0 bg-[var(--color-surface-0)] border border-[var(--color-border-strong)] rounded-lg [box-shadow:var(--shadow-popover)] p-[0.3rem] z-[9999] flex flex-col gap-[0.15rem] min-w-[9.5rem]">
                    <button
                        onClick={() => changeLang("pt")}
                        className={`${menuBtnBase} ${i18n.language === "pt" ? menuBtnActive : ''}`}
                    >
                        <span className="fi fi-br" />
                        <span>{t("language_portuguese")}</span>
                    </button>
                    <button
                        onClick={() => changeLang("en")}
                        className={`${menuBtnBase} ${i18n.language === "en" ? menuBtnActive : ''}`}
                    >
                        <span className="fi fi-us" />
                        <span>{t("language_english")}</span>
                    </button>
                </div>
            )}
        </div>
    )
}

export default LangSwitcher