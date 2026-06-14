import { useMemo, useState } from 'react'
import { SearchIcon, ChevronDownIcon } from '../../../assets/icons'
import styles from './style.module.css'
import type { Align, Column, SortDir, TableProps } from './type'

const alignClass: Record<Align, string> = {
  left:   styles.left,
  right:  styles.right,
  center: styles.center,
}

export default function Table<T>({
  columns,
  data,
  rowKey,
  loading = false,
  emptyText,
  loadingText,
  searchPlaceholder = '',
  footer,
  sortKey: sortKeyProp,
  sortDir: sortDirProp,
  onSortChange,
}: TableProps<T>) {
  const controlled = onSortChange !== undefined
  const [internalSortKey, setInternalSortKey] = useState<string | null>(null)
  const [internalSortDir, setInternalSortDir] = useState<SortDir>('asc')
  const [filters, setFilters] = useState<Record<string, string>>({})

  const sortKey = controlled ? (sortKeyProp ?? null) : internalSortKey
  const sortDir = controlled ? (sortDirProp ?? 'asc') : internalSortDir

  const hasSearchRow = columns.some((c) => c.searchable)

  const toggleSort = (col: Column<T>) => {
    if (!col.sortable) return
    // cycle: (cột khác) → asc → desc → bỏ sort
    let nextKey: string | null
    let nextDir: SortDir
    if (sortKey !== col.key) {
      nextKey = col.key
      nextDir = 'asc'
    } else if (sortDir === 'asc') {
      nextKey = col.key
      nextDir = 'desc'
    } else {
      nextKey = null
      nextDir = 'asc'
    }
    if (controlled) {
      onSortChange!(nextKey, nextDir)
    } else {
      setInternalSortKey(nextKey)
      setInternalSortDir(nextDir)
    }
  }

  const setFilter = (key: string, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }))

  const processed = useMemo(() => {
    let rows = [...data]

    // Lọc theo từng cột searchable (luôn client-side)
    for (const col of columns) {
      if (!col.searchable || !col.accessor) continue
      const q = filters[col.key]?.trim().toLowerCase()
      if (!q) continue
      const acc = col.accessor
      rows = rows.filter((r) => String(acc(r) ?? '').toLowerCase().includes(q))
    }

    // Sắp xếp client-side — bỏ qua nếu đang controlled (parent/server đã sort)
    if (!controlled && sortKey) {
      const col = columns.find((c) => c.key === sortKey)
      if (col?.accessor) {
        const acc = col.accessor
        rows.sort((a, b) => {
          const va = acc(a)
          const vb = acc(b)
          if (typeof va === 'number' && typeof vb === 'number') {
            return sortDir === 'asc' ? va - vb : vb - va
          }
          const sa = String(va ?? '').toLowerCase()
          const sb = String(vb ?? '').toLowerCase()
          return sortDir === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
        })
      }
    }

    return rows
  }, [data, columns, filters, controlled, sortKey, sortDir])

  return (
    <div className={styles.card}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => {
              const active = sortKey === col.key
              return (
                <th
                  key={col.key}
                  className={`${styles.th} ${alignClass[col.align ?? 'left']} ${col.sortable ? styles.thSortable : ''}`}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={() => toggleSort(col)}
                >
                  <span className={styles.thInner}>
                    {col.header}
                    {col.sortable && (
                      <span
                        className={`${styles.sortIcon} ${active ? styles.sortActive : ''}`}
                        style={active && sortDir === 'asc' ? { transform: 'rotate(180deg)' } : undefined}
                      >
                        <ChevronDownIcon size={14} />
                      </span>
                    )}
                  </span>
                </th>
              )
            })}
          </tr>

          {hasSearchRow && (
            <tr className={styles.filterRow}>
              {columns.map((col) => (
                <th key={col.key} className={styles.filterCell}>
                  {col.searchable && (
                    <span className={styles.filterWrap}>
                      <span className={styles.filterIcon}><SearchIcon size={14} /></span>
                      <input
                        className={styles.filterInput}
                        value={filters[col.key] ?? ''}
                        onChange={(e) => setFilter(col.key, e.target.value)}
                        placeholder={searchPlaceholder}
                      />
                    </span>
                  )}
                </th>
              ))}
            </tr>
          )}
        </thead>

        <tbody>
          {loading ? (
            <tr><td colSpan={columns.length} className={styles.stateCell}>{loadingText}</td></tr>
          ) : processed.length === 0 ? (
            <tr><td colSpan={columns.length} className={styles.stateCell}>{emptyText}</td></tr>
          ) : (
            processed.map((row) => (
              <tr key={rowKey(row)} className={styles.row}>
                {columns.map((col) => (
                  <td key={col.key} className={`${styles.td} ${alignClass[col.align ?? 'left']}`}>
                    {col.render ? col.render(row) : String(col.accessor?.(row) ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {footer}
    </div>
  )
}
