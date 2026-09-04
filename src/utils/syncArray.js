export function applyRealtimeToArray(setArray, mapRow, payload) {
  if (payload.eventType === 'DELETE') {
    setArray((prev) => prev.filter((item) => item.id !== payload.old.id))
    return
  }
  const mapped = mapRow(payload.new)
  setArray((prev) => {
    const exists = prev.some((item) => item.id === mapped.id)
    if (exists) return prev.map((item) => (item.id === mapped.id ? mapped : item))
    return [mapped, ...prev]
  })
}

export function applyRealtimeToFechamentos(setFechamentos, payload) {
  if (payload.eventType === 'DELETE') {
    setFechamentos((prev) => {
      const next = { ...prev }
      delete next[payload.old.month_key]
      return next
    })
    return
  }
  const row = payload.new
  setFechamentos((prev) => ({
    ...prev,
    [row.month_key]: { fechado: row.fechado, fechadoPor: row.fechado_por, fechadoEm: row.fechado_em },
  }))
}
