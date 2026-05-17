import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPageChange }) {
  if (!meta || meta.totalPages <= 1) return null

  const pages = Array.from({ length: meta.totalPages }, (_, i) => i + 1)

  const start = (meta.page - 1) * meta.limit + 1
  const end = Math.min(meta.page * meta.limit, meta.total)

  return (
    <div className="flex flex-col gap-4 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <p className="text-sm font-medium text-slate-400">
        Mostrando{' '}
        <span className="font-black text-slate-700">{start}</span>
        {' '}—{' '}
        <span className="font-black text-slate-700">{end}</span>
        {' '}de{' '}
        <span className="font-black text-slate-700">{meta.total}</span>
        {' '}registros
      </p>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onPageChange(meta.page - 1)}
          disabled={meta.page === 1}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Página anterior"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`flex h-9 min-w-9 items-center justify-center rounded-xl px-3 text-sm font-black transition ${
                p === meta.page
                  ? 'bg-[#000089] text-white shadow-lg shadow-[#000089]/20'
                  : 'border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-[#000089]'
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(meta.page + 1)}
          disabled={meta.page === meta.totalPages}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          title="Página siguiente"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}