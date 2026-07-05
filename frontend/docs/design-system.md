# Design System — Bakery Quotation (frontend)

Referência de tokens e primitivos para padronizar telas. **Catálogo vivo:** abrir a rota `/design-system` para ver tudo renderizado.

- **Fonte de verdade dos tokens:** `src/styles/index.css` (bloco `@theme`).
- **Fonte de verdade dos primitivos:** `src/components/`.
- Este documento explica **quando** usar cada coisa; ele não substitui o código.

---

## 1. Filosofia

1. **Tokens primeiro** — nunca hardcodear cor/sombra/raio. Usar `var(--token)`; tipografia via tokens semânticos (`text-title`/`text-heading`/`text-body`/`text-caption`/`text-label`), não `text-[0.875rem]`.
2. **Colocation** — o estilo vive no componente, em mapas de variante + helper `cn()` (`@/utils/cn`). Molde: `Button.jsx`, `Input.jsx`. **Não** adicionar classes de tela novas em `index.css` (que guarda só tokens, base global e `@keyframes`).
3. **Primitivo-first** — antes de criar componente/hook novo, verificar `components/` e `hooks/`. Estilo de tela vem dos primitivos, não de markup ad-hoc.
4. **Nunca reinventar** modal/sheet/confirmação — usar `Modal`/`ConfirmDialog`.
5. **Responsividade híbrida** — breakpoint único `640px` (= `sm` do Tailwind = `useIsMobile(640)`). `useIsMobile()` só para troca de paradigma de UX (`Table`↔`MobileCardList`, `Modal`↔`BottomSheet`); todo o resto é CSS (`max-sm:`/`md:`).

---

## 2. Tokens

> Os valores abaixo são um retrato de `index.css`; em caso de divergência, vale o CSS.

### Tipografia (semântica → utilitário `text-*`)

| Token | Utilitário | Tamanho | Uso |
|---|---|---|---|
| `--text-title` | `text-title` | 1.5rem | Título de página / auth (h1) |
| `--text-heading` | `text-heading` | 1.0625rem | Título de seção / modal |
| `--text-body` | `text-body` | 0.875rem | Texto padrão, labels, inputs |
| `--text-caption` | `text-caption` | 0.75rem | Legendas, hints, tags |
| `--text-label` | `text-label` | 0.6875rem | Rótulo micro/uppercase (eyebrow, badge, cabeçalho de tabela) |

Famílias: `--font-sans` (Outfit), `--font-mono` (JetBrains Mono).

### Cores — escala de papéis

> **Regra de ouro:** escolha a cor pelo **para que serve** (papel), não pelo tom. Cada token tem **uma** função. Veja o catálogo visual (com valor e uso) na rota `/design-system`.

**Text — hierarquia por função** (era: 11 tokens em duas rampas concorrentes)

| Token | Use quando… |
|---|---|
| `--color-text-heading` | Títulos, ênfase máxima |
| `--color-text-body` | Texto de leitura padrão / valores |
| `--color-text-secondary` | Apoio índigo (subtítulos, descrições) |
| `--color-text-neutral` | Texto de UI cinza (label de campo, célula de tabela) |
| `--color-text-muted` | Auxiliar, hints, labels, placeholders |
| `--color-text-disabled` | Inativo, placeholder, asterisco opcional |
| `--color-text-inverse` | Texto sobre fundo claro pontual (use `on-dark-*` na navbar) |

**Surfaces — fundos** · **Borders — por proeminência**

| Surface | Uso | Border | Uso |
|---|---|---|---|
| `surface-card` | Card, input, modal, tabela | `border-default` | Borda padrão |
| `surface-app` | Fundo da página/app | `border-strong` | Input, ênfase |
| `surface-subtle` | Zebra de linha, empty-state | `border-subtle` | Divisória leve |
| `surface-muted` | Preenchimento destacado | `border-faint` | Divisória quase invisível |
| `surface-sunken` | Área interna afundada | `border-spinner` | Spinner de loading |

**Brand & Accent:** `brand`/`brand-mid` (fundo escuro), `accent` (ação primária/foco), `accent-hover`, `accent-strong` (ênfase), `accent-soft`/`-soft-strong`/`-soft-weak` (fundos translúcidos: hover / foco / card selecionado).

**Highlights (roxo suave):** `highlight-soft` (fundo destaque), `highlight` (médio), `highlight-lighter` (hover de linha), `highlight-border` (borda), `info-border` (borda de banner informativo).

**Semantic status** (prefixo = papel): `success`/`danger`/`warning` (base) + `-strong` (enfático) + `-lighter` (fundo) + `-border` (borda) + `-soft`/`-soft-border` (translúcido). `warning-text` = tom legível em texto; `danger-dark` = foco forte.

**On-dark** (branco translúcido sobre fundo escuro — navbar/drawer): `on-dark-text` / `-text-muted` / `-text-faint` (3 níveis de texto), `on-dark-bg` / `-bg-hover` (preenchimento/hover), `on-dark-border` / `-border-strong` (bordas).

**Overlays:** `overlay-dark` (modal/sheet), `overlay-drawer` (drawer). **Avatar:** `avatar-from/to/ring/text` (gradiente âmbar do fornecedor).

### Radii

`--radius-sm` 6px · `--radius-md` 8px · `--radius-lg` 14px · `--radius-xl` 16px · `--radius-2xl` 20px.

### Shadows

- **Depth:** `--shadow-xs/sm/md/md-soft/lg/xl/popover`
- **Card:** `--shadow-card-soft`, `--shadow-card-md`
- **Accent / hover lift:** `--shadow-accent`, `--shadow-hover-accent`, `--shadow-hover-success`, `--shadow-hover-danger`
- **Focus rings (como shadow):** `--shadow-focus-accent`, `--shadow-focus-accent-soft`, `--shadow-focus-danger`

---

## 3. Inventário de primitivos

> Antes de criar qualquer componente, verificar se já existe aqui (`@/components`).

### Layout
| Componente | Props principais | Variantes / notas |
|---|---|---|
| `PageContainer` | `variant`, `children` | `list` / `detail` / `form` / `auth` |
| `PageHeader` | `title`, `subtitle`, `actions` | h1 padrão da tela |

### Formulário
| Componente | Props principais | Variantes / notas |
|---|---|---|
| `Button` | `variant`, `onClick`, `loading`, `disabled`, `type` | `primary` / `success` / `danger` / `secondary` (texto roxo, fundo card) / `ghost` |
| `Input` | `label`, `type`, `value`, `onChange`, `error`, `isInvalid`, `required` | toggle de senha quando `type="password"` |
| `Select` | `label`, `value`, `onChange`, `options`, `placeholder`, `bare` | `bare` para toolbars (sem label/margem) |
| `FieldMessage` | `tone`, `children` | `error` / `warning` — mensagem sob o campo |
| `FormActions` | `align`, `children` | `center` / `end` / `between` / `start` |
| `WizardActions` | `onBack`, `onPrimary`, `primaryLabel`, `primaryIcon`, `blocked`, `hint`, `loading` | barra do wizard; fixa no rodapé no mobile |
| `Alert` | `message`, `variant` | `error` / `success` / `warning` / `info` |

### Listas
| Componente | Props principais | Notas |
|---|---|---|
| hook `useResourceList` | `{ endpoint, idKey, defaultSortField, deletePath }` | fetch + paginação + sort + busca + remoção; expõe também `totalElements`/`pageSize` |
| `Table` | `columns`, `data`, `idKey`, `onEdit/onDelete/onView/onMonitor`, `onSort`, `toolbar` | desktop |
| `MobileCardList` | `items`, `renderCard`, `onEdit/...`, `sortColumns`, `onSort`, `onClearSort`, `inlineToolbar` | mobile (par do `Table`); se `sortColumns`+`onSort` forem passados, renderiza `SortButton` ao lado do `inlineToolbar` |
| `SortButton` | `active`, `onOpen`, `onClear` | botão "Ordenar" usado internamente pelo `MobileCardList` (ao lado do `PaginationSummary`); normalmente não é usado direto pelas páginas |
| `Pagination` | `currentPage`, `totalPages`, `onPageChange` | desktop, com elipses |
| `PaginationSummary` | `pageLabel`, `rangeLabel` | texto "Página X de Y" / "Mostrando W–Z de Total" / "N registros"; usar com `getPaginationSummary` (`@/utils/paginationSummary`); no mobile, passar como `inlineToolbar` do `MobileCardList` para ficar ao lado do `SortButton` |
| `MobileSearchInput` | `value`, `onChange`, `onSearch`, `onClear` | toolbar mobile |
| `ActiveFilterPill` | `label`, `value`, `onClear` | pill de busca ativa (mobile) |
| `StatusTabFilter` | `value`, `onChange`, `counts`, `mobile` | abas de status (Todas/Agendado/Ativo/Fechado) |
| `ConfirmDialog` | `isOpen`, `onConfirm`, `confirmVariant`, `icon`, `title`, `confirmLabel`, `children` | alerta de confirmação centralizado (ícone + título + ação destrutiva; botões empilhados) |

