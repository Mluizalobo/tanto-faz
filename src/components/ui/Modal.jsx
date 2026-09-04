import React, { useEffect } from 'react'

export default function Modal({ open, onClose, title, children, footer, wide }) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-plum/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${wide ? 'max-w-2xl' : 'max-w-md'} max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-soft animate-in`}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-plum/8 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="font-display text-lg font-semibold text-plum">{title}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-plum/8 text-plum/60 text-xl leading-none"
            aria-label="Fechar"
          >
            ×
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-plum/8 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>
  )
}
