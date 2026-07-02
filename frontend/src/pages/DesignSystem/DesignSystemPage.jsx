import { useState } from 'react'
import { Calendar, Gavel, Package, Building2, Search } from 'lucide-react'
import { cn } from '@/utils/cn'

import PageContainer from '@/components/PageContainer'
import PageHeader from '@/components/PageHeader'
import SectionHeader from '@/components/SectionHeader'
import Button from '@/components/Button'
import Input from '@/components/Input'
import Select from '@/components/Select'
import Alert from '@/components/Alert'
import FieldMessage from '@/components/FieldMessage'
import FormActions from '@/components/FormActions'
import WizardActions from '@/components/WizardActions'
import MetaCard from '@/components/MetaCard'
import EmptyState from '@/components/EmptyState'
import StatusTabFilter from '@/components/StatusTabFilter'
import Pagination from '@/components/Pagination'
import Modal from '@/components/Modal'
import ConfirmDialog from '@/components/ConfirmDialog'
import ActiveFilterPill from '@/components/ActiveFilterPill'
import Table from '@/components/Table'

/*
 * Catálogo vivo do design system (rota /design-system).
 * Renderiza tokens (lendo o valor real via var()) e os primitivos de @/components
 * com todas as suas variantes — para consulta e padronização de telas novas.
 * NÃO é fonte de verdade: tokens vivem em src/styles/index.css; primitivos em @/components.
 */

/* ── Catálogo de cores por PAPEL. Cada token: [nome, "use quando…"].
   Valores resolvidos em runtime via var(); a descrição responde "qual cor em qual caso". ── */
const COLOR_GROUPS = [
  {
    title: 'Brand & Accent',
    tokens: [
      ['--color-brand', 'Fundo escuro (navbar, auth)'],
      ['--color-brand-mid', 'Degradê do fundo escuro'],
      ['--color-accent', 'Ação primária, foco, destaque'],
      ['--color-accent-hover', 'Hover da ação primária'],
      ['--color-accent-strong', 'Ênfase do accent (texto/borda)'],
      ['--color-accent-soft', 'Fundo accent translúcido (hover)'],
      ['--color-accent-soft-strong', 'Fundo accent em foco'],
      ['--color-accent-soft-weak', 'Fundo do card selecionado'],
    ],
  },
  {
    title: 'Surfaces (fundos)',
    tokens: [
      ['--color-surface-card', 'Card, input, modal, tabela'],
      ['--color-surface-app', 'Fundo da página/app'],
      ['--color-surface-subtle', 'Zebra de linha, empty-state'],
      ['--color-surface-muted', 'Preenchimento destacado'],
      ['--color-surface-sunken', 'Área interna afundada'],
    ],
  },
  {
    title: 'Highlights (roxo suave)',
    tokens: [
      ['--color-highlight-soft', 'Fundo de destaque roxo'],
      ['--color-highlight', 'Destaque roxo médio'],
      ['--color-highlight-lighter', 'Fundo roxo levíssimo (hover)'],
      ['--color-highlight-border', 'Borda roxa de destaque'],
      ['--color-info-border', 'Borda de banner informativo'],
    ],
  },
  {
    title: 'Text (hierarquia por função)',
    tokens: [
      ['--color-text-heading', 'Títulos, ênfase máxima'],
      ['--color-text-body', 'Texto de leitura padrão'],
      ['--color-text-secondary', 'Apoio índigo (subtítulos)'],
      ['--color-text-neutral', 'Texto de UI cinza (labels, células)'],
      ['--color-text-muted', 'Auxiliar, hints, placeholders'],
      ['--color-text-disabled', 'Inativo, placeholder'],
      ['--color-text-inverse', 'Texto sobre fundo claro pontual'],
    ],
  },
  {
    title: 'Borders (por proeminência)',
    tokens: [
      ['--color-border-default', 'Borda padrão'],
      ['--color-border-strong', 'Input, ênfase'],
      ['--color-border-subtle', 'Divisória leve'],
      ['--color-border-faint', 'Divisória quase invisível'],
      ['--color-border-spinner', 'Spinner de loading'],
    ],
  },
  {
    title: 'Semantic — Success',
    tokens: [
      ['--color-success', 'Sucesso (base)'],
      ['--color-success-strong', 'Sucesso enfático'],
      ['--color-success-lighter', 'Fundo de sucesso'],
      ['--color-success-border', 'Borda de sucesso'],
      ['--color-success-soft', 'Fundo verde translúcido'],
      ['--color-success-soft-border', 'Borda verde translúcida'],
    ],
  },
  {
    title: 'Semantic — Danger',
    tokens: [
      ['--color-danger', 'Erro (base)'],
      ['--color-danger-strong', 'Erro enfático (botão)'],
      ['--color-danger-dark', 'Erro em foco forte'],
      ['--color-danger-border', 'Borda de erro'],
      ['--color-danger-soft', 'Fundo vermelho translúcido'],
    ],
  },
  {
    title: 'Semantic — Warning',
    tokens: [
      ['--color-warning', 'Aviso (base)'],
      ['--color-warning-text', 'Aviso legível em texto'],
      ['--color-warning-strong', 'Aviso enfático'],
      ['--color-warning-lighter', 'Fundo de aviso'],
      ['--color-warning-border', 'Borda de aviso'],
    ],
  },
]

