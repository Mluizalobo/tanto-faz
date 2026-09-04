import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { DEFAULT_CATEGORIAS } from '../data/defaults.js'
import { generateId } from '../utils/id.js'
import { currentMonthKey, todayISO } from '../utils/format.js'
import { supabaseReady } from '../db/supabaseClient.js'
import {
  fetchAll,
  dbInsertMoradora,
  dbUpdateMoradora,
  dbDeleteMoradora,
  dbInsertCategoria,
  dbInsertDespesa,
  dbUpdateDespesa,
  dbDeleteDespesa,
  dbInsertEntrada,
  dbUpdateEntrada,
  dbDeleteEntrada,
  dbSetFechamento,
  uploadComprovante,
  deleteComprovanteFile,
  subscribeRealtime,
} from '../db/api.js'
import { applyRealtimeToArray, applyRealtimeToFechamentos } from '../utils/syncArray.js'
import { mapMoradora, mapCategoria, mapDespesa, mapEntrada } from '../db/api.js'
import { saveComprovante, deleteComprovante as deleteLocalComprovante } from '../db/files.js'

const AppContext = createContext(null)

function useLocalUiState() {
  const [role, setRole] = useLocalStorage('tf_role', 'admin')
  const [currentMoradoraId, setCurrentMoradoraId] = useLocalStorage('tf_current_moradora', null)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())
  return { role, setRole, currentMoradoraId, setCurrentMoradoraId, selectedMonth, setSelectedMonth }
}

export function AppProvider({ children }) {
  if (supabaseReady) return <SupabaseAppProvider>{children}</SupabaseAppProvider>
  return <LocalAppProvider>{children}</LocalAppProvider>
}

// ============================================================
// Modo nuvem (Supabase) — dados compartilhados entre todos os dispositivos
// ============================================================
function SupabaseAppProvider({ children }) {
  const ui = useLocalUiState()
  const [moradoras, setMoradoras] = useState([])
  const [categorias, setCategorias] = useState(DEFAULT_CATEGORIAS)
  const [despesas, setDespesas] = useState([])
  const [entradas, setEntradas] = useState([])
  const [fechamentos, setFechamentos] = useState({})
  const [loading, setLoading] = useState(true)
  const [erroConexao, setErroConexao] = useState(false)

  useEffect(() => {
    let cancelled = false
    fetchAll()
      .then((data) => {
        if (cancelled) return
        setMoradoras(data.moradoras)
        setCategorias(data.categorias.length ? data.categorias : DEFAULT_CATEGORIAS)
        setDespesas(data.despesas)
        setEntradas(data.entradas)
        setFechamentos(data.fechamentos)
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setErroConexao(true)
          setLoading(false)
        }
      })

    const unsubscribe = subscribeRealtime({
      onMoradoras: (p) => applyRealtimeToArray(setMoradoras, mapMoradora, p),
      onCategorias: (p) => applyRealtimeToArray(setCategorias, mapCategoria, p),
      onDespesas: (p) => applyRealtimeToArray(setDespesas, mapDespesa, p),
      onEntradas: (p) => applyRealtimeToArray(setEntradas, mapEntrada, p),
      onFechamentos: (p) => applyRealtimeToFechamentos(setFechamentos, p),
    })

    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [])

  function isMonthClosed(monthKey) {
    return Boolean(fechamentos[monthKey]?.fechado)
  }

  // ---------- Moradoras ----------
  async function addMoradora(data) {
    const m = {
      id: generateId('mor'),
      nome: data.nome,
      avatar: data.avatar || null,
      status: 'ativa',
      dataEntrada: data.dataEntrada || todayISO(),
      dataSaida: null,
    }
    setMoradoras((prev) => [...prev, m])
    await dbInsertMoradora(m)
    if (!ui.currentMoradoraId) ui.setCurrentMoradoraId(m.id)
    return m.id
  }

  async function updateMoradora(id, patch) {
    setMoradoras((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    await dbUpdateMoradora(id, patch)
  }

  async function toggleMoradoraStatus(id) {
    const alvo = moradoras.find((m) => m.id === id)
    if (!alvo) return
    const novoStatus = alvo.status === 'ativa' ? 'inativa' : 'ativa'
    const patch = { status: novoStatus, dataSaida: novoStatus === 'inativa' ? alvo.dataSaida || todayISO() : null }
    setMoradoras((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
    await dbUpdateMoradora(id, patch)
  }

  async function removeMoradora(id) {
    const temHistorico = despesas.some((d) => d.pagoPor === id) || entradas.some((e) => e.moradoraId === id)
    if (temHistorico) return { ok: false, reason: 'historico' }
    setMoradoras((prev) => prev.filter((m) => m.id !== id))
    await dbDeleteMoradora(id)
    return { ok: true }
  }

  // ---------- Categorias ----------
  async function addCategoria(nome) {
    const existing = categorias.find((c) => c.nome.toLowerCase() === nome.toLowerCase())
    if (existing) return existing.id
    const c = { id: generateId('cat'), nome }
    setCategorias((prev) => [...prev, c])
    await dbInsertCategoria(c)
    return c.id
  }

  // ---------- Despesas ----------
  async function addDespesa(data, comprovanteFile) {
    const monthKey = data.data.slice(0, 7)
    if (isMonthClosed(monthKey)) return { ok: false, reason: 'mes-fechado' }
    let comprovanteId = null
    if (comprovanteFile) comprovanteId = await uploadComprovante(comprovanteFile)
    const d = {
      id: generateId('desp'),
      descricao: data.descricao,
      valor: Number(data.valor),
      data: data.data,
      categoriaId: data.categoriaId,
      pagoPor: data.pagoPor,
      formaPagamento: data.formaPagamento || 'Pix',
      comprovanteId,
      comprovanteNome: comprovanteFile ? comprovanteFile.name : null,
      observacao: data.observacao || '',
      criadoEm: new Date().toISOString(),
    }
    setDespesas((prev) => [d, ...prev])
    await dbInsertDespesa(d)
    return { ok: true, id: d.id }
  }

  async function updateDespesa(id, data, comprovanteFile, removerComprovante) {
    const alvo = despesas.find((d) => d.id === id)
    if (!alvo) return { ok: false, reason: 'nao-encontrada' }
    const monthKeyAtual = alvo.data.slice(0, 7)
    const monthKeyNovo = (data.data || alvo.data).slice(0, 7)
    if (isMonthClosed(monthKeyAtual) || isMonthClosed(monthKeyNovo)) return { ok: false, reason: 'mes-fechado' }

    const patch = { ...data }
    if (data.valor !== undefined) patch.valor = Number(data.valor)

    if (comprovanteFile) {
      if (alvo.comprovanteId) await deleteComprovanteFile(alvo.comprovanteId)
      patch.comprovanteId = await uploadComprovante(comprovanteFile)
      patch.comprovanteNome = comprovanteFile.name
    } else if (removerComprovante && alvo.comprovanteId) {
      await deleteComprovanteFile(alvo.comprovanteId)
      patch.comprovanteId = null
      patch.comprovanteNome = null
    }

    setDespesas((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d)))
    await dbUpdateDespesa(id, patch)
    return { ok: true }
  }

  async function deleteDespesa(id) {
    const alvo = despesas.find((d) => d.id === id)
    if (!alvo) return { ok: false }
    if (isMonthClosed(alvo.data.slice(0, 7))) return { ok: false, reason: 'mes-fechado' }
    if (alvo.comprovanteId) await deleteComprovanteFile(alvo.comprovanteId)
    setDespesas((prev) => prev.filter((d) => d.id !== id))
    await dbDeleteDespesa(id)
    return { ok: true }
  }

  // ---------- Entradas ----------
  async function addEntrada(data) {
    const monthKey = data.data.slice(0, 7)
    if (isMonthClosed(monthKey)) return { ok: false, reason: 'mes-fechado' }
    const e = {
      id: generateId('ent'),
      data: data.data,
      valor: Number(data.valor),
      moradoraId: data.moradoraId,
      referencia: data.referencia || '',
      observacao: data.observacao || '',
      criadoEm: new Date().toISOString(),
    }
    setEntradas((prev) => [e, ...prev])
    await dbInsertEntrada(e)
    return { ok: true, id: e.id }
  }

  async function updateEntrada(id, data) {
    const alvo = entradas.find((e) => e.id === id)
    if (!alvo) return { ok: false }
    const monthKeyAtual = alvo.data.slice(0, 7)
    const monthKeyNovo = (data.data || alvo.data).slice(0, 7)
    if (isMonthClosed(monthKeyAtual) || isMonthClosed(monthKeyNovo)) return { ok: false, reason: 'mes-fechado' }
    const patch = { ...data }
    if (data.valor !== undefined) patch.valor = Number(data.valor)
    setEntradas((prev) => prev.map((e) => (e.id === id ? { ...e, ...patch } : e)))
    await dbUpdateEntrada(id, patch)
    return { ok: true }
  }

  async function deleteEntrada(id) {
    const alvo = entradas.find((e) => e.id === id)
    if (!alvo) return { ok: false }
    if (isMonthClosed(alvo.data.slice(0, 7))) return { ok: false, reason: 'mes-fechado' }
    setEntradas((prev) => prev.filter((e) => e.id !== id))
    await dbDeleteEntrada(id)
    return { ok: true }
  }

  // ---------- Fechamento mensal ----------
  async function fecharMes(monthKey, fechadoPorNome) {
    const fechamento = { fechado: true, fechadoPor: fechadoPorNome, fechadoEm: new Date().toISOString() }
    setFechamentos((prev) => ({ ...prev, [monthKey]: fechamento }))
    await dbSetFechamento(monthKey, fechamento)
  }

  async function reabrirMes(monthKey) {
    const atual = fechamentos[monthKey] || {}
    const fechamento = { ...atual, fechado: false }
    setFechamentos((prev) => ({ ...prev, [monthKey]: fechamento }))
    await dbSetFechamento(monthKey, fechamento)
  }

  const value = useMemo(
    () => ({
      moradoras,
      categorias,
      despesas,
      entradas,
      fechamentos,
      loading,
      erroConexao,
      cloudSync: true,
      ...ui,
      isMonthClosed,
      addMoradora,
      updateMoradora,
      toggleMoradoraStatus,
      removeMoradora,
      addCategoria,
      addDespesa,
      updateDespesa,
      deleteDespesa,
      addEntrada,
      updateEntrada,
      deleteEntrada,
      fecharMes,
      reabrirMes,
    }),
    [moradoras, categorias, despesas, entradas, fechamentos, loading, erroConexao, ui.role, ui.currentMoradoraId, ui.selectedMonth],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// ============================================================
// Modo local (fallback) — usado só enquanto o Supabase não está configurado.
// Dados ficam presos neste navegador/aparelho.
// ============================================================
function LocalAppProvider({ children }) {
  const [moradoras, setMoradoras] = useLocalStorage('tf_moradoras', [])
  const [categorias, setCategorias] = useLocalStorage('tf_categorias', DEFAULT_CATEGORIAS)
  const [despesas, setDespesas] = useLocalStorage('tf_despesas', [])
  const [entradas, setEntradas] = useLocalStorage('tf_entradas', [])
  const [fechamentos, setFechamentos] = useLocalStorage('tf_fechamentos', {})
  const ui = useLocalUiState()

  function isMonthClosed(monthKey) {
    return Boolean(fechamentos[monthKey]?.fechado)
  }

  function addMoradora(data) {
    const m = {
      id: generateId('mor'),
      nome: data.nome,
      avatar: data.avatar || null,
      status: 'ativa',
      dataEntrada: data.dataEntrada || todayISO(),
      dataSaida: null,
    }
    setMoradoras((prev) => [...prev, m])
    if (!ui.currentMoradoraId) ui.setCurrentMoradoraId(m.id)
    return m.id
  }

  function updateMoradora(id, patch) {
    setMoradoras((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)))
  }

  function toggleMoradoraStatus(id) {
    setMoradoras((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const novoStatus = m.status === 'ativa' ? 'inativa' : 'ativa'
        return { ...m, status: novoStatus, dataSaida: novoStatus === 'inativa' ? m.dataSaida || todayISO() : null }
      }),
    )
  }

  function removeMoradora(id) {
    const temHistorico = despesas.some((d) => d.pagoPor === id) || entradas.some((e) => e.moradoraId === id)
    if (temHistorico) return { ok: false, reason: 'historico' }
    setMoradoras((prev) => prev.filter((m) => m.id !== id))
    return { ok: true }
  }

  function addCategoria(nome) {
    const existing = categorias.find((c) => c.nome.toLowerCase() === nome.toLowerCase())
    if (existing) return existing.id
    const c = { id: generateId('cat'), nome }
    setCategorias((prev) => [...prev, c])
    return c.id
  }

  async function addDespesa(data, comprovanteFile) {
    const monthKey = data.data.slice(0, 7)
    if (isMonthClosed(monthKey)) return { ok: false, reason: 'mes-fechado' }
    let comprovanteId = null
    if (comprovanteFile) {
      comprovanteId = generateId('cmp')
      await saveComprovante(comprovanteId, comprovanteFile)
    }
    const d = {
      id: generateId('desp'),
      descricao: data.descricao,
      valor: Number(data.valor),
      data: data.data,
      categoriaId: data.categoriaId,
      pagoPor: data.pagoPor,
      formaPagamento: data.formaPagamento || 'Pix',
      comprovanteId,
      comprovanteNome: comprovanteFile ? comprovanteFile.name : null,
      observacao: data.observacao || '',
      criadoEm: new Date().toISOString(),
    }
    setDespesas((prev) => [d, ...prev])
    return { ok: true, id: d.id }
  }

  async function updateDespesa(id, data, comprovanteFile, removerComprovante) {
    const alvo = despesas.find((d) => d.id === id)
    if (!alvo) return { ok: false, reason: 'nao-encontrada' }
    const monthKeyAtual = alvo.data.slice(0, 7)
    const monthKeyNovo = (data.data || alvo.data).slice(0, 7)
    if (isMonthClosed(monthKeyAtual) || isMonthClosed(monthKeyNovo)) return { ok: false, reason: 'mes-fechado' }

    let comprovanteId = alvo.comprovanteId
    let comprovanteNome = alvo.comprovanteNome
    if (comprovanteFile) {
      if (alvo.comprovanteId) await deleteLocalComprovante(alvo.comprovanteId)
      comprovanteId = generateId('cmp')
      await saveComprovante(comprovanteId, comprovanteFile)
      comprovanteNome = comprovanteFile.name
    } else if (removerComprovante && alvo.comprovanteId) {
      await deleteLocalComprovante(alvo.comprovanteId)
      comprovanteId = null
      comprovanteNome = null
    }

    setDespesas((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, ...data, valor: data.valor !== undefined ? Number(data.valor) : d.valor, comprovanteId, comprovanteNome }
          : d,
      ),
    )
    return { ok: true }
  }

  async function deleteDespesa(id) {
    const alvo = despesas.find((d) => d.id === id)
    if (!alvo) return { ok: false }
    if (isMonthClosed(alvo.data.slice(0, 7))) return { ok: false, reason: 'mes-fechado' }
    if (alvo.comprovanteId) await deleteLocalComprovante(alvo.comprovanteId)
    setDespesas((prev) => prev.filter((d) => d.id !== id))
    return { ok: true }
  }

  function addEntrada(data) {
    const monthKey = data.data.slice(0, 7)
    if (isMonthClosed(monthKey)) return { ok: false, reason: 'mes-fechado' }
    const e = {
      id: generateId('ent'),
      data: data.data,
      valor: Number(data.valor),
      moradoraId: data.moradoraId,
      referencia: data.referencia || '',
      observacao: data.observacao || '',
      criadoEm: new Date().toISOString(),
    }
    setEntradas((prev) => [e, ...prev])
    return { ok: true, id: e.id }
  }

  function updateEntrada(id, data) {
    const alvo = entradas.find((e) => e.id === id)
    if (!alvo) return { ok: false }
    const monthKeyAtual = alvo.data.slice(0, 7)
    const monthKeyNovo = (data.data || alvo.data).slice(0, 7)
    if (isMonthClosed(monthKeyAtual) || isMonthClosed(monthKeyNovo)) return { ok: false, reason: 'mes-fechado' }
    setEntradas((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data, valor: data.valor !== undefined ? Number(data.valor) : e.valor } : e)),
    )
    return { ok: true }
  }

  function deleteEntrada(id) {
    const alvo = entradas.find((e) => e.id === id)
    if (!alvo) return { ok: false }
    if (isMonthClosed(alvo.data.slice(0, 7))) return { ok: false, reason: 'mes-fechado' }
    setEntradas((prev) => prev.filter((e) => e.id !== id))
    return { ok: true }
  }

  function fecharMes(monthKey, fechadoPorNome) {
    setFechamentos((prev) => ({
      ...prev,
      [monthKey]: { fechado: true, fechadoPor: fechadoPorNome, fechadoEm: new Date().toISOString() },
    }))
  }

  function reabrirMes(monthKey) {
    setFechamentos((prev) => ({ ...prev, [monthKey]: { ...(prev[monthKey] || {}), fechado: false } }))
  }

  const value = useMemo(
    () => ({
      moradoras,
      categorias,
      despesas,
      entradas,
      fechamentos,
      loading: false,
      erroConexao: false,
      cloudSync: false,
      ...ui,
      isMonthClosed,
      addMoradora,
      updateMoradora,
      toggleMoradoraStatus,
      removeMoradora,
      addCategoria,
      addDespesa,
      updateDespesa,
      deleteDespesa,
      addEntrada,
      updateEntrada,
      deleteEntrada,
      fecharMes,
      reabrirMes,
    }),
    [moradoras, categorias, despesas, entradas, fechamentos, ui.role, ui.currentMoradoraId, ui.selectedMonth],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
