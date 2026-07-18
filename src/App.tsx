import { BrowserRouter, HashRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";
import { AppShell } from "@/layouts/AppShell";
import { hydrateErpnextSession } from "@/lib/client";
import { ChartsPage } from "@/pages/ChartsPage";
import { ConnectionPage } from "@/pages/ConnectionPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { DashboardsPage } from "@/pages/DashboardsPage";
import { DatasetsPage } from "@/pages/DatasetsPage";
import { ExportsPage } from "@/pages/ExportsPage";
import { LoginPage } from "@/pages/LoginPage";
import { PivotPage } from "@/pages/PivotPage";
import { ReportsPage } from "@/pages/ReportsPage";
import { useSessionStore } from "@/store/session";

const Router = window.zatgoDesktop ? HashRouter : BrowserRouter;

function RequireAuth({ children }: { children: React.ReactNode }) {
  const connected = useSessionStore((s) => s.connected);
  if (!connected) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <AppShell />
          </RequireAuth>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="datasets" element={<DatasetsPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="pivot" element={<PivotPage />} />
        <Route path="charts" element={<ChartsPage />} />
        <Route path="dashboards" element={<DashboardsPage />} />
        <Route path="exports" element={<ExportsPage />} />
        <Route path="connection" element={<ConnectionPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void hydrateErpnextSession().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[var(--color-muted-foreground)]">
        Loading…
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}
