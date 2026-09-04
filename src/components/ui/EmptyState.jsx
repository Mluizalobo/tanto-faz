import React from 'react'

export default function EmptyState({ icon = '🏡', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="text-5xl mb-3">{icon}</div>
      <p className="font-display font-semibold text-plum text-lg">{title}</p>
      {subtitle && <p className="text-plum/60 text-sm mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
