# design-sync notes — Bakery Quotation frontend

Repo-specific gotchas for future syncs. Read before re-running.

## Shape / build
- This is an **app, not a packaged component library** — no dist library entry, no TypeScript. Runs in **synth-entry `package` mode** with a hand-written barrel entry: `.design-sync/entry.mjs` re-exports each component's *default* export as a named export. A plain `export *` synth entry would NOT pick up default exports (every component here is `export default`), so `window.BakeryDS.*` would be empty. **Keep the barrel.**
- `componentSrcMap` in config is the **explicit component manifest** (there is no `.d.ts` to derive names from). To add/remove a component: edit both `entry.mjs` and `componentSrcMap`.
- `@/` path alias resolves via `.design-sync/tsconfig.json` (`baseUrl: ".."`, `@/* → src/*`). esbuild reads its `compilerOptions.paths`.
- **CSS**: the shipped stylesheet is the compiled Tailwind from `dist/`, copied to a stable path by `buildCmd`: `npm run build && cp dist/assets/index-*.css .design-sync/compiled.css`. The dist filename is content-hashed, hence the copy. `.design-sync/compiled.css` is gitignored (regenerated).
- **Provider**: `Table` and `MobileCardList` call `useMobilePage()` and crash without `MobilePageProvider`. It's wired as the global `cfg.provider` and exported via the barrel (not a card).

## d.ts contracts
- No TypeScript → auto-extracted props are `[key: string]: unknown`. The **20 core primitives** have hand-written `dtsPropsFor` in config (accurate props). The **11 composites** (navbars, menus, bottom sheets, LogoutConfirmModal) still ship generic props — improving them is a standing task.

## Previews / verification
- **Render check was SKIPPED** (`--no-render-check`, user opted out of the ~200MB Playwright install). Previews are **not machine-verified**; the grading capture (`package-capture.mjs`) is also unavailable without Playwright.
- Authored previews (`.design-sync/previews/*.tsx`, 20 core) are ported from the app's **living catalog** `src/pages/DesignSystem/DesignSystemPage.jsx` — known-good compositions from shipping code.
- The post-conventions-header rebuild used plain `package-build.mjs` + `package-validate.mjs --no-render-check` instead of the `resync.mjs` driver, because the driver's render + capture stages need Playwright. On the incremental first-sync path this is fine (deletes come from the plan globs, receipt from `report_validate`). **If Playwright is installed later, switch to the driver for real render verification + grading.**
- Overrides (`cfg.overrides`): `Table`/`PageHeader`/`WizardActions` → `cardMode: column`; `Modal`/`ConfirmDialog`/`MobileCardList` → `cardMode: single` + viewport.
- Excluded: `PrivateRoute` (route guard, not a visual component).

## Known render warns (expected — not new)
- `[FONT_REMOTE]` for `Outfit`, `JetBrains Mono`, `source-code-pro` — Outfit loads at runtime from Google Fonts; **JetBrains Mono / source-code-pro are referenced by `--font-mono` but never actually `@import`ed**, so mono text falls back to a system mono. Cosmetic, low impact (few code/token displays).
- `[RENDER_SKIPPED]` — expected while Playwright is absent.

## Re-sync risks (what can silently go stale)
- `compiled.css` depends on `dist/assets/index-*.css` existing after `npm run build`. If the Vite output layout changes, fix the `cp` glob in `buildCmd`.
- `styles.css` contains only the Tailwind utilities the **current app** already uses (Tailwind v4, no runtime JIT). Novel utility combinations the design agent invents won't be styled — `conventions.md` tells it to fall back to inline `style={{ … 'var(--token)' }}`. If the app's utility usage shrinks, previously-available utilities could disappear from the shipped CSS.
- The 11 composite components render as **floor cards** and have generic `.d.ts`. Authoring their previews + `dtsPropsFor` is the standing incremental improvement on any future sync.
