import {PageLayout} from "./components/layout/PageLayout.tsx";
import {AuthProvider, ProtectedView} from "./features/auth";
import {WelcomeScreen} from "./components/layout/WelcomeScreen.tsx";
import {SocketProvider} from "./services/socket/context/SocketProvider.tsx";
import {SocketInitializer} from "./services/socket/components/SocketInitializer.tsx";
import {StreamerWorkspace} from "./components/layout/StreamerWorkspace.tsx";

// TODO:
//   системные сообщения о банах не регулируются чекбоксом.
//   выделенные сообщения.
//   в верстке чат не отдельным блоком, а один из 4х:
//   настройки очереди, очередь, логи очереди, общий чат.
//   закрытие модалки выбора канала без изменения состояний приложения.
//   обработка несуществующего канала.
//   логика если бот в муте / бане.
//   QueuePanel.
//   сохранение настроек очереди в файл, проверка с библиотекой zod.

function App() {
    return (
        <SocketProvider>
            <AuthProvider>
                <SocketInitializer/>

                <PageLayout>
                    <ProtectedView fallback={<WelcomeScreen/>}>
                        <StreamerWorkspace/>
                    </ProtectedView>
                </PageLayout>
            </AuthProvider>
        </SocketProvider>
    );
}

export default App;
