const TABS = [
    { value: "",         label: "Todas",    color: null },
    { value: "agendado", label: "Agendado", color: "accent" },
    { value: "ativo",    label: "Ativo",    color: "success" },
    { value: "fechado",  label: "Fechado",  color: "neutral" },
]

const StatusDot = ({ color }) => {
    if (!color) return null
    return <span className={`stf-dot stf-dot--${color}`} aria-hidden="true" />
}

/**
 * Filtro de status em abas (com contadores e ponto colorido), em versões desktop e mobile.
 */
const StatusTabFilter = ({ value, onChange, mobile = false, counts = {} }) => (
    <div
        className={`stf-root ${mobile ? 'stf-root--mobile' : ''}`}
        role="tablist"
        aria-label="Filtrar por status"
    >
        {TABS.map(tab => {
            const isActive = value === tab.value
            const count = counts[tab.value]
            return (
                <button
                    key={tab.value}
                    role="tab"
                    aria-selected={isActive}
                    className={`stf-tab ${isActive ? 'stf-tab--active' : ''} ${tab.color ? `stf-tab--${tab.color}` : ''}`}
                    onClick={() => onChange(tab.value)}
                >
                    <StatusDot color={tab.color} />
                    <span className="stf-tab-label">{tab.label}</span>
                    {count !== undefined && (
                        <span className={`stf-badge ${isActive ? 'stf-badge--active' : ''}`}>
                            {count}
                        </span>
                    )}
                </button>
            )
        })}
    </div>
)

export default StatusTabFilter
