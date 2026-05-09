const DetailRow = ({ icon, label, value }) => {
    if (!value || value === '-') return null
    return (
        <div className="flex items-start gap-3 py-3 border-b border-[var(--color-border-lighter)] last:border-0">
            <span className="mt-0.5 text-[var(--color-accent)] shrink-0">{icon}</span>
            <div className="min-w-0">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-0.5">{label}</p>
                <p className="text-[0.9rem] font-medium text-[var(--color-text-strong)] break-all">{value}</p>
            </div>
        </div>
    )
}

export default DetailRow
