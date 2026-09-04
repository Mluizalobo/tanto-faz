import React from 'react'

const VARIANTS = {
  neutral: 'bg-plum/8 text-plum',
  success: 'bg-teal-100 text-teal-700',
  warning: 'bg-sun/30 text-plum',
  danger: 'bg-coral-100 text-coral-700',
}

export default function Badge({ variant = 'neutral', className = '', children }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${VARIANTS[variant]} ${className}`}>
      {children}
    </span>
  )
}
