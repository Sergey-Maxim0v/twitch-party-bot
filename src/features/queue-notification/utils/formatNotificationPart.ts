export interface FormatNotificationPartArgs {
  title: string;
  members: string[];
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
