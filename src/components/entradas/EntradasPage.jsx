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
import EntradaForm from './EntradaForm.jsx'

export default function EntradasPage() {
  const {
    entradas,
    moradoras,
    role,
    currentMoradoraId,
    addEntrada,
    updateEntrada,
    deleteEntrada,
    selectedMonth,
    setSelectedMonth,
    isMonthClosed,
  } = useApp()

  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)
  const isAdmin = role === 'admin'
  const mesFechado = isMonthClosed(selectedMonth)

  const lista = useMemo(
    () => entradas.filter((e) => e.data.slice(0, 7) === selectedMonth).sort((a, b) => (a.data < b.data ? 1 : -1)),
    [entradas, selectedMonth],
  )
  const total = lista.reduce((acc, e) => acc + Number(e.valor), 0)

  const porMoradora = useMemo(() => {
    const map = {}
    lista.forEach((e) => {
      map[e.moradoraId] = (map[e.moradoraId] || 0) + Number(e.valor)
    })
    return Object.entries(map).map(([moradoraId, valor]) => ({
      moradora: moradoras.find((m) => m.id === moradoraId),
      valor,
    }))
  }, [lista, moradoras])

  function moradoraOf(id) {
    return moradoras.find((m) => m.id === id)
  }

  function openNova() {
    setEditando(null)
    setFormOpen(true)
  }

  async function handleSubmit(data) {
    const result = editando ? await updateEntrada(editando.id, data) : await addEntrada(data)
    if (result.ok) setFormOpen(false)
    return result
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    await deleteEntrada(excluindo.id)
    setExcluindo(null)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <div className="flex items-center gap-3">
          {mesFechado && <Badge variant="warning">🔒 mês fechado</Badge>}
          {isAdmin && (
            <Button variant="secondary" onClick={openNova} disabled={mesFechado}>
              + Nova Entrada
            </Button>
          )}
        </div>
      </div>

      {porMoradora.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {porMoradora.map(({ moradora, valor }) => (
            <Card key={moradora?.id} className="p-4 flex items-center gap-3">
              <MoradoraAvatar moradora={moradora} size="sm" />
              <div>
                <p className="text-sm font-semibold text-plum">{moradora?.nome}</p>
                <p className="text-teal-600 font-bold">{formatBRL(valor)}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="overflow-hidden">
        {lista.length === 0 ? (
          <EmptyState
            icon="💰"
            title="Nenhuma entrada neste mês"
            subtitle="Registre os depósitos que as moradoras fizeram na caixinha."
            action={isAdmin && !mesFechado && <Button variant="secondary" onClick={openNova}>+ Nova Entrada</Button>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-plum/40 text-xs uppercase tracking-wide border-b border-plum/8">
                  <th className="px-5 py-3 font-semibold">Data</th>
                  <th className="px-5 py-3 font-semibold">Moradora</th>
                  <th className="px-5 py-3 font-semibold">Referência</th>
                  <th className="px-5 py-3 font-semibold text-right">Valor</th>
                  {isAdmin && <th className="px-5 py-3 font-semibold text-right">Ações</th>}
                </tr>
              </thead>
              <tbody>
                {lista.map((e) => {
                  const mor = moradoraOf(e.moradoraId)
                  return (
                    <tr key={e.id} className="border-b border-plum/5 last:border-0 hover:bg-plum/[0.02]">
                      <td className="px-5 py-3 text-plum/60 whitespace-nowrap">{formatDate(e.data)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <MoradoraAvatar moradora={mor} size="xs" />
                          {mor?.nome || '—'}
                        </div>
                      </td>
                      <td className="px-5 py-3 text-plum/60">{e.referencia || '—'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-teal-600 whitespace-nowrap">{formatBRL(e.valor)}</td>
                      {isAdmin && (
                        <td className="px-5 py-3 text-right whitespace-nowrap">
                          {!mesFechado && (
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => {
                                  setEditando(e)
                                  setFormOpen(true)
                                }}
                                className="w-8 h-8 rounded-lg hover:bg-plum/8 text-plum/50"
                              >
                                ✏️
                              </button>
                              <button onClick={() => setExcluindo(e)} className="w-8 h-8 rounded-lg hover:bg-coral-50 text-coral-500">
                                🗑️
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-right text-xs font-semibold text-plum/50 uppercase">
                    Total do mês
                  </td>
                  <td className="px-5 py-3 text-right font-bold text-teal-700">{formatBRL(total)}</td>
                  {isAdmin && <td />}
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editando ? 'Editar entrada' : 'Nova entrada'}>
        <EntradaForm
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
        title="Excluir entrada"
        message="Tem certeza que quer excluir este registro de entrada?"
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