// Tons translúcidos para usar sobre fundo escuro (navbar/drawer).
const ON_DARK_TOKENS = [
  ['--color-on-dark-text', 'Texto principal'],
  ['--color-on-dark-text-muted', 'Texto secundário'],
  ['--color-on-dark-text-faint', 'Texto terciário'],
  ['--color-on-dark-bg', 'Preenchimento'],
  ['--color-on-dark-bg-hover', 'Hover de item'],
  ['--color-on-dark-border', 'Borda'],
  ['--color-on-dark-border-strong', 'Borda enfática'],
]

const RADII = ['--radius-sm', '--radius-md', '--radius-lg', '--radius-xl', '--radius-2xl']

const SHADOW_GROUPS = [
  { title: 'Depth', tokens: ['--shadow-xs', '--shadow-sm', '--shadow-md', '--shadow-md-soft', '--shadow-lg', '--shadow-xl', '--shadow-popover'] },
  { title: 'Card', tokens: ['--shadow-card-soft', '--shadow-card-md'] },
  { title: 'Accent & hover lift', tokens: ['--shadow-accent', '--shadow-hover-accent', '--shadow-hover-success', '--shadow-hover-danger'] },
  { title: 'Focus rings', tokens: ['--shadow-focus-accent', '--shadow-focus-accent-soft', '--shadow-focus-danger'] },
]

const TYPOGRAPHY = [
  { cls: 'text-title', token: '--text-title', sample: 'Título de página' },
  { cls: 'text-heading', token: '--text-heading', sample: 'Título de seção / modal' },
  { cls: 'text-body', token: '--text-body', sample: 'Texto padrão, labels e inputs' },
  { cls: 'text-caption', token: '--text-caption', sample: 'Legendas, hints e tags' },
]

/* ── Lê o valor computado de um token CSS no :root ── */
const tokenValue = (name) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// Lê uma vez na montagem (initializer preguiçoso) — evita setState em effect.
const useTokenValue = (name) => {
  const [value] = useState(() => tokenValue(name))
  return value
}

/* ── Building blocks da própria página (estilo colocado, via tokens) ── */
const Section = ({ id, title, subtitle, children }) => (
  <section id={id} className="mb-12 scroll-mt-20">
    <div className="mb-5 pb-2 border-b border-[var(--color-border-default)]">
      <h2 className="m-0 text-heading font-bold text-[var(--color-text-heading)]">{title}</h2>
      {subtitle && <p className="m-0 mt-1 text-caption text-[var(--color-text-muted)]">{subtitle}</p>}
    </div>
    {children}
  </section>
)

