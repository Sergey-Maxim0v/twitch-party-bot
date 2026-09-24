import PageLayout from './components/layout/PageLayout.tsx'
import SocketProvider from './services/socket/context/SocketProvider.tsx'
import SocketInitializer from './services/socket/components/SocketInitializer.tsx'
import WelcomeScreen from './components/layout/WelcomeScreen.tsx'
import StreamerWorkspace from './components/layout/workspace/StreamerWorkspace.tsx'
import { AuthProvider } from './features/auth/context/AuthProvider.tsx'
import { ProtectedView } from './features/auth/components/ProtectedView.tsx'
import { AppLogsProvider } from './features/app-logs/context/AppLogsProvider.tsx'
import { QueueSettingsProvider } from './features/queue-settings/context/QueueSettingsProvider.tsx'
import { QueueProvider } from './features/queue/context/QueueProvider.tsx'
import { TwitchChatProvider } from './services/twitch/context/TwitchChatProvider.tsx'

//  TODO:
//   проверить:
//   -  проверить выделение никнейма
//   -  добавление в очередь
//   -  удаление из очереди
//   -  удаление из всех очередей
//   -  бан
//   -  лимиты игр
//   -  приоритет подписчиков
//   -  все команды чата
//   -  изменение команд для чата

//  TODO:
//   - заменить блюр под модалкой авторизации на полупрозрачный фон и проверить чтоб так же под модалкой подробностей
//   - при команде !show сообщение в чат отправляется, в приложении не отображается
//   - добавить команду !play для чата (перевод активной очереди в историю)
//   - хук отправки сообщений в чат по изменениям в очереди

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <SocketInitializer />

        <PageLayout>
          <ProtectedView fallback={<WelcomeScreen />}>
            <AppLogsProvider>
              <TwitchChatProvider>
                <QueueSettingsProvider>
                  <QueueProvider>
                    <StreamerWorkspace />
                  </QueueProvider>
                </QueueSettingsProvider>
              </TwitchChatProvider>
            </AppLogsProvider>
          </ProtectedView>
        </PageLayout>
      </AuthProvider>
    </SocketProvider>
  )
}

export default App
