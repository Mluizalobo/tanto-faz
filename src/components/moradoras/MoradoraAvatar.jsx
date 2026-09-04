import React from 'react'
import { initials, avatarColor } from '../../utils/format.js'

const SIZES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
}

export default function MoradoraAvatar({ moradora, size = 'md', className = '' }) {
  if (!moradora) return null
  const dim = SIZES[size]
  if (moradora.avatar) {
    return (
      <img
        src={moradora.avatar}
        alt={moradora.nome}
        className={`${dim} rounded-full object-cover shrink-0 ${className}`}
      />
    )
  }
  return (
    <div
      className={`${dim} ${avatarColor(moradora.nome)} rounded-full flex items-center justify-center text-white font-bold shrink-0 ${className}`}
    >
      {initials(moradora.nome)}
    </div>
  )
}
