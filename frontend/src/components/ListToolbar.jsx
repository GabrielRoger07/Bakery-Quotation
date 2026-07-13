import MobileSearchInput from '@/components/MobileSearchInput'
import ActiveFilterPill from '@/components/ActiveFilterPill'
import PaginationSummary from '@/components/PaginationSummary'

/**
 * Barra de busca/filtro/ordenação do `desktopToolbar` (par do `MobileCardList`).
 * Padroniza a estrutura (linha 1: busca + filtros + ordenação · linha 2: paginação
 * + filtro ativo) para não repetir o layout em cada página de lista.
 *
 * `search`: opcional — props do campo de busca (`dense`) — { value, onChange, onSearch,
 *   onClear, placeholder, ariaLabel, disabled, searchDisabled }. `searchDisabled` cai
 *   para `disabled` se omitido. Se a tela não tiver busca, omitir a prop inteira.
 * `before`/`after`: conteúdo opcional (ex.: `<Select bare .../>`) antes/depois do
 *   campo de busca na linha 1 — usar `before` quando a tela exige escolher um campo
 *   antes de digitar (ex.: Supplier), `after` para filtros complementares (ex.: setor).
 * `sort`: conteúdo opcional, sempre por último na linha 1 (ex.: `<Select bare .../>`).
 * `activeFilter`: { label, value, onClear } repassado ao `ActiveFilterPill`.
 */
const ListToolbar = ({
  search, before, after, sort,
  pageLabel, rangeLabel,
  activeFilter,
}) => (
  <div className="flex flex-col gap-4 w-full">
    <div className="flex items-center gap-4 flex-wrap">
      {before}
      {search && (
        <MobileSearchInput
          dense
          value={search.value}
          onChange={search.onChange}
          onSearch={search.onSearch}
          onClear={search.onClear}
          placeholder={search.placeholder}
          ariaLabel={search.ariaLabel}
          inputDisabled={search.disabled}
          searchDisabled={search.searchDisabled ?? search.disabled}
        />
      )}
      {after}
      {sort}
    </div>
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <PaginationSummary pageLabel={pageLabel} rangeLabel={rangeLabel} />
      {activeFilter && (
        <ActiveFilterPill label={activeFilter.label} value={activeFilter.value} onClear={activeFilter.onClear} />
      )}
    </div>
  </div>
)

export default ListToolbar
