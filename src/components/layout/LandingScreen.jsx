import React from 'react'
import logoWide from '../../assets/logo-wide.png'
import Button from '../ui/Button.jsx'

export default function LandingScreen({ onEnter }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-6 text-center gap-10">
      <img
        src={logoWide}
        alt="República Tanto Faz"
        className="w-full max-w-[280px] sm:max-w-xs rounded-2xl shadow-soft"
      />
      <div>
        <h1 className="font-display text-2xl font-bold text-plum">Tanto Faz</h1>
        <p className="text-plum/60 text-sm mt-1">Controle da caixinha da república</p>
      </div>
      <Button size="lg" onClick={onEnter} className="px-12">
        Entrar
      </Button>
    </div>
  )
}
