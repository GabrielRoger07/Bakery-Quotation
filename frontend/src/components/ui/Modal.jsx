const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-[var(--color-overlay-dark)] flex justify-center items-center z-[2000] [backdrop-filter:blur(6px)] p-4">
            <div
                className="bg-[var(--color-surface-0)] border border-[var(--color-border)] p-[1.625rem] rounded-[var(--radius-2xl)] w-[min(680px,100%)] [box-shadow:var(--shadow-lg)] [animation:modalIn_0.2s_cubic-bezier(0.16,1,0.3,1)] max-sm:p-[1.125rem_1rem] max-sm:w-full"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4 mb-[1.375rem]">
                    {title && (
                        <h2 className="text-[var(--color-text-strong)] text-base font-bold tracking-[-0.015em] m-0">
                            {title}
                        </h2>
                    )}
                    <button
                        onClick={onClose}
                        className="bg-transparent border border-transparent w-8 h-8 rounded-[var(--radius-md)] text-xl leading-none cursor-pointer text-[var(--color-text-muted)] flex items-center justify-center transition-[background-color,color,border-color] duration-[160ms] ease-[ease] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border)] ml-auto"
                    >
                        &times;
                    </button>
                </div>
                <div className="max-h-[72vh] overflow-y-auto pr-1 max-sm:max-h-[80vh]">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default Modal