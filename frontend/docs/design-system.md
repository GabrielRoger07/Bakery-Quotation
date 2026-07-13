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
| `Navbar` | — | contexto empresa, **só mobile** (`sm:hidden`): título da página + reload + `MobileMenu` (barra inferior) |
| `Sidebar` | — | contexto empresa, rail fixo à esquerda **só desktop** (`hidden sm:flex`, `w-24`), par de `Navbar`/`MobileMenu`; mesmos ícones (`@/components/icons/NavIcons`) e rotas |

### Formulário
| Componente | Props principais | Variantes / notas |
|---|---|---|
| `Button` | `variant`, `onClick`, `loading`, `disabled`, `type` | `primary` / `success` / `danger` / `secondary` (texto roxo, fundo card) / `ghost` |
| `Input` | `label`, `type`, `value`, `onChange`, `error`, `isInvalid`, `required` | toggle de senha quando `type="password"` |
| `Select` | `label`, `value`, `onChange`, `options`, `placeholder`, `bare` | `bare` para toolbars (sem label/margem) |
| `FieldMessage` | `tone`, `children` | `error` / `warning` — mensagem sob o campo |
| `FormActions` | `align`, `children` | `center` / `end` / `between` / `start` |
| `WizardActions` | `onBack`, `onPrimary`, `primaryLabel`, `desktopLabel`, `primaryIcon`, `blocked`, `hint`, `loading` | barra do wizard; fixa no rodapé no mobile; no desktop vira rodapé da área de conteúdo (`border-t`, Voltar à esquerda / primária à direita, `md:mt-auto` encosta no fim do step) — `desktopLabel` dá rótulo contextual só no desktop (ex: "Continuar para Produtos"), mobile mantém `primaryLabel` |
| `Alert` | `message`, `variant` | `error` / `success` / `warning` / `info` |

### Listas
| Componente | Props principais | Notas |
|---|---|---|
| hook `useResourceList` | `{ endpoint, idKey, defaultSortField, deletePath }` | fetch + paginação + sort + busca + remoção; expõe `handleSort`/`clearSort` (toggle, usado pelo `Table` desktop) e `setSort(field, direction)` (seleção direta, usado pelo sheet de ordenação mobile) |
| `Table` | `columns`, `data`, `idKey`, `onEdit/onDelete/onView/onMonitor`, `onSort`, `toolbar` | desktop; não é mais usado por nenhuma tela de listagem (Department/Product/Supplier/Quotation migraram para `MobileCardList` em todos os breakpoints) — segue existindo para outros usos (`QuotationMonitor`, `SupplierAccess`) |
| `MobileCardList` | `items`, `renderCard`, `onEdit/...`, `sortOptions`, `sortField`, `sortDirection`, `onSelectSort`, `inlineToolbar`, `eyebrow`, `addLabel`, `desktopToolbar` | mobile (par do `Table`); se `sortOptions`+`onSelectSort` forem passados, renderiza o pill `SortButton` ("A-Z") ao lado do `inlineToolbar`, que abre o `SortBottomSheet`. A partir de `sm:` (640px): `.cards-list` vira grid de múltiplas colunas; a paginação troca para `Pagination` (numerada) em vez de dots/progress; o FAB some (só mobile); se `title` for passado, aparece um cabeçalho (`eyebrow` opcional + título + botão `addLabel`); e, se `desktopToolbar` for passado, ele substitui `toolbar`/`searchBar` (mobile-only a partir de agora) por uma barra própria de busca/filtro/ordenação — layout costuma diferir bastante do mobile, então não é 1:1. Cabeçalho + `desktopToolbar` ficam dentro de um painel branco só (mesma linguagem visual do container do `Table`: `surface-card`/`radius-xl`/borda/`shadow-card-soft`), separado do grid de cards abaixo. `ProductList`/`SupplierList`/`QuotationList` usam esse componente em todos os breakpoints (sem `Table`), com `onCardClick` igual nos dois (abre o bottom sheet de detalhe, que troca de chrome por `isMobile`). A partir de `sm:`, a raiz é `flex-1` dentro do `PageContainer` (`list` = `sm:min-h-screen sm:flex sm:flex-col`) e a paginação desktop leva `sm:mt-auto` — a distância da paginação até o fim da tela fica sempre igual entre as telas, independente de quantas linhas de card cabem (lista curta: sobra de viewport empurra a paginação para baixo; lista longa: a página rola e o gap vem do `sm:pb-8` do `PageContainer`) |
| `SortButton` | `onOpen` | pill "A-Z" usado internamente pelo `MobileCardList` (ao lado do `PaginationSummary`) para abrir o `SortBottomSheet`; normalmente não é usado direto pelas páginas |
| `SortBottomSheet` | `isOpen`, `onClose`, `options: [{key,label,field,direction}]`, `sortField`, `sortDirection`, `onSelectSort` | sheet com lista plana de opções de ordenação pré-compostas (campo+direção); tocar numa opção aplica e fecha na hora; cada página define seu próprio array de `options` (ex.: "Nome (A → Z)") |
| `Pagination` | `currentPage`, `totalPages`, `onPageChange` | desktop, com elipses; também usado internamente por `MobileCardList` (bloco `hidden sm:block`) para a paginação numerada a partir de `sm:` |
| `PaginationSummary` | `pageLabel`, `rangeLabel` | texto "Página X de Y" / "Mostrando W–Z de Total" / "N registros"; usar com `getPaginationSummary` (`@/utils/paginationSummary`); no mobile, passar como `inlineToolbar` do `MobileCardList` para ficar ao lado do `SortButton` |
| `MobileSearchInput` | `value`, `onChange`, `onSearch`, `onClear`, `ariaLabel`, `dense` | campo de busca com ícone + limpar + Enter-to-search; `dense` (usado pelo `ListToolbar`) troca o botão "Buscar" por lupa clicável, altura/raio batendo com `Select bare`, e contém a largura (`flex-1 min-w-[200px] max-w-[280px]`) — sem `dense` (default) é o padrão mobile/sticky, com botão de texto |
| `ListToolbar` | `search`, `before`, `after`, `sort`, `pageLabel`, `rangeLabel`, `activeFilter` | barra padrão do `desktopToolbar` (busca + filtros + ordenação, depois paginação + `ActiveFilterPill`); `before`/`after` recebem `Select`s específicos da tela (ex.: seletor de campo do Supplier vai em `before`, filtro de setor do Product vai em `after`) — ver `ProductList.jsx`/`SupplierList.jsx` |
| `ActiveFilterPill` | `label`, `value`, `onClear` | pill de busca ativa (mobile e dentro do `ListToolbar`) |
| `StatusTabFilter` | `value`, `onChange`, `mobile` | abas de status (Todas/Agendado/Ativo/Fechado) |
| `ConfirmDialog` | `isOpen`, `onConfirm`, `confirmVariant`, `icon`, `title`, `confirmLabel`, `children` | alerta de confirmação centralizado (ícone + título + ação destrutiva; botões empilhados) |

