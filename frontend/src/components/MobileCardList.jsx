import { useEffect, useRef, useState } from 'react'
import { Pencil, Trash, Search, X, SlidersHorizontal, Plus, Eye, BarChart2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { useMobilePage } from '@/contexts/MobilePageContext'
import SortBottomSheet from '@/components/SortBottomSheet'

/**
 * MobileCardList — padrão mobile-native para listas de Fornecedores e Produtos.
 *
 * Props:
 *   title          string        — título da página (vai para o navbar)
 *   items          array         — dados formatados
 *   idKey          string        — chave de id (ex: "supplierId")
 *   loading        bool
 *   emptyMessage   string
 *   onReload       fn()
 *   onAdd          fn()
 *   onEdit         fn(item)
 *   onDelete       fn(id)
 *   onView         fn(item)      — abre modal de detalhes
 *   onMonitor      fn(item)      — navega para monitoramento
 *   renderCard     fn(item)      — retorna { avatar, title, subtitle, tags[] }
 *   toolbar        ReactNode     — conteúdo da barra de filtro
 *   filterActive   bool
 *   searchBar      ReactNode     — input de busca rápida (opcional, exibido acima dos cards)
 *   sortColumns    [{ key, label }]  — colunas ordenáveis (ativa o botão de sort)
 *   sortField      string | null
 *   sortDirection  "asc" | "desc"
 *   onSort         fn(columnKey)
 */
const MobilePagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null

    const useDots = totalPages <= 7
    const progress = totalPages > 1 ? currentPage / (totalPages - 1) : 0

    return (
        <div className="mobile-pagination">
            {/* ── Indicador ── */}
            <div className="mpag-indicator">
                {useDots ? (
                    <div className="mpag-dots">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`mpag-dot ${i === currentPage ? 'active' : ''}`}
                                onClick={() => onPageChange(i)}
                                aria-label={`Página ${i + 1}`}
                                aria-current={i === currentPage ? 'page' : undefined}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mpag-progress-wrap">
                        <div className="mpag-progress-track">
                            <div
                                className="mpag-progress-fill"
                                style={{ width: `${progress * 100}%` }}
                            />
                        </div>
                        <span className="mpag-page-label">
                            {currentPage + 1} <span className="mpag-page-sep">/</span> {totalPages}
                        </span>
                    </div>
                )}
            </div>

            {/* ── Botões ── */}
            <div className="mpag-btns">
                <button
                    className="mpag-btn"
                    disabled={currentPage === 0}
                    onClick={() => onPageChange(currentPage - 1)}
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={17} strokeWidth={2.5} />
                    <span>Anterior</span>
                </button>
                <button
                    className="mpag-btn mpag-btn-next"
                    disabled={currentPage === totalPages - 1}
                    onClick={() => onPageChange(currentPage + 1)}
                    aria-label="Próxima página"
                >
                    <span>Próximo</span>
                    <ChevronRight size={17} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    )
}

