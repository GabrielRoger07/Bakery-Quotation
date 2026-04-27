# Bakery Quotation — Guia para o Claude

## Stack

- **Frontend:** React + Vite + Tailwind CSS v4 (via `@theme` no CSS)
- **Estilização:** variáveis CSS em `frontend/src/styles/index.css`; classes utilitárias Tailwind inline; classes de componente via `@layer components` no mesmo arquivo
- **Roteamento:** React Router v6
- **Autenticação:** JWT em cookie (`accessToken` para empresa, `supplierAccessToken` para fornecedor)
- **Backend:** Spring Boot (REST). Fetch via `useFetch`.
- **Ícones:** Lucide React — sempre com `size` e `strokeWidth` explícitos

---

## Estrutura do frontend

```
frontend/src/
├── components/          ← componentes reutilizáveis (ver catálogo abaixo)
├── contexts/            ← MobilePageContext
├── hooks/               ← hooks reutilizáveis (ver catálogo abaixo)
├── pages/
│   ├── Company/         ← Login, Home, CompanyCreate
│   ├── Marketing/       ← LandingPage
│   ├── Product/         ← ProductList, ProductCreate, ProductEdit
│   ├── Quotation/       ← QuotationList, QuotationMonitor, QuotationCreate*, QuotationForm
│   ├── Supplier/        ← SupplierList, SupplierCreate, SupplierEdit
│   └── SupplierAccess/  ← SupplierPage, SupplierQuotationRouter, SupplierQuotationClosed,
│                           SupplierQuotationActiveUnique, SupplierQuotationActiveAuction,
│                           SupplierQuotationScheduled
├── styles/index.css     ← tema, animações, classes de componente
└── utils/               ← formatMoney, formatCnpj, formatDateTime, formatPhone, decodeJwt
```

---

## Catálogo de componentes — SEMPRE usar antes de criar algo novo

### `Button` — `components/Button.jsx`
```jsx
<Button variant="primary|secondary|danger|success|ghost" onClick={fn} loading={bool} disabled={bool}>
    Texto
</Button>
```
- Variante padrão: `primary` (roxo com sombra)
- `ghost` é para superfícies escuras (navbar)
- **Não criar botões inline com classes manuais**

### `Input` — `components/Input.jsx`
```jsx
<Input label="Nome" type="text" value={v} onChange={fn} required isInvalid={bool} />
```
- Suporte nativo a `type="password"` com toggle mostrar/ocultar
- **Não criar inputs com classes manuais em formulários**

### `Modal` — `components/Modal.jsx`
```jsx
<Modal isOpen={bool} onClose={fn} title="Título">
    {children}
</Modal>
```
- Overlay com blur, animação `modalIn`, responsivo

### `Alert` — `components/Alert.jsx`
```jsx
<Alert message={errorString} />
```
- Retorna `null` se `message` for falsy — seguro usar sempre

### `Table` — `components/Table.jsx`
Tabela desktop com toolbar, sort, paginação, ações (editar/excluir/ver/monitorar).
```jsx
<Table
    title="Fornecedores"
    columns={[{ key, label, sortable? }]}
    data={rows}
    idKey="supplierId"
    loading={bool}
    onEdit={fn} onDelete={fn} onAdd={fn} onView={fn} onMonitor={fn}
    onReload={fn}
    onSort={fn} sortField={str} sortDirection="asc|desc"
    toolbar={<FilterNode />}
    filterActive={bool}
    filterSlot={<StatusTabFilter ... />}
/>
```

### `MobileCardList` — `components/MobileCardList.jsx`
Lista mobile-native com swipe, skeleton, empty state, FAB, paginação e sort bottom sheet.
```jsx
<MobileCardList
    title="Fornecedores"          // registra no navbar mobile
    items={filtered}
    idKey="supplierId"
    loading={bool}
    emptyMessage="Nenhum item."
    onReload={fn}
    onAdd={fn}                    // exibe FAB
    onEdit={fn} onDelete={fn}
    onView={fn} onMonitor={fn}
    onCardClick={fn}              // modo clique (sem swipe); mutuamente exclusivo com ações
    inlineToolbar={<Node />}      // sempre visível acima dos cards (ex: StatusTabFilter)
    toolbar={<Node />}            // dentro do drawer de filtros (toggle)
    filterActive={bool}
    searchBar={<Node />}
    sortColumns={[{ key, label }]}
    sortField={str} sortDirection="asc|desc" onSort={fn} onClearSort={fn}
    currentPage={n} totalPages={n} onPageChange={fn}
    renderCard={(item) => ({
        avatar: <Icon /> | "AB",  // JSX ou string (iniciais)
        title: "...",
        subtitle: "...",
        meta: "...",
        tags: [{ label, variant: "accent|success|" }],
    })}
/>
```
- `onCardClick` ativa modo clique (chevron direito, sem swipe)
- `inlineToolbar` é para filtros sempre visíveis (ex: StatusTabFilter); `toolbar` fica dentro do drawer de filtros colapsável

