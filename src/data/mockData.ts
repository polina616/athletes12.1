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

export const athletes: Athlete[] = [
  {
    id: 'a1',
    name: 'Алексей Петров',
    nameShort: 'А. Петров',
    birthDate: '2005-03-14',
    age: 19,
    gender: 'M',
    height: 186,
    weight: 80,
    armSpan: 191,
    legLength: 98,
    shoeSize: 44,
    phone: '+7 921 345-67-89',
    parents: 'Петров Иван Сергеевич',
    parentPhone: '+7 921 111-22-33',
    medicalNotes: 'Без ограничений',
    allergies: 'Нет',
    grade: 'КМС',
    group: 'Основная',
    trainingStart: '2018-09-01',
    favoriteEvent: '110 м с/б',
    goals: 'Выполнить норматив МС к концу сезона',
    coachComment: 'Отличная техника барьерного бега, нужно работать над прыжком с шестом',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=200&h=200&fit=crop&auto=format',
    specialization: 'decathlon',
  },
  {
    id: 'a2',
    name: 'Дмитрий Волков',
    nameShort: 'Д. Волков',
    birthDate: '2004-07-22',
    age: 20,
    gender: 'M',
    height: 182,
    weight: 76,
    armSpan: 187,
    legLength: 95,
    shoeSize: 43,
    phone: '+7 911 234-56-78',
    parents: 'Волкова Наталья Александровна',
    parentPhone: '+7 911 444-55-66',
    medicalNotes: 'Наблюдение за коленным суставом',
    allergies: 'Пыльца',
    grade: 'I разряд',
    group: 'Основная',
    trainingStart: '2019-01-15',
    favoriteEvent: '100 м',
    goals: 'Пробежать 100 м из 10.80',
    coachComment: 'Мощный спринтер, прекрасные физические данные',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=200&h=200&fit=crop&auto=format',
    specialization: 'decathlon',
  },
  {
    id: 'a3',
    name: 'Мария Соколова',
    nameShort: 'М. Соколова',
    birthDate: '2006-11-05',
    age: 18,
    gender: 'F',
    height: 174,
    weight: 62,
    armSpan: 177,
    legLength: 92,
    shoeSize: 39,
    phone: '+7 931 567-89-01',
    parents: 'Соколов Андрей Петрович',
    parentPhone: '+7 931 777-88-99',
    medicalNotes: 'Без ограничений',
    allergies: 'Нет',
    grade: 'КМС',
    group: 'Юниоры',
    trainingStart: '2020-03-01',
    favoriteEvent: '200 м',
    goals: 'Стать чемпионом России среди юниоров',
    coachComment: 'Лучшая техника в группе, работает над скоростной выносливостью',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?w=200&h=200&fit=crop&auto=format',
    specialization: 'heptathlon',
  },
  {
    id: 'a4',
    name: 'Игорь Смирнов',
    nameShort: 'И. Смирнов',
    birthDate: '2003-05-18',
    age: 21,
    gender: 'M',
    height: 190,
    weight: 92,
    armSpan: 197,
    legLength: 102,
    shoeSize: 46,
    phone: '+7 951 678-90-12',
    parents: 'Смирнов Сергей Игоревич',
    parentPhone: '+7 951 222-33-44',
    medicalNotes: 'Травма плеча 2022 г. — восстановлен',
    allergies: 'Нет',
    grade: 'МС',
    group: 'Основная',
    trainingStart: '2017-06-01',
    favoriteEvent: 'Толкание ядра',
    goals: 'Выход на международный уровень',
    coachComment: 'Лидер команды, образцовая дисциплина',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=200&h=200&fit=crop&auto=format',
    specialization: 'decathlon',
  },
  {
    id: 'a5',
    name: 'Анна Козлова',
    nameShort: 'А. Козлова',
    birthDate: '2007-02-28',
    age: 17,
    gender: 'F',
    height: 170,
    weight: 58,
    armSpan: 172,
    legLength: 88,
    shoeSize: 38,
    phone: '+7 901 345-67-89',
    parents: 'Козлова Елена Викторовна',
    parentPhone: '+7 901 555-66-77',
    medicalNotes: 'Без ограничений',
    allergies: 'Нет',
    grade: 'I разряд',
    group: 'Юниоры',
    trainingStart: '2021-09-01',
    favoriteEvent: 'Прыжок в высоту',
    goals: 'Преодолеть 1.75 м',
    coachComment: 'Талантливая прыгунья, перспективная многоборка',
    status: 'injured',
    photo: 'https://images.unsplash.com/photo-1509869175650-a1d97972541a?w=200&h=200&fit=crop&auto=format',
    specialization: 'heptathlon',
  },
  {
    id: 'a6',
    name: 'Павел Новиков',
    nameShort: 'П. Новиков',
    birthDate: '2005-08-11',
    age: 19,
    gender: 'M',
    height: 178,
    weight: 72,
    armSpan: 182,
    legLength: 93,
    shoeSize: 42,
    phone: '+7 961 890-12-34',
    parents: 'Новикова Ольга Михайловна',
    parentPhone: '+7 961 888-99-00',
    medicalNotes: 'Без ограничений',
    allergies: 'Нет',
    grade: 'II разряд',
    group: 'Юниоры',
    trainingStart: '2022-01-15',
    favoriteEvent: 'Прыжок в длину',
    goals: 'Выполнить норматив КМС',
    coachComment: 'Быстро прогрессирует, целеустремленный',
    status: 'active',
    photo: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?w=200&h=200&fit=crop&auto=format',
    specialization: 'decathlon',
  },
]

// World Athletics scoring tables coefficients (simplified)
export const decathlonEvents = [
  { id: '100m', name: '100 м', unit: 's', type: 'track', a: 25.4347, b: 18, c: 1.81 },
  { id: 'lj', name: 'Прыжок в длину', unit: 'm', type: 'field', a: 0.14354, b: 220, c: 1.4 },
  { id: 'sp', name: 'Толкание ядра', unit: 'm', type: 'field', a: 51.39, b: 1.5, c: 1.05 },
  { id: 'hj', name: 'Прыжок в высоту', unit: 'm', type: 'field', a: 0.8465, b: 75, c: 1.42 },
  { id: '400m', name: '400 м', unit: 's', type: 'track', a: 1.53775, b: 82, c: 1.81 },
  { id: '110h', name: '110 м с/б', unit: 's', type: 'track', a: 5.74352, b: 28.5, c: 1.92 },
  { id: 'dt', name: 'Метание диска', unit: 'm', type: 'field', a: 12.91, b: 4, c: 1.1 },
  { id: 'pv', name: 'Прыжок с шестом', unit: 'm', type: 'field', a: 0.2797, b: 100, c: 1.35 },
  { id: 'jt', name: 'Метание копья', unit: 'm', type: 'field', a: 10.14, b: 7, c: 1.08 },
  { id: '1500m', name: '1500 м', unit: 's', type: 'track', a: 0.03768, b: 480, c: 1.85 },
]

export const heptathlonEvents = [
  { id: '100h', name: '100 м с/б', unit: 's', type: 'track', a: 9.23076, b: 26.7, c: 1.835 },
  { id: 'hj', name: 'Прыжок в высоту', unit: 'm', type: 'field', a: 1.84523, b: 75, c: 1.348 },
  { id: 'sp', name: 'Толкание ядра', unit: 'm', type: 'field', a: 56.0211, b: 1.5, c: 1.05 },
  { id: '200m', name: '200 м', unit: 's', type: 'track', a: 4.99087, b: 42.5, c: 1.81 },
  { id: 'lj', name: 'Прыжок в длину', unit: 'm', type: 'field', a: 0.188807, b: 210, c: 1.41 },
  { id: 'jt', name: 'Метание копья', unit: 'm', type: 'field', a: 15.9803, b: 3.8, c: 1.04 },
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

export const results: Result[] = [
  // Alexey - 100m history
  { id: 'r1', athleteId: 'a1', date: '2024-03-01', discipline: '100 м', result: '11.23', resultValue: 11.23, unit: 's', location: 'Москва', type: 'test', wind: 0.3 },
  { id: 'r2', athleteId: 'a1', date: '2024-04-15', discipline: '100 м', result: '11.08', resultValue: 11.08, unit: 's', location: 'СПб', type: 'competition', wind: -0.2 },
  { id: 'r3', athleteId: 'a1', date: '2024-06-01', discipline: '100 м', result: '10.94', resultValue: 10.94, unit: 's', location: 'Москва', type: 'competition', wind: 1.1 },
  { id: 'r4', athleteId: 'a1', date: '2024-07-20', discipline: '100 м', result: '10.89', resultValue: 10.89, unit: 's', location: 'Казань', type: 'competition', wind: 0.8 },
  { id: 'r5', athleteId: 'a1', date: '2024-09-05', discipline: '100 м', result: '10.82', resultValue: 10.82, unit: 's', location: 'Москва', type: 'competition', wind: 0.5 },

  { id: 'r6', athleteId: 'a1', date: '2024-03-01', discipline: '110 м с/б', result: '14.52', resultValue: 14.52, unit: 's', location: 'Москва', type: 'test' },
  { id: 'r7', athleteId: 'a1', date: '2024-06-15', discipline: '110 м с/б', result: '14.21', resultValue: 14.21, unit: 's', location: 'СПб', type: 'competition' },
  { id: 'r8', athleteId: 'a1', date: '2024-08-10', discipline: '110 м с/б', result: '13.98', resultValue: 13.98, unit: 's', location: 'Москва', type: 'competition' },

  { id: 'r9', athleteId: 'a1', date: '2024-03-01', discipline: 'Прыжок в длину', result: '7.12', resultValue: 7.12, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r10', athleteId: 'a1', date: '2024-07-01', discipline: 'Прыжок в длину', result: '7.35', resultValue: 7.35, unit: 'm', location: 'СПб', type: 'competition' },
  { id: 'r11', athleteId: 'a1', date: '2024-09-15', discipline: 'Прыжок в длину', result: '7.48', resultValue: 7.48, unit: 'm', location: 'Москва', type: 'competition' },

  { id: 'r12', athleteId: 'a1', date: '2024-03-01', discipline: 'Толкание ядра', result: '13.45', resultValue: 13.45, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r13', athleteId: 'a1', date: '2024-08-01', discipline: 'Толкание ядра', result: '14.12', resultValue: 14.12, unit: 'm', location: 'Казань', type: 'competition' },

  { id: 'r14', athleteId: 'a1', date: '2024-03-15', discipline: 'Прыжок в высоту', result: '1.90', resultValue: 1.90, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r15', athleteId: 'a1', date: '2024-07-15', discipline: 'Прыжок в высоту', result: '1.96', resultValue: 1.96, unit: 'm', location: 'Москва', type: 'competition' },

  { id: 'r16', athleteId: 'a1', date: '2024-04-01', discipline: '400 м', result: '49.85', resultValue: 49.85, unit: 's', location: 'Москва', type: 'test' },
  { id: 'r17', athleteId: 'a1', date: '2024-08-20', discipline: '400 м', result: '48.92', resultValue: 48.92, unit: 's', location: 'СПб', type: 'competition' },

  { id: 'r18', athleteId: 'a1', date: '2024-05-01', discipline: 'Метание диска', result: '38.45', resultValue: 38.45, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r19', athleteId: 'a1', date: '2024-09-01', discipline: 'Метание диска', result: '41.20', resultValue: 41.20, unit: 'm', location: 'Москва', type: 'competition' },

  { id: 'r20', athleteId: 'a1', date: '2024-05-15', discipline: 'Прыжок с шестом', result: '4.40', resultValue: 4.40, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r21', athleteId: 'a1', date: '2024-09-10', discipline: 'Прыжок с шестом', result: '4.60', resultValue: 4.60, unit: 'm', location: 'Казань', type: 'competition' },

  { id: 'r22', athleteId: 'a1', date: '2024-06-01', discipline: 'Метание копья', result: '54.30', resultValue: 54.30, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r23', athleteId: 'a1', date: '2024-09-05', discipline: 'Метание копья', result: '57.80', resultValue: 57.80, unit: 'm', location: 'СПб', type: 'competition' },

  { id: 'r24', athleteId: 'a1', date: '2024-06-15', discipline: '1500 м', result: '253.4', resultValue: 253.4, unit: 's', location: 'Москва', type: 'test' },
  { id: 'r25', athleteId: 'a1', date: '2024-09-20', discipline: '1500 м', result: '248.6', resultValue: 248.6, unit: 's', location: 'СПб', type: 'competition' },

  // Dmitry results
  { id: 'r30', athleteId: 'a2', date: '2024-03-10', discipline: '100 м', result: '10.95', resultValue: 10.95, unit: 's', location: 'Москва', type: 'test', wind: 0.1 },
  { id: 'r31', athleteId: 'a2', date: '2024-05-20', discipline: '100 м', result: '10.85', resultValue: 10.85, unit: 's', location: 'СПб', type: 'competition', wind: 0.7 },
  { id: 'r32', athleteId: 'a2', date: '2024-07-15', discipline: '100 м', result: '10.78', resultValue: 10.78, unit: 's', location: 'Москва', type: 'competition', wind: 0.4 },
  { id: 'r33', athleteId: 'a2', date: '2024-09-01', discipline: '100 м', result: '10.72', resultValue: 10.72, unit: 's', location: 'Казань', type: 'competition', wind: 1.2 },

  { id: 'r34', athleteId: 'a2', date: '2024-04-01', discipline: '200 м', result: '21.45', resultValue: 21.45, unit: 's', location: 'Москва', type: 'test' },
  { id: 'r35', athleteId: 'a2', date: '2024-08-01', discipline: '200 м', result: '21.12', resultValue: 21.12, unit: 's', location: 'Москва', type: 'competition' },

  // Maria results
  { id: 'r40', athleteId: 'a3', date: '2024-03-15', discipline: '200 м', result: '24.12', resultValue: 24.12, unit: 's', location: 'Москва', type: 'test' },
  { id: 'r41', athleteId: 'a3', date: '2024-05-25', discipline: '200 м', result: '23.85', resultValue: 23.85, unit: 's', location: 'СПб', type: 'competition' },
  { id: 'r42', athleteId: 'a3', date: '2024-07-20', discipline: '200 м', result: '23.54', resultValue: 23.54, unit: 's', location: 'Москва', type: 'competition' },
  { id: 'r43', athleteId: 'a3', date: '2024-09-15', discipline: '200 м', result: '23.31', resultValue: 23.31, unit: 's', location: 'Казань', type: 'competition' },

  // Igor results
  { id: 'r50', athleteId: 'a4', date: '2024-02-20', discipline: 'Толкание ядра', result: '16.45', resultValue: 16.45, unit: 'm', location: 'Москва', type: 'test' },
  { id: 'r51', athleteId: 'a4', date: '2024-05-15', discipline: 'Толкание ядра', result: '17.12', resultValue: 17.12, unit: 'm', location: 'Москва', type: 'competition' },
  { id: 'r52', athleteId: 'a4', date: '2024-08-05', discipline: 'Толкание ядра', result: '17.65', resultValue: 17.65, unit: 'm', location: 'СПб', type: 'competition' },
]

export const competitions: Competition[] = [
  {
    id: 'c1',
    name: 'Чемпионат Москвы по многоборью',
    date: '2024-09-20',
    location: 'Москва, Лужники',
    organizer: 'Московская федерация лёгкой атлетики',
    athletes: ['a1', 'a4'],
    type: 'outdoor',
    level: 'regional',
  },
  {
    id: 'c2',
    name: 'Кубок России по лёгкой атлетике',
    date: '2024-08-10',
    location: 'Санкт-Петербург, Зенит Арена',
    organizer: 'ВФЛА',
    athletes: ['a1', 'a2', 'a4'],
    type: 'outdoor',
    level: 'national',
  },
  {
    id: 'c3',
    name: 'Зимний многоборный турнир',
    date: '2025-02-15',
    location: 'Москва, Олимпийский',
    organizer: 'ДСО Динамо',
    athletes: ['a1', 'a2', 'a3', 'a4', 'a6'],
    type: 'indoor',
    level: 'regional',
  },
  {
    id: 'c4',
    name: 'Первенство России U20',
    date: '2025-06-25',
    location: 'Чебоксары',
    organizer: 'ВФЛА',
    athletes: ['a3', 'a5', 'a6'],
    type: 'outdoor',
    level: 'national',
  },
]

export const trainings: Training[] = [
  {
    id: 't1',
    date: '2024-10-01',
    type: 'Скоростно-силовая',
    duration: 120,
    intensity: 'high',
    goal: 'Развитие стартовой скорости',
    athletes: ['a1', 'a2', 'a4', 'a6'],
    attended: ['a1', 'a2', 'a4'],
    notes: 'Акцент на выход со старта',
  },
  {
    id: 't2',
    date: '2024-10-03',
    type: 'Техническая',
    duration: 90,
    intensity: 'medium',
    goal: 'Техника барьерного бега',
    athletes: ['a1', 'a3'],
    attended: ['a1', 'a3'],
    notes: 'Работа над ритмом барьерного бега',
  },
  {
    id: 't3',
    date: '2024-10-05',
    type: 'Прыжковая',
    duration: 100,
    intensity: 'high',
    goal: 'Прыжок с шестом',
    athletes: ['a1', 'a6'],
    attended: ['a1'],
    notes: 'А6 - отсутствовал по болезни',
  },
  {
    id: 't4',
    date: '2024-10-08',
    type: 'ОФП',
    duration: 90,
    intensity: 'medium',
    goal: 'Общая физическая подготовка',
    athletes: ['a1', 'a2', 'a3', 'a4', 'a6'],
    attended: ['a1', 'a2', 'a3', 'a4', 'a6'],
    notes: 'Кроссфит-элементы, силовые упражнения',
  },
  {
    id: 't5',
    date: '2024-10-10',
    type: 'Метания',
    duration: 120,
    intensity: 'high',
    goal: 'Техника метания диска и копья',
    athletes: ['a1', 'a4'],
    attended: ['a1', 'a4'],
    notes: 'Хорошая тренировка',
  },
]

export const progressData = [
  { month: 'Янв', avg: 7340 },
  { month: 'Фев', avg: 7480 },
  { month: 'Мар', avg: 7520 },
  { month: 'Апр', avg: 7610 },
  { month: 'Май', avg: 7780 },
  { month: 'Июн', avg: 7850 },
  { month: 'Июл', avg: 7920 },
  { month: 'Авг', avg: 8040 },
  { month: 'Сен', avg: 8150 },
  { month: 'Окт', avg: 8220 },
]

export const disciplines = [
  '100 м', '200 м', '400 м', '800 м', '1500 м', '3000 м', '5000 м',
  '60 м', '30 м', '110 м с/б', '100 м с/б', '400 м с/б',
  'Прыжок в длину', 'Прыжок в высоту', 'Прыжок с места', 'Тройной прыжок', 'Прыжок с шестом',
  'Толкание ядра', 'Метание копья', 'Метание диска', 'Метание молота',
  'Подтягивания', 'Отжимания', 'Пресс (30с)', 'Планка',
]
