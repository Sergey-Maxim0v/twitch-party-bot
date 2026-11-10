interface FormatNotificationPartArgs {
  /** Заголовок группы участников. */
  title: string;
  /** Никнеймы участников группы. */
  members: string[];
  /** Максимальное количество отображаемых участников. */
  limit: number;
}

/**
 * Форматирует отдельную группу участников для уведомления.
 */
export const formatNotificationPart = (
  { title, members, limit }: FormatNotificationPartArgs): string => {
  if (limit <= 0 || members.length === 0) {
    return ''
  }

  const visibleMembers = members.slice(0, limit).join(', ')
  const hiddenCount = members.length - limit

  return `${title}: ${visibleMembers}${hiddenCount > 0 ? ` +${hiddenCount}` : ''}`
}
