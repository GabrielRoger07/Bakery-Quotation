# Bakery Quotation — Design System conventions

React 19 + Tailwind CSS v4. Every visual token is a CSS custom property defined on `:root` by the shipped `styles.css` (which `@import`s the compiled Tailwind and `_ds_bundle.css`). Components are pre-styled; you mostly compose them and add layout glue with the token-referencing utilities below.

## Setup / wrapping

- **`styles.css` must be loaded** — it defines all `--color-*`, `--radius-*`, `--shadow-*`, `--text-*` tokens and the fonts. Without it components render unstyled.
- **`Table` and `MobileCardList` require `MobilePageProvider`** around them (they read a context via `useMobilePage()` and crash otherwise). Wrap the app root once:
  ```jsx
  <MobilePageProvider>
    <App />
  </MobilePageProvider>
  ```
  No other component needs a provider.
- **Font:** the UI font is **Outfit** (`--font-sans`), loaded at runtime from Google Fonts. `--font-mono` is JetBrains Mono (falls back to a system mono; not bundled).

## Styling idiom — token-referencing Tailwind utilities

Never hardcode a color, radius, shadow, or font size. Two vocabularies:

**Semantic typography** (use these instead of `text-[13px]`): `text-title` (page h1), `text-heading` (section/modal), `text-body` (default text, labels, inputs), `text-caption` (hints, tags).

**Everything else via arbitrary utilities that reference a token** — `bg-[var(--color-surface-card)]`, `text-[var(--color-text-heading)]`, `border-[var(--color-border-default)]`, `rounded-[var(--radius-lg)]`, `shadow-[var(--shadow-card-md)]`. Real token families (choose by role, not hue):

| Family | Tokens (prefix `--color-` unless noted) |
|---|---|
| Text | `text-heading` `text-body` `text-secondary` `text-neutral` `text-muted` `text-disabled` `text-inverse` |
| Surfaces | `surface-card` `surface-app` `surface-subtle` `surface-muted` `surface-sunken` |
| Borders | `border-default` `border-strong` `border-subtle` `border-faint` |
| Brand / accent | `brand` `brand-mid` `accent` `accent-hover` `accent-strong` `accent-soft` |
| Highlights (roxo) | `highlight-soft` `highlight` `highlight-lighter` `highlight-border` |
| Status | base + `-strong` + `-border` for `success` `danger` `warning`; plus `success-lighter` `success-soft` `warning-lighter` `warning-text` `danger-soft` `danger-dark` |
| On-dark (over `brand`) | `on-dark-text` `on-dark-text-muted` `on-dark-bg` `on-dark-border` |
| Radius (`--radius-`) | `sm` `md` `lg` `xl` `2xl` · Shadows (`--shadow-`): `xs`→`xl`, `card-soft` `card-md`, `focus-accent` |

Only utilities that reference tokens **already used in the app** are precompiled (Tailwind v4, no runtime JIT). For a novel combination, use an inline style with the same token — `style={{ background: 'var(--color-surface-card)' }}` — which always resolves. Merge classes with the `cn()` helper (clsx + tailwind-merge).

## Where the truth lives

- `styles.css` + `_ds_bundle.css` — the full token + component stylesheet the agent should read before styling.
- `components/general/<Name>/<Name>.d.ts` — the prop contract; `<Name>.prompt.md` — usage notes.

## Idiomatic snippet

```jsx
import { PageContainer, PageHeader, Table, Button } from '@bakery/design-system'

// In this repo's own code each is a default export: import Button from '@/components/Button'
<MobilePageProvider>
  <PageContainer variant="list">
    <PageHeader title="Produtos" actions={<Button variant="primary">Adicionar</Button>} />
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-5">
      <Table title="Produtos" columns={columns} data={data} idKey="id" onEdit={fn} onDelete={fn} />
    </div>
  </PageContainer>
</MobilePageProvider>
```
