import React from 'react'
import logoWide from '../../assets/logo-wide.png'
import MoradoraAvatar from '../moradoras/MoradoraAvatar.jsx'

export default function LandingScreen({ moradoras, onChooseAdmin, onChooseMoradora }) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-cream px-6 py-10 text-center gap-8">
      <img
        src={logoWide}
        alt="República Tanto Faz"
        className="w-full max-w-[240px] sm:max-w-[260px] rounded-2xl shadow-soft"
      />
      <div>
        <h1 className="font-display text-2xl font-bold text-plum">Tanto Faz</h1>
        <p className="text-plum/60 text-sm mt-1">Controle da caixinha da república</p>
      </div>

      <div className="w-full max-w-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-plum/40 mb-3">Quem é você?</p>

        <button
          onClick={onChooseAdmin}
          className="w-full flex items-center gap-3 bg-plum text-white rounded-xl px-4 py-3 mb-3 shadow-soft hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-sm font-bold shrink-0">
            A
          </div>
          <span className="font-semibold">Administradora</span>
        </button>

        {moradoras.length > 0 && (
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {moradoras.map((m) => (
              <button
                key={m.id}
                onClick={() => onChooseMoradora(m.id)}
                className="w-full flex items-center gap-3 bg-white rounded-xl border border-plum/10 px-4 py-3 hover:border-coral-300 hover:bg-coral-50 transition-colors"
              >
                <MoradoraAvatar moradora={m} size="sm" />
                <span className="font-medium text-plum">{m.nome}</span>
                {m.status === 'inativa' && <span className="text-[10px] text-plum/40 ml-auto">inativa</span>}
              </button>
            ))}
          </div>
        )}

        {moradoras.length === 0 && (
          <p className="text-xs text-plum/40">Nenhuma moradora cadastrada ainda — entre como administradora para começar.</p>
        )}
      </div>
    </div>
  )
}