### Detalhe / feedback
| Componente | Props principais | Notas |
|---|---|---|
| `Modal` | `isOpen`, `onClose`, `title`, `children` | overlay + card centralizado |
| `MetaCard` | `icon`, `label`, `value`, `sub`, `tone` (`default`/`success`/`danger`) | metadado (card branco, rótulo colorido por `tone`) em detalhe/revisão |
| `SectionHeader` | `icon`, `label`, `count` | cabeçalho de seção |
| `EmptyState` | `children` ou `icon`/`title`/`description`/`action`/`tone` (`accent`/`danger`) | estado vazio simples (texto) ou rico (ícone + título + CTA, ex.: erro de carregamento) |

### Utils
`cn` (merge seguro de className), `initials`, `charLimitMessage`, `getPaginationSummary` (calcula `pageLabel`/`rangeLabel` p/ `PaginationSummary`).

---

## 4. Como compor uma tela nova

**Formulário (create/edit):**
```jsx
<PageContainer variant="form">
  <PageHeader title="Novo produto" />
  <form onSubmit={...}>
    <Input label="Nome" value={name} onChange={...} required error={...} />
    <Select label="Departamento" options={...} value={...} onChange={...} required />
    <Alert message={error} />
    <Alert variant="success" message={success} />
    <FormActions>
      <Button type="submit" disabled={...}>Salvar</Button>
    </FormActions>
  </form>
</PageContainer>
```

**Lista (Container/Presenter):**
```jsx
const list = useResourceList({ endpoint: '/api/v1/products', idKey: 'productId', defaultSortField: 'productName' })
return (
  <PageContainer variant="list">
    {list.error && <Alert message={list.error} />}
    {isMobile
      ? <MobileCardList items={list.items} renderCard={...} onDelete={list.confirm.requestRemove} ... />
      : <Table columns={...} data={list.items} onDelete={list.confirm.requestRemove} ... />}
    <ConfirmDialog isOpen={list.confirm.isOpen} onConfirm={list.confirm.confirm} onClose={list.confirm.cancel} confirmVariant="danger">...</ConfirmDialog>
  </PageContainer>
)
```

---

## 5. Dívida técnica conhecida

A refatoração das telas de **Quotation** introduziu classes de tela diretamente em `index.css`, o que viola a regra 2 ("sem classes de tela no `index.css`; estilo colocado no componente"). Estão registradas aqui para migração futura:

| Classes em `index.css` | Telas | Primitivo-alvo sugerido |
|---|---|---|
| `psheet-*`, `sform-sheet-*`, `qsheet-*` | Quotation Step 2, Department, detalhe | `BottomSheet` (par mobile do `Modal`) |
| `step-tabs`, `step-tab*` | `QuotationCreateStep2/3` | `TabSwitcher` |
| `sel-product-*`, `sup-row-*` | `QuotationCreateStep2/3` | `IconButton` + card primitivo |
| Card "ícone + título" repetido; `inputCls()`/`iconBtn*` inline | `QuotationCreateStep1–4` | `SectionCard`, `IconButton`; migrar inputs para `<Input>` |

**Plano futuro:** extrair esses padrões para primitivos com estilo colocado, remover as classes correspondentes de `index.css` e migrar `QuotationCreateStep1–4` + `QuotationForm` para os primitivos. Fora do escopo atual (este ciclo entrega só catálogo + doc).
