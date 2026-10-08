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
//   -  выделение игрового никнейма (регуляркой)
//   -  лимиты игр
//   -  добавление в очередь
//   -  удаление из очереди
//   -  удаление из всех очередей
//   -  бан
//   -  приоритет подписчиков
//   -  все команды чата
//   -  изменение команд для чата
//   -  список ожидающих
//   -  отправка сообщений в чат при изменении очереди согласно настройкам

//  TODO:
//   - при командах в чат из приложения (/mod) ничего не отображается, при отправке следующего сообщения, всместо следующего отображается первое (/mod)
//   - хук или метод в провайдере twichChat сбора накопления и отправки комплексного сообщения в чат твича
//   - README
//   - привести в порядок код

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
