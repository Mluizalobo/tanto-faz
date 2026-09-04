import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { formatBRL, todayISO } from '../../utils/format.js'
import { FORMAS_PAGAMENTO } from '../../data/defaults.js'
import Card from '../ui/Card.jsx'
import Badge from '../ui/Badge.jsx'
import { IconTable, IconPlus, IconTrash, IconLock } from '../ui/Icons.jsx'

const cellInput =
  'w-full h-full bg-transparent px-2.5 py-2 text-sm text-plum outline-none focus:bg-white focus:ring-2 focus:ring-inset focus:ring-teal-300 rounded-md disabled:text-plum/40'

export default function PlanilhaDespesas() {
  const { despesas, categorias, moradoras, updateDespesa, addDespesa, deleteDespesa, selectedMonth, isMonthClosed } = useApp()
  const [novaLinhaCarregando, setNovaLinhaCarregando] = useState(false)

  const mesFechado = isMonthClosed(selectedMonth)
  const ativas = moradoras.filter((m) => m.status === 'ativa')

  const lista = useMemo(
    () =>
      despesas
        .filter((d) => d.data.slice(0, 7) === selectedMonth)
        .sort((a, b) => (a.data < b.data ? 1 : -1)),
    [despesas, selectedMonth],
  )

  const total = lista.reduce((acc, d) => acc + Number(d.valor), 0)

  function patch(id, field, value) {
    updateDespesa(id, { [field]: value })
  }

  async function handleAddRow() {
    if (ativas.length === 0 || categorias.length === 0) return
    setNovaLinhaCarregando(true)
    const dataDefault = todayISO().slice(0, 7) === selectedMonth ? todayISO() : `${selectedMonth}-01`
    await addDespesa({
      descricao: '',
      valor: 0,
      data: dataDefault,
      categoriaId: categorias[0].id,
      pagoPor: ativas[0].id,
      formaPagamento: FORMAS_PAGAMENTO[0],
      observacao: '',
    })
    setNovaLinhaCarregando(false)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-plum/8">
        <div className="flex items-center gap-2.5">
          <IconTable className="w-5 h-5 text-plum/50" />
          <h3 className="font-display font-semibold text-plum">Planilha de despesas</h3>
        </div>
        {mesFechado ? (
          <Badge variant="warning">
            <IconLock className="w-3.5 h-3.5" /> mês fechado — somente leitura
          </Badge>
        ) : (
          <span className="text-xs text-plum/40">edite direto nas células, tudo é salvo na hora</span>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-plum/[0.03] text-left text-plum/40 text-xs uppercase tracking-wide">
              <th className="px-2.5 py-2.5 font-semibold w-32">Data</th>
              <th className="px-2.5 py-2.5 font-semibold min-w-[180px]">Descrição</th>
              <th className="px-2.5 py-2.5 font-semibold w-40">Categoria</th>
              <th className="px-2.5 py-2.5 font-semibold w-40">Quem pagou</th>
              <th className="px-2.5 py-2.5 font-semibold w-32 text-right">Valor</th>
              <th className="px-2.5 py-2.5 font-semibold w-10" />
            </tr>
          </thead>
          <tbody>
            {lista.map((d) => (
              <tr key={d.id} className="border-b border-plum/8 hover:bg-plum/[0.015]">
                <td className="border-r border-plum/8 p-0">
                  <input
                    type="date"
                    className={cellInput}
                    defaultValue={d.data}
                    disabled={mesFechado}
                    onBlur={(e) => e.target.value && patch(d.id, 'data', e.target.value)}
                  />
                </td>
                <td className="border-r border-plum/8 p-0">
                  <input
                    type="text"
                    className={cellInput}
                    defaultValue={d.descricao}
                    placeholder="Descrição…"
                    disabled={mesFechado}
                    onBlur={(e) => patch(d.id, 'descricao', e.target.value)}
                  />
                </td>
                <td className="border-r border-plum/8 p-0">
                  <select
                    className={cellInput}
                    defaultValue={d.categoriaId}
                    disabled={mesFechado}
                    onChange={(e) => patch(d.id, 'categoriaId', e.target.value)}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-plum/8 p-0">
                  <select
                    className={cellInput}
                    defaultValue={d.pagoPor}
                    disabled={mesFechado}
                    onChange={(e) => patch(d.id, 'pagoPor', e.target.value)}
                  >
                    {moradoras.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="border-r border-plum/8 p-0">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`${cellInput} text-right font-medium`}
                    defaultValue={d.valor}
                    disabled={mesFechado}
                    onBlur={(e) => patch(d.id, 'valor', e.target.value)}
                  />
                </td>
                <td className="p-0 text-center">
                  {!mesFechado && (
                    <button
                      onClick={() => deleteDespesa(d.id)}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-md text-plum/30 hover:text-coral-600 hover:bg-coral-50"
                      title="Excluir linha"
                    >
                      <IconTrash className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-plum/[0.03]">
              <td colSpan={4} className="px-2.5 py-2.5 text-right text-xs font-semibold text-plum/50 uppercase">
                Total do mês
              </td>
              <td className="px-2.5 py-2.5 text-right font-bold text-plum">{formatBRL(total)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>

      {!mesFechado && (
        <button
          onClick={handleAddRow}
          disabled={novaLinhaCarregando || ativas.length === 0}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-teal-600 hover:bg-teal-50 border-t border-plum/8 disabled:opacity-40"
        >
          <IconPlus className="w-4 h-4" /> Adicionar linha
        </button>
      )}
    </Card>
  )
}
