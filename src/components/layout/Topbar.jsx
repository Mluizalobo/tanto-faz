import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'
import { IconMenu, IconChevronDown } from '../ui/Icons.jsx'

const PAGE_TITLES = {
  dashboard: 'Início',
  despesas: 'Despesas',
  entradas: 'Entradas da caixinha',
  situacao: 'Minha situação',
  prestacao: 'Prestação de contas',
  historico: 'Histórico financeiro',
  moradoras: 'Moradoras',
}

export default function Topbar({ page, setMobileOpen }) {
  const { role, setRole, moradoras, currentMoradoraId, setCurrentMoradoraId } = useApp()
  const [menuOpen, setMenuOpen] = useState(false)
  const eu = moradoras.find((m) => m.id === currentMoradoraId)

  return (
    <header className="sticky top-0 z-30 bg-cream/90 backdrop-blur-sm border-b border-plum/8">
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-plum/8"
            onClick={() => setMobileOpen(true)}
            aria-label="Abrir menu"
          >
            <IconMenu className="w-5 h-5" />
          </button>
          <h1 className="font-display text-xl font-semibold text-plum">{PAGE_TITLES[page]}</h1>
        </div>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-white border border-plum/10 shadow-card hover:shadow-soft transition-shadow"
          >
            {role === 'moradora' && eu ? (
              <MoradoraAvatar moradora={eu} size="sm" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-plum flex items-center justify-center text-white text-xs font-bold">A</div>
            )}
            <span className="text-sm font-semibold text-plum hidden sm:inline">
              {role === 'admin' ? 'Administradora' : eu?.nome || 'Escolher moradora'}
            </span>
            <IconChevronDown className="w-3.5 h-3.5 text-plum/40" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-soft border border-plum/8 z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-plum/8">
                  <p className="text-[11px] uppercase tracking-wide text-plum/40 font-semibold mb-2">Ver como</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRole('admin')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                        role === 'admin' ? 'bg-coral-500 text-white' : 'bg-plum/5 text-plum/60'
                      }`}
                    >
                      Administradora
                    </button>
                    <button
                      onClick={() => setRole('moradora')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold ${
                        role === 'moradora' ? 'bg-teal-500 text-white' : 'bg-plum/5 text-plum/60'
                      }`}
                    >
                      Moradora
                    </button>
                  </div>
                </div>
                {role === 'moradora' && (
                  <div className="py-2 max-h-56 overflow-y-auto">
                    {moradoras.length === 0 && (
                      <p className="px-4 py-2 text-xs text-plum/40">Cadastre moradoras primeiro.</p>
                    )}
                    {moradoras.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => {
                          setCurrentMoradoraId(m.id)
                          setMenuOpen(false)
                        }}
                        className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm hover:bg-plum/5 ${
                          m.id === currentMoradoraId ? 'bg-teal-50 text-teal-700 font-semibold' : 'text-plum/80'
                        }`}
                      >
                        <MoradoraAvatar moradora={m} size="sm" />
                        {m.nome}
                        {m.status === 'inativa' && <span className="text-[10px] text-plum/40 ml-auto">inativa</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
