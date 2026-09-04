import React from 'react'
import Logo from './Logo.jsx'
import { useApp } from '../../context/AppContext.jsx'
import { IconHome, IconReceipt, IconWallet, IconUserCircle, IconClipboard, IconBook, IconUsers, IconFileText } from '../ui/Icons.jsx'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Início', Icon: IconHome, roles: ['admin', 'moradora'] },
  { id: 'despesas', label: 'Despesas', Icon: IconReceipt, roles: ['admin', 'moradora'] },
  { id: 'entradas', label: 'Entradas', Icon: IconWallet, roles: ['admin', 'moradora'] },
  { id: 'anexos', label: 'Comprovantes', Icon: IconFileText, roles: ['admin', 'moradora'] },
  { id: 'situacao', label: 'Minha Situação', Icon: IconUserCircle, roles: ['moradora'] },
  { id: 'prestacao', label: 'Prestação de Contas', Icon: IconClipboard, roles: ['admin', 'moradora'] },
  { id: 'historico', label: 'Histórico', Icon: IconBook, roles: ['admin', 'moradora'] },
  { id: 'moradoras', label: 'Moradoras', Icon: IconUsers, roles: ['admin'] },
]

export default function Sidebar({ page, setPage, mobileOpen, setMobileOpen }) {
  const { role } = useApp()
  const items = NAV_ITEMS.filter((item) => item.roles.includes(role))

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-plum/40 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-0 h-screen w-64 bg-white border-r border-plum/8 flex flex-col shrink-0 transition-transform md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 py-6">
          <Logo />
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setPage(item.id)
                setMobileOpen(false)
              }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                page === item.id
                  ? 'bg-coral-50 text-coral-600'
                  : 'text-plum/70 hover:bg-plum/5 hover:text-plum'
              }`}
            >
              <item.Icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-5 py-5 text-[11px] text-plum/35 leading-relaxed">
          Feito para a República Tanto Faz.
          <br />
          Seus dados ficam só neste navegador.
        </div>
      </aside>
    </>
  )
}
