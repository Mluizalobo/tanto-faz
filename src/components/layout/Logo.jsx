import React from 'react'
import logoSquare from '../../assets/logo-square.png'

export default function Logo({ size = 'md' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-base' : 'text-lg'
  return (
    <div className="flex items-center gap-2.5">
      <img
        src={logoSquare}
        alt="Brasão da República Tanto Faz"
        className={`${dims} rounded-lg object-cover shrink-0 shadow-soft`}
      />
      <div className="leading-none">
        <p className={`font-display font-bold text-plum ${textSize} tracking-tight`}>Tanto Faz</p>
        <p className="text-[10px] uppercase tracking-wider text-plum/40 font-semibold -mt-0.5">Caixinha da República</p>
      </div>
    </div>
  )
}
