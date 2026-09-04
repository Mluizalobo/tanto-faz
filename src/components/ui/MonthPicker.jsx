import React from 'react'
import { formatMonthLabel, shiftMonthKey } from '../../utils/format.js'

export default function MonthPicker({ value, onChange, className = '' }) {
  return (
    <div className={`inline-flex items-center gap-1 bg-white rounded-xl border border-plum/10 px-1.5 py-1.5 shadow-card ${className}`}>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-plum/8 text-plum/60"
        onClick={() => onChange(shiftMonthKey(value, -1))}
        aria-label="Mês anterior"
      >
        ‹
      </button>
      <span className="font-display font-semibold text-sm px-2 min-w-[130px] text-center capitalize">
        {formatMonthLabel(value)}
      </span>
      <button
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-plum/8 text-plum/60"
        onClick={() => onChange(shiftMonthKey(value, 1))}
        aria-label="Próximo mês"
      >
        ›
      </button>
    </div>
  )
}
