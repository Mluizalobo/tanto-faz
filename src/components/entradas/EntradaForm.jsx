import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { todayISO } from '../../utils/format.js'
import Button from '../ui/Button.jsx'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-plum/15 bg-white text-sm text-plum placeholder:text-plum/30 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-teal-300'
const labelClass = 'block text-xs font-semibold text-plum/60 mb-1.5'

export default function EntradaForm({ initial, onSubmit, onCancel, defaultMoradoraId }) {
  const { moradoras } = useApp()
  const ativas = moradoras.filter((m) => m.status === 'ativa')

  const [moradoraId, setMoradoraId] = useState(initial?.moradoraId || defaultMoradoraId || ativas[0]?.id || '')
  const [valor, setValor] = useState(initial?.valor ?? '')
  const [data, setData] = useState(initial?.data || todayISO())
  const [referencia, setReferencia] = useState(initial?.referencia || '')
  const [observacao, setObservacao] = useState(initial?.observacao || '')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!valor || Number(valor) <= 0) return setErro('Informe um valor válido.')
    if (!moradoraId) return setErro('Selecione a moradora.')

    setSalvando(true)
    const result = await onSubmit({ moradoraId, valor, data, referencia, observacao })
    setSalvando(false)
    if (result && result.ok === false) {
      setErro(result.reason === 'mes-fechado' ? 'Este mês já foi fechado na prestação de contas.' : 'Não foi possível salvar.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <div className="bg-coral-50 text-coral-700 text-sm rounded-xl px-3.5 py-2.5">{erro}</div>}

      <div>
        <label className={labelClass}>Moradora</label>
        <select className={inputClass} value={moradoraId} onChange={(e) => setMoradoraId(e.target.value)}>
          {ativas.length === 0 && <option value="">Cadastre moradoras</option>}
          {ativas.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Valor (R$)</label>
          <input className={inputClass} type="number" min="0" step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
        </div>
        <div>
          <label className={labelClass}>Data</label>
          <input className={inputClass} type="date" value={data} onChange={(e) => setData(e.target.value)} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Referência</label>
        <input className={inputClass} value={referencia} onChange={(e) => setReferencia(e.target.value)} placeholder="Ex: mensalidade de setembro" />
      </div>

      <div>
        <label className={labelClass}>Observação (opcional)</label>
        <textarea className={inputClass} rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" variant="secondary" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar entrada'}
        </Button>
      </div>
    </form>
  )
}
