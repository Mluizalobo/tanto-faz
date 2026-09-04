import React, { useState } from 'react'
import { useApp } from '../../context/AppContext.jsx'
import Logo from './Logo.jsx'
import Button from '../ui/Button.jsx'

export default function Onboarding() {
  const { addMoradora } = useApp()
  const [nomes, setNomes] = useState([''])

  function updateNome(i, value) {
    setNomes((prev) => prev.map((n, idx) => (idx === i ? value : n)))
  }

  function addCampo() {
    setNomes((prev) => [...prev, ''])
  }

  function handleSubmit(e) {
    e.preventDefault()
    const validos = nomes.map((n) => n.trim()).filter(Boolean)
    validos.forEach((nome) => addMoradora({ nome }))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Logo />
        </div>
        <div className="bg-white rounded-2xl shadow-soft p-7">
          <h1 className="font-display text-xl font-bold text-plum text-center">Bem-vinda! 🏡</h1>
          <p className="text-sm text-plum/60 text-center mt-1.5 mb-6">
            Quem mora na república? Cadastre as moradoras para começar a controlar a caixinha.
          </p>
          <form onSubmit={handleSubmit} className="space-y-3">
            {nomes.map((nome, i) => (
              <input
                key={i}
                autoFocus={i === 0}
                className="w-full px-3.5 py-2.5 rounded-xl border border-plum/15 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-coral-300"
                placeholder={`Nome da moradora ${i + 1}`}
                value={nome}
                onChange={(e) => updateNome(i, e.target.value)}
              />
            ))}
            <button type="button" onClick={addCampo} className="text-teal-600 text-sm font-semibold hover:underline">
              + adicionar outra moradora
            </button>
            <Button type="submit" className="w-full mt-2" size="lg" disabled={!nomes.some((n) => n.trim())}>
              Criar a caixinha
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
