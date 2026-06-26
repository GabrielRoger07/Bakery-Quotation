/**
 * Linha de busca das toolbars mobile (input com ícone + limpar + botão Buscar).
 * Extrai o markup idêntico antes repetido nas listas; a lógica de filtro
 * permanece na página.
 */
const MobileSearchInput = ({
  value, onChange, onSearch, onClear, placeholder,
  inputDisabled = false, searchDisabled = false,
}) => (
  <div className="mf-input-row">
    <div className="mf-input-wrap">
      <svg className="mf-input-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10.5 10.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input
        type="text"
        className="mf-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={inputDisabled}
        onKeyDown={e => { if (e.key === 'Enter') onSearch() }}
      />
      {value && (
        <button type="button" className="mf-input-clear" onClick={onClear} aria-label="Limpar texto">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
    <button type="button" className="mf-search-btn" onClick={onSearch} disabled={searchDisabled}>
      Buscar
    </button>
  </div>
)

export default MobileSearchInput