### `StatusTabFilter` — `components/StatusTabFilter.jsx`
Filtro de abas por status. **Usar sempre que houver filtro Todas/Ativo/Agendado/Fechado.**
```jsx
<StatusTabFilter
    value={statusFilter}          // string: "" | "agendado" | "ativo" | "fechado"
    onChange={setStatusFilter}
    counts={{ "": 10, agendado: 2, ativo: 5, fechado: 3 }}
    mobile={bool}                 // true → strip full-width
/>
```
- **Valores em minúsculo:** `"agendado"`, `"ativo"`, `"fechado"`, `""` para Todas
- **Não recriar este componente inline** — foi o erro cometido em `SupplierPage.jsx`

### `Pagination` — `components/Pagination.jsx`
```jsx
<Pagination currentPage={n} totalPages={n} onPageChange={fn} />
```
- Retorna `null` se `totalPages <= 1`
- Uso exclusivo no desktop; mobile usa paginação interna do `MobileCardList`

### `SortBottomSheet` — `components/SortBottomSheet.jsx`
Painel de ordenação mobile. Já integrado ao `MobileCardList` — usar diretamente só em casos especiais.

### Bottom sheets de formulário
- `ProductFormBottomSheet` — criação/edição de produto no mobile
- `SupplierFormBottomSheet` — criação/edição de fornecedor no mobile
- `QuotationBottomSheet` — detalhes de cotação no mobile
- `SupplierBottomSheet` — detalhes de fornecedor no mobile
- `ProductBottomSheet` — detalhes de produto no mobile

### Navbars e menus
- `Navbar` + `MobileMenu` — área da empresa (usa `accessToken`)
- `SupplierNavbar` + `SupplierMobileMenu` — área do fornecedor (usa `supplierAccessToken`)
- `LogoutConfirmModal` — modal de confirmação de logout

---

## Catálogo de hooks — SEMPRE usar antes de criar algo novo

| Hook | O que faz |
|---|---|
| `useFetch(baseUrl)` | `{ request, loading, error }` — fetch autenticado com redirect 403 |
| `useIsMobile(breakpoint=640)` | `bool` — reativo a resize |
| `useCurrencyMask(initial)` | `{ value, handleChange, getNumericValue, setValue }` — input R$ |
| `useCnpjMask()` | `{ value, handleChange }` — input CNPJ formatado |
| `usePhoneMask()` | `{ value, handleChange }` — input telefone formatado |
| `useCharLimit(max)` | controle de limite de caracteres |
| `useMobileMenu()` | controle de abertura do menu mobile |
| `useWebSocket(quotationId, onMessage)` | STOMP/SockJS para lances em tempo real |

---

## Catálogo de utils

| Função | Uso |
|---|---|
| `formatMoney(value)` | `1234.5` → `"R$ 1.234,50"` |
| `formatCnpj(str)` | `"00000000000100"` → `"00.000.000/0001-00"` |
| `formatDateTime(iso)` | data/hora localizada pt-BR |
| `formatPhone(str)` | formata telefone brasileiro |
| `decodeJwt(token)` | decodifica payload sem verificar assinatura |

---

## Padrões de layout

### Página desktop
```jsx
<div className="page-wrapper">      {/* max-width 1200px, padding 1.5rem 1rem */}
    {/* conteúdo */}
</div>
```

### Página mobile — lista de cards
Usar `MobileCardList` diretamente. Ele já é `mobile-card-list-root` internamente.

