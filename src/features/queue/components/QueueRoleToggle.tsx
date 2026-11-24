import { type FC } from 'react'

interface QueueRoleToggleProps {
  /** Подпись роли. */
  label: string;
  /** Включена ли роль. */
  checked: boolean;
  /** CSS-классы цветового варианта переключателя. */
  toggleClassName: string;
  /** Обработчик изменения состояния роли. */
  onChange: (checked: boolean) => void;
}

/**
 * Переключатель роли участника в форме добавления игрока.
 */
export const QueueRoleToggle: FC<QueueRoleToggleProps> = ({
  label,
  checked,
  toggleClassName,
  onChange,
}) => (
  <label
    className="flex flex-1 cursor-pointer select-none items-center justify-center gap-1.5 rounded-xl
      border border-base-300/70 bg-base-100/40 px-2 py-1.5 text-[11px] font-semibold
      text-base-content/50 transition-all hover:border-base-content/20 hover:text-base-content/70
      has-[:checked]:border-primary/40 has-[:checked]:bg-primary/10 has-[:checked]:text-base-content"
  >
    <span>{label}</span>
    <input
      checked={checked}
      className={`toggle ${toggleClassName} toggle-xs`}
      onChange={e => onChange(e.target.checked)}
      type="checkbox"
    />
  </label>
)
