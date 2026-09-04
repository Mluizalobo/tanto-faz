import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { computeMonthSummary, computeAcertos } from '../../utils/calc.js'
import { formatBRL, formatMonthLabel, currentMonthKey } from '../../utils/format.js'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'

export default function HistoricoPage({ goTo }) {
  const { moradoras, despesas, entradas, categorias, fechamentos, setSelectedMonth } = useApp()
  const [aberto, setAberto] = useState(null)

  const meses = useMemo(() => {
    const set = new Set([currentMonthKey(), ...Object.keys(fechamentos)])
    despesas.forEach((d) => set.add(d.data.slice(0, 7)))
    entradas.forEach((e) => set.add(e.data.slice(0, 7)))
    return Array.from(set).sort((a, b) => (a < b ? 1 : -1))
  }, [despesas, entradas, fechamentos])

  function categoriaOf(id) {
    return categorias.find((c) => c.id === id)
  }

  if (meses.length === 0) {
    return <EmptyState icon="📚" title="Ainda não há histórico" subtitle="Assim que o primeiro mês tiver movimentação, ele aparece aqui." />
  }

  return (
    <div className="space-y-3">
      {meses.map((monthKey) => {
        const resumo = computeMonthSummary(moradoras, despesas, entradas, monthKey)
        const acertos = computeAcertos(resumo.porMoradora)
        const fechamento = fechamentos[monthKey]
        const expandido = aberto === monthKey
        const semMovimento = resumo.despesasMes.length === 0 && resumo.entradasMes.length === 0

        return (
          <Card key={monthKey} className="overflow-hidden">
            <button
              onClick={() => setAberto(expandido ? null : monthKey)}
              className="w-full flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-left hover:bg-plum/[0.02]"
            >
              <div className="flex items-center gap-3">
                <span className="font-display font-semibold text-plum capitalize">{formatMonthLabel(monthKey)}</span>
                {fechamento?.fechado ? <Badge variant="warning">fechado</Badge> : <Badge variant="success">aberto</Badge>}
                {semMovimento && <Badge>sem movimento</Badge>}
              </div>
              <div className="flex items-center gap-5 text-sm">
                <span className="text-teal-600 font-semibold">+{formatBRL(resumo.totalEntradas)}</span>
                <span className="text-coral-600 font-semibold">−{formatBRL(resumo.totalDespesas)}</span>
                <span className="font-bold text-plum">{formatBRL(resumo.saldoFinal)}</span>
                <span className="text-plum/30">{expandido ? '▲' : '▼'}</span>
              </div>
            </button>

            {expandido && (
              <div className="px-5 pb-5 pt-1 border-t border-plum/8 space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                  <MiniStat label="Saldo inicial" value={formatBRL(resumo.saldoInicial)} />
                  <MiniStat label="Entradas" value={formatBRL(resumo.totalEntradas)} />
                  <MiniStat label="Despesas" value={formatBRL(resumo.totalDespesas)} />
                  <MiniStat label="Saldo final" value={formatBRL(resumo.saldoFinal)} />
                </div>

                {Object.keys(resumo.porCategoria).length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-2">Por categoria</p>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(resumo.porCategoria).map(([catId, valor]) => {
                        const cat = categoriaOf(catId)
                        return (
                          <span key={catId} className="text-xs bg-plum/5 rounded-full px-3 py-1.5 font-medium">
                            {cat?.icon} {cat?.nome}: <strong>{formatBRL(valor)}</strong>
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}

                {resumo.porMoradora.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-2">Por moradora</p>
                    <div className="grid sm:grid-cols-2 gap-2">
                      {resumo.porMoradora.map((p) => (
                        <div key={p.moradora.id} className="flex items-center gap-2.5 text-sm bg-plum/[0.03] rounded-xl px-3.5 py-2.5">
                          <MoradoraAvatar moradora={p.moradora} size="xs" />
                          <span className="font-medium flex-1 truncate">{p.moradora.nome}</span>
                          <span className="text-plum/50 text-xs">pagou {formatBRL(p.pago)} · parte {formatBRL(p.parte)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {acertos.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-2">Acertos</p>
                    <ul className="space-y-1.5">
                      {acertos.map((a, i) => (
                        <li key={i} className="text-sm text-plum/70">
                          <strong className="text-plum">{a.de.nome}</strong> pagou <strong className="text-coral-600">{formatBRL(a.valor)}</strong> para{' '}
                          <strong className="text-plum">{a.para.nome}</strong>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedMonth(monthKey)
                    goTo?.('prestacao')
                  }}
                  className="text-teal-600 text-sm font-semibold hover:underline"
                >
                  Ver prestação de contas completa →
                </button>
              </div>
            )}
          </Card>
        )
      })}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="bg-plum/[0.03] rounded-xl px-3.5 py-2.5">
      <p className="text-[10px] uppercase font-semibold text-plum/40">{label}</p>
      <p className="font-display font-bold text-plum">{value}</p>
    </div>
  )
}
