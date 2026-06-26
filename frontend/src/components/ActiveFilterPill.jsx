/**
 * Pill de "busca ativa" das toolbars mobile (rótulo: valor + botão limpar).
 * Extrai o markup idêntico antes repetido nas listas. Não renderiza sem valor.
 */
const ActiveFilterPill = ({ label, value, onClear }) => {
  if (!value) return null
  return (
    <div className="mf-active-row">
      <span className="mf-active-pill">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M4 6h4M6 4v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        {label}: <strong>{value}</strong>
      </span>
      <button type="button" className="mf-clear-btn" onClick={onClear}>
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
          <path d="M1 1l9 9M10 1L1 10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        </svg>
        Limpar
      </button>
    </div>
  )
}

export default ActiveFilterPill
