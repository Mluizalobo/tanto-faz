// Regras centrais do TANTO FAZ:
// - despesas de um mês são sempre divididas IGUALMENTE entre as moradoras ativas naquele mês
// - saldo da caixinha é acumulado: saldo anterior + entradas do mês - despesas do mês

export function isMoradoraActiveInMonth(moradora, monthKey) {
  const entrada = moradora.dataEntrada ? moradora.dataEntrada.slice(0, 7) : null
  const saida = moradora.dataSaida ? moradora.dataSaida.slice(0, 7) : null
  if (entrada && entrada > monthKey) return false
  if (saida && saida < monthKey) return false
  // moradora "inativa" sem data de saída registrada não entra em meses futuros a partir de hoje,
  // mas continua valendo para meses já registrados enquanto não houver data de saída explícita.
  return true
}

export function getActiveMoradorasForMonth(moradoras, monthKey) {
  return moradoras.filter((m) => isMoradoraActiveInMonth(m, monthKey))
}

export function getDespesasForMonth(despesas, monthKey) {
  return despesas.filter((d) => d.data.slice(0, 7) === monthKey)
}

export function getEntradasForMonth(entradas, monthKey) {
  return entradas.filter((e) => e.data.slice(0, 7) === monthKey)
}

export function sumValor(list) {
  return list.reduce((acc, item) => acc + (Number(item.valor) || 0), 0)
}

// Saldo acumulado da caixinha estritamente ANTES do início do monthKey.
export function computeSaldoAnterior(despesas, entradas, monthKey) {
  const entradasAntes = entradas.filter((e) => e.data.slice(0, 7) < monthKey)
  const despesasAntes = despesas.filter((d) => d.data.slice(0, 7) < monthKey)
  return sumValor(entradasAntes) - sumValor(despesasAntes)
}

export function computeMonthSummary(moradoras, despesas, entradas, monthKey) {
  const despesasMes = getDespesasForMonth(despesas, monthKey)
  const entradasMes = getEntradasForMonth(entradas, monthKey)
  const ativas = getActiveMoradorasForMonth(moradoras, monthKey)

  const totalDespesas = sumValor(despesasMes)
  const totalEntradas = sumValor(entradasMes)
  const saldoInicial = computeSaldoAnterior(despesas, entradas, monthKey)
  const saldoFinal = saldoInicial + totalEntradas - totalDespesas

  const numMoradoras = ativas.length
  const valorPorMoradora = numMoradoras > 0 ? totalDespesas / numMoradoras : 0

  const porMoradora = ativas.map((m) => {
    const pago = sumValor(despesasMes.filter((d) => d.pagoPor === m.id))
    const depositado = sumValor(entradasMes.filter((e) => e.moradoraId === m.id))
    const parte = valorPorMoradora
    const saldo = pago - parte
    return {
      moradora: m,
      pago,
      depositado,
      parte,
      saldo,
      status: saldo > 0.005 ? 'recebe' : saldo < -0.005 ? 'paga' : 'quite',
    }
  })

  // moradoras que pagaram algo no mês mas não estavam ativas (situação incomum, mas cobrimos)
  const idsAtivas = new Set(ativas.map((m) => m.id))
  const foraDaAtivas = moradoras.filter((m) => !idsAtivas.has(m.id))
  foraDaAtivas.forEach((m) => {
    const pago = sumValor(despesasMes.filter((d) => d.pagoPor === m.id))
    const depositado = sumValor(entradasMes.filter((e) => e.moradoraId === m.id))
    if (pago > 0 || depositado > 0) {
      porMoradora.push({
        moradora: m,
        pago,
        depositado,
        parte: 0,
        saldo: pago,
        status: pago > 0 ? 'recebe' : 'quite',
        foraDoMes: true,
      })
    }
  })

  const porCategoria = {}
  despesasMes.forEach((d) => {
    porCategoria[d.categoriaId] = (porCategoria[d.categoriaId] || 0) + Number(d.valor)
  })

  return {
    monthKey,
    despesasMes,
    entradasMes,
    ativas,
    totalDespesas,
    totalEntradas,
    saldoInicial,
    saldoFinal,
    numMoradoras,
    valorPorMoradora,
    porMoradora,
    porCategoria,
  }
}

// Sugestão simples de acertos (quem paga pra quem) usando os saldos líquidos do mês.
export function computeAcertos(porMoradora) {
  const devedores = porMoradora
    .filter((p) => p.saldo < -0.005)
    .map((p) => ({ moradora: p.moradora, valor: -p.saldo }))
    .sort((a, b) => b.valor - a.valor)
  const credores = porMoradora
    .filter((p) => p.saldo > 0.005)
    .map((p) => ({ moradora: p.moradora, valor: p.saldo }))
    .sort((a, b) => b.valor - a.valor)

  const acertos = []
  let i = 0
  let j = 0
  while (i < devedores.length && j < credores.length) {
    const dev = devedores[i]
    const cred = credores[j]
    const valor = Math.min(dev.valor, cred.valor)
    if (valor > 0.005) {
      acertos.push({ de: dev.moradora, para: cred.moradora, valor })
    }
    dev.valor -= valor
    cred.valor -= valor
    if (dev.valor <= 0.005) i++
    if (cred.valor <= 0.005) j++
  }
  return acertos
}
