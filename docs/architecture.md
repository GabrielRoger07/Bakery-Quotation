# Arquitetura — Bakery Quotation

SaaS B2B para gestão de cotações de compra. Empresas criam cotações com produtos e convidam fornecedores para dar lances. Suporta leilão reverso em tempo real (WebSocket/STOMP) e geração de relatórios em PDF

## Índice
- [Stack](#stack)
- [Domínios de negócio](#domínios-de-negócio)
- [Backend](#backend) — pacotes, auth/segurança, WebSocket, erros, PDF
- [Frontend](#frontend) — rotas, hooks, contextos, componentes, páginas, utilitários
- [Fluxos principais](#fluxos-principais)

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite + Tailwind CSS v4 |
| Backend | Spring Boot 3.5.6 · Java 21 |
| Banco | MySQL 8.0 + Flyway (migrations) |
| Auth | JWT · BCrypt |
| WebSocket | Spring WebSocket + STOMP + SockJS |
| PDF | OpenPDF v1.3.43 |
| HTTP client (FE) | `useFetch` custom hook + js-cookie |
| Roteamento (FE) | React Router v6 |

## Domínios de negócio

O sistema tem dois papéis de usuário completamente separados, com autenticação, cookies e interfaces independentes:
- **Empresa** — cria e gerencia produtos, fornecedores e cotações; monitora lances em tempo real
- **Fornecedor** — acessa o portal via link da empresa; visualiza cotações ativas e envia lances; o fornecedor é cadastrado pela empresa compradora

## Backend

### Estrutura de pacotes

```
com.bakeryquotation.backend/
├── bid/              ← Lances dos fornecedores para um produto em uma cotação
├── company/          ← Entidade Empresa (autenticação + CRUD)
├── config/           ← SecurityConfig, WebSocketConfig, AuthConfig, TokenConfig, WebConfig, WebSocketAuthInterceptor
├── contain/          ← Produtos dentro de uma cotação (com quantidade solicitada)
├── exception/        ← GlobalExceptionHandler + exceções customizadas
├── participation/    ← Vínculo de fornecedor a uma cotação
├── product/          ← Produtos cadastrados pela empresa
├── quotation/        ← Cotações criadas pela empresa (evento principal)
├── supplier/         ← Entidade Fornecedor (autenticação + CRUD)
```

### Entidades e banco de dados

Schema completo (tabelas, colunas, tipos, constraints e migrations Flyway) em [docs/database/database-schema.md](database/database-schema.md)

### Controllers e endpoints

Endpoints em [docs/backend/api-reference.md](backend/api-reference.md)

### Autenticação e segurança

#### Fluxo JWT

```
Login (POST /api/v1/companies/login ou /api/v1/suppliers/login/{cnpj})
  └─ Retorna: { accessToken, refreshToken }
      └─ Frontend armazena em cookie (js-cookie)
          └─ useFetch injeta: Authorization: Bearer {token}
              └─ SecurityFilter valida JWT → SecurityContext
```

**Claims do token empresa:**
- `sub` = email da empresa
- `companyCnpj` = CNPJ
- `userType` = "COMPANY"

**Claims do token fornecedor:**
- `sub` = supplierId
- `supplierName` = nome
- `userType` = "SUPPLIER"

**Expiração:**
| Token | Empresa | Fornecedor |
|---|---|---|
| access | 24h | 2h |
| refresh | 7d | 4h |

> Endpoint de refresh ainda não implementado.

#### Níveis de acesso (SecurityConfig)

| Perfil | Authorities | Descrição |
|---|---|---|
| ADMIN | ROLE_ADMIN | Empresa com role=ADMIN |
| COMPANY | ROLE_COMPANY | Empresa com role=COMPANY |
| SUPPLIER | ROLE_SUPPLIER | Qualquer fornecedor autenticado |

Rotas públicas: `/api/v1/companies/login`, `/api/v1/companies/register`, `/api/v1/suppliers/login/**`, `/ws/**`

#### Componentes de segurança

- **`SecurityFilter`** — Intercepta Authorization header, valida JWT via `TokenConfig`, extrai `userType`, injeta `AuthUserDetails` no `SecurityContext`.
- **`TokenConfig`** — Gera e valida tokens JWT (empresa e fornecedor). Método `validateToken()` retorna o subject ou null se inválido.
- **`AuthUserDetails`** — Implementação de `UserDetails`; factory methods `fromCompany()` e `fromSupplier()` mapeiam roles.
- **`AuthConfig`** — Bean `BCryptPasswordEncoder`.
- **`WebConfig`** — CORS configurado via `cors.allowed-origins` (variável de ambiente).
- **`WebSocketAuthInterceptor`** — Valida Bearer token nos frames STOMP CONNECT antes de estabelecer sessão WebSocket.

### WebSocket / STOMP

- **Endpoint:** `/ws` (com fallback SockJS)
- **Destination prefix:** `/app`
- **Broker:** Simple broker com prefixo `/topic`
- **Tópico de lances:** `/topic/quotation/{quotationId}`
- **Autenticação:** `WebSocketAuthInterceptor` valida o mesmo Bearer token JWT no header STOMP `Authorization`.
- **Fluxo:** Fornecedor envia lance → `BidService` processa → publica mensagem no tópico → empresa recebe atualização em tempo real no `QuotationMonitor`.

### Tratamento de erros

`GlobalExceptionHandler` (@ControllerAdvice) mapeia todas as exceções para `ApiError` com campos `message`, `status`, `timestamp`.

| Exceção | Status HTTP |
|---|---|
| `ResourceNotFoundException` | 400 |
| `MethodArgumentNotValidException` | 400 |
| `NoSuchElementException` | 400 |
| `BidAboveLowestException` | 400 |
| `ImmutableResourceException` | 400 |
| `DuplicateResourceException` | 409 |
| `DataIntegrityViolationException` | 409 |
| `BadCredentialsException` | 401 |
| `AuthenticationException` | 401 |
| `AccessDeniedException` | 403 |
| `IllegalArgumentException` | 500 |
| `Exception` (genérico) | 500 |

### Relatórios PDF

- **`QuotationReportService`** — Gera PDF da cotação com todos os lances e fornecedores.
- **`SupplierReportService`** — Gera PDF filtrado por participação de um fornecedor específico.
- Usa OpenPDF. O endpoint retorna bytes com `Content-Type: application/pdf`.

## Frontend

### Estrutura de pastas

```
frontend/src/
├── components/              ← componentes cross-feature (compartilhados)
│   ├── ui/                  ← primitivos sem domínio: Button, Input, Alert, Modal, Pagination, BottomSheet, DetailRow
│   ├── layout/              ← shell da app: Navbar, SupplierNavbar, MobileMenu, PrivateRoute, LogoutConfirmModal
│   └── data-display/        ← exibição genérica: Table, MobileCardList, StatusTabFilter, SortBottomSheet
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
├── pages/                   ← páginas sem domínio (só marketing): LandingPage
├── hooks/                   ← hooks cross-feature: useFetch, useIsMobile, useWebSocket, useListPage, masks...
├── contexts/                ← FetchAuthContext, MobilePageContext (contexto), MobilePageProvider (provider)
├── utils/                   ← formatCnpj, formatPhone, formatMoney, formatDateTime, decodeJwt
├── config/env.js
├── styles/index.css         ← tema global, animações, classes de componente (@layer components)
├── App.jsx
└── main.jsx
```

### Rotas (App.jsx)

| Path | Componente | Acesso |
|---|---|---|
| `/` | `LandingPage` | público |
| `/login` | `Login` | público |
| `/register` | `CompanyCreate` | público |
| `/suppliers` | `SupplierList` | privado (empresa) |
| `/products` | `ProductList` | privado (empresa) |
| `/quotations` | `QuotationList` | privado (empresa) |
| `/quotations/new` | `QuotationCreatePage` | privado (empresa) |
| `/quotations/:id/edit` | `QuotationEditPage` | privado (empresa) |
| `/quotations/monitor/` | `QuotationMonitor` | privado (empresa) |
| `/supplier/login/:companyCnpj` | `SupplierAccessToken` | público |
| `/supplier/quotations/:companyCnpj` | `SupplierPage` | fornecedor |
| `/supplier/quotation` | `SupplierQuotationPage` | fornecedor |
| `*` | redirect `/login` | — |

**`PrivateRoute`** — Guarda rotas de empresa: decodifica JWT via `jwt-decode`, redireciona para `/login` se expirado.

**`SupplierRoute`** — Wrapper para rotas de fornecedor: sobrescreve `FetchAuthContext` com `{ cookieName: "supplierAccessToken", loginPath: "/supplier/login/{cnpj}" }`.

### Autenticação no frontend

**Empresa:**
1. POST `/api/v1/companies/login` → recebe `accessToken`
2. Salva em cookie `"accessToken"` (secure, sameSite: Strict)
3. `useFetch` lê o cookie e injeta `Authorization: Bearer {token}` em toda requisição
4. 403 → cookie removido + redirect para `/login`

**Fornecedor:**
1. Acessa `/supplier/login/:companyCnpj`
2. POST `/api/v1/suppliers/login/{companyCnpj}` → recebe `supplierAccessToken`
3. Salva em cookie `"supplierAccessToken"`
4. `SupplierRoute` injeta contexto alternativo; `useFetch` usa `supplierAccessToken`
5. 403 → redirect para `/supplier/login/{cnpj}`

Os dois contextos de auth nunca se misturam. Cookies, navbars e rotas são completamente separados.

### Hooks customizados

#### `useFetch`
Hook central de HTTP. Lê o token do cookie via `FetchAuthContext`, injeta o header `Authorization`, trata loading/error, e em caso de resposta 403 remove o cookie e redireciona para o login.

```js
const { request, loading, error } = useFetch()
// request(method, endpoint, body?, headers?) → Promise<data>
```

#### `useWebSocket`
Conecta ao endpoint STOMP `/ws` via SockJS, autentica com Bearer token (lido diretamente do cookie `accessToken`), e assina `/topic/quotation/{quotationId}`. Cada mensagem recebida é parsada como JSON e entregue ao callback `onMessage`.

```js
useWebSocket(quotationId, (message) => { /* atualiza estado */ })
```

#### Outros hooks
| Hook | Responsabilidade |
|---|---|
| `useIsMobile` | Detecta se viewport ≤ 640px |
| `useListPage` | Estado central de páginas de listagem: paginação, ordenação, busca, modais, sheets e confirmação de exclusão |
| `useMobileMenu` | Estado de abertura do menu mobile |
| `useCnpjMask` | Formatação de input de CNPJ |
| `usePhoneMask` | Formatação de input de telefone |
| `useCurrencyMask` | Formatação de input de moeda (BRL) |
| `useCharLimit` | Rastreamento de limite de caracteres |

### Contexts

**`FetchAuthContext`** — Provê `{ cookieName, loginPath }` para o `useFetch`. O valor padrão é empresa; `SupplierRoute` sobrescreve com os valores do fornecedor.

**`MobilePageContext`** / **`MobilePageProvider`** — Gerencia título e ações do header mobile. Páginas chamam `registerPage(title, reloadFn)` ao montar e `unregisterPage()` ao desmontar. O hook de acesso (`useMobilePage`) fica em `hooks/useMobilePage.js` — separado para satisfazer a regra de fast refresh do Vite.

### Componentes principais

| Componente | Descrição |
|---|---|
| `PrivateRoute` | Guard de rota empresa (valida JWT) |
| `SupplierRoute` | Guard de rota fornecedor (injeta contexto) |
| `Navbar` | Navegação da empresa |
| `SupplierNavbar` | Navegação do fornecedor |
| `Modal` | Dialog genérico (desktop) |
| `BottomSheet` | Painel deslizante genérico (mobile) — wrapper com scroll-lock, teclado e backdrop |
| `DetailRow` | Linha de detalhe com ícone, label e valor — usada dentro de bottom sheets |
| `Table` | Tabela com paginação e ordenação |
| `Pagination` | Controles de paginação |
| `MobileCardList` | Lista de cards para mobile |
| `MobileMenu` / `SupplierMobileMenu` | Gaveta de navegação mobile |
| `ProductBottomSheet` | Detalhes e ações de produto (mobile) |
| `ProductFormBottomSheet` | Formulário de produto (mobile) |
| `SupplierBottomSheet` | Detalhes e ações de fornecedor (mobile) |
| `SupplierFormBottomSheet` | Formulário de fornecedor (mobile) |
| `QuotationBottomSheet` | Detalhes de cotação (mobile) |
| `SortBottomSheet` | Opções de ordenação (mobile) |
| `StatusTabFilter` | Filtro de status em abas |
| `LogoutConfirmModal` | Confirmação de logout |

### Páginas principais

#### `QuotationCreatePage` — criação de cotação (4 etapas)
1. **Detalhes:** datas de início/fim, flag `isAuction`
2. **Produtos:** seleção dos produtos da empresa
3. **Quantidades:** quantidade e `bonusLimit` por produto
4. **Fornecedores:** seleção dos fornecedores a convidar

Ao submeter, executa em sequência:
- `POST /api/v1/quotations`
- `POST /api/v1/contains/batch`
- `POST /api/v1/participations/batch`

#### `QuotationMonitor` — monitoramento em tempo real
- Conecta via `useWebSocket` ao tópico `/topic/quotation/{quotationId}`
- Exibe countdown até o fim da cotação
- Tabelas: produtos (com menor lance via `useMemo`) e lances (com detalhes de fornecedor)
- Stats: custo total estimado, quantidade de lances, fornecedores, produtos com oferta
- Filtros por produto, fornecedor, empregador, CNPJ e presença de lance
- Exporta PDF via `GET /api/v1/quotations/{id}/report` (download de blob)
- Layouts distintos para mobile e desktop

#### `SupplierQuotationPage` — envio de lances pelo fornecedor
- Carrega cotação, produtos (`contain`) e participação do fornecedor
- Formulário dinâmico: um campo por produto (preço, quantidade, bônus)
- Submete `POST /api/v1/bids/batch`

### Utilitários

| Arquivo | Função |
|---|---|
| `formatMoney.js` | Formata valor em BRL |
| `formatCnpj.js` | Formata CNPJ (XX.XXX.XXX/XXXX-XX) |
| `formatPhone.js` | Formata telefone (11 dígitos) |
| `formatDateTime.js` | Converte `Instant` UTC para exibição local |
| `decodeJwt.js` | Decodifica payload JWT (usado em `PrivateRoute`) |

### Configuração de ambiente

```js
// src/config/env.js
export const ENV = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  SOCKET_URL:   import.meta.env.VITE_SOCKET_URL   || "ws://localhost:8080/ws"
}
```

### Responsividade

Breakpoint: **640px** (`max-sm:` no Tailwind).

- `useIsMobile()` determina qual árvore de UI renderizar
- Mobile: bottom sheets, card lists, gaveta de navegação
- Desktop: tabelas, modais, toolbars
- CSS customizado em `index.css` com variáveis (`--color-primary`, `--surface`, etc.) e layers de componentes (`.auth-card`, `.toolbar-*`, `.qm-*`, `.sqm-*`)

## Fluxos principais

### 1. Criação e monitoramento de cotação

```
Empresa cria cotação (4 steps) ─► POST /quotations + /contains/batch + /participations/batch
                                        │
Fornecedor acessa portal ──────────────►│
  GET /participations/supplier           │
  GET /contains/{quotationId}            │
  POST /bids/batch ──────────────────── Backend publica em /topic/quotation/{id}
                                               │
Empresa no QuotationMonitor ◄──── STOMP push ─┘
  (useMemo recalcula menor lance, UI atualiza)
```

### 2. Autenticação completa

```
Empresa: POST /companies/login → accessToken em cookie "accessToken"
  └─ useFetch injeta Bearer token → SecurityFilter valida → COMPANY context

Fornecedor: POST /suppliers/login/{cnpj} → supplierAccessToken em cookie "supplierAccessToken"
  └─ SupplierRoute sobrescreve FetchAuthContext
  └─ useFetch injeta Bearer token → SecurityFilter valida → SUPPLIER context
```

### 3. Geração de PDF

```
Empresa clica "Exportar" no QuotationMonitor
  └─ GET /api/v1/quotations/{id}/report
      └─ QuotationReportService gera PDF (OpenPDF)
          └─ Frontend recebe blob → download como "cotacao-{id}.pdf"
```