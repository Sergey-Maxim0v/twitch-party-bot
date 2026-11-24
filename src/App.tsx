import { PageLayout } from './components/layout/PageLayout.tsx'
import { SocketProvider } from './services/socket/context/SocketProvider.tsx'
import { SocketInitializer } from './services/socket/components/SocketInitializer.tsx'
import { WelcomeScreen } from './components/layout/WelcomeScreen.tsx'
import { StreamerWorkspace } from './components/layout/workspace/StreamerWorkspace.tsx'
import { AuthProvider } from './features/auth/context/AuthProvider.tsx'
import { ProtectedView } from './features/auth/components/ProtectedView.tsx'
import { ChannelInfoProvider } from './features/channel-info/context/ChannelInfoProvider.tsx'
import { AppLogsProvider } from './features/app-logs/context/AppLogsProvider.tsx'
import { QueueSettingsProvider } from './features/queue-settings/context/QueueSettingsProvider.tsx'
import { QueueProvider } from './features/queue/context/QueueProvider.tsx'
import { TwitchChatProvider } from './services/twitch/context/TwitchChatProvider.tsx'
import { QueueNotificationProvider } from './features/queue-notification/context/QueueNotificationProvider.tsx'

export const App = () => (
  <SocketProvider>
    <AuthProvider>
      <SocketInitializer />

      <ChannelInfoProvider>
        <PageLayout>
          <AppLogsProvider>
            <ProtectedView fallback={<WelcomeScreen />}>
              <QueueSettingsProvider>
                <TwitchChatProvider>
                  <QueueNotificationProvider>
                    <QueueProvider>
                      <StreamerWorkspace />
                    </QueueProvider>
                  </QueueNotificationProvider>
                </TwitchChatProvider>
              </QueueSettingsProvider>
            </ProtectedView>
          </AppLogsProvider>
        </PageLayout>
      </ChannelInfoProvider>
    </AuthProvider>
  </SocketProvider>
)
