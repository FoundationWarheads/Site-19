import { useState } from 'react'
import { useStore } from '../store'
import { cycleVoice, resetVoice, currentVoiceName } from '../lib/tts'

/**
 * Slim fixed text bar at the bottom of the screen.
 *
 * Calls the same `respond()` that the voice loop uses, so typed messages go
 * through the exact same path: user turn logged, phase moves to thinking,
 * bridge replies, TTS fires. Visible whenever the terminal is live (not during
 * boot or before power-on). Submits on Enter or the SEND button.
 *
 * Also houses the VOC button — cycles through available TTS voices. Keeps the
 * V-key shortcut from being swallowed when this input has focus.
 */
export function TextInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const phase = useStore((s) => s.phase)
  const setVoice = useStore((s) => s.setVoice)
  const voice = useStore((s) => s.voice)
  const [value, setValue] = useState('')

  if (phase === 'offline' || phase === 'boot') return null

  const busy = phase === 'thinking' || phase === 'tooling' || phase === 'speaking'

  const submit = () => {
    const text = value.trim()
    if (!text || busy) return
    setValue('')
    onSubmit(text)
  }

  const handleVoc = () => {
    const name = cycleVoice()
    setVoice(name)
  }

  const handleReset = () => {
    const name = resetVoice()
    setVoice(name)
  }

  // Short label: first word of the voice name, strip parens
  const vocLabel = (voice || currentVoiceName())
    .replace(/\(.*?\)/g, '')
    .trim()
    .split(' ')[0]
    .toUpperCase()
    .slice(0, 7) || 'VOC'

  return (
    <div className="txt-bar">
      <input
        className="txt-input"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { submit(); return }
          // Forward bare V to the global shortcut even when input is focused
          if (e.key === 'v' && !e.metaKey && !e.ctrlKey && !e.altKey && !e.repeat) {
            e.preventDefault()
            handleVoc()
          }
        }}
        placeholder="ENTER DIRECTIVE…"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        className="txt-send"
        style={{ letterSpacing: '0.12em', opacity: 0.7 }}
        title="Cycle voice (V)"
        onClick={handleVoc}
      >
        {vocLabel}
      </button>
      <button
        className="txt-send"
        style={{ letterSpacing: '0.12em', opacity: 0.5 }}
        title="Reset to default voice"
        onClick={handleReset}
      >
        RST
      </button>
      <button className="txt-send" onClick={submit} disabled={busy}>
        SEND
      </button>
    </div>
  )
}
