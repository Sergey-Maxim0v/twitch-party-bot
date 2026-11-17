import { type FC } from 'react'
import { LuShieldAlert } from 'react-icons/lu'
import { FRAME_GUARD_LINK_ATTRS, FRAME_GUARD_UI_MESSAGES } from '../constants/security.constants.ts'

/**
 * Экран блокировки приложения, открытого внутри iframe.
 */
export const FrameBlockedScreen: FC = () => (
  <div className="flex h-screen items-center justify-center bg-base-100 p-6 text-base-content">
    <div className="max-w-md text-center flex flex-col items-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-warning/10 flex items-center justify-center text-warning mb-2">
        <LuShieldAlert className="text-4xl" />
      </div>

      <h1 className="text-2xl font-black tracking-tight">
        {FRAME_GUARD_UI_MESSAGES.TITLE}
      </h1>

      <p className="text-sm text-base-content/60 leading-relaxed max-w-sm">
        {FRAME_GUARD_UI_MESSAGES.DESCRIPTION}
      </p>

      <a
        className="btn btn-primary mt-2"
        href={window.location.href}
        rel={FRAME_GUARD_LINK_ATTRS.REL}
        target={FRAME_GUARD_LINK_ATTRS.TARGET}
      >
        {FRAME_GUARD_UI_MESSAGES.OPEN_IN_NEW_TAB}
      </a>
    </div>
  </div>
)
