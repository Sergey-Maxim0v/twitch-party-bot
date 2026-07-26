import {PageLayout} from "./components/layout/PageLayout.tsx";
import {AuthContextProvider, ProtectedView} from "./features/auth";
import {WelcomeScreen} from "./components/layout/WelcomeScreen.tsx";
import TwitchChat from "./components/chat/TwitchChat.tsx";
import QueuePanel from "./components/queue/QueuePanel.tsx";
import {TwitchChatProvider} from "./context/TwitchChatProvider.tsx";

function App() {
    return (
        <AuthContextProvider>
            <TwitchChatProvider>
                <PageLayout>
                    <ProtectedView fallback={<WelcomeScreen/>}>
                        <div className="flex flex-1 w-full h-full overflow-hidden bg-base-100">

                            <div className="flex-1 h-full overflow-y-auto flex justify-center p-6">
                                <div className="w-full max-w-7xl h-full flex flex-col">
                                    <QueuePanel/>
                                </div>
                            </div>

                            <TwitchChat className="h-full shrink-0 border-l border-base-300"/>
                        </div>
                    </ProtectedView>
                </PageLayout>
            </TwitchChatProvider>
        </AuthContextProvider>
    );
}

export default App;
