# Frontend

React 19 · Vite · Tailwind CSS v4 · React Router v6

## Ressalvas

- **`useFetch` é o único cliente HTTP** — não usar `fetch` diretamente, exceto download de blob (exige leitura manual do cookie)
- **Tokens em `@theme` (`src/styles/index.css`):** Nunca hardcodear cores/sombras — usar `var(--nome)`. Tipografia via tokens semânticos (`text-title`, `text-heading`, `text-body`, `text-caption`) em vez de `text-[0.875rem]` etc.
- **Estilização = colocation:** o estilo vive **no componente**, organizado em mapas de variante + helper `cn()` (`@/utils/cn`) — ver `Button.jsx`/`Input.jsx` como molde. **Não** adicionar classes de tela novas no `index.css` (que guarda só tokens, base global e `@keyframes`).
- **Ícones:** Lucide React — sempre com `size` e `strokeWidth` explícitos
- **Imports:** Usar path alias `@/*` para imports dentro de src
- **Dark Mode:** Gerenciado via classes CSS no elemento root 

## Estrutura do frontend

```
/src/
├── components/          ← componentes reutilizáveis - VERIFICAR ANTES de criar algo novo
├── contexts/            ← MobilePageContext
├── hooks/               ← hooks reutilizáveis - VERIFICAR ANTES de criar algo novo
├── pages/               ← subpastas por domínio: Company/Quotation/Supplier/SupplierAccess/Marketing
├── styles/index.css     ← SÓ tokens (@theme), base global e @keyframes (sem classes de tela)
└── utils/               ← funções utilitárias - VERIFICAR ANTES de criar algo novo
```

### Primitivos disponíveis (verificar antes de criar)
- **Layout:** `PageContainer` (variantes `list`/`auth`/`detail`/`form`), `PageHeader`
- **Formulário:** `Input` (prop `error`), `Select` (prop `bare` p/ toolbars), `FieldMessage`, `FormActions`, `Alert` (variantes `error`/`success`/`warning`/`info`)
- **Listas:** hook `useResourceList` (fetch+paginação+sort+busca+remoção), `ConfirmDialog`, `MobileSearchInput`, `ActiveFilterPill`, `Table`/`MobileCardList`, `Pagination`
- **Detalhe/feedback:** `MetaCard`, `SectionHeader`, `EmptyState`, `Modal`
- **Utils:** `cn` (className seguro), `initials`, `charLimitMessage`

## Regras de ouro

1. **Antes de criar qualquer componente novo, verificar se já existe em `components/`**
2. **Antes de criar qualquer hook novo, verificar se já existe em `hooks/`**
3. Estilo de tela vem dos primitivos (`PageContainer`/`PageHeader`/`Input`+`error`/`Select`/`Alert`), não de markup ad-hoc por tela
4. **Nunca reinventar modal/sheet/confirmação do zero** — usar `Modal`/`ConfirmDialog`

## Responsividade (híbrido disciplinado)
- Breakpoint mobile único: `640px` = `sm` do Tailwind = `useIsMobile(640)`. Não usar `max-[560px]`/`max-[768px]`.
- **`useIsMobile()` SÓ para troca de paradigma de UX** — `Table`↔`MobileCardList`, `Modal`↔`BottomSheet` (montar uma árvore só).
- **Todo o resto é CSS/Tailwind** (`max-sm:`/`md:`): espaçamento, colunas, empilhar, tipografia, esconder elemento simples. Não usar JS para isso.
- **Container/Presenter:** dados/estado/handlers centralizados (ex.: `useResourceList`); só a apresentação troca entre desktop e mobile.