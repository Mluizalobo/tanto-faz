import React, { createContext, useContext, useMemo, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { DEFAULT_CATEGORIAS } from '../data/defaults.js'
import { generateId, saveComprovante, deleteComprovante } from '../db/files.js'
import { currentMonthKey, todayISO } from '../utils/format.js'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [moradoras, setMoradoras] = useLocalStorage('tf_moradoras', [])
  const [categorias, setCategorias] = useLocalStorage('tf_categorias', DEFAULT_CATEGORIAS)
  const [despesas, setDespesas] = useLocalStorage('tf_despesas', [])
  const [entradas, setEntradas] = useLocalStorage('tf_entradas', [])
  const [fechamentos, setFechamentos] = useLocalStorage('tf_fechamentos', {})

  const [role, setRole] = useLocalStorage('tf_role', 'admin')
  const [currentMoradoraId, setCurrentMoradoraId] = useLocalStorage('tf_current_moradora', null)
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey())

  function isMonthClosed(monthKey) {
    return Boolean(fechamentos[monthKey]?.fechado)
  }

  // ---------- Moradoras ----------
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
    if (!currentMoradoraId) setCurrentMoradoraId(m.id)
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
        return {
          ...m,
          status: novoStatus,
          dataSaida: novoStatus === 'inativa' ? (m.dataSaida || todayISO()) : null,
        }
      }),
    )
  }

  function removeMoradora(id) {
    const temHistorico = despesas.some((d) => d.pagoPor === id) || entradas.some((e) => e.moradoraId === id)
    if (temHistorico) return { ok: false, reason: 'historico' }
    setMoradoras((prev) => prev.filter((m) => m.id !== id))
    return { ok: true }
  }

  // ---------- Categorias ----------
  function addCategoria(nome, icon = '🏷️') {
    const existing = categorias.find((c) => c.nome.toLowerCase() === nome.toLowerCase())
    if (existing) return existing.id
    const c = { id: generateId('cat'), nome, icon }
    setCategorias((prev) => [...prev, c])
    return c.id
  }

  // ---------- Despesas ----------
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
      if (alvo.comprovanteId) await deleteComprovante(alvo.comprovanteId)
      comprovanteId = generateId('cmp')
      await saveComprovante(comprovanteId, comprovanteFile)
      comprovanteNome = comprovanteFile.name
    } else if (removerComprovante && alvo.comprovanteId) {
      await deleteComprovante(alvo.comprovanteId)
      comprovanteId = null
      comprovanteNome = null
    }

    setDespesas((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              ...data,
              valor: Number(data.valor),
              comprovanteId,
              comprovanteNome,
            }
          : d,
      ),
    )
    return { ok: true }
  }

  async function deleteDespesa(id) {
    const alvo = despesas.find((d) => d.id === id)
    if (!alvo) return { ok: false }
    if (isMonthClosed(alvo.data.slice(0, 7))) return { ok: false, reason: 'mes-fechado' }
    if (alvo.comprovanteId) await deleteComprovante(alvo.comprovanteId)
    setDespesas((prev) => prev.filter((d) => d.id !== id))
    return { ok: true }
  }

  // ---------- Entradas ----------
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
    setEntradas((prev) => prev.map((e) => (e.id === id ? { ...e, ...data, valor: Number(data.valor) } : e)))
    return { ok: true }
  }

  function deleteEntrada(id) {
    const alvo = entradas.find((e) => e.id === id)
    if (!alvo) return { ok: false }
    if (isMonthClosed(alvo.data.slice(0, 7))) return { ok: false, reason: 'mes-fechado' }
    setEntradas((prev) => prev.filter((e) => e.id !== id))
    return { ok: true }
  }

  // ---------- Fechamento mensal ----------
  function fecharMes(monthKey, fechadoPorNome) {
    setFechamentos((prev) => ({
      ...prev,
      [monthKey]: {
        fechado: true,
        fechadoPor: fechadoPorNome,
        fechadoEm: new Date().toISOString(),
      },
    }))
  }

  function reabrirMes(monthKey) {
    setFechamentos((prev) => ({
      ...prev,
      [monthKey]: {
        ...(prev[monthKey] || {}),
        fechado: false,
      },
    }))
  }

  const value = useMemo(
    () => ({
      moradoras,
      categorias,
      despesas,
      entradas,
      fechamentos,
      role,
      setRole,
      currentMoradoraId,
      setCurrentMoradoraId,
      selectedMonth,
      setSelectedMonth,
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
    [moradoras, categorias, despesas, entradas, fechamentos, role, currentMoradoraId, selectedMonth],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp deve ser usado dentro de AppProvider')
  return ctx
}
