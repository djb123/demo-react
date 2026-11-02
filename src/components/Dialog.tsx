import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { X } from 'lucide-react'

export function Dialog({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null)
  useEffect(() => { ref.current?.showModal() }, [])
  return <dialog ref={ref} className={`modal ${className}`} aria-label={title} onCancel={onClose} onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); onClose() } }} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
    <div className="modal-box">
      <button className="btn btn-circle btn-ghost close-dialog" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
      {children}
    </div>
  </dialog>
}
