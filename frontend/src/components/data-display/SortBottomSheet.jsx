import { X, ArrowUpNarrowWide, ArrowDownNarrowWide, ArrowUpAZ, ArrowDownAZ } from 'lucide-react'
import BottomSheet from '@/components/ui/BottomSheet'

/**
 * SortBottomSheet — native-feel mobile sort panel.
 *
 * Props:
 *   isOpen        bool
 *   onClose       fn()
 *   columns       [{ key, label }]   — sortable columns
 *   sortField     string | null
 *   sortDirection "asc" | "desc"
 *   onSort        fn(columnKey)      — same signature as desktop handleColumnSort
 */
const SortBottomSheet = ({ isOpen, onClose, columns = [], sortField, sortDirection, onSort, onClearSort }) => {
    const handleColumnSelect = (key) => {
        onSort(key)
    }

    const handleDirectionSelect = (dir) => {
        if (dir !== sortDirection && sortField) {
            onSort(sortField)
        }
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} label="Ordenar lista" className="sort-sheet">
            <div className="sort-sheet-header">
                <span className="sort-sheet-title">Ordenar por</span>
                <button className="sort-sheet-close" onClick={onClose} aria-label="Fechar">
                    <X size={18} strokeWidth={2} />
                </button>
            </div>

            <div className="sort-sheet-body">
                <p className="sort-section-label">Campo</p>
                <div className="sort-columns">
                    {columns.map(col => {
                        const active = sortField === col.key
                        return (
                            <button
                                key={col.key}
                                className={`sort-col-btn ${active ? 'active' : ''}`}
                                onClick={() => handleColumnSelect(col.key)}
                            >
                                <span className="sort-col-label">{col.label}</span>
                                {active && (
                                    <span className="sort-col-indicator">
                                        {sortDirection === 'asc'
                                            ? <ArrowUpAZ size={15} strokeWidth={2.5} />
                                            : <ArrowDownAZ size={15} strokeWidth={2.5} />
                                        }
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>

                {sortField && (
                    <>
                        <p className="sort-section-label" style={{ marginTop: '1.25rem' }}>Direção</p>
                        <div className="sort-direction-row">
                            <button
                                className={`sort-dir-btn ${sortDirection === 'asc' ? 'active' : ''}`}
                                onClick={() => handleDirectionSelect('asc')}
                            >
                                <ArrowUpNarrowWide size={16} strokeWidth={2} />
                                <span>A → Z / Menor primeiro</span>
                            </button>
                            <button
                                className={`sort-dir-btn ${sortDirection === 'desc' ? 'active' : ''}`}
                                onClick={() => handleDirectionSelect('desc')}
                            >
                                <ArrowDownNarrowWide size={16} strokeWidth={2} />
                                <span>Z → A / Maior primeiro</span>
                            </button>
                        </div>
                    </>
                )}

                <div className="sort-sheet-actions">
                    {sortField && onClearSort && (
                        <button
                            className="sort-remove-btn"
                            onClick={() => { onClearSort(); onClose() }}
                        >
                            Limpar ordenação
                        </button>
                    )}
                    <button className="sort-clear-btn" onClick={onClose}>
                        Aplicar
                    </button>
                </div>
            </div>
        </BottomSheet>
    )
}

export default SortBottomSheet
