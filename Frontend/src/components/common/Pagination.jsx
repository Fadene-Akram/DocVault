export default function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }) {
  if (totalPages <= 1) return null

  const start = (page - 1) * pageSize + 1
  const end = Math.min(page * pageSize, totalItems)

  // Build page numbers with ellipsis
  function getPages() {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (page > 3) pages.push('...')
      for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i)
      if (page < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="pagination" data-testid="pagination">
      <span className="pagination-info">
        Showing {start}–{end} of {totalItems}
      </span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          title="Previous page"
        >‹</button>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} style={{ padding: '0 4px', color: 'var(--gray-400)', fontSize: 13 }}>…</span>
          ) : (
            <button
              key={p}
              className={`page-btn${p === page ? ' active' : ''}`}
              onClick={() => onPageChange(p)}
            >{p}</button>
          )
        )}
        <button
          className="page-btn"
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          title="Next page"
        >›</button>
      </div>
    </div>
  )
}
