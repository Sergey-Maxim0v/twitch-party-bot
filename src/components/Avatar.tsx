import { type FC } from 'react'

interface AvatarProps {
  /** Ссылка на изображение аватара. */
  src: string;
  /** Альтернативный текст изображения. */
  alt: string;
  /** CSS-классы обводки аватара. */
  ringClassName?: string;
}

/**
 * Круглый аватар канала или пользователя.
 */
export const Avatar: FC<AvatarProps> = ({ src, alt, ringClassName = 'ring-base-content/20' }) => (
  <div className="avatar shrink-0">
    <div className={`w-4 h-4 rounded-full ring-1 ${ringClassName} overflow-hidden`}>
      <img
        alt={alt}
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
        src={src}
      />
    </div>
  </div>
)
