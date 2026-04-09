import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";

import { container } from "@/utils/di/inversify.config";
import DefaultStore from "@/state-management/store/app-store";
import { GlobalPopupProvider } from "@/components/ui/global-popup";

import HomePage from "@/pages/page";
import LoginPage from "@/pages/onboarding/login/page";

import ConnectionsPage from "@/pages/connections/page";
import ConnectionDetailsPage from "@/pages/connections/details";
import UsersPage from "@/pages/users/page";
import AiLlmConfigPage from "@/pages/ai-llm-config/page";
import ChatPage from "@/pages/chat/page";
import ReportsPage from "@/pages/reports/page";
import ProtectedRoute from "@/components/guards/protected-route";
import ModuleAccessRoute from "@/components/guards/module-access-route";
import { MainLayout } from "@/components/layout/main-layout";

const store = container.get(DefaultStore);

function App() {
  return (
    <Provider store={store.store!}>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange>
        <BrowserRouter>
          <GlobalPopupProvider />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/onboarding/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/database-connections"
              element={
                <ModuleAccessRoute>
                  <ConnectionsPage />
                </ModuleAccessRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <ModuleAccessRoute>
                  <ConnectionsPage />
                </ModuleAccessRoute>
              }
            />
            <Route
              path="/connections/:id"
              element={
                <ModuleAccessRoute>
                  <ConnectionDetailsPage />
                </ModuleAccessRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ModuleAccessRoute>
                  <UsersPage />
                </ModuleAccessRoute>
              }
            />
            <Route
              path="/ai-llm-config"
              element={
                <ModuleAccessRoute>
                  <AiLlmConfigPage />
                </ModuleAccessRoute>
              }
            />
            <Route
              path="/reports"
              element={
                <ModuleAccessRoute>
                  <ReportsPage />
                </ModuleAccessRoute>
              }
            />

            <Route
              path="/chat/:id?"
              element={
                <ProtectedRoute>
                  <MainLayout>
                    <ChatPage />
                  </MainLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
