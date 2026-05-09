# Frontend

React 19 · Vite · Tailwind CSS v4 · React Router v6

## Ressalvas

- **`useFetch` é o único cliente HTTP** — não usar `fetch` diretamente, exceto download de blob (exige leitura manual do cookie)
- **Variáveis CSS:** Localizadas em `src/styles/index.css`. Nunca hardcodear cores ou sombras, usar sempre `var(--nome)`.
- **Ícones:** Lucide React — sempre com `size` e `strokeWidth` explícitos
- **Imports:** Usar path alias `@/*` para imports dentro de src. Nunca usar caminhos relativos (`../`) entre features distintas.
- **Dark Mode:** Gerenciado via classes CSS no elemento root

## Estrutura de pastas

```
src/
├── components/              ← apenas componentes cross-feature (compartilhados)
│   ├── ui/                  ← primitivos sem domínio: Button, Input, Alert, Modal, Pagination, BottomSheet, DetailRow
│   ├── layout/              ← shell da app: Navbar, SupplierNavbar, MobileMenu, PrivateRoute, LogoutConfirmModal
│   └── data-display/        ← exibição genérica: Table, MobileCardList, StatusTabFilter, SortBottomSheet
│
├── features/                ← uma pasta por domínio de negócio
│   ├── products/
│   │   ├── pages/           ← ProductList, ProductCreate, ProductEdit
│   │   └── components/      ← ProductBottomSheet, ProductFormBottomSheet
│   ├── suppliers/
│   │   ├── pages/           ← SupplierList, SupplierCreate, SupplierEdit
│   │   └── components/      ← SupplierBottomSheet, SupplierFormBottomSheet
│   ├── quotations/
│   │   ├── pages/           ← QuotationList, QuotationCreatePage, QuotationEditPage, QuotationForm, Steps 1-4, QuotationMonitor
│   │   └── components/      ← QuotationBottomSheet, QuotationDetails
│   ├── supplier-access/
│   │   ├── pages/           ← SupplierPage, SupplierQuotationPage, SupplierRoute, SupplierQuotationRouter, Active/Closed/Scheduled
│   │   └── components/      ← QuotationProductItem, SingleProposalProductRow
│   └── company/
│       └── pages/           ← Login, CompanyCreate, Home
│
├── pages/                   ← páginas sem domínio (só marketing)
│   └── LandingPage.jsx
│
├── hooks/                   ← hooks cross-feature: useFetch, useIsMobile, useWebSocket, useListPage, masks...
├── contexts/                ← FetchAuthContext, MobilePageContext
├── utils/                   ← formatCnpj, formatPhone, formatMoney, formatDateTime, decodeJwt
├── config/env.js
├── styles/index.css         ← tema global, animações, classes de componente (@layer components)
├── App.jsx
└── main.jsx
```

## Regras de componentes

| Caminho | Regra |
|---|---|
| `components/ui/` | Zero conhecimento de domínio. Sem chamadas HTTP. Props genéricas. |
| `components/layout/` | Shell da app. Sem chamadas HTTP (exceto leitura de cookie para exibir nome do usuário). |
| `components/data-display/` | Props genéricas. Nunca importa de `features/`. |
| `features/<x>/components/` | Pode importar de `components/`. Nunca importa de outra feature. |
| `features/<x>/pages/` | Pode importar de `components/` e do próprio `features/<x>/components/`. |

**Se um componente de feature for necessário em 2+ features → promover para `components/data-display/` com props genéricas.**

## Regras de ouro

1. **Antes de criar qualquer componente, verificar `components/` e `features/<domínio>/components/`**
2. **Antes de criar qualquer hook, verificar `hooks/`**
3. **`useFetch` é o único cliente HTTP**
4. **Modal já existe em `components/ui/Modal.jsx`** — nunca reinventar
5. **BottomSheet já existe em `components/ui/BottomSheet.jsx`** — usar para qualquer painel que desliza de baixo no mobile
6. **`useListPage` já existe em `hooks/useListPage.js`** — usar em toda página de listagem com paginação, ordenação e CRUD
7. Usar `useIsMobile()` para decisões de layout (estrutura JSX diferente); `max-sm:` do Tailwind para ajustes visuais no mesmo elemento

## Responsividade

- Breakpoint mobile: `640px` — hook `useIsMobile()` e classe `max-sm:` no Tailwind
- **`useIsMobile()`** → quando desktop e mobile renderizam JSX estruturalmente diferente (ex: `<Table>` vs `<MobileCardList>`)
- **`max-sm:`** → quando o mesmo elemento só precisa de ajuste de padding, fonte ou direção flex
- **Sempre implementar os dois layouts** nas páginas de listagem
