import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { computeMonthSummary } from '../../utils/calc.js'
import { formatBRL } from '../../utils/format.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import MonthPicker from '../ui/MonthPicker.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'
import DespesaForm from '../despesas/DespesaForm.jsx'

export default function DashboardPage({ goTo }) {
  const { moradoras, despesas, entradas, role, currentMoradoraId, addDespesa, selectedMonth, setSelectedMonth, isMonthClosed } = useApp()
  const [formOpen, setFormOpen] = useState(false)

  const resumo = useMemo(
    () => computeMonthSummary(moradoras, despesas, entradas, selectedMonth),
    [moradoras, despesas, entradas, selectedMonth],
  )
  const mesFechado = isMonthClosed(selectedMonth)

  async function handleSubmit(data, file) {
    const result = await addDespesa(data, file)
    if (result.ok) setFormOpen(false)
    return result
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <Button onClick={() => setFormOpen(true)} disabled={mesFechado} size="lg">
          + Nova Despesa
        </Button>
      </div>

      <Card className="p-6 bg-plum text-white overflow-hidden relative">
        <div className="absolute -right-6 -top-6 text-[8rem] opacity-10 select-none">🏠</div>
        <p className="text-white/60 text-sm font-semibold">Saldo atual da caixinha</p>
        <p className="font-display text-4xl font-bold mt-1">{formatBRL(resumo.saldoFinal)}</p>
        <div className="flex flex-wrap gap-x-8 gap-y-2 mt-4 text-sm text-white/70">
          <span>Saldo anterior: <strong className="text-white">{formatBRL(resumo.saldoInicial)}</strong></span>
          <span>+ Entradas: <strong className="text-teal-300">{formatBRL(resumo.totalEntradas)}</strong></span>
          <span>− Despesas: <strong className="text-coral-300">{formatBRL(resumo.totalDespesas)}</strong></span>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon="💵" label="Entradas no mês" value={formatBRL(resumo.totalEntradas)} accent="text-teal-600" />
        <StatCard icon="🧾" label="Despesas no mês" value={formatBRL(resumo.totalDespesas)} accent="text-coral-600" />
        <StatCard icon="📦" label="Total de despesas" value={resumo.despesasMes.length} accent="text-plum" />
        <StatCard icon="👭" label="Moradoras ativas" value={resumo.numMoradoras} accent="text-plum" />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-plum">Resumo por moradora</h3>
          <span className="text-xs text-plum/40">
            {resumo.numMoradoras > 0
              ? `cada uma deveria pagar ${formatBRL(resumo.valorPorMoradora)}`
              : 'cadastre moradoras ativas'}
          </span>
        </div>
        {resumo.porMoradora.length === 0 ? (
          <p className="text-sm text-plum/40 py-6 text-center">Nada por aqui ainda neste mês.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-plum/40 text-xs uppercase tracking-wide border-b border-plum/8">
                  <th className="py-2.5 font-semibold">Moradora</th>
                  <th className="py-2.5 font-semibold text-right">Pagou no mês</th>
                  <th className="py-2.5 font-semibold text-right">Sua parte</th>
                  <th className="py-2.5 font-semibold text-right">Acerto</th>
                </tr>
              </thead>
              <tbody>
                {resumo.porMoradora.map((p) => (
                  <tr key={p.moradora.id} className="border-b border-plum/5 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <MoradoraAvatar moradora={p.moradora} size="sm" />
                        <span className="font-medium text-plum">{p.moradora.nome}</span>
                      </div>
                    </td>
                    <td className="py-3 text-right">{formatBRL(p.pago)}</td>
                    <td className="py-3 text-right text-plum/60">{formatBRL(p.parte)}</td>
                    <td className="py-3 text-right">
                      {p.status === 'quite' ? (
                        <Badge>em dia</Badge>
                      ) : p.status === 'recebe' ? (
                        <Badge variant="success">+ {formatBRL(Math.abs(p.saldo))}</Badge>
                      ) : (
                        <Badge variant="danger">− {formatBRL(Math.abs(p.saldo))}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <button onClick={() => goTo?.('prestacao')} className="text-teal-600 text-sm font-semibold mt-4 hover:underline">
          Ver prestação de contas completa →
        </button>
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Nova despesa" wide>
        <DespesaForm
          defaultMoradoraId={role === 'moradora' ? currentMoradoraId : undefined}
          onSubmit={handleSubmit}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>
    </div>
  )
}

function StatCard({ icon, label, value, accent }) {
  return (
    <Card className="p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-xs font-semibold text-plum/40 uppercase tracking-wide">{label}</p>
      <p className={`font-display text-2xl font-bold mt-0.5 ${accent}`}>{value}</p>
    </Card>
  )
}
