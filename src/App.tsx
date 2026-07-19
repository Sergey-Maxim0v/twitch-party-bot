import {PageLayout} from "./components/layout/PageLayout.tsx";
import {AuthProvider} from "./features/auth";

function App() {

    return (
        <AuthProvider>
            <PageLayout>
                <div className="max-h-screen bg-base-100 text-base-content antialiased transition-colors duration-200">
                    TODO: content
                </div>
            </PageLayout>
        </AuthProvider>
    )
}

export default App
