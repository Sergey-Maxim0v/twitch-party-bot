import PageLayout from "./components/layout/PageLayout.tsx";
import SocketProvider from "./services/socket/context/SocketProvider.tsx";
import SocketInitializer from "./services/socket/components/SocketInitializer.tsx";
import WelcomeScreen from "./components/layout/WelcomeScreen.tsx";
import StreamerWorkspace from "./components/layout/StreamerWorkspace.tsx";
import {AuthProvider} from "./features/auth/context/AuthProvider.tsx";
import {ProtectedView} from "./features/auth/components/ProtectedView.tsx";

// TODO:
//  - ники в чате с учетом регистров (displayed name)
//  - время в чате до секунды
//  - связать приложение между вкладками (если открыть в нескольких вкладках)

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