### Página mobile — detalhe/visualização (ex: QuotationMonitor, SupplierQuotationClosed, SupplierQuotationActiveUnique)
Usar o padrão `qm-mobile-*` do CSS:
```jsx
<div className="qm-mobile-root">
    <div className="qm-mobile-header">
        <button className="qm-mobile-back-btn" onClick={() => navigate(-1)}>
            <ChevronLeft size={20} strokeWidth={2.5} />
        </button>
        <div className="qm-mobile-header-center">
            <span className="qm-mobile-title">Título</span>
            <span className="qm-mobile-status-pill qm-status--active|qm-status--scheduled|qm-status--closed">
                Label
            </span>
        </div>
        {/* botão de ação opcional à direita (ex: export) */}
    </div>
    {/* countdown banner opcional */}
    <div className="qm-countdown-banner qm-status--active|qm-status--scheduled">
        <Clock size={14} strokeWidth={2} />
        <span>Encerra em</span>
        <span className="qm-countdown-time">{timeRemaining}</span>
    </div>
    {/* datas de início/fim */}
    <div className="qm-dates-row">
        <div className="qm-date-item">
            <span className="qm-date-label">Início</span>
            <span className="qm-date-value">{...}</span>
        </div>
        <div className="qm-date-divider" />
        <div className="qm-date-item">...</div>
    </div>
    {/* grid de stats 2 colunas */}
    <div className="qm-stats-grid">
        <div className="qm-stat-card qm-stat-card--total">{/* span cols */}</div>
        <div className="qm-stat-card">...</div>
    </div>
    {/* seções colapsáveis */}
    <div className="qm-section">
        <div className="qm-section-header">
            <div className="qm-section-header-left">
                <span className="qm-section-icon"><Icon /></span>
                <span className="qm-section-title">Título</span>
                <span className="qm-section-count">{n}</span>
            </div>
        </div>
        <div className="qm-section-body">
            <div className="qm-cards-list">{/* cards */}</div>
        </div>
    </div>
    <div style={{ height: 'calc(4.25rem + env(safe-area-inset-bottom) + 1.5rem)' }} />
</div>
```

#### Bottom sheet de confirmação mobile (padrão `saqu-*`)
Para ações destrutivas ou de revisão no mobile, **não usar `<Modal>`** — usar bottom sheet nativo:
```jsx
<>
    <div className={`saqu-sheet-backdrop ${isOpen ? 'open' : ''}`} onClick={onClose} />
    <div className={`saqu-confirm-sheet ${isOpen ? 'open' : ''}`}>
        <div className="saqu-sheet-handle" />
        <div className="saqu-sheet-header">
            <span className="saqu-sheet-title">Título</span>
            <button className="saqu-sheet-close" onClick={onClose}><X size={16} strokeWidth={2.5} /></button>
        </div>
        <div className="saqu-sheet-body">{/* conteúdo */}</div>
        <div className="saqu-sheet-footer">
            <button className="saqu-sheet-cancel-btn" onClick={onClose}>Cancelar</button>
            <button className="saqu-sheet-confirm-btn" onClick={onConfirm}>Confirmar</button>
        </div>
    </div>
</>
```

#### CTA fixo no rodapé mobile
Para ações primárias que ficam sempre visíveis durante preenchimento:
```jsx
<div className="saqu-bottom-cta">
    <div className="saqu-bottom-cta-inner">
        {/* meta opcional: contagem e total acumulado */}
        <button className="saqu-submit-btn" disabled={disabled}>
            <Icon size={17} strokeWidth={2.5} />
            Texto da ação
        </button>
    </div>
</div>
{/* padding de segurança ao final da página */}
<div style={{ height: 'calc(4.25rem + env(safe-area-inset-bottom) + 6rem)' }} />
```

### Responsividade
- Breakpoint mobile: `640px` (hook `useIsMobile`) e classe `max-sm:` no Tailwind
- **Sempre implementar os dois layouts** (mobile e desktop) com `isMobile` do `useIsMobile()`
- **Nunca usar só media query CSS** para esconder conteúdo complexo — renderizar condicionalmente

---

## Variáveis CSS essenciais (definidas em `index.css`)

**Cores de texto:** `--color-text-strong`, `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-disabled`

**Superfícies:** `--color-surface-0` (branco), `--color-surface-1/2/3`, `--color-surface-app` (fundo geral)

**Acento (roxo):** `--color-accent`, `--color-accent-hover`, `--color-accent-strong`, `--color-accent-light`, `--color-highlight`, `--color-highlight-lighter`, `--color-highlight-border`

**Semânticas:** `--color-success`, `--color-success-strong`, `--color-success-lighter`, `--color-success-border` / `--color-danger`, `--color-warning`, `--color-warning-strong`, `--color-warning-lighter`, `--color-warning-border`

**Info/aguardando (roxo suave):** `--color-info-soft`, `--color-info-border` — usar para estados de espera/processamento, nunca para vitória/confirmação final

**Soft bgs:** `--color-success-soft-bg`, `--color-success-soft-bg-2`, `--color-success-soft-border`, `--color-accent-soft-bg`, `--color-accent-soft-bg-focus`, `--color-danger-soft-bg`

**Bordas:** `--color-border`, `--color-border-light`, `--color-border-strong`

