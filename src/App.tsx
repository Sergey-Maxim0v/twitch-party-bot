import {PageLayout} from "./components/layout/PageLayout.tsx";
import {AuthProvider, ProtectedView} from "./features/auth";
import {WelcomeScreen} from "./components/layout/WelcomeScreen.tsx";

function App() {

    return (
        <AuthProvider>
            <PageLayout>
                <ProtectedView fallback={<WelcomeScreen/>}>
                    <div className="flex h-full items-center justify-center bg-base-100 p-6">
                        <div className="text-center">
                            <div className="badge badge-success gap-2 mb-2 font-semibold">
                                <span className="w-1.5 h-1.5 rounded-full bg-base-100 animate-ping"></span>
                                Чат-бот активен
                            </div>
                            <h2 className="text-2xl font-black text-base-content">
                                Панель управления очередью
                            </h2>
                            <p className="text-sm text-base-content/60 mt-1">
                                Здесь скоро появится список игроков из чата.
                            </p>
                        </div>
                    </div>
                </ProtectedView>
            </PageLayout>
        </AuthProvider>
    )
}

export default App
