import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Loader2, ShieldAlert } from "lucide-react";
import { AdminLayout } from "./components/AdminLayout";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useIsCallerAdmin } from "./hooks/useQueries";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { PresentationDetailPage } from "./pages/PresentationDetailPage";
import { RequestPage } from "./pages/RequestPage";
import { RequestSubmittedPage } from "./pages/RequestSubmittedPage";
import { UploadPage } from "./pages/UploadPage";
import { ViewPage } from "./pages/ViewPage";

// ─── Root layout ──────────────────────────────────────────────────────────────

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" richColors />
    </>
  );
}

// ─── Admin Guard ──────────────────────────────────────────────────────────────

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  if (isInitializing || adminLoading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return <LoginPage />;
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            Access Denied
          </h2>
          <p className="text-sm text-muted-foreground">
            You are not an admin. Contact the owner to request admin access.
          </p>
        </div>
      </div>
    );
  }

  return <AdminLayout>{children}</AdminLayout>;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

const rootRoute = createRootRoute({
  component: RootLayout,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <AdminGuard>
      <DashboardPage />
    </AdminGuard>
  ),
});

const uploadRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/upload",
  component: () => (
    <AdminGuard>
      <UploadPage />
    </AdminGuard>
  ),
});

const presentationDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/presentation/$id",
  component: () => (
    <AdminGuard>
      <PresentationDetailPage />
    </AdminGuard>
  ),
});

const requestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/request/$presentationId",
  component: RequestPage,
});

const requestSubmittedRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/request-submitted",
  component: RequestSubmittedPage,
});

const viewRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/view",
  component: ViewPage,
});

const routeTree = rootRoute.addChildren([
  dashboardRoute,
  uploadRoute,
  presentationDetailRoute,
  requestRoute,
  requestSubmittedRoute,
  viewRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  return <RouterProvider router={router} />;
}
