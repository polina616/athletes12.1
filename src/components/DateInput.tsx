import { useState, useEffect, useRef } from 'react'

interface DateInputProps {
  value: string | undefined // ISO-формат yyyy-mm-dd, или '' / undefined
  onChange: (isoValue: string) => void
  style?: React.CSSProperties
  placeholder?: string
}

function isoToDisplay(iso: string): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  if (!y || !m || !d) return ''
  return `${d}.${m}.${y}`
}

function displayToIso(display: string): string | null {
  const match = display.match(/^(\d{2})\.(\d{2})\.(\d{4})$/)
  if (!match) return null
  const [, d, m, y] = match
  const day = Number(d)
  const month = Number(m)
  const year = Number(y)
  if (month < 1 || month > 12) return null
  const daysInMonth = new Date(year, month, 0).getDate()
  if (day < 1 || day > daysInMonth) return null
  return `${y}-${m}-${d}`
}

// Оставляет только цифры (максимум 8: ддммгггг) и расставляет точки после дня и месяца
function normalizeInput(raw: string): string {
  const digitsOnly = raw.replace(/\D/g, '').slice(0, 8)
  let out = ''
  for (let i = 0; i < digitsOnly.length; i++) {
    out += digitsOnly[i]
    if (i === 1 || i === 3) out += '.'
  }
  return out
}

export default function DateInput({ value, onChange, style, placeholder = 'дд.мм.гггг' }: DateInputProps) {
  const [display, setDisplay] = useState(() => isoToDisplay(value ?? ''))
  const isFocused = useRef(false)

  useEffect(() => {
    if (!isFocused.current) {
      setDisplay(isoToDisplay(value ?? ''))
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = normalizeInput(e.target.value)
    setDisplay(next)
    const iso = displayToIso(next)
    if (iso) onChange(iso)
  }

  const handleFocus = () => { isFocused.current = true }

    const handleBlur = () => {
    isFocused.current = false
    const iso = displayToIso(display)
    if (iso) {
      onChange(iso)
      setDisplay(isoToDisplay(iso))
    } else if (display === '') {
      onChange('')
    } else {
      // неполная/невалидная дата при потере фокуса — откатываем к последнему валидному значению
      setDisplay(isoToDisplay(value ?? ''))
    }
  }

  return (
    <input
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={display}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      style={style}
    />
  )
}