import React, { useState } from 'react'
import { useApp } from './context/AppContext.jsx'
import Sidebar from './components/layout/Sidebar.jsx'
import Topbar from './components/layout/Topbar.jsx'
import DashboardPage from './components/dashboard/DashboardPage.jsx'
import DespesasPage from './components/despesas/DespesasPage.jsx'
import EntradasPage from './components/entradas/EntradasPage.jsx'
import MoradorasPage from './components/moradoras/MoradorasPage.jsx'
import PrestacaoContasPage from './components/prestacao/PrestacaoContasPage.jsx'
import HistoricoPage from './components/historico/HistoricoPage.jsx'
import MinhaSituacaoPage from './components/situacao/MinhaSituacaoPage.jsx'
import Onboarding from './components/layout/Onboarding.jsx'

export default function App() {
  const { moradoras, role } = useApp()
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)

  if (moradoras.length === 0) {
    return <Onboarding />
  }

  const paginaPermitida =
    (page === 'situacao' && role !== 'moradora') || (page === 'moradoras' && role !== 'admin')
  const effectivePage = paginaPermitida ? 'dashboard' : page

  return (
    <div className="flex min-h-screen">
      <Sidebar page={effectivePage} setPage={setPage} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar page={effectivePage} setMobileOpen={setMobileOpen} />
        <main className="flex-1 px-4 md:px-8 py-6 max-w-6xl w-full mx-auto">
          {effectivePage === 'dashboard' && <DashboardPage goTo={setPage} />}
          {effectivePage === 'despesas' && <DespesasPage />}
          {effectivePage === 'entradas' && <EntradasPage />}
          {effectivePage === 'moradoras' && role === 'admin' && <MoradorasPage />}
          {effectivePage === 'prestacao' && <PrestacaoContasPage />}
          {effectivePage === 'historico' && <HistoricoPage goTo={setPage} />}
          {effectivePage === 'situacao' && role === 'moradora' && <MinhaSituacaoPage />}
        </main>
      </div>
    </div>
  )
}
