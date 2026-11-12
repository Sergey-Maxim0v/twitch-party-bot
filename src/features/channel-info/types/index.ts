/**
 * Роли аккаунта бота в текущем канале.
 */
export interface ChannelRoles {
  /** Аккаунт является владельцем канала (стримером). */
  isBroadcaster: boolean;

  /** Аккаунт является модератором канала. */
  isModerator: boolean;

  /** Аккаунт является VIP-пользователем канала. */
  isVip: boolean;

  /** Аккаунт является подписчиком канала. */
  isSubscriber: boolean;
}

/**
 * Ограничение доступа к чату текущего канала.
 */
export interface ChannelRestriction {
  /** Тег ROOMSTATE, по которому пришло ограничение. */
  tag: string;

  /** Короткое название ограничения для интерфейса. */
  title: string;

  /** Подробное описание ограничения. */
  description: string;
}
