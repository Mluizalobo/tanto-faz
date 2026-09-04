import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { formatBRL, formatDate } from '../../utils/format.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import MonthPicker from '../ui/MonthPicker.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'
import DespesaForm from './DespesaForm.jsx'
import ComprovanteViewer from './ComprovanteViewer.jsx'

const inputClass =
  'px-3.5 py-2 rounded-xl border border-plum/15 bg-white text-sm text-plum placeholder:text-plum/30 focus:outline-none focus:ring-2 focus:ring-coral-300 focus:border-coral-300'

export default function DespesasPage() {
  const {
    despesas,
    categorias,
    moradoras,
    role,
    currentMoradoraId,
    addDespesa,
    updateDespesa,
    deleteDespesa,
    selectedMonth,
    setSelectedMonth,
    isMonthClosed,
  } = useApp()

  const [busca, setBusca] = useState('')
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [filtroMoradora, setFiltroMoradora] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  const mesFechado = isMonthClosed(selectedMonth)
  const isAdmin = role === 'admin'

  const lista = useMemo(() => {
    return despesas
      .filter((d) => d.data.slice(0, 7) === selectedMonth)
      .filter((d) => (filtroCategoria ? d.categoriaId === filtroCategoria : true))
      .filter((d) => (filtroMoradora ? d.pagoPor === filtroMoradora : true))
      .filter((d) => (busca ? d.descricao.toLowerCase().includes(busca.toLowerCase()) : true))
      .sort((a, b) => (a.data < b.data ? 1 : -1))
  }, [despesas, selectedMonth, filtroCategoria, filtroMoradora, busca])

  const total = lista.reduce((acc, d) => acc + Number(d.valor), 0)

  function categoriaOf(id) {
    return categorias.find((c) => c.id === id)
  }
  function moradoraOf(id) {
    return moradoras.find((m) => m.id === id)
  }

  function openNova() {
    setEditando(null)
    setFormOpen(true)
  }
  function openEditar(d) {
    setEditando(d)
    setFormOpen(true)
  }

  async function handleSubmit(data, file, removerComprovante) {
    const result = editando ? await updateDespesa(editando.id, data, file, removerComprovante) : await addDespesa(data, file)
    if (result.ok) setFormOpen(false)
    return result
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    await deleteDespesa(excluindo.id)
    setExcluindo(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <div className="flex items-center gap-3">
          {mesFechado && <Badge variant="warning">🔒 mês fechado</Badge>}
          <Button onClick={openNova} disabled={mesFechado}>
            + Nova Despesa
          </Button>
        </div>
      </div>

      <Card className="p-4 flex flex-wrap gap-3 items-center">
        <input
          className={`${inputClass} flex-1 min-w-[180px]`}
          placeholder="🔎 Pesquisar despesa…"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <select className={inputClass} value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)}>
          <option value="">Todas categorias</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.icon} {c.nome}
            </option>
          ))}
        </select>
        <select className={inputClass} value={filtroMoradora} onChange={(e) => setFiltroMoradora(e.target.value)}>
          <option value="">Todas moradoras</option>
          {moradoras.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        <div className="ml-auto text-sm font-semibold text-plum/70">
          {lista.length} despesa{lista.length !== 1 ? 's' : ''} · <span className="text-coral-600">{formatBRL(total)}</span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        {lista.length === 0 ? (
          <EmptyState
            icon="🧾"
            title="Nenhuma despesa neste mês"
            subtitle="Assim que alguém registrar uma compra da casa, ela aparece aqui."
            action={
              !mesFechado && (
                <Button onClick={openNova}>+ Nova Despesa</Button>
              )
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-plum/40 text-xs uppercase tracking-wide border-b border-plum/8">
                  <th className="px-5 py-3 font-semibold">Data</th>
                  <th className="px-5 py-3 font-semibold">Descrição</th>
                  <th className="px-5 py-3 font-semibold">Categoria</th>
                  <th className="px-5 py-3 font-semibold">Quem pagou</th>
                  <th className="px-5 py-3 font-semibold text-right">Valor</th>
                  <th className="px-5 py-3 font-semibold text-center">Comprovante</th>
                  <th className="px-5 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {lista.map((d) => {
                  const cat = categoriaOf(d.categoriaId)
                  const mor = moradoraOf(d.pagoPor)
                  return (
                    <tr key={d.id} className="border-b border-plum/5 last:border-0 hover:bg-plum/[0.02]">
                      <td className="px-5 py-3 text-plum/60 whitespace-nowrap">{formatDate(d.data)}</td>
                      <td className="px-5 py-3 font-medium text-plum">
                        {d.descricao}
                        {d.observacao && <p className="text-xs text-plum/40 font-normal">{d.observacao}</p>}
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <Badge>{cat?.icon} {cat?.nome || '—'}</Badge>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <MoradoraAvatar moradora={mor} size="xs" />
                          {mor?.nome || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-plum whitespace-nowrap">{formatBRL(d.valor)}</td>
                      <td className="px-5 py-3 text-center">
                        <ComprovanteViewer comprovanteId={d.comprovanteId} nome={d.comprovanteNome} />
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        {isAdmin && !mesFechado && (
                          <div className="flex justify-end gap-1">
                            <button onClick={() => openEditar(d)} className="w-8 h-8 rounded-lg hover:bg-plum/8 text-plum/50" title="Editar">
                              ✏️
                            </button>
                            <button onClick={() => setExcluindo(d)} className="w-8 h-8 rounded-lg hover:bg-coral-50 text-coral-500" title="Excluir">
                              🗑️
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editando ? 'Editar despesa' : 'Nova despesa'} wide>
        <DespesaForm
          initial={editando}
          defaultMoradoraId={role === 'moradora' ? currentMoradoraId : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        open={Boolean(excluindo)}
        onClose={() => setExcluindo(null)}
        onConfirm={confirmarExclusao}
        title="Excluir despesa"
        message={`Tem certeza que quer excluir "${excluindo?.descricao}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
