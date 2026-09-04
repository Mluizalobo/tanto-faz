import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import { formatDate } from '../../utils/format.js'
import Card from '../ui/Card.jsx'
import Button from '../ui/Button.jsx'
import Badge from '../ui/Badge.jsx'
import Modal from '../ui/Modal.jsx'
import ConfirmDialog from '../ui/ConfirmDialog.jsx'
import EmptyState from '../ui/EmptyState.jsx'
import MoradoraAvatar from './MoradoraAvatar.jsx'
import MoradoraForm from './MoradoraForm.jsx'

export default function MoradorasPage() {
  const { moradoras, addMoradora, updateMoradora, toggleMoradoraStatus, removeMoradora } = useApp()
  const [formOpen, setFormOpen] = useState(false)
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)
  const [avisoHistorico, setAvisoHistorico] = useState(false)

  const ativas = moradoras.filter((m) => m.status === 'ativa')
  const inativas = moradoras.filter((m) => m.status === 'inativa')

  async function handleSubmit(data) {
    if (editando) {
      updateMoradora(editando.id, data)
    } else {
      addMoradora(data)
    }
    setFormOpen(false)
  }

  function confirmarExclusao() {
    const result = removeMoradora(excluindo.id)
    if (!result.ok) setAvisoHistorico(true)
    setExcluindo(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditando(null)
            setFormOpen(true)
          }}
        >
          + Nova Moradora
        </Button>
      </div>

      {moradoras.length === 0 ? (
        <EmptyState
          icon="👭"
          title="Nenhuma moradora cadastrada"
          subtitle="Cadastre as moradoras da república para começar a dividir as despesas."
          action={<Button onClick={() => setFormOpen(true)}>+ Nova Moradora</Button>}
        />
      ) : (
        <>
          <section>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-3">Ativas · {ativas.length}</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ativas.map((m) => (
                <MoradoraCard
                  key={m.id}
                  moradora={m}
                  onEdit={() => {
                    setEditando(m)
                    setFormOpen(true)
                  }}
                  onToggle={() => toggleMoradoraStatus(m.id)}
                  onDelete={() => setExcluindo(m)}
                />
              ))}
            </div>
          </section>

          {inativas.length > 0 && (
            <section>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-3">Inativas · {inativas.length}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {inativas.map((m) => (
                  <MoradoraCard
                    key={m.id}
                    moradora={m}
                    onEdit={() => {
                      setEditando(m)
                      setFormOpen(true)
                    }}
                    onToggle={() => toggleMoradoraStatus(m.id)}
                    onDelete={() => setExcluindo(m)}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editando ? 'Editar moradora' : 'Nova moradora'}>
        <MoradoraForm initial={editando} onSubmit={handleSubmit} onCancel={() => setFormOpen(false)} />
      </Modal>

      <ConfirmDialog
        open={Boolean(excluindo)}
        onClose={() => setExcluindo(null)}
        onConfirm={confirmarExclusao}
        title="Excluir moradora"
        message={`Remover "${excluindo?.nome}" definitivamente? Só é possível se ela não tiver despesas ou entradas registradas.`}
        confirmLabel="Excluir"
        danger
      />

      <ConfirmDialog
        open={avisoHistorico}
        onClose={() => setAvisoHistorico(false)}
        onConfirm={() => setAvisoHistorico(false)}
        title="Não é possível excluir"
        message="Essa moradora já tem despesas ou entradas registradas no histórico. Marque-a como inativa em vez de excluir, para preservar a prestação de contas dos meses anteriores."
        confirmLabel="Entendi"
      />
    </div>
  )
}

function MoradoraCard({ moradora, onEdit, onToggle, onDelete }) {
  const ativa = moradora.status === 'ativa'
  return (
    <Card className="p-4 flex items-start gap-3">
      <MoradoraAvatar moradora={moradora} size="lg" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-semibold text-plum truncate">{moradora.nome}</p>
          <Badge variant={ativa ? 'success' : 'neutral'}>{ativa ? 'ativa' : 'inativa'}</Badge>
        </div>
        <p className="text-xs text-plum/50 mt-1">desde {formatDate(moradora.dataEntrada)}</p>
        {!ativa && moradora.dataSaida && <p className="text-xs text-plum/50">saiu em {formatDate(moradora.dataSaida)}</p>}
        <div className="flex gap-3 mt-3 text-xs font-semibold">
          <button onClick={onEdit} className="text-plum/60 hover:text-plum">
            editar
          </button>
          <button onClick={onToggle} className={ativa ? 'text-coral-600' : 'text-teal-600'}>
            {ativa ? 'marcar inativa' : 'marcar ativa'}
          </button>
          <button onClick={onDelete} className="text-plum/40 hover:text-coral-600">
            excluir
          </button>
        </div>
      </div>
    </Card>
  )
}