const MobileCardList = ({
    title,
    items = [],
    idKey = 'id',
    loading = false,
    emptyMessage = 'Nenhum item encontrado.',
    onReload,
    onAdd,
    onEdit,
    onDelete,
    onView,
    onMonitor,
    onCardClick,
    renderCard,
    toolbar,
    inlineToolbar,
    filterActive = false,
    searchBar,
    sortColumns,
    sortField,
    sortDirection,
    onSort,
    onClearSort,
    currentPage,
    totalPages,
    onPageChange,
}) => {
    const { registerPage, unregisterPage } = useMobilePage()
    const [filterOpen, setFilterOpen] = useState(false)
    const [sortOpen, setSortOpen] = useState(false)
    const [swipedId, setSwipedId] = useState(null)
    const touchStart = useRef(null)
    const touchItem = useRef(null)

    useEffect(() => {
        if (title && onReload) registerPage(title, onReload)
        return () => unregisterPage()
    }, [title, onReload, registerPage, unregisterPage])

    const handleTouchStart = (e, id) => {
        touchStart.current = e.touches[0].clientX
        touchItem.current = id
    }

    const handleTouchEnd = (e, id) => {
        if (touchStart.current === null) return
        const delta = touchStart.current - e.changedTouches[0].clientX
        if (delta > 52) {
            setSwipedId(prev => (prev === id ? null : id))
        } else if (delta < -20) {
            setSwipedId(null)
        }
        touchStart.current = null
        touchItem.current = null
    }

    const closeSwipe = () => setSwipedId(null)

    return (
        <div className="mobile-card-list-root" onClick={closeSwipe}>
            {/* ── Inline toolbar (always visible, no drawer) ── */}
            {inlineToolbar && (
                <div className="px-4 pt-3 pb-1">
                    {inlineToolbar}
                </div>
            )}

            {/* ── Search / filter bar ── */}
            {(searchBar || toolbar || sortColumns) && (
                <div className="px-4 pt-3 pb-1 flex flex-col gap-2">
                    {searchBar && (
                        <div className="search-bar-wrap">
                            {searchBar}
                        </div>
                    )}
                    <div className="filter-sort-row">
                        {toolbar && (
                            <button
                                className={`filter-toggle-btn ${filterOpen ? 'active' : ''} ${filterActive ? 'has-dot' : ''}`}
                                onClick={e => { e.stopPropagation(); setFilterOpen(p => !p) }}
                            >
                                <SlidersHorizontal size={15} strokeWidth={2} />
                                <span>Filtros</span>
                                {filterActive && <span className="filter-dot" />}
                            </button>
                        )}
                        {sortColumns && onSort && (
                            <button
                                className={`filter-toggle-btn ${sortField ? 'active' : ''}`}
                                onClick={e => { e.stopPropagation(); setSortOpen(true) }}
                            >
                                <ArrowUpDown size={15} strokeWidth={2} />
                                <span>Ordenar</span>
                                {sortField && onClearSort && (
                                    <span
                                        className="filter-clear-sort"
                                        role="button"
                                        aria-label="Limpar ordenação"
                                        onClick={e => { e.stopPropagation(); onClearSort() }}
                                    >
                                        <X size={12} strokeWidth={2.5} />
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                    {toolbar && (
                        <div className={`filter-drawer ${filterOpen ? 'open' : ''}`}>
                            <div className="filter-drawer-inner">
                                {toolbar}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Count chip ── */}
            {!loading && items.length > 0 && (
                <div className="count-chip-row">
                    <span className="count-chip">{items.length} {items.length === 1 ? 'registro' : 'registros'}</span>
                </div>
            )}

            {/* ── Loading skeleton ── */}
            {loading && (
                <div className="card-skeleton-list">
                    {[0, 1, 2, 3].map(i => (
                        <div key={i} className="card-skeleton" style={{ animationDelay: `${i * 80}ms` }}>
                            <div className="skel-avatar" />
                            <div className="skel-lines">
                                <div className="skel-line skel-line-title" />
                                <div className="skel-line skel-line-sub" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Empty ── */}
            {!loading && items.length === 0 && (
                <div className="empty-state">
                    <div className="empty-icon">
                        <Search size={28} strokeWidth={1.5} />
                    </div>
                    <p>{emptyMessage}</p>
                </div>
            )}

            {/* ── Cards ── */}
            {!loading && items.length > 0 && (
                <ul className="cards-list" onClick={e => e.stopPropagation()}>
                    {items.map((item, idx) => {
                        const id = item[idKey]
                        const swiped = swipedId === id
                        const card = renderCard ? renderCard(item) : {}
                        const { avatar, title: cardTitle, subtitle, meta, tags = [] } = card
                        const clickable = !!onCardClick
                        const actionCount = [onMonitor, onView, onEdit, onDelete].filter(Boolean).length
                        const swipeOffset = `${actionCount * 4}rem`

                        return (
                            <li
                                key={id ?? idx}
                                className={`card-item ${!clickable && swiped ? 'swiped' : ''}`}
                                style={{ animationDelay: `${idx * 35}ms`, '--swipe-offset': swipeOffset }}
                                onTouchStart={!clickable ? e => handleTouchStart(e, id) : undefined}
                                onTouchEnd={!clickable ? e => handleTouchEnd(e, id) : undefined}
                            >
                                {/* Swipe action background (only when no onCardClick) */}
                                {!clickable && (
                                    <div className="swipe-actions">
                                        {onMonitor && (
                                            <button
                                                className="swipe-btn swipe-monitor"
                                                onClick={e => { e.stopPropagation(); onMonitor(item); closeSwipe() }}
                                            >
                                                <BarChart2 size={18} strokeWidth={2} />
                                            </button>
                                        )}
                                        {onView && (
                                            <button
                                                className="swipe-btn swipe-view"
                                                onClick={e => { e.stopPropagation(); onView(item); closeSwipe() }}
                                            >
                                                <Eye size={18} strokeWidth={2} />
                                            </button>
                                        )}
                                        {onEdit && (
                                            <button
                                                className="swipe-btn swipe-edit"
                                                onClick={e => { e.stopPropagation(); onEdit(item); closeSwipe() }}
                                            >
                                                <Pencil size={18} strokeWidth={2} />
                                            </button>
                                        )}
                                        {onDelete && (
                                            <button
                                                className="swipe-btn swipe-delete"
                                                onClick={e => { e.stopPropagation(); onDelete(id); closeSwipe() }}
                                            >
                                                <Trash size={18} strokeWidth={2} />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Card front */}
                                <div
                                    className={`card-front ${clickable ? 'card-front-clickable' : ''}`}
                                    onClick={clickable ? () => onCardClick(item) : undefined}
                                >
                                    {/* Avatar */}
                                    {avatar !== undefined && (
                                        <div className="card-avatar" aria-hidden="true">
                                            {typeof avatar === 'string' ? avatar : avatar}
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="card-body">
                                        <span className="card-title">{cardTitle}</span>
                                        {subtitle && <span className="card-subtitle">{subtitle}</span>}
                                        {meta && <span className="card-meta">{meta}</span>}
                                        {tags.length > 0 && (
                                            <div className="card-tags">
                                                {tags.map((t, ti) => (
                                                    <span key={ti} className={`card-tag ${t.variant ?? ''}`}>
                                                        {t.icon && <span className="tag-icon">{t.icon}</span>}
                                                        {t.label}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions (only when no onCardClick) */}
                                    {!clickable && (
                                        <div className="card-actions">
                                            {onMonitor && (
                                                <button
                                                    className="card-action-btn monitor"
                                                    onClick={e => { e.stopPropagation(); onMonitor(item) }}
                                                    aria-label="Monitorar"
                                                >
                                                    <BarChart2 size={15} strokeWidth={2} />
                                                </button>
                                            )}
                                            {onView && (
                                                <button
                                                    className="card-action-btn view"
                                                    onClick={e => { e.stopPropagation(); onView(item) }}
                                                    aria-label="Detalhes"
                                                >
                                                    <Eye size={15} strokeWidth={2} />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    className="card-action-btn edit"
                                                    onClick={e => { e.stopPropagation(); onEdit(item) }}
                                                    aria-label="Editar"
                                                >
                                                    <Pencil size={15} strokeWidth={2} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    className="card-action-btn delete"
                                                    onClick={e => { e.stopPropagation(); onDelete(id) }}
                                                    aria-label="Excluir"
                                                >
                                                    <Trash size={15} strokeWidth={2} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    {/* Chevron hint for clickable cards */}
                                    {clickable && (
                                        <ChevronRight size={16} strokeWidth={2} className="card-chevron" />
                                    )}
                                </div>
                            </li>
                        )
                    })}
                </ul>
            )}

            {/* ── Mobile Pagination ── */}
            {!loading && totalPages > 1 && (
                <MobilePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                />
            )}

            {/* ── FAB ── */}
            {onAdd && (
                <button
                    className="mobile-fab"
                    onClick={e => { e.stopPropagation(); onAdd() }}
                    style={{ bottom: 'calc(4.25rem + env(safe-area-inset-bottom) + 1rem)' }}
                    aria-label="Adicionar"
                >
                    <Plus size={26} strokeWidth={2.5} />
                </button>
            )}

            {/* ── Sort bottom sheet ── */}
            {sortColumns && onSort && (
                <SortBottomSheet
                    isOpen={sortOpen}
                    onClose={() => setSortOpen(false)}
                    columns={sortColumns}
                    sortField={sortField}
                    sortDirection={sortDirection}
                    onSort={onSort}
                    onClearSort={onClearSort}
                />
            )}
        </div>
    )
}

export default MobileCardList
