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
import LandingScreen from './components/layout/LandingScreen.jsx'
import logoSquare from './assets/logo-square.png'

export default function App() {
  const { moradoras, role, loading, erroConexao } = useApp()
  const [page, setPage] = useState('dashboard')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [entrou, setEntrou] = useState(false)

  if (!entrou) {
    return <LandingScreen onEnter={() => setEntrou(true)} />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3">
        <img src={logoSquare} alt="" className="w-14 h-14 rounded-xl shadow-soft animate-pulse" />
        <p className="text-sm text-plum/50">Carregando a caixinha…</p>
      </div>
    )
  }

  if (erroConexao) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-cream gap-3 px-6 text-center">
        <img src={logoSquare} alt="" className="w-14 h-14 rounded-xl shadow-soft" />
        <p className="font-display font-semibold text-plum">Não foi possível conectar ao banco de dados</p>
        <p className="text-sm text-plum/50 max-w-sm">
          Confira sua internet e recarregue a página. Se o problema continuar, avise a administradora.
        </p>
      </div>
    )
  }

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
