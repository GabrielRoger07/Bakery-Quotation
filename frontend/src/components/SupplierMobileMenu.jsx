import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LogoutIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
)

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const ConfigIcon = ({ active }) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
)

const SupplierConfigDrawer = ({ open, onClose, onLogout, supplierName, initial }) => {
    const { i18n, t } = useTranslation()
    const drawerRef = useRef(null)
    const [visible, setVisible] = useState(false)
    const [dragY, setDragY] = useState(0)
    const dragStart = useRef(null)

    useEffect(() => {
        if (open) {
            setDragY(0)
            requestAnimationFrame(() => setVisible(true))
        } else {
            setVisible(false)
        }
    }, [open])

    useEffect(() => {
        if (!open) return
        const handleKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose])

    const onTouchStart = (e) => { dragStart.current = e.touches[0].clientY }
    const onTouchMove = (e) => {
        const delta = e.touches[0].clientY - dragStart.current
        if (delta > 0) setDragY(delta)
    }
    const onTouchEnd = () => {
        if (dragY > 80) onClose()
        else setDragY(0)
        dragStart.current = null
    }

    if (!open && !visible) return null

    const changeLang = (lang) => { i18n.changeLanguage(lang) }
    const currentLang = i18n.language?.startsWith('pt') ? 'pt' : 'en'

    return (
        <>
            <div
                className="fixed inset-0 z-[1002]"
                style={{
                    background: 'rgba(15,13,35,0.45)',
                    backdropFilter: 'blur(3px)',
                    opacity: visible ? 1 : 0,
                    transition: 'opacity 280ms ease',
                }}
                onClick={onClose}
            />
            <div
                ref={drawerRef}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                className="fixed bottom-0 left-0 right-0 z-[1003] bg-[var(--color-brand)] rounded-t-[1.5rem] pb-[calc(4.5rem+env(safe-area-inset-bottom))]"
                style={{
                    transform: `translateY(${visible ? dragY + 'px' : '100%'})`,
                    transition: dragY > 0 ? 'none' : 'transform 320ms cubic-bezier(0.32,0.72,0,1)',
                    boxShadow: '0 -8px 40px rgba(15,13,35,0.45)',
                    borderTop: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <div className="flex flex-col pt-3 px-4">
                    <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.18)] mx-auto mb-5" />

                    {supplierName && (
                        <div
                            className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] mb-5"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                            }}
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold flex-shrink-0 select-none"
                                style={{
                                    background: 'linear-gradient(135deg, var(--color-avatar-from), var(--color-avatar-to))',
                                    boxShadow: '0 0 0 2px var(--color-avatar-ring-lg)',
                                    color: 'var(--color-avatar-text)',
                                }}
                            >
                                {initial}
                            </div>
                            <div className="flex flex-col leading-[1.25] overflow-hidden">
                                <span className="text-[0.625rem] font-medium tracking-[0.07em] uppercase text-[var(--color-on-dark-text-faint)]">
                                    {t('supplier_logged_in_as')}
                                </span>
                                <span className="text-[0.9rem] font-semibold text-[var(--color-on-dark-text)] truncate">
                                    {supplierName}
                                </span>
                            </div>
                        </div>
                    )}

                    <p className="text-[0.6875rem] font-semibold tracking-[0.1em] uppercase text-[var(--color-on-dark-text-muted)] px-1 mb-2">
                        {t('language_label') || 'Idioma'}
                    </p>

                    <div className="flex flex-col gap-1 mb-5">
                        <button
                            onClick={() => changeLang('pt')}
                            className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] transition-[background-color] duration-[160ms] text-left w-full"
                            style={{
                                background: currentLang === 'pt' ? 'rgba(91,33,182,0.25)' : 'transparent',
                                border: currentLang === 'pt' ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                            }}
                        >
                            <span className="fi fi-br text-lg" />
                            <span className="flex-1 text-[0.9375rem] font-medium text-[var(--color-on-dark-text)]">
                                {t('language_portuguese')}
                            </span>
                            {currentLang === 'pt' && (
                                <span className="text-[var(--color-accent-light)]"><CheckIcon /></span>
                            )}
                        </button>
                        <button
                            onClick={() => changeLang('en')}
                            className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] transition-[background-color] duration-[160ms] text-left w-full"
                            style={{
                                background: currentLang === 'en' ? 'rgba(91,33,182,0.25)' : 'transparent',
                                border: currentLang === 'en' ? '1px solid rgba(139,92,246,0.4)' : '1px solid transparent',
                            }}
                        >
                            <span className="fi fi-us text-lg" />
                            <span className="flex-1 text-[0.9375rem] font-medium text-[var(--color-on-dark-text)]">
                                {t('language_english')}
                            </span>
                            {currentLang === 'en' && (
                                <span className="text-[var(--color-accent-light)]"><CheckIcon /></span>
                            )}
                        </button>
                    </div>

                    <div className="h-px bg-[var(--color-on-dark-border-soft)] mb-4" />

                    <button
                        onClick={onLogout}
                        className="flex items-center gap-3 px-3 py-3 rounded-[var(--radius-md)] w-full text-left transition-[background-color] duration-[160ms] hover:bg-[rgba(220,38,38,0.12)]"
                        style={{ color: '#f87171' }}
                    >
                        <LogoutIcon />
                        <span className="text-[0.9375rem] font-medium">{t('navbar_logout')}</span>
                    </button>
                </div>
            </div>
        </>
    )
}

