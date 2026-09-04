import React, { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { formatBRL, formatDate } from '../../utils/format.js'
import { getCategoryIcon } from '../../utils/categoryIcon.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Modal from '../ui/Modal.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import MonthPicker from '../ui/MonthPicker.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'
import ComprovanteViewer from '../despesas/ComprovanteViewer.jsx'
import AnexoForm from './AnexoForm.jsx'
import { IconFileText, IconPlus, IconTrash } from '../ui/Icons.jsx'

export default function AnexosPage() {
  const { anexos, despesas, moradoras, categorias, role, addAnexo, deleteAnexo, selectedMonth, setSelectedMonth } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [excluindo, setExcluindo] = useState(null)
  const isAdmin = role === 'admin'

  const despesasComComprovante = useMemo(
    () =>
      despesas
        .filter((d) => d.comprovanteId && d.data.slice(0, 7) === selectedMonth)
        .sort((a, b) => (a.data < b.data ? 1 : -1)),
    [despesas, selectedMonth],
  )

  async function handleSubmit(data, arquivo) {
    const result = await addAnexo(data, arquivo)
    if (result.ok) setFormOpen(false)
    return result
  }

  async function confirmarExclusao() {
    if (!excluindo) return
    await deleteAnexo(excluindo.id)
    setExcluindo(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display font-semibold text-plum">Documentos gerais</h3>
          <p className="text-xs text-plum/40">Contratos, recibos e comprovantes que não são de uma despesa específica.</p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <IconPlus className="w-4 h-4" /> Novo Anexo
        </Button>
      </div>

      <Card className="overflow-hidden">
        {anexos.length === 0 ? (
          <EmptyState
            icon={<IconFileText />}
            title="Nenhum documento anexado ainda"
            subtitle="Guarde aqui contratos, recibos avulsos ou qualquer papel importante da república."
            action={<Button onClick={() => setFormOpen(true)}>+ Novo Anexo</Button>}
          />
        ) : (
          <div className="divide-y divide-plum/8">
            {anexos.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-5 py-4">
                <div className="w-10 h-10 rounded-lg bg-plum/5 flex items-center justify-center shrink-0">
                  <IconFileText className="w-5 h-5 text-plum/50" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-plum truncate">{a.nome}</p>
                  {a.descricao && <p className="text-xs text-plum/40 truncate">{a.descricao}</p>}
                  <p className="text-[11px] text-plum/30">{formatDate(a.criadoEm?.slice(0, 10))}</p>
                </div>
                <ComprovanteViewer comprovanteId={a.arquivoPath} nome={a.arquivoNome} />
                {isAdmin && (
                  <button
                    onClick={() => setExcluindo(a)}
                    className="w-8 h-8 rounded-lg hover:bg-coral-50 text-coral-500 inline-flex items-center justify-center shrink-0"
                    title="Excluir"
                  >
                    <IconTrash className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div>
          <h3 className="font-display font-semibold text-plum">Comprovantes de despesas</h3>
          <p className="text-xs text-plum/40">Tudo que já foi anexado ao lançar uma despesa, mês a mês.</p>
        </div>
        <MonthPicker value={selectedMonth} onChange={setSelectedMonth} />
      </div>

      <Card className="overflow-hidden">
        {despesasComComprovante.length === 0 ? (
          <EmptyState
            icon={<IconFileText />}
            title="Nenhum comprovante de despesa neste mês"
            subtitle="Comprovantes anexados ao lançar despesas aparecem aqui, organizados por mês."
          />
        ) : (
          <div className="divide-y divide-plum/8">
            {despesasComComprovante.map((d) => {
              const cat = categorias.find((c) => c.id === d.categoriaId)
              const mor = moradoras.find((m) => m.id === d.pagoPor)
              const CatIcon = getCategoryIcon(d.categoriaId)
              return (
                <div key={d.id} className="flex items-center gap-3 px-5 py-4">
                  <div className="w-10 h-10 rounded-lg bg-plum/5 flex items-center justify-center shrink-0">
                    <CatIcon className="w-5 h-5 text-plum/50" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-plum truncate">{d.descricao}</p>
                    <div className="flex items-center gap-2 text-xs text-plum/40">
                      <span>{formatDate(d.data)}</span>
                      <span>·</span>
                      <span>{cat?.nome}</span>
                      <span>·</span>
                      <MoradoraAvatar moradora={mor} size="xs" />
                      <span>{mor?.nome}</span>
                    </div>
                  </div>
                  <span className="font-semibold text-plum whitespace-nowrap">{formatBRL(d.valor)}</span>
                  <ComprovanteViewer comprovanteId={d.comprovanteId} nome={d.comprovanteNome} />
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title="Novo anexo">
        <AnexoForm onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(excluindo)}
        onClose={() => setExcluindo(null)}
        onConfirm={confirmarExclusao}
        title="Excluir anexo"
        message={`Tem certeza que quer excluir "${excluindo?.nome}"? Essa ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        danger
      />
    </div>
  )
}