**Sombras:** `--shadow-xs`, `--shadow-sm`, `--shadow-card-soft`, `--shadow-accent`

**Radii:** `--radius-sm` (0.375), `--radius-md` (0.5), `--radius-lg` (0.875), `--radius-xl` (1), `--radius-2xl` (1.25)

---

## Animações disponíveis (usar com `animate-[nome]`)

| Nome | Efeito |
|---|---|
| `cardAppear` | fade + slide up — cards de lista |
| `skeletonPulse` | pulse de opacidade — skeletons |
| `modalIn` | scale + fade — modais |
| `authIn` | fade + slide up — tela de login |
| `fabPop` | scale pop — FAB |
| `spin` | rotação contínua — loading spinner |
| `qmFadeUp` | fade + slide up — seções do monitor/detalhe mobile |
| `qmPulse` | pulse suave — countdown banner de cotação ativa |

Skeleton escalonado: `style={{ animationDelay: `${idx * 80}ms` }}`
Cards escalonados nas páginas de detalhe: `style={{ animationDelay: `${index * 55}ms` }}`

---

## Classes de componente reutilizáveis (definidas em `@layer components`)

**Listas mobile:** `.mobile-card-list-root`, `.cards-list`, `.card-item`, `.card-front`, `.card-front-clickable`, `.card-avatar`, `.card-body`, `.card-title`, `.card-subtitle`, `.card-meta`, `.card-tags`, `.card-tag`, `.card-chevron`

**Skeleton:** `.card-skeleton-list`, `.card-skeleton`, `.skel-avatar`, `.skel-lines`, `.skel-line`, `.skel-line-title`, `.skel-line-sub`

**Empty state:** `.empty-state`, `.empty-icon`

**Filtros:** `.stf-root`, `.stf-root--mobile`, `.stf-tab`, `.stf-tab--active`, `.stf-dot`, `.stf-badge` (usados internamente pelo `StatusTabFilter`)

**Header mobile de detalhe:** `.qm-mobile-root`, `.qm-mobile-header`, `.qm-mobile-back-btn`, `.qm-mobile-header-center`, `.qm-mobile-title`, `.qm-mobile-status-pill`, `.qm-mobile-export-btn`

**Status pills mobile:** `.qm-status--active` (verde), `.qm-status--scheduled` (roxo), `.qm-status--closed` (cinza)

**Countdown banner:** `.qm-countdown-banner` + modificador de status acima

**Datas:** `.qm-dates-row`, `.qm-date-item`, `.qm-date-label`, `.qm-date-value`, `.qm-date-divider`

**Stats grid:** `.qm-stats-grid`, `.qm-stat-card`, `.qm-stat-card--total`, `.qm-stat-icon`, `.qm-stat-value`, `.qm-stat-value-denom`, `.qm-stat-label`

**Seções colapsáveis:** `.qm-section`, `.qm-section-header`, `.qm-section-header-left`, `.qm-section-icon`, `.qm-section-title`, `.qm-section-count`, `.qm-section-chevron`, `.qm-section-body`, `.qm-section-filter-bar`

**Cards de detalhe (QuotationMonitor):** `.qm-cards-list`, `.qm-empty`, `.qm-product-card`, `.qm-bid-card`, `.qm-bid-card--winning`, `.qm-bid-card--losing`

**Cotação encerrada — fornecedor (`sqc-*`):** `.sqc-win-card`, `.sqc-win-card-header`, `.sqc-win-avatar`, `.sqc-win-info`, `.sqc-win-name`, `.sqc-win-brand`, `.sqc-win-qty-badge`, `.sqc-win-prices`, `.sqc-win-price-metric`, `.sqc-win-price-metric--total`, `.sqc-win-price-label`, `.sqc-win-price-value`, `.sqc-win-price-value--total`, `.sqc-win-bonus-pill`, `.sqc-total-footer`, `.sqc-total-label`, `.sqc-total-value`, `.sqc-no-win-banner`, `.sqc-loading-state`, `.sqc-loading-spinner`, `.sqc-loading-text`

