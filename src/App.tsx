import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/theme-provider";
import { Provider } from "react-redux";

import { container } from "@/utils/di/inversify.config";
import DefaultStore from "@/state-management/store/app-store";
import { GlobalPopupProvider } from "@/components/ui/global-popup";

import HomePage from "@/pages/page";
import LoginPage from "@/pages/onboarding/login/page";
import PromptPage from "@/pages/queries/prompt/page";
import ConnectionsPage from "@/pages/connections/page";
import ConnectionDetailsPage from "@/pages/connections/details";

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
            <Route path="/" element={<HomePage />} />
            <Route path="/connections" element={<ConnectionsPage />} />
            <Route path="/connections/:id" element={<ConnectionDetailsPage />} />
            <Route path="/onboarding/login" element={<LoginPage />} />
            <Route path="/queries/prompt" element={<PromptPage />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
