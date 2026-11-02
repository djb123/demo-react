import { useEffect, useState } from 'react'
import { cardById } from './data'

const key = 'leadership-cards.session.v1'
interface Session { title: string; notes: string; selected: string[] }
const empty: Session = { title: '', notes: '', selected: [] }

function load(): { session: Session; error: string } {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return { session: empty, error: '' }
    const data: unknown = JSON.parse(raw)
    if (!data || typeof data !== 'object' || !('title' in data) || typeof data.title !== 'string' || !('notes' in data) || typeof data.notes !== 'string' || !('selected' in data) || !Array.isArray(data.selected)) throw new Error('Invalid session')
    return { session: { title: data.title, notes: data.notes, selected: [...new Set(data.selected.filter((id): id is string => typeof id === 'string' && cardById.has(id)))] }, error: '' }
  } catch { return { session: empty, error: 'Your saved session could not be loaded. You can still use the deck and export your notes.' } }
}

export function useSession() {
  const [initial] = useState(load)
  const [session, setSession] = useState(initial.session)
  const [storageError, setStorageError] = useState(initial.error)
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(session)) }
    catch { setStorageError('Browser storage is unavailable. Export your session to keep a copy.') }
  }, [session])
  const toggle = (id: string) => setSession(previous => ({ ...previous, selected: previous.selected.includes(id) ? previous.selected.filter(value => value !== id) : [...previous.selected, id] }))
  const reset = () => setSession({ ...empty, selected: [] })
  const exportSession = () => {
    const content = [`# ${session.title || 'My leadership session'}`, '', `Exported ${new Date().toLocaleDateString()}`, '', '## Selected cards', ...session.selected.flatMap((id, index) => {
      const card = cardById.get(id)!
      return ['', `### ${index + 1}. ${card.title} (${card.category})`, '', ...card.front.map(section => section.text), '', ...card.back.map(section => `${section.heading ? `${section.heading}\n` : ''}${section.text}`)]
    }), '', '## My notes & next steps', '', session.notes || 'No notes yet.', '', 'Card content: If This, Then That — Cards for Leaders, Complete Leadership Academy.'].join('\n')
    const url = URL.createObjectURL(new Blob([content], { type: 'text/markdown;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `leadership-session-${new Date().toISOString().slice(0, 10)}.md`
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
  return { session, setSession, toggle, reset, exportSession, storageError }
}
