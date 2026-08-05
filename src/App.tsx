import {AuthProvider, ProtectedView} from "./features/auth";
import PageLayout from "./components/layout/PageLayout.tsx";
import SocketProvider from "./services/socket/context/SocketProvider.tsx";
import SocketInitializer from "./services/socket/components/SocketInitializer.tsx";
import WelcomeScreen from "./components/layout/WelcomeScreen.tsx";
import StreamerWorkspace from "./components/layout/StreamerWorkspace.tsx";

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
