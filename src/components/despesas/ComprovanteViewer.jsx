import React, { useState } from 'react'
import Modal from '../ui/Modal.jsx'
import { useComprovanteUrl } from '../../hooks/useComprovanteUrl.js'
import { useApp } from '../../context/AppContext.jsx'
import { getComprovanteUrl } from '../../db/api.js'
import { IconPaperclip } from '../ui/Icons.jsx'

function guessType(nome) {
  if (!nome) return ''
  const ext = nome.split('.').pop().toLowerCase()
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'image/' + (ext === 'jpg' ? 'jpeg' : ext)
  if (ext === 'pdf') return 'application/pdf'
  return ''
}

export default function ComprovanteViewer({ comprovanteId, nome }) {
  const { cloudSync } = useApp()
  const [open, setOpen] = useState(false)

  if (!comprovanteId) {
    return <span className="text-plum/25 text-sm">—</span>
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 text-sm font-semibold"
        title={nome}
      >
        <IconPaperclip className="w-4 h-4" /> <span className="hidden sm:inline">ver</span>
      </button>
      {open &&
        (cloudSync ? (
          <CloudViewer comprovanteId={comprovanteId} nome={nome} onClose={() => setOpen(false)} />
        ) : (
          <LocalViewer comprovanteId={comprovanteId} nome={nome} onClose={() => setOpen(false)} />
        ))}
    </>
  )
}

function CloudViewer({ comprovanteId, nome, onClose }) {
  const url = getComprovanteUrl(comprovanteId)
  const type = guessType(nome)
  const isImage = type.startsWith('image/')
  const isPdf = type === 'application/pdf'

  return (
    <Modal open onClose={onClose} title={nome || 'Comprovante'}>
      {isImage && <img src={url} alt={nome} className="w-full rounded-xl border border-plum/10" />}
      {isPdf && <iframe src={url} title={nome} className="w-full h-[70vh] rounded-xl border border-plum/10" />}
      {!isImage && !isPdf && (
        <a href={url} download={nome} className="text-teal-600 underline text-sm">
          Baixar arquivo ({nome})
        </a>
      )}
    </Modal>
  )
}

function LocalViewer({ comprovanteId, nome, onClose }) {
  const { url, type, loading } = useComprovanteUrl(comprovanteId, true)
  const isImage = type?.startsWith('image/')
  const isPdf = type === 'application/pdf'

  return (
    <Modal open onClose={onClose} title={nome || 'Comprovante'}>
      {loading && <p className="text-sm text-plum/50 py-8 text-center">Carregando…</p>}
      {!loading && isImage && url && <img src={url} alt={nome} className="w-full rounded-xl border border-plum/10" />}
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
  )
}
