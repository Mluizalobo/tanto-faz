import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { computeMonthSummary, computeAcertos } from '../../utils/calc.js'
import { formatBRL, formatDate } from '../../utils/format.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import MonthPicker from '../ui/MonthPicker.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'
import RelatorioPrint from './RelatorioPrint.jsx'

export default function PrestacaoContasPage() {
  const { moradoras, despesas, entradas, categorias, fechamentos, role, fecharMes, reabrirMes, selectedMonth, setSelectedMonth } = useApp()
  const [fecharAberto, setFecharAberto] = useState(false)
  const [nomeAdmin, setNomeAdmin] = useState('')

  const resumo = useMemo(
    () => computeMonthSummary(moradoras, despesas, entradas, selectedMonth),
    [moradoras, despesas, entradas, selectedMonth],
  )
  const acertos = useMemo(() => computeAcertos(resumo.porMoradora), [resumo])
  const fechamento = fechamentos[selectedMonth]
  const fechado = Boolean(fechamento?.fechado)
  const isAdmin = role === 'admin'

  function categoriaOf(id) {
    return categorias.find((c) => c.id === id)
  }

  function handleFechar() {
    fecharMes(selectedMonth, nomeAdmin.trim() || 'Administradora')
    setFecharAberto(false)
    setNomeAdmin('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 no-print">
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
        <div className="flex items-center gap-3">
          {fechado ? (
            <Badge variant="warning">🔒 fechado por {fechamento.fechadoPor}</Badge>
          ) : (
            <Badge variant="success">🟢 mês em aberto</Badge>
          )}
          <Button variant="outline" onClick={() => window.print()}>
            📄 Gerar Prestação de Contas
          </Button>
          {isAdmin && !fechado && (
            <Button onClick={() => setFecharAberto(true)}>Fechar Prestação de Contas</Button>
          )}
          {isAdmin && fechado && (
            <Button variant="outline" onClick={() => reabrirMes(selectedMonth)}>
              Reabrir mês
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 no-print">
        <Metric label="Saldo inicial" value={formatBRL(resumo.saldoInicial)} />
        <Metric label="Entradas" value={formatBRL(resumo.totalEntradas)} accent="text-teal-600" />
        <Metric label="Despesas" value={formatBRL(resumo.totalDespesas)} accent="text-coral-600" />
        <Metric label="Saldo final" value={formatBRL(resumo.saldoFinal)} strong />
        <Metric label="Moradoras" value={resumo.numMoradoras} />
      </div>

      <Card className="p-5 no-print">
        <h3 className="font-display font-semibold text-plum mb-4">Divisão entre moradoras</h3>
        {resumo.porMoradora.length === 0 ? (
          <p className="text-sm text-plum/40 py-4 text-center">Nenhuma moradora ativa neste mês.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-plum/40 text-xs uppercase tracking-wide border-b border-plum/8">
                  <th className="py-2.5 font-semibold">Moradora</th>
                  <th className="py-2.5 font-semibold text-right">Total pago</th>
                  <th className="py-2.5 font-semibold text-right">Sua parte</th>
                  <th className="py-2.5 font-semibold text-right">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {resumo.porMoradora.map((p) => (
                  <tr key={p.moradora.id} className="border-b border-plum/5 last:border-0">
                    <td className="py-3">
                      <div className="flex items-center gap-2.5">
                        <MoradoraAvatar moradora={p.moradora} size="sm" />
                        {p.moradora.nome}
                      </div>
                    </td>
                    <td className="py-3 text-right">{formatBRL(p.pago)}</td>
                    <td className="py-3 text-right text-plum/60">{formatBRL(p.parte)}</td>
                    <td className="py-3 text-right font-semibold">
                      {p.status === 'quite' ? (
                        <span className="text-plum/40">em dia</span>
                      ) : p.status === 'recebe' ? (
                        <span className="text-teal-600">recebe {formatBRL(Math.abs(p.saldo))}</span>
                      ) : (
                        <span className="text-coral-600">paga {formatBRL(Math.abs(p.saldo))}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-5 no-print">
        <h3 className="font-display font-semibold text-plum mb-4">Acertos entre as moradoras</h3>
        {acertos.length === 0 ? (
          <p className="text-sm text-plum/40 py-4 text-center">Tudo certo — ninguém precisa acertar nada esse mês. 🎉</p>
        ) : (
          <ul className="space-y-2">
            {acertos.map((a, i) => (
              <li key={i} className="flex items-center gap-3 text-sm bg-plum/[0.03] rounded-xl px-4 py-3">
                <MoradoraAvatar moradora={a.de} size="xs" />
                <span className="font-semibold">{a.de.nome}</span>
                <span className="text-plum/40">deve pagar</span>
                <span className="font-bold text-coral-600">{formatBRL(a.valor)}</span>
                <span className="text-plum/40">para</span>
                <MoradoraAvatar moradora={a.para} size="xs" />
                <span className="font-semibold">{a.para.nome}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card className="p-5 no-print">
        <h3 className="font-display font-semibold text-plum mb-4">Despesas do mês ({resumo.despesasMes.length})</h3>
        {resumo.despesasMes.length === 0 ? (
          <p className="text-sm text-plum/40 py-4 text-center">Nenhuma despesa registrada.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-plum/40 text-xs uppercase tracking-wide border-b border-plum/8">
                  <th className="py-2 font-semibold">Data</th>
                  <th className="py-2 font-semibold">Descrição</th>
                  <th className="py-2 font-semibold">Categoria</th>
                  <th className="py-2 font-semibold">Pagadora</th>
                  <th className="py-2 font-semibold text-right">Valor</th>
                </tr>
              </thead>
              <tbody>
                {resumo.despesasMes.map((d) => (
                  <tr key={d.id} className="border-b border-plum/5 last:border-0">
                    <td className="py-2 text-plum/60">{formatDate(d.data)}</td>
                    <td className="py-2">{d.descricao}</td>
                    <td className="py-2">{categoriaOf(d.categoriaId)?.icon} {categoriaOf(d.categoriaId)?.nome}</td>
                    <td className="py-2">{moradoras.find((m) => m.id === d.pagoPor)?.nome}</td>
                    <td className="py-2 text-right font-medium">{formatBRL(d.valor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <RelatorioPrint resumo={resumo} categorias={categorias} fechamento={fechamento} />

      <Modal
        open={fecharAberto}
        onClose={() => setFecharAberto(false)}
        title="Fechar prestação de contas"
        footer={
          <>
            <Button variant="ghost" onClick={() => setFecharAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={handleFechar}>Confirmar fechamento</Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-plum/60">
            Confira o resumo antes de fechar. Depois de fechado, ninguém poderá alterar lançamentos deste mês até você reabrir.
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <SummaryRow label="Total de entradas" value={formatBRL(resumo.totalEntradas)} />
            <SummaryRow label="Total de despesas" value={formatBRL(resumo.totalDespesas)} />
            <SummaryRow label="Saldo final" value={formatBRL(resumo.saldoFinal)} />
            <SummaryRow label="Moradoras ativas" value={resumo.numMoradoras} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-plum/60 mb-1.5">Seu nome (para o registro do fechamento)</label>
            <input
              className="w-full px-3.5 py-2.5 rounded-xl border border-plum/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-coral-300"
              value={nomeAdmin}
              onChange={(e) => setNomeAdmin(e.target.value)}
              placeholder="Ex: Ana"
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

function Metric({ label, value, accent = 'text-plum', strong }) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-plum/40">{label}</p>
      <p className={`font-display ${strong ? 'text-2xl font-bold' : 'text-xl font-semibold'} mt-0.5 ${accent}`}>{value}</p>
    </Card>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="bg-plum/[0.03] rounded-xl px-3.5 py-2.5">
      <p className="text-[11px] text-plum/40 uppercase font-semibold">{label}</p>
      <p className="font-semibold text-plum">{value}</p>
    </div>
  )
}
