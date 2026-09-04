import React, { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { useComprovanteUrl } from '../../hooks/useComprovanteUrl.js'
import { IconPaperclip } from '../ui/Icons.jsx'

export default function ComprovanteViewer({ comprovanteId, nome }) {
  const [open, setOpen] = useState(false)
  const { url, type, loading } = useComprovanteUrl(comprovanteId, open)

  if (!comprovanteId) {
    return <span className="text-plum/25 text-sm">—</span>
  }

  const isImage = type?.startsWith('image/')
  const isPdf = type === 'application/pdf'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-semibold"
        title={nome}
      >
        <IconPaperclip className="w-4 h-4" /> <span className="hidden sm:inline">ver</span>
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title={nome || 'Comprovante'}>
        {loading && <p className="text-sm text-plum/50 py-8 text-center">Carregando…</p>}
        {!loading && isImage && url && (
          <img src={url} alt={nome} className="w-full rounded-xl border border-plum/10" />
        )}
        {!loading && isPdf && url && (
          <iframe src={url} title={nome} className="w-full h-[70vh] rounded-xl border border-plum/10" />
        )}
        {!loading && url && !isImage && !isPdf && (
          <a href={url} download={nome} className="text-teal-600 underline text-sm">
            Baixar arquivo ({nome})
          </a>
        )}
        {!loading && !url && <p className="text-sm text-plum/50 py-8 text-center">Comprovante não encontrado.</p>}
      </Modal>
    </>
  )
}
