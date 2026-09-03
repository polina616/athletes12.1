// Реальные типы Athlete/Result/Injury живут в src/contexts/Athletescontext.tsx —
// именно оттуда их и нужно импортировать в компонентах.
// Здесь остаются только вычислительные таблицы очков и справочники,
// которые не привязаны к структуре БД.

export type EventCategory = 'sprint' | 'hurdles' | 'jumps' | 'vault' | 'throws' | 'endurance'

export const decathlonEvents = [
  { id: '100m', name: '100 м', unit: 's', type: 'track', category: 'sprint' as EventCategory, a: 25.4347, b: 18, c: 1.81 },
  { id: 'lj', name: 'Прыжок в длину', unit: 'm', type: 'field', category: 'jumps' as EventCategory, a: 0.14354, b: 220, c: 1.4 },
  { id: 'sp', name: 'Толкание ядра', unit: 'м', type: 'field', category: 'throws' as EventCategory, a: 51.39, b: 1.5, c: 1.05 },
  { id: 'hj', name: 'Прыжок в высоту', unit: 'м', type: 'field', category: 'jumps' as EventCategory, a: 0.8465, b: 75, c: 1.42 },
  { id: '400m', name: '400 м', unit: 's', type: 'track', category: 'sprint' as EventCategory, a: 1.53775, b: 82, c: 1.81 },
  { id: '110h', name: '110 м с/б', unit: 's', type: 'track', category: 'hurdles' as EventCategory, a: 5.74352, b: 28.5, c: 1.92 },
  { id: 'dt', name: 'Метание диска', unit: 'м', type: 'field', category: 'throws' as EventCategory, a: 12.91, b: 4, c: 1.1 },
  { id: 'pv', name: 'Прыжок с шестом', unit: 'м', type: 'field', category: 'vault' as EventCategory, a: 0.2797, b: 100, c: 1.35 },
  { id: 'jt', name: 'Метание копья', unit: 'м', type: 'field', category: 'throws' as EventCategory, a: 10.14, b: 7, c: 1.08 },
  { id: '1500m', name: '1500 м', unit: 's', type: 'track', category: 'endurance' as EventCategory, a: 0.03768, b: 480, c: 1.85 },
]

export const heptathlonEvents = [
  { id: '100h', name: '100 м с/б', unit: 's', type: 'track', category: 'hurdles' as EventCategory, a: 9.23076, b: 26.7, c: 1.835 },
  { id: 'hj', name: 'Прыжок в высоту', unit: 'м', type: 'field', category: 'jumps' as EventCategory, a: 1.84523, b: 75, c: 1.348 },
  { id: 'sp', name: 'Толкание ядра', unit: 'м', type: 'field', category: 'throws' as EventCategory, a: 56.0211, b: 1.5, c: 1.05 },
  { id: '200m', name: '200 м', unit: 's', type: 'track', category: 'sprint' as EventCategory, a: 4.99087, b: 42.5, c: 1.81 },
  { id: 'lj', name: 'Прыжок в длину', unit: 'м', type: 'field', category: 'jumps' as EventCategory, a: 0.188807, b: 210, c: 1.41 },
  { id: 'jt', name: 'Метание копья', unit: 'м', type: 'field', category: 'throws' as EventCategory, a: 15.9803, b: 3.8, c: 1.04 },
  { id: '800m', name: '800 м', unit: 's', type: 'track', category: 'endurance' as EventCategory, a: 0.11193, b: 254, c: 1.88 },
]

export function calcDecathlonPoints(event: typeof decathlonEvents[0], result: number): number {
  const { a, b, c, type } = event
  if (type === 'track') {
    return Math.floor(a * Math.pow(Math.max(0, b - result), c))
  } else {
    return Math.floor(a * Math.pow(Math.max(0, result * 100 - b), c))
  }
}

// Список дисциплин для выбора
export const disciplines = [
  '100 м', '200 м', '400 м', '800 м', '1500 м', '3000 м', '5000 м',
  '60 м', '30 м', '110 м с/б', '100 м с/б', '400 м с/б',
  'Прыжок в длину', 'Прыжок в высоту', 'Прыжок с места', 'Тройной прыжок', 'Прыжок с шестом',
  'Толкание ядра', 'Метание копья', 'Метание диска', 'Метание молота',
  'Подтягивания', 'Отжимания', 'Пресс (30с)', 'Планка',
]