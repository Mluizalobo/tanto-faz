import { useEffect, useState } from 'react'
import { getComprovante } from '../db/files.js'

export function useComprovanteUrl(comprovanteId, active) {
  const [state, setState] = useState({ url: null, type: null, loading: false })

  useEffect(() => {
    if (!active || !comprovanteId) return
    let url = null
    let cancelled = false
    setState((s) => ({ ...s, loading: true }))
    getComprovante(comprovanteId).then((rec) => {
      if (cancelled || !rec) {
        setState({ url: null, type: null, loading: false })
        return
      }
      url = URL.createObjectURL(rec.blob)
      setState({ url, type: rec.type, loading: false })
    })
    return () => {
      cancelled = true
      if (url) URL.revokeObjectURL(url)
    }
  }, [comprovanteId, active])

  return state
}
