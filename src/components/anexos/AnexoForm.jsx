import React, { useState } from 'react'
import Button from '../ui/Button.jsx'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-plum/15 bg-white text-sm text-plum placeholder:text-plum/30 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-coral-300'
const labelClass = 'block text-xs font-semibold text-plum/60 mb-1.5'

export default function AnexoForm({ onSubmit, onCancel }) {
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [arquivo, setArquivo] = useState(null)
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!arquivo) return setErro('Escolha um arquivo para anexar.')
    setSalvando(true)
    const result = await onSubmit({ nome: nome.trim(), descricao: descricao.trim() }, arquivo)
    setSalvando(false)
    if (result && result.ok === false) setErro('Não foi possível salvar o anexo.')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <div className="bg-coral-50 text-coral-700 text-sm rounded-xl px-3.5 py-2.5">{erro}</div>}

      <div>
        <label className={labelClass}>Nome do documento</label>
        <input
          className={inputClass}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Contrato de aluguel"
          autoFocus
        />
      </div>

      <div>
        <label className={labelClass}>Observação (opcional)</label>
        <textarea
          className={inputClass}
          rows={2}
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Algum detalhe a mais…"
        />
      </div>

      <div>
        <label className={labelClass}>Arquivo</label>
        <input
          className={`${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:text-xs file:font-semibold`}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setArquivo(e.target.files?.[0] || null)}
        />
        <p className="text-[11px] text-plum/40 mt-1">Foto, PDF, contrato, recibo ou qualquer comprovante.</p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar anexo'}
        </Button>
      </div>
    </form>
  )
}
