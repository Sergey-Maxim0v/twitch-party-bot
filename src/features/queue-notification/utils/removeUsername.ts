/** Удаляет ник из группы без учёта регистра; `null`, если совпадения нет. */
export const removeUsername = (members: Set<string>, normalizedUsername: string): Set<string> | null => {
  let hasMatch = false
  const nextMembers = new Set<string>()

  members.forEach(nickname => {
    if (nickname.toLowerCase() === normalizedUsername) {
      hasMatch = true
      return
    }

    nextMembers.add(nickname)
  })

  return hasMatch ? nextMembers : null
}