### Detalhe / feedback
| Componente | Props principais | Notas |
|---|---|---|
| `Modal` | `isOpen`, `onClose`, `title`, `children` | overlay + card centralizado |
| `MetaCard` | `icon`, `label`, `value`, `sub`, `tone` (`default`/`success`/`danger`/`muted`) | metadado (card branco, rótulo colorido por `tone`) em detalhe/revisão |
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
Esse era o padrão antigo (não usado por nenhuma tela de listagem atualmente). `Department`, `Product`, `Supplier` e `Quotation` usam uma variação sem `Table`: renderizam sempre `MobileCardList` (que já vira grid a partir de `sm:`, com cabeçalho e `desktopToolbar` próprios no desktop) e mantêm `onCardClick` igual nos dois breakpoints — quem troca de chrome por `isMobile` é o bottom sheet de detalhe (`DepartmentBottomSheet`/`ProductBottomSheet`/`SupplierBottomSheet`/`QuotationBottomSheet`: bottom sheet no mobile, `Modal` no desktop), não a lista em si; o formulário de criar/editar segue o mesmo princípio via `DepartmentFormBottomSheet`/`ProductFormBottomSheet`/`SupplierFormBottomSheet` (sheet no mobile, `Modal` no desktop). O `desktopToolbar` em si deve ser montado com `ListToolbar` (em vez de remontar `Select`/`MobileSearchInput`/`ActiveFilterPill`/`PaginationSummary` na mão) — ver `ProductList.jsx`/`SupplierList.jsx`/`QuotationList.jsx` para o exemplo completo. `Quotation` não usa `search` no `ListToolbar` (a prop é opcional) — só `before` (`StatusTabFilter`) e `sort`. `Department` não tem busca/filtro, só ordenação (`sortOptions` "Nome (A → Z)"/"Nome (Z → A)"), então seu `ListToolbar` usa só `sort` + `pageLabel`/`rangeLabel` (sem `search`/`before`/`after`/`activeFilter`).

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
