import { useLayoutEffect } from 'react'

// Gradiente decorativo do fundo de auth (tom do accent).
const AUTH_GRADIENT =
  'radial-gradient(ellipse 80% 60% at 20% -10%, rgba(91,33,182,0.25) 0%, transparent 55%),' +
  'radial-gradient(ellipse 60% 40% at 80% 110%, rgba(91,33,182,0.15) 0%, transparent 55%)'

const surfaces = {
  app:   { color: 'var(--color-surface-app)', image: 'none' },
  brand: { color: 'var(--color-brand)',       image: AUTH_GRADIENT },
}

/**
 * Pinta o <body> com a superfície da tela enquanto o componente estiver montado.
 *
 * Necessário porque a moldura do navegador no mobile (status bar / barra do Safari,
 * área de overscroll) usa a cor de fundo do documento, não a de um container interno —
 * um wrapper escuro dentro do #root deixa faixas claras em cima e embaixo.
 *
 * surface: 'app' (padrão, fundo claro) | 'brand' (fundo escuro de auth + gradiente)
 */
const usePageSurface = (surface = 'app') => {
  useLayoutEffect(() => {
    const { color, image } = surfaces[surface] ?? surfaces.app
    document.body.style.backgroundColor = color
    document.body.style.backgroundImage = image
    return () => {
      document.body.style.backgroundColor = ''
      document.body.style.backgroundImage = ''
    }
  }, [surface])
}

export default usePageSurface
