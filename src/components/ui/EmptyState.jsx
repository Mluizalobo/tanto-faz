import React from 'react'
import { IconClipboard } from './Icons.jsx'

export default function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6">
      <div className="w-14 h-14 rounded-2xl bg-plum/5 text-plum/40 flex items-center justify-center mb-4">
        {icon ? React.cloneElement(icon, { className: 'w-7 h-7' }) : <IconClipboard className="w-7 h-7" />}
      </div>
      <p className="font-display font-semibold text-plum text-lg">{title}</p>
      {subtitle && <p className="text-plum/60 text-sm mt-1 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
