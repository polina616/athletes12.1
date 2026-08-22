export function disciplineMeta(discipline: string): { unit: string; lowerIsBetter: boolean } {
  const d = discipline.toLowerCase()
  if (d.includes('бег') || d.includes('плавание')) return { unit: 'сек', lowerIsBetter: true }
  if (d.includes('стрельба')) return { unit: 'очки', lowerIsBetter: false }
  if (d.includes('скакалк')) return { unit: 'раз', lowerIsBetter: false }
  if (d.includes('прыж')) return { unit: 'см', lowerIsBetter: false }
  if (d.includes('толкание') || d.includes('метание')) return { unit: 'м', lowerIsBetter: false }
  return { unit: 'раз', lowerIsBetter: false } // пресс, приседания, подтягивания, отжимания, бурпи
}