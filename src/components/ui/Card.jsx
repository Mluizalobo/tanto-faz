import React from 'react'

export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`bg-white rounded-2xl shadow-card border border-plum/5 ${className}`} {...props}>
      {children}
    </div>
  )
}
