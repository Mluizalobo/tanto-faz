import React from 'react'
import { formatBRL, formatDate, formatMonthLabel } from '../../utils/format.js'
import { computeAcertos } from '../../utils/calc.js'
import logoSquare from '../../assets/logo-square.png'

export default function RelatorioPrint({ resumo, categorias, fechamento }) {
  const acertos = computeAcertos(resumo.porMoradora)
  const categoriaOf = (id) => categorias.find((c) => c.id === id)

  return (
    <div className="hidden print:block print-area bg-white text-plum p-10 text-sm">
      <header className="flex items-center justify-between border-b-2 border-plum pb-4 mb-6">
        <div className="flex items-center gap-3">
          <img src={logoSquare} alt="" className="w-12 h-12 rounded-md object-cover" />
          <div>
            <h1 className="font-display text-2xl font-bold">República Tanto Faz</h1>
            <p className="text-plum/50 text-xs uppercase tracking-wide">Prestação de contas</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold capitalize">{formatMonthLabel(resumo.monthKey)}</p>
          {fechamento?.fechado && (
            <p className="text-xs text-plum/50">
              fechado por {fechamento.fechadoPor} em {new Date(fechamento.fechadoEm).toLocaleString('pt-BR')}
            </p>
          )}
        </div>
      </header>

      <section className="grid grid-cols-4 gap-4 mb-8">
        <Metric label="Saldo inicial" value={formatBRL(resumo.saldoInicial)} />
        <Metric label="Entradas" value={formatBRL(resumo.totalEntradas)} />
        <Metric label="Despesas" value={formatBRL(resumo.totalDespesas)} />
        <Metric label="Saldo final" value={formatBRL(resumo.saldoFinal)} strong />
      </section>

      <section className="mb-8">
        <h2 className="font-display font-semibold text-base mb-2">Despesas do mês</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-plum/30 text-left text-xs uppercase text-plum/50">
              <th className="py-1.5 pr-2">Data</th>
              <th className="py-1.5 pr-2">Descrição</th>
              <th className="py-1.5 pr-2">Categoria</th>
              <th className="py-1.5 pr-2">Pagadora</th>
              <th className="py-1.5 text-right">Valor</th>
            </tr>
          </thead>
          <tbody>
            {resumo.despesasMes.map((d) => (
              <tr key={d.id} className="border-b border-plum/10">
                <td className="py-1.5 pr-2">{formatDate(d.data)}</td>
                <td className="py-1.5 pr-2">{d.descricao}</td>
                <td className="py-1.5 pr-2">{categoriaOf(d.categoriaId)?.nome}</td>
                <td className="py-1.5 pr-2">{d.pagoPor ? resumo.porMoradora.find((p) => p.moradora.id === d.pagoPor)?.moradora.nome : ''}</td>
                <td className="py-1.5 text-right">{formatBRL(d.valor)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="mb-8">
        <h2 className="font-display font-semibold text-base mb-2">Divisão entre moradoras</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-plum/30 text-left text-xs uppercase text-plum/50">
              <th className="py-1.5 pr-2">Moradora</th>
              <th className="py-1.5 pr-2 text-right">Total pago</th>
              <th className="py-1.5 pr-2 text-right">Sua parte</th>
              <th className="py-1.5 text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {resumo.porMoradora.map((p) => (
              <tr key={p.moradora.id} className="border-b border-plum/10">
                <td className="py-1.5 pr-2">{p.moradora.nome}</td>
                <td className="py-1.5 pr-2 text-right">{formatBRL(p.pago)}</td>
                <td className="py-1.5 pr-2 text-right">{formatBRL(p.parte)}</td>
                <td className="py-1.5 text-right">{p.saldo >= 0 ? '+' : '−'} {formatBRL(Math.abs(p.saldo))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="font-display font-semibold text-base mb-2">Acertos</h2>
        {acertos.length === 0 ? (
          <p className="text-plum/50">Ninguém precisa acertar nada — tudo certo!</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-plum/30 text-left text-xs uppercase text-plum/50">
                <th className="py-1.5 pr-2">Quem deve</th>
                <th className="py-1.5 pr-2">Quem recebe</th>
                <th className="py-1.5 text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {acertos.map((a, i) => (
                <tr key={i} className="border-b border-plum/10">
                  <td className="py-1.5 pr-2">{a.de.nome}</td>
                  <td className="py-1.5 pr-2">{a.para.nome}</td>
                  <td className="py-1.5 text-right">{formatBRL(a.valor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

function Metric({ label, value, strong }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-plum/50">{label}</p>
      <p className={`font-display ${strong ? 'text-xl font-bold' : 'text-lg font-semibold'}`}>{value}</p>
    </div>
  )
}
