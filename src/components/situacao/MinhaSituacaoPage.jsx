import React, { useMemo } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { computeMonthSummary } from '../../utils/calc.js'
import { formatBRL } from '../../utils/format.js'
import Card from '../ui/Card.jsx'
import MonthPicker from '../ui/MonthPicker.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'
import { IconUserCircle } from '../ui/Icons.jsx'

export default function MinhaSituacaoPage() {
  const { moradoras, despesas, entradas, currentMoradoraId, setCurrentMoradoraId, selectedMonth, setSelectedMonth } = useApp()
  const eu = moradoras.find((m) => m.id === currentMoradoraId)

  const resumo = useMemo(
    () => computeMonthSummary(moradoras, despesas, entradas, selectedMonth),
    [moradoras, despesas, entradas, selectedMonth],
  )
  const minhaLinha = resumo.porMoradora.find((p) => p.moradora.id === currentMoradoraId)

  if (moradoras.length === 0) {
    return <EmptyState icon={<IconUserCircle />} title="Nenhuma moradora cadastrada ainda" />
  }

  if (!eu) {
    return (
      <div className="max-w-sm mx-auto text-center py-10">
        <p className="text-plum/60 mb-4">Quem é você?</p>
        <div className="space-y-2">
          {moradoras.map((m) => (
            <button
              key={m.id}
              onClick={() => setCurrentMoradoraId(m.id)}
              className="w-full flex items-center gap-3 bg-white rounded-xl border border-plum/10 px-4 py-3 hover:border-coral-300 hover:bg-coral-50 transition-colors"
            >
              <MoradoraAvatar moradora={m} size="sm" />
              <span className="font-medium">{m.nome}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  const statusPositivo = minhaLinha ? minhaLinha.saldo > 0.005 : false
  const statusNegativo = minhaLinha ? minhaLinha.saldo < -0.005 : false

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <button onClick={() => setCurrentMoradoraId(null)} className="text-xs text-plum/40 hover:text-plum underline">
          trocar de moradora
        </button>
      </div>

      <Card className="p-6 text-center">
        <MoradoraAvatar moradora={eu} size="lg" className="mx-auto" />
        <p className="font-display text-xl font-bold text-plum mt-3">{eu.nome}</p>
      </Card>

      {!minhaLinha ? (
        <EmptyState icon={<IconUserCircle />} title="Você não estava ativa neste mês" subtitle="Nenhuma parte foi calculada para você." />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-plum/40">Pagamentos realizados</p>
              <p className="font-display text-2xl font-bold text-plum mt-1">{formatBRL(minhaLinha.pago)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-plum/40">Sua parte</p>
              <p className="font-display text-2xl font-bold text-plum mt-1">{formatBRL(minhaLinha.parte)}</p>
            </Card>
          </div>

          <Card
            className={`p-6 text-center ${statusPositivo ? 'bg-teal-500' : statusNegativo ? 'bg-coral-500' : 'bg-plum'} text-white`}
          >
            <p className="text-white/70 text-sm font-semibold">Saldo</p>
            <p className="font-display text-3xl font-bold mt-1">
              {minhaLinha.saldo >= 0 ? '+ ' : '− '}
              {formatBRL(Math.abs(minhaLinha.saldo))}
            </p>
            <p className="mt-3 font-semibold">
              {statusPositivo && `VOCÊ TEM ${formatBRL(minhaLinha.saldo)} A RECEBER`}
              {statusNegativo && `VOCÊ PRECISA PAGAR ${formatBRL(Math.abs(minhaLinha.saldo))}`}
              {!statusPositivo && !statusNegativo && 'VOCÊ ESTÁ EM DIA'}
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-1">Saldo da caixinha (geral)</p>
            <p className="font-display text-xl font-bold text-plum">{formatBRL(resumo.saldoFinal)}</p>
          </Card>
        </>
      )}
    </div>
  )
}
