import React, { useState } from 'react'
import { todayISO } from '../../utils/format.js'
import { resizeImageToDataUrl } from '../../utils/image.js'
import Button from '../ui/Button.jsx'
import MoradoraAvatar from './MoradoraAvatar.jsx'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-plum/15 bg-white text-sm text-plum placeholder:text-plum/30 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-coral-300'
const labelClass = 'block text-xs font-semibold text-plum/60 mb-1.5'

export default function MoradoraForm({ initial, onSubmit, onCancel }) {
  const [nome, setNome] = useState(initial?.nome || '')
  const [avatar, setAvatar] = useState(initial?.avatar || null)
  const [dataEntrada, setDataEntrada] = useState(initial?.dataEntrada || todayISO())
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUrl = await resizeImageToDataUrl(file)
    setAvatar(dataUrl)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!nome.trim()) return setErro('Informe o nome da moradora.')
    setSalvando(true)
    await onSubmit({ nome: nome.trim(), avatar, dataEntrada })
    setSalvando(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <div className="bg-coral-50 text-coral-700 text-sm rounded-xl px-3.5 py-2.5">{erro}</div>}

      <div className="flex items-center gap-4">
        <MoradoraAvatar moradora={{ nome, avatar }} size="lg" />
        <div>
          <label className="inline-block cursor-pointer text-sm font-semibold text-teal-600 bg-teal-50 px-3.5 py-2 rounded-xl hover:bg-teal-100">
            Escolher foto
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </label>
          {avatar && (
            <button type="button" onClick={() => setAvatar(null)} className="block mt-1 text-xs text-coral-600 font-semibold">
              remover foto
            </button>
          )}
        </div>
      </div>

      <div>
        <label className={labelClass}>Nome</label>
        <input className={inputClass} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da moradora" autoFocus />
      </div>

      <div>
        <label className={labelClass}>Data de entrada na república</label>
        <input className={inputClass} type="date" value={dataEntrada} onChange={(e) => setDataEntrada(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  )
}
