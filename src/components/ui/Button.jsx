import React from 'react'

const VARIANTS = {
  primary: 'bg-coral-500 text-white hover:bg-coral-600 shadow-soft',
  secondary: 'bg-teal-500 text-white hover:bg-teal-600 shadow-soft',
  ghost: 'bg-transparent text-plum hover:bg-plum/5',
  outline: 'bg-white text-plum border border-plum/15 hover:bg-plum/5',
  danger: 'bg-white text-coral-600 border border-coral-200 hover:bg-coral-50',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
}

export default function Button({ variant = 'primary', size = 'md', className = '', children, ...props }) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
