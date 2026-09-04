import React from 'react'

export default function Logo({ size = 'md' }) {
  const dims = size === 'sm' ? 'w-8 h-8' : 'w-10 h-10'
  const textSize = size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <div className="flex items-center gap-2.5">
      <div className={`${dims} rounded-xl bg-coral-500 flex items-center justify-center shadow-soft shrink-0`}>
        <svg viewBox="0 0 24 24" className="w-[60%] h-[60%]" fill="none">
          <path
            d="M3 11.5 12 4l9 7.5"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 10v8.5a1 1 0 0 0 1 1H17.5a1 1 0 0 0 1-1V10"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="15" r="2.4" fill="#FFC94A" stroke="white" strokeWidth="0.6" />
        </svg>
      </div>
      <div className="leading-none">
        <p className={`font-display font-bold text-plum ${textSize} tracking-tight`}>tanto faz</p>
        <p className="text-[10px] uppercase tracking-wider text-plum/40 font-semibold -mt-0.5">caixinha da república</p>
      </div>
    </div>
  )
}
