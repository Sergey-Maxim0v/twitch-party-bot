import PageLayout from './components/layout/PageLayout.tsx'
import SocketProvider from './services/socket/context/SocketProvider.tsx'
import SocketInitializer from './services/socket/components/SocketInitializer.tsx'
import WelcomeScreen from './components/layout/WelcomeScreen.tsx'
import StreamerWorkspace from './components/layout/workspace/StreamerWorkspace.tsx'
import { AuthProvider } from './features/auth/context/AuthProvider.tsx'
import { ProtectedView } from './features/auth/components/ProtectedView.tsx'
import { AppLogsProvider } from './features/app-logs/context/AppLogsProvider.tsx'

//  TODO:
//   проверить:
//   -  проверить выделение никнейма
//   -  добавление в очередь
//   -  удаление из очереди
//   -  удаление из всех очередей
//   -  бан
//   -  лимиты игр
//   -  приоритет подписчиков

//  TODO:
//   - дебаунс на инпут настроек размера очереди, изменение настроек не на лету, а при смене фокуса
//   - хук логики обработки команд из чата
//   - хук отправки сообщений в чат по изменениям в очереди

function App() {
  return (
    <SocketProvider>
      <AuthProvider>
        <SocketInitializer />

        <PageLayout>
          <ProtectedView fallback={<WelcomeScreen />}>
            <AppLogsProvider>
              <StreamerWorkspace />
            </AppLogsProvider>
          </ProtectedView>
        </PageLayout>
      </AuthProvider>
    </SocketProvider>
  )
}

export default App
