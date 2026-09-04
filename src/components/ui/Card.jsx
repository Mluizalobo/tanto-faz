import React from 'react'

export default function Card({ className = '', children, ...props }) {
  const hasOwnBackground = /\bbg-/.test(className)
  return (
    <div
      className={`${hasOwnBackground ? '' : 'bg-white'} rounded-2xl shadow-card border border-plum/5 ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
