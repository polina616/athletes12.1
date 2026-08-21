export interface Athlete {
  id: string
  name: string
  nameShort: string
  birthDate: string
  age: number
  gender: 'M' | 'F'
  height: number
  weight: number
  armSpan: number
  legLength: number
  shoeSize: number
  phone: string
  parents: string
  parentPhone: string
  medicalNotes: string
  allergies: string
  grade: string
  group: string
  trainingStart: string
  favoriteEvent: string
  goals: string
  coachComment: string
  status: 'active' | 'injured' | 'inactive'
  photo: string
  specialization: 'decathlon' | 'heptathlon' | 'sprints' | 'jumps' | 'throws' | 'distance'
}

export interface Result {
  id: string
  athleteId: string
  date: string
  discipline: string
  result: string
  resultValue: number
  unit: string
  location: string
  type: 'training' | 'competition' | 'test'
  wind?: number
  surface?: string
  shoes?: string
  comment?: string
  weather?: string
  feeling?: number
  rpe?: number
}

export interface Competition {
  id: string
  name: string
  date: string
  location: string
  organizer: string
  athletes: string[]
  type: 'indoor' | 'outdoor' | 'road'
  level: 'regional' | 'national' | 'international'
}

export interface Training {
  id: string
  date: string
  type: string
  duration: number
  intensity: 'low' | 'medium' | 'high' | 'max'
  goal: string
  athletes: string[]
  attended: string[]
  notes: string
}

// World Athletics scoring tables coefficients (simplified)
export const decathlonEvents = [
  { id: '100m', name: '100 м', unit: 's', type: 'track', a: 25.4347, b: 18, c: 1.81 },
  { id: 'lj', name: 'Прыжок в длину', unit: 'm', type: 'field', a: 0.14354, b: 220, c: 1.4 },
  { id: 'sp', name: 'Толкание ядра', unit: 'м', type: 'field', a: 51.39, b: 1.5, c: 1.05 },
  { id: 'hj', name: 'Прыжок в высоту', unit: 'м', type: 'field', a: 0.8465, b: 75, c: 1.42 },
  { id: '400m', name: '400 м', unit: 's', type: 'track', a: 1.53775, b: 82, c: 1.81 },
  { id: '110h', name: '110 м с/б', unit: 's', type: 'track', a: 5.74352, b: 28.5, c: 1.92 },
  { id: 'dt', name: 'Метание диска', unit: 'м', type: 'field', a: 12.91, b: 4, c: 1.1 },
  { id: 'pv', name: 'Прыжок с шестом', unit: 'м', type: 'field', a: 0.2797, b: 100, c: 1.35 },
  { id: 'jt', name: 'Метание копья', unit: 'м', type: 'field', a: 10.14, b: 7, c: 1.08 },
  { id: '1500m', name: '1500 м', unit: 's', type: 'track', a: 0.03768, b: 480, c: 1.85 },
]

export const heptathlonEvents = [
  { id: '100h', name: '100 м с/б', unit: 's', type: 'track', a: 9.23076, b: 26.7, c: 1.835 },
  { id: 'hj', name: 'Прыжок в высоту', unit: 'м', type: 'field', a: 1.84523, b: 75, c: 1.348 },
  { id: 'sp', name: 'Толкание ядра', unit: 'м', type: 'field', a: 56.0211, b: 1.5, c: 1.05 },
  { id: '200m', name: '200 м', unit: 's', type: 'track', a: 4.99087, b: 42.5, c: 1.81 },
  { id: 'lj', name: 'Прыжок в длину', unit: 'м', type: 'field', a: 0.188807, b: 210, c: 1.41 },
  { id: 'jt', name: 'Метание копья', unit: 'м', type: 'field', a: 15.9803, b: 3.8, c: 1.04 },
  { id: '800m', name: '800 м', unit: 's', type: 'track', a: 0.11193, b: 254, c: 1.88 },
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