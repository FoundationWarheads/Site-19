import { useState } from 'react'
import { useStore } from '../store'

/**
 * Slim fixed text bar at the bottom of the screen.
 *
 * Calls the same `respond()` that the voice loop uses, so typed messages go
 * through the exact same path: user turn logged, phase moves to thinking,
 * bridge replies, TTS fires. Visible whenever the terminal is live (not during
 * boot or before power-on). Submits on Enter or the SEND button.
 */
export function TextInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const phase = useStore((s) => s.phase)
  const [value, setValue] = useState('')

  if (phase === 'offline' || phase === 'boot') return null

  const busy = phase === 'thinking' || phase === 'tooling' || phase === 'speaking'

  const submit = () => {
    const text = value.trim()
    if (!text || busy) return
    setValue('')
    onSubmit(text)
  }

  return (
    <div className="txt-bar">
      <input
        className="txt-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
        placeholder="ENTER DIRECTIVE…"
        autoComplete="off"
        spellCheck={false}
      />
      <button className="txt-send" onClick={submit} disabled={busy}>
        SEND
      </button>
    </div>
  )
}
