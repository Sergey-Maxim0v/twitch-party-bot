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
//   -  будущие очереди
//   -  отправка сообщений в чат при изменении очереди согласно настройкам

//  TODO:
//   - при ручном добавлении одинаковых ников, переносить дублер в будущую
//   - при команде !show сообщение в чат отправляется, в приложении не отображается
//   - вынести в объект распарсенного сообщения isMod isVip и все остальное что может потребоваться
//   - добавление несколько раз в будущую очередь
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
              <QueueSettingsProvider>
                <TwitchChatProvider>
                  <QueueProvider>
                    <StreamerWorkspace />
                  </QueueProvider>
                </TwitchChatProvider>
              </QueueSettingsProvider>
            </AppLogsProvider>
          </ProtectedView>
        </PageLayout>
      </AuthProvider>
    </SocketProvider>
  )
}

export default App
