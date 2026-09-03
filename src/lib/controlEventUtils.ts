export function disciplineMeta(discipline: string): { unit: string; lowerIsBetter: boolean } {
  const d = discipline.toLowerCase()
  if (d.includes('бег') || d.includes('плавание')) return { unit: 'сек', lowerIsBetter: true }
  if (d.includes('стрельба')) return { unit: 'очки', lowerIsBetter: false }
  if (d.includes('скакалк')) return { unit: 'раз', lowerIsBetter: false }
  if (d.includes('прыж')) return { unit: 'см', lowerIsBetter: false }
  if (d.includes('толкание') || d.includes('метание')) return { unit: 'м', lowerIsBetter: false }
  return { unit: 'раз', lowerIsBetter: false } // пресс, приседания, подтягивания, отжимания, бурпи
}

/**
 * Определяет отображаемую категорию произвольной дисциплины (не только многоборье) —
 * используется для группировки в списке результатов спортсмена.
 * Порядок проверок повторяет disciplineMeta и группы в ControlEvents.tsx:
 * "Прыжки на скакалке" — это силовое/гимнастическое упражнение, а не прыжковая дисциплина,
 * поэтому проверка на "скакалк" обязательно идёт раньше проверки на "прыж".
 */
export function categorizeDiscipline(discipline: string): string {
  const d = discipline.toLowerCase()
  if (d.includes('бег')) return 'Бег'
  if (d.includes('плавание')) return 'Плавание'
  if (d.includes('стрельба')) return 'Стрельба'
  if (d.includes('скакалк')) return 'Сила и гимнастика'
  if (d.includes('прыж')) return 'Прыжки'
  if (d.includes('толкание') || d.includes('метание')) return 'Метания'
  return 'Сила и гимнастика' // пресс, приседания, подтягивания, отжимания, бурпи и т.п.
}

/** Порядок отображения категорий в сгруппированном списке результатов. */
export const DISCIPLINE_CATEGORY_ORDER = ['Бег', 'Прыжки', 'Метания', 'Плавание', 'Стрельба', 'Сила и гимнастика']