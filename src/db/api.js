import { supabase } from './supabaseClient.js'
import { generateId } from '../utils/id.js'

const MORADORA_MAP = { nome: 'nome', avatar: 'avatar', status: 'status', dataEntrada: 'data_entrada', dataSaida: 'data_saida' }
const DESPESA_MAP = {
  descricao: 'descricao',
  valor: 'valor',
  data: 'data',
  categoriaId: 'categoria_id',
  pagoPor: 'pago_por',
  formaPagamento: 'forma_pagamento',
  comprovanteId: 'comprovante_path',
  comprovanteNome: 'comprovante_nome',
  observacao: 'observacao',
}
const ENTRADA_MAP = { data: 'data', valor: 'valor', moradoraId: 'moradora_id', referencia: 'referencia', observacao: 'observacao' }

function toDb(obj, fieldMap) {
  const out = {}
  for (const [camel, snake] of Object.entries(fieldMap)) {
    if (obj[camel] !== undefined) out[snake] = obj[camel]
  }
  return out
}

export function mapMoradora(r) {
  return { id: r.id, nome: r.nome, avatar: r.avatar, status: r.status, dataEntrada: r.data_entrada, dataSaida: r.data_saida }
}
export function mapCategoria(r) {
  return { id: r.id, nome: r.nome }
}
export function mapDespesa(r) {
  return {
    id: r.id,
    descricao: r.descricao,
    valor: Number(r.valor) || 0,
    data: r.data,
    categoriaId: r.categoria_id,
    pagoPor: r.pago_por,
    formaPagamento: r.forma_pagamento,
    comprovanteId: r.comprovante_path,
    comprovanteNome: r.comprovante_nome,
    observacao: r.observacao || '',
    criadoEm: r.criado_em,
  }
}
export function mapEntrada(r) {
  return {
    id: r.id,
    data: r.data,
    valor: Number(r.valor) || 0,
    moradoraId: r.moradora_id,
    referencia: r.referencia || '',
    observacao: r.observacao || '',
    criadoEm: r.criado_em,
  }
}

export async function fetchAll() {
  const [moradoras, categorias, despesas, entradas, fechamentos] = await Promise.all([
    supabase.from('moradoras').select('*').order('data_entrada', { ascending: true }),
    supabase.from('categorias').select('*'),
    supabase.from('despesas').select('*').order('data', { ascending: false }),
    supabase.from('entradas').select('*').order('data', { ascending: false }),
    supabase.from('fechamentos').select('*'),
  ])
  for (const r of [moradoras, categorias, despesas, entradas, fechamentos]) {
    if (r.error) throw r.error
  }
  const fechamentosObj = {}
  for (const row of fechamentos.data) {
    fechamentosObj[row.month_key] = { fechado: row.fechado, fechadoPor: row.fechado_por, fechadoEm: row.fechado_em }
  }
  return {
    moradoras: moradoras.data.map(mapMoradora),
    categorias: categorias.data.map(mapCategoria),
    despesas: despesas.data.map(mapDespesa),
    entradas: entradas.data.map(mapEntrada),
    fechamentos: fechamentosObj,
  }
}

// ---------- Moradoras ----------
export async function dbInsertMoradora(moradora) {
  const { error } = await supabase.from('moradoras').insert({ id: moradora.id, ...toDb(moradora, MORADORA_MAP) })
  if (error) throw error
}
export async function dbUpdateMoradora(id, patch) {
  const { error } = await supabase.from('moradoras').update(toDb(patch, MORADORA_MAP)).eq('id', id)
  if (error) throw error
}
export async function dbDeleteMoradora(id) {
  const { error } = await supabase.from('moradoras').delete().eq('id', id)
  if (error) throw error
}

// ---------- Categorias ----------
export async function dbInsertCategoria(categoria) {
  const { error } = await supabase.from('categorias').insert(categoria)
  if (error) throw error
}

// ---------- Despesas ----------
export async function dbInsertDespesa(despesa) {
  const { error } = await supabase.from('despesas').insert({ id: despesa.id, ...toDb(despesa, DESPESA_MAP) })
  if (error) throw error
}
export async function dbUpdateDespesa(id, patch) {
  const { error } = await supabase.from('despesas').update(toDb(patch, DESPESA_MAP)).eq('id', id)
  if (error) throw error
}
export async function dbDeleteDespesa(id) {
  const { error } = await supabase.from('despesas').delete().eq('id', id)
  if (error) throw error
}

// ---------- Entradas ----------
export async function dbInsertEntrada(entrada) {
  const { error } = await supabase.from('entradas').insert({ id: entrada.id, ...toDb(entrada, ENTRADA_MAP) })
  if (error) throw error
}
export async function dbUpdateEntrada(id, patch) {
  const { error } = await supabase.from('entradas').update(toDb(patch, ENTRADA_MAP)).eq('id', id)
  if (error) throw error
}
export async function dbDeleteEntrada(id) {
  const { error } = await supabase.from('entradas').delete().eq('id', id)
  if (error) throw error
}

// ---------- Fechamentos ----------
export async function dbSetFechamento(monthKey, { fechado, fechadoPor, fechadoEm }) {
  const { error } = await supabase
    .from('fechamentos')
    .upsert({ month_key: monthKey, fechado, fechado_por: fechadoPor, fechado_em: fechadoEm })
  if (error) throw error
}

// ---------- Comprovantes (Supabase Storage) ----------
export async function uploadComprovante(file) {
  const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin'
  const path = `${generateId('cmp')}.${ext}`
  const { error } = await supabase.storage.from('comprovantes').upload(path, file, { contentType: file.type })
  if (error) throw error
  return path
}
export async function deleteComprovanteFile(path) {
  if (!path) return
  await supabase.storage.from('comprovantes').remove([path])
}
export function getComprovanteUrl(path) {
  if (!path) return null
  return supabase.storage.from('comprovantes').getPublicUrl(path).data.publicUrl
}

// ---------- Realtime ----------
export function subscribeRealtime(handlers) {
  const channel = supabase
    .channel('tanto-faz-sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'moradoras' }, (p) => handlers.onMoradoras(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'categorias' }, (p) => handlers.onCategorias(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'despesas' }, (p) => handlers.onDespesas(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'entradas' }, (p) => handlers.onEntradas(p))
    .on('postgres_changes', { event: '*', schema: 'public', table: 'fechamentos' }, (p) => handlers.onFechamentos(p))
    .subscribe()

  return () => supabase.removeChannel(channel)
}
