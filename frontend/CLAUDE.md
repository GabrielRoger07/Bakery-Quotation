# Frontend

React 19 · Vite · Tailwind CSS v4 · React Router v6

## Ressalvas

- **`useFetch` é o único cliente HTTP** — não usar `fetch` diretamente, exceto download de blob (exige leitura manual do cookie)
- **Variáveis CSS:** Localizadas em `src/styles/index.css`. Nunca hardcodear cores ou sombras, usar sempre `var(--nome)`.
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
├── styles/index.css     ← tema global, animações, classes de componente (@layer components)
└── utils/               ← funções utilitárias - VERIFICAR ANTES de criar algo novo
```

## Regras de ouro

1. **Antes de criar qualquer componente novo, verificar se já existe em `components/`**
2. **Antes de criar qualquer hook novo, verificar se já existe em `hooks/`**
3. Usar `useIsMobile()` para decisões de layout; `max-sm:` do Tailwind para ajustes pontuais de estilo
4. **Nunca reinventar modal/sheet do zero** — `<Modal>` já existe em `src/components/Modal.jsx`

## Responsividade
- Breakpoint mobile: `640px` (hook `useIsMobile`) e classe `max-sm:` no Tailwind
- **Sempre implementar os dois layouts** (mobile e desktop) com `isMobile` do `useIsMobile()`
- **Nunca usar só media query CSS** para esconder conteúdo complexo — renderizar condicionalmente