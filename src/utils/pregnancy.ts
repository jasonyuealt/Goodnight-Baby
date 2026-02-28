/** 根据预产期计算孕期天数，无效返回 null */
export function getPregnancyDays(dueDate: string): number | null {
  if (!dueDate) return null
  const due = new Date(dueDate)
  const now = new Date()
  const diffMs = due.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  const days = 280 - daysLeft
  if (days < 0 || days > 300) return null
  return days
}

/** 根据预产期计算孕周数，无效返回 null */
export function getPregnancyWeeks(dueDate: string): number | null {
  const days = getPregnancyDays(dueDate)
  if (days == null) return null
  return Math.floor(days / 7)
}
