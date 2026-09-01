import PageLayout from './components/layout/PageLayout.tsx'
import SocketProvider from './services/socket/context/SocketProvider.tsx'
import SocketInitializer from './services/socket/components/SocketInitializer.tsx'
import WelcomeScreen from './components/layout/WelcomeScreen.tsx'
import StreamerWorkspace from './components/layout/StreamerWorkspace.tsx'
import { AuthProvider } from './features/auth/context/AuthProvider.tsx'
import { ProtectedView } from './features/auth/components/ProtectedView.tsx'
import { AppLogsProvider } from './features/app-logs/context/AppLogsProvider.tsx'

//  TODO:
//   -  добавление в очередь через приложение без открытия очереди
//   -  в лог открытия очереди добавить инфо об открывающем
//   -  в лог закрытия очереди добавить инфо об закрывающем
//   -  в лог добавления в очередь добавить инфо об добавляющем (из приложения, остальные проверить)
//   -  добавление в очередь из приложения с клавиатуры интер, и сразу фокус на инпут никнейма для добавления следующего

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