const Subsection = ({ title, children }) => (
  <div className="mb-7">
    {title && <h3 className="m-0 mb-3 text-body font-bold text-[var(--color-text-secondary)]">{title}</h3>}
    {children}
  </div>
)

const TokenName = ({ children }) => (
  <code className="text-[0.6875rem] font-mono text-[var(--color-text-muted)] break-all">{children}</code>
)

const ColorSwatch = ({ token, use }) => {
  const value = useTokenValue(token)
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-border-default)]"
        style={{ background: `var(${token})` }}
      />
      <TokenName>{token}</TokenName>
      <span className="text-[0.625rem] font-mono uppercase text-[var(--color-text-disabled)]">{value || '—'}</span>
      {use && <span className="text-[0.6875rem] leading-tight text-[var(--color-text-neutral)]">{use}</span>}
    </div>
  )
}

const ColorGrid = ({ tokens }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
    {tokens.map(([name, use]) => <ColorSwatch key={name} token={name} use={use} />)}
  </div>
)

/* ── Seção de Tokens ── */
const TokensSection = () => (
  <Section id="tokens" title="Tokens" subtitle="Fonte de verdade: src/styles/index.css (@theme). Os valores abaixo são lidos em runtime via var().">
    {COLOR_GROUPS.map((group) => (
      <Subsection key={group.title} title={group.title}>
        <ColorGrid tokens={group.tokens} />
      </Subsection>
    ))}

    <Subsection title="On-dark (sobre fundo escuro)">
      <div className="rounded-[var(--radius-lg)] p-4 bg-[var(--color-brand)] grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ON_DARK_TOKENS.map(([name, use]) => (
          <div key={name} className="flex flex-col gap-1.5">
            <div className="h-14 w-full rounded-[var(--radius-md)] border border-[var(--color-on-dark-border)]" style={{ background: `var(${name})` }} />
            <code className="text-[0.625rem] font-mono text-[var(--color-on-dark-text)] break-all">{name}</code>
            <span className="text-[0.6875rem] leading-tight text-[var(--color-on-dark-text-muted)]">{use}</span>
          </div>
        ))}
      </div>
    </Subsection>

    <Subsection title="Tipografia">
      <div className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-5">
        {TYPOGRAPHY.map(({ cls, token, sample }) => (
          <div key={cls} className="flex items-baseline justify-between gap-4 border-b border-[var(--color-border-faint)] pb-3 last:border-b-0 last:pb-0">
            <span className={cn(cls, 'font-semibold text-[var(--color-text-heading)]')}>{sample}</span>
            <span className="flex flex-col items-end text-right">
              <code className="text-[0.6875rem] font-mono text-[var(--color-accent)]">{cls}</code>
              <TokenName>{token}</TokenName>
            </span>
          </div>
        ))}
        <p className="m-0 text-caption text-[var(--color-text-muted)]">Família: <TokenName>--font-sans</TokenName> (Outfit)</p>
      </div>
    </Subsection>

    <Subsection title="Radii">
      <div className="flex flex-wrap gap-5">
        {RADII.map((token) => (
          <div key={token} className="flex flex-col items-center gap-2">
            <div className="w-20 h-20 bg-[var(--color-highlight)] border border-[var(--color-highlight-border)]" style={{ borderRadius: `var(${token})` }} />
            <TokenName>{token}</TokenName>
          </div>
        ))}
      </div>
    </Subsection>

    {SHADOW_GROUPS.map((group) => (
      <Subsection key={group.title} title={`Shadows — ${group.title}`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 p-2">
          {group.tokens.map((token) => (
            <div key={token} className="flex flex-col items-center gap-3">
              <div className="w-full h-16 rounded-[var(--radius-lg)] bg-[var(--color-surface-card)] border border-[var(--color-border-faint)]" style={{ boxShadow: `var(${token})` }} />
              <TokenName>{token}</TokenName>
            </div>
          ))}
        </div>
      </Subsection>
    ))}
  </Section>
)

