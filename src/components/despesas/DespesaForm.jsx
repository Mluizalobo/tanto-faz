import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { FORMAS_PAGAMENTO } from '../../data/defaults.js'
import { todayISO } from '../../utils/format.js'
import Button from '../ui/Button.jsx'
import { IconPaperclip } from '../ui/Icons.jsx'

const inputClass =
  'w-full px-3.5 py-2.5 rounded-xl border border-plum/15 bg-white text-sm text-plum placeholder:text-plum/30 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-coral-300'
const labelClass = 'block text-xs font-semibold text-plum/60 mb-1.5'

export default function DespesaForm({ initial, onSubmit, onCancel, defaultMoradoraId }) {
  const { moradoras, categorias, addCategoria } = useApp()
  const ativas = moradoras.filter((m) => m.status === 'ativa')

  const [descricao, setDescricao] = useState(initial?.descricao || '')
  const [valor, setValor] = useState(initial?.valor ?? '')
  const [data, setData] = useState(initial?.data || todayISO())
  const [categoriaId, setCategoriaId] = useState(initial?.categoriaId || categorias[0]?.id || '')
  const [pagoPor, setPagoPor] = useState(initial?.pagoPor || defaultMoradoraId || ativas[0]?.id || '')
  const [formaPagamento, setFormaPagamento] = useState(initial?.formaPagamento || FORMAS_PAGAMENTO[0])
  const [observacao, setObservacao] = useState(initial?.observacao || '')
  const [comprovanteFile, setComprovanteFile] = useState(null)
  const [removerComprovante, setRemoverComprovante] = useState(false)
  const [novaCategoria, setNovaCategoria] = useState(false)
  const [nomeNovaCategoria, setNomeNovaCategoria] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function handleCriarCategoria() {
    if (!nomeNovaCategoria.trim()) return
    const id = addCategoria(nomeNovaCategoria.trim())
    setCategoriaId(id)
    setNomeNovaCategoria('')
    setNovaCategoria(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErro('')
    if (!descricao.trim()) return setErro('Informe a descrição da despesa.')
    if (!valor || Number(valor) <= 0) return setErro('Informe um valor válido.')
    if (!pagoPor) return setErro('Selecione quem pagou.')
    if (!categoriaId) return setErro('Selecione uma categoria.')

    setSalvando(true)
    const result = await onSubmit(
      { descricao: descricao.trim(), valor, data, categoriaId, pagoPor, formaPagamento, observacao },
      comprovanteFile,
      removerComprovante,
    )
    setSalvando(false)
    if (result && result.ok === false) {
      if (result.reason === 'mes-fechado') {
        setErro('Este mês já foi fechado na prestação de contas. Peça para a administradora reabrir o mês.')
      } else {
        setErro('Não foi possível salvar a despesa.')
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {erro && <div className="bg-coral-50 text-coral-700 text-sm rounded-xl px-3.5 py-2.5">{erro}</div>}

      <div>
        <label className={labelClass}>Descrição</label>
        <input className={inputClass} value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Compras do mês" autoFocus />
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
        <label className={labelClass}>Categoria</label>
        {!novaCategoria ? (
          <div className="flex gap-2">
            <select className={inputClass} value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <Button type="button" variant="outline" size="md" onClick={() => setNovaCategoria(true)}>
              + nova
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              className={inputClass}
              value={nomeNovaCategoria}
              onChange={(e) => setNomeNovaCategoria(e.target.value)}
              placeholder="Nome da nova categoria"
              autoFocus
            />
            <Button type="button" variant="secondary" onClick={handleCriarCategoria}>
              Criar
            </Button>
            <Button type="button" variant="ghost" onClick={() => setNovaCategoria(false)}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Quem pagou</label>
          <select className={inputClass} value={pagoPor} onChange={(e) => setPagoPor(e.target.value)}>
            {ativas.length === 0 && <option value="">Cadastre moradoras</option>}
            {ativas.map((m) => (
              <option key={m.id} value={m.id}>
                {m.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Forma de pagamento</label>
          <select className={inputClass} value={formaPagamento} onChange={(e) => setFormaPagamento(e.target.value)}>
            {FORMAS_PAGAMENTO.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Comprovante</label>
        {initial?.comprovanteId && !comprovanteFile && !removerComprovante && (
          <div className="flex items-center justify-between bg-plum/5 rounded-xl px-3.5 py-2.5 mb-2 text-sm">
            <span className="text-plum/70 truncate inline-flex items-center gap-1.5">
              <IconPaperclip className="w-4 h-4 text-plum/40" /> {initial.comprovanteNome || 'arquivo anexado'}
            </span>
            <button type="button" className="text-coral-600 text-xs font-semibold" onClick={() => setRemoverComprovante(true)}>
              remover
            </button>
          </div>
        )}
        <input
          className={`${inputClass} file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-teal-500 file:text-white file:text-xs file:font-semibold`}
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => {
            setComprovanteFile(e.target.files?.[0] || null)
            setRemoverComprovante(false)
          }}
        />
        <p className="text-[11px] text-plum/40 mt-1">Foto, PDF, nota fiscal, recibo ou print do Pix.</p>
      </div>

      <div>
        <label className={labelClass}>Observação (opcional)</label>
        <textarea className={inputClass} rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Algum detalhe a mais…" />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={salvando}>
          {salvando ? 'Salvando…' : 'Salvar despesa'}
        </Button>
      </div>
    </form>
  )
}
