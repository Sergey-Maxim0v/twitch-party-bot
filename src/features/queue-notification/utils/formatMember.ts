interface FormatMemberArgs {
  /** Маркер статуса; пустая строка означает отсутствие маркера. */
  mark?: string;
  /** Никнейм без символа `@`. */
  nickname: string;
}

/**
 * Возвращает упоминание участника с необязательным маркером статуса.
 */
export const formatMember = ({ mark, nickname }: FormatMemberArgs): string => (
  mark ? `${mark} @${nickname}` : `@${nickname}`
)