/* ── Bloco que apresenta um primitivo: nome + preview ── */
const Primitive = ({ name, count, children }) => (
  <div className="mb-7">
    <SectionHeader icon={<Package size={14} strokeWidth={2.5} />} label={name} count={count} />
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border-default)] bg-[var(--color-surface-card)] p-5">
      {children}
    </div>
  </div>
)

const Row = ({ children }) => <div className="flex flex-wrap items-center gap-3">{children}</div>

/* ── Seção de Primitivos (ao vivo) ── */
const PrimitivesSection = () => {
  const [text, setText] = useState('')
  const [selectValue, setSelectValue] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(2)
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pillValue, setPillValue] = useState('pão francês')

  const selectOptions = [
    { value: 'kg', label: 'Quilograma (kg)' },
    { value: 'un', label: 'Unidade (un)' },
    { value: 'cx', label: 'Caixa (cx)' },
  ]

  const tableColumns = [
    { key: 'name', label: 'Produto' },
    { key: 'dept', label: 'Departamento' },
    { key: 'unit', label: 'Unidade' },
  ]
  const tableData = [
    { id: 1, name: 'Farinha de trigo', dept: 'Secos', unit: 'kg' },
    { id: 2, name: 'Fermento biológico', dept: 'Secos', unit: 'un' },
    { id: 3, name: 'Leite integral', dept: 'Laticínios', unit: 'L' },
  ]

  return (
    <Section id="primitivos" title="Primitivos" subtitle="Componentes de @/components renderizados ao vivo. Antes de criar algo novo, reutilizar daqui.">
      <Primitive name="Button" count="5 variantes">
        <Row>
          <Button variant="primary">Primary</Button>
          <Button variant="success">Success</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="secondary">Secondary</Button>
          <div className="rounded-[var(--radius-md)] bg-[var(--color-brand)] p-2"><Button variant="ghost">Ghost (on-dark)</Button></div>
        </Row>
        <Row>
          <Button loading>Loading</Button>
          <Button disabled>Disabled</Button>
        </Row>
      </Primitive>

      <Primitive name="Input">
        <div className="max-w-md">
          <Input label="Nome do produto" value={text} onChange={(e) => setText(e.target.value)} placeholder="Digite o nome" required />
          <Input label="E-mail" type="email" value="email-invalido" onChange={() => {}} error="E-mail inválido" />
          <Input label="Senha" type="password" value="segredo123" onChange={() => {}} />
        </div>
      </Primitive>

      <Primitive name="Select">
        <div className="max-w-md flex flex-col gap-3">
          <Select label="Unidade de medida" value={selectValue} onChange={(e) => setSelectValue(e.target.value)} options={selectOptions} placeholder="Selecionar..." required />
          <div>
            <p className="m-0 mb-1 text-caption text-[var(--color-text-muted)]">bare (toolbar)</p>
            <Select bare value={selectValue} onChange={(e) => setSelectValue(e.target.value)} options={selectOptions} placeholder="Filtrar..." />
          </div>
        </div>
      </Primitive>

      <Primitive name="Alert" count="4 variantes">
        <Alert message="Algo deu errado ao salvar." variant="error" />
        <Alert message="Salvo com sucesso!" variant="success" />
        <Alert message="Atenção: revise os campos." variant="warning" />
        <Alert message="Dica: você pode editar depois." variant="info" />
      </Primitive>

      <Primitive name="FieldMessage">
        <FieldMessage tone="error">Campo obrigatório</FieldMessage>
        <FieldMessage tone="warning">Mínimo de 3 caracteres</FieldMessage>
      </Primitive>

      <Primitive name="FormActions">
        <FormActions>
          <Button variant="secondary">Cancelar</Button>
          <Button>Salvar</Button>
        </FormActions>
      </Primitive>

      <Primitive name="WizardActions">
        <div className="relative">
          <WizardActions onBack={() => {}} onPrimary={() => {}} primaryLabel="Próximo" primaryIcon={Calendar} blocked hint="Preencha os campos obrigatórios para avançar." />
        </div>
        <p className="m-0 mt-2 text-caption text-[var(--color-text-muted)]">No mobile fixa no rodapé acima da bottom-nav.</p>
      </Primitive>

      <Primitive name="PageHeader">
        <PageHeader title="Produtos" subtitle="Gerencie os produtos da sua empresa." actions={<Button>Adicionar</Button>} />
      </Primitive>

      <Primitive name="MetaCard">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <MetaCard icon={<Calendar size={16} />} label="Abertura" value="27/06/2026" sub="08:00" />
          <MetaCard icon={<Gavel size={16} />} label="Modo" value="Leilão reverso" />
        </div>
      </Primitive>

      <Primitive name="SectionHeader">
        <SectionHeader icon={<Building2 size={14} strokeWidth={2.5} />} label="Fornecedores" count={3} />
      </Primitive>

      <Primitive name="EmptyState">
        <EmptyState>Nenhum item encontrado.</EmptyState>
      </Primitive>

      <Primitive name="StatusTabFilter">
        <StatusTabFilter value={status} onChange={setStatus} counts={{ '': 12, agendado: 3, ativo: 5, fechado: 4 }} />
      </Primitive>

      <Primitive name="ActiveFilterPill">
        <ActiveFilterPill label="Busca" value={pillValue} onClear={() => setPillValue('')} />
        {!pillValue && <p className="m-0 text-caption text-[var(--color-text-muted)]">(sem valor — não renderiza)</p>}
      </Primitive>

      <Primitive name="Pagination">
        <Pagination currentPage={page} totalPages={8} onPageChange={setPage} />
      </Primitive>

      <Primitive name="Modal / ConfirmDialog">
        <Row>
          <Button onClick={() => setModalOpen(true)}>Abrir Modal</Button>
          <Button variant="danger" onClick={() => setConfirmOpen(true)}>Abrir ConfirmDialog</Button>
        </Row>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Exemplo de Modal">
          <p className="m-0 text-body text-[var(--color-text-secondary)]">Conteúdo do modal. Use sempre este primitivo em vez de recriar overlays.</p>
          <FormActions>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Fechar</Button>
          </FormActions>
        </Modal>
        <ConfirmDialog
          isOpen={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          confirmVariant="danger"
        >
          Tem certeza de que deseja remover este item?
        </ConfirmDialog>
      </Primitive>

      <Primitive name="Table">
        <p className="m-0 mb-3 flex items-center gap-1.5 text-caption text-[var(--color-text-muted)]"><Search size={13} /> Versão desktop; no mobile o app troca para MobileCardList.</p>
        <Table title="Produtos" columns={tableColumns} data={tableData} idKey="id" onEdit={() => {}} onDelete={() => {}} />
      </Primitive>
    </Section>
  )
}

const NAV = [
  { id: 'tokens', label: 'Tokens' },
  { id: 'primitivos', label: 'Primitivos' },
]

const DesignSystemPage = () => (
  <PageContainer variant="detail">
    <PageHeader title="Design System" subtitle="Catálogo vivo de tokens e primitivos (rota interna /design-system)." />

    <nav className="mb-8 flex flex-wrap gap-2">
      {NAV.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          className="rounded-full border border-[var(--color-border-default)] bg-[var(--color-surface-card)] px-3 py-1 text-caption font-semibold text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
          {label}
        </a>
      ))}
    </nav>

    <TokensSection />
    <PrimitivesSection />
  </PageContainer>
)

export default DesignSystemPage