const SupplierMobileMenu = ({ onLogout, supplierName, initial }) => {
    const { t } = useTranslation()
    const [configOpen, setConfigOpen] = useState(false)

    return (
        <>
            <nav
                className="fixed bottom-0 left-0 right-0 z-[1000] sm:hidden"
                style={{
                    background: 'var(--color-brand)',
                    borderTop: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 -4px 24px rgba(15,13,35,0.3)',
                    paddingBottom: 'env(safe-area-inset-bottom)',
                }}
            >
                <div className="flex items-stretch h-[4.25rem]">
                    <div className="flex-1 flex flex-col items-center justify-center gap-[0.3rem]">
                        {supplierName && (
                            <>
                                <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-[0.75rem] font-bold select-none"
                                    style={{
                                        background: 'linear-gradient(135deg, var(--color-avatar-from), var(--color-avatar-to))',
                                        color: 'var(--color-avatar-text)',
                                    }}
                                >
                                    {initial}
                                </div>
                                <span className="text-[0.6rem] font-medium leading-none max-w-[5rem] truncate" style={{ color: 'rgba(255,255,255,0.55)' }}>
                                    {supplierName}
                                </span>
                            </>
                        )}
                    </div>

                    <button
                        onClick={() => setConfigOpen(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-[0.3rem] bg-transparent border-none cursor-pointer relative transition-[color] duration-[160ms]"
                        style={{ color: configOpen ? '#c4b5fd' : 'rgba(255,255,255,0.45)' }}
                    >
                        {configOpen && (
                            <span
                                className="absolute top-0 left-1/2 -translate-x-1/2 h-[2px] rounded-b-full"
                                style={{
                                    width: '2rem',
                                    background: '#8b5cf6',
                                    boxShadow: '0 0 8px rgba(139,92,246,0.7)',
                                }}
                            />
                        )}
                        <ConfigIcon active={configOpen} />
                        <span className="text-[0.65rem] font-medium tracking-[0.02em] leading-none" style={{ fontWeight: configOpen ? 600 : 400 }}>
                            {t('navbar_config') || 'Config'}
                        </span>
                    </button>
                </div>
            </nav>

            <SupplierConfigDrawer
                open={configOpen}
                onClose={() => setConfigOpen(false)}
                onLogout={onLogout}
                supplierName={supplierName}
                initial={initial}
            />
        </>
    )
}

export default SupplierMobileMenu