**Cotação única ativa — fornecedor (`saqu-*`):** `.saqu-status-banner`, `.saqu-status-banner--sent`, `.saqu-status-banner--pending`, `.saqu-status-banner-icon`, `.saqu-status-banner-icon--pending`, `.saqu-status-banner-body`, `.saqu-status-banner-title`, `.saqu-status-banner-sub`, `.saqu-status-banner-check`, `.saqu-section-hint`, `.saqu-input-card`, `.saqu-input-card--filled`, `.saqu-input-avatar`, `.saqu-input-avatar--filled`, `.saqu-input-name`, `.saqu-input-desc`, `.saqu-input-qty-badge`, `.saqu-input-brand-row`, `.saqu-input-field-row`, `.saqu-input-field-label`, `.saqu-price-input`, `.saqu-price-input--filled`, `.saqu-input-total-row`, `.saqu-input-total-label`, `.saqu-input-total-value`, `.saqu-submitted-card`, `.saqu-submitted-card--priced`, `.saqu-submitted-card--empty`, `.saqu-submitted-prices`, `.saqu-submitted-price-cell`, `.saqu-submitted-price-cell--total`, `.saqu-submitted-no-price`, `.saqu-alert`, `.saqu-alert--error`, `.saqu-alert--success`, `.saqu-bottom-cta`, `.saqu-bottom-cta-inner`, `.saqu-bottom-cta-meta`, `.saqu-bottom-cta-total`, `.saqu-submit-btn`, `.saqu-sheet-backdrop`, `.saqu-confirm-sheet`, `.saqu-sheet-handle`, `.saqu-sheet-header`, `.saqu-sheet-title`, `.saqu-sheet-close`, `.saqu-sheet-body`, `.saqu-sheet-intro`, `.saqu-sheet-items`, `.saqu-review-row`, `.saqu-review-row--skipped`, `.saqu-review-row-info`, `.saqu-review-row-name`, `.saqu-review-row-qty`, `.saqu-review-total`, `.saqu-review-no-price-pill`, `.saqu-sheet-warning`, `.saqu-sheet-total-row`, `.saqu-sheet-total-label`, `.saqu-sheet-total-value`, `.saqu-sheet-footer`, `.saqu-sheet-confirm-btn`, `.saqu-sheet-cancel-btn`, `.saqu-btn-spinner`

**Contagem:** `.count-chip-row`, `.count-chip`

**Auth:** `.auth-bg`, `.auth-card`

---

## Semântica de cores — UX crítico

O sistema de cores carrega significado de negócio. **Nunca usar verde para estados intermediários.**

| Cor | Significado correto | Exemplos |
|---|---|---|
| **Verde** (`success`) | Resultado final positivo, vitória confirmada | Lances vencedores (cotação encerrada), proposta aceita |
| **Roxo** (`accent` / `info-soft`) | Em andamento, registrado, aguardando resultado | Proposta enviada mas cotação ainda ativa, status "registrado" |
| **Âmbar** (`warning`) | Atenção, ausência com consequência, item ignorado | Produto não cotado, item sem preço que será excluído |
| **Vermelho** (`danger`) | Erro, falha, ação destrutiva | Erros de API, exclusão |
| **Cinza** (`surface` / `muted`) | Encerrado, inativo, sem relevância | Cotação fechada sem participação |

Exemplos de aplicação correta:
- Cotação **ativa** com proposta enviada → banner roxo (`saqu-status-banner--sent`) com ícone `Hourglass`
- Cotação **encerrada** com lances vencedores → cards verdes (`sqc-win-card`)
- Produto **não cotado** numa proposta → âmbar (`saqu-submitted-card--empty`) com texto "Não cotado — não será considerado"

---

## Regras de ouro

1. **Antes de criar qualquer componente novo, verificar se já existe em `components/`**
2. **`StatusTabFilter` é o único filtro de status** — não recriar inline com valores em maiúsculo (`Ativo`) ou com outro nome (`FilterTabs`, `StatusFilter`, etc.). Sempre usar minúsculo: `"agendado"`, `"ativo"`, `"fechado"`
3. **`MobileCardList` é o padrão de lista mobile** — não criar listas de cards mobile do zero
4. **`useFetch` é o único cliente HTTP** — não usar `fetch` diretamente (exceto download de blob com token manual)
5. **Variáveis CSS sempre via `var(--nome)`** — nunca hardcodear cores ou sombras
6. **`useIsMobile()`** para decisões de layout; `max-sm:` do Tailwind para ajustes pontuais de estilo
7. **Páginas de detalhe mobile** seguem o padrão `qm-mobile-*` com header sticky e botão de voltar (`navigate(-1)`)
8. **Modal desktop → bottom sheet mobile** — nas páginas que usam `useIsMobile()`, substituir `<Modal>` por bottom sheet `saqu-confirm-sheet` no layout mobile
9. **CTA primário mobile fixo no rodapé** — usar `.saqu-bottom-cta` com gradiente fade; nunca botão solto no meio do scroll
10. **Verde só para resultado final confirmado** — estados intermediários (proposta enviada, aguardando) usam roxo/accent; ausências com consequência usam âmbar
