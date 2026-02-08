import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

// React Router v7 future flags
const routerFutureConfig = {
  v7_startTransition: true,
  v7_relativeSplatPath: true,
};
import { TavusProvider } from "./contexts/TavusContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute, PublicRoute } from "./components/ProtectedRoute";
import NavigationUniversal from "./components/NavigationUniversal";
import Landing from "./pages/Landing";
import Session from "./pages/Session";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Booking from "./pages/Booking";
import AuthUniversal from "./pages/AuthUniversal";
import AuthCallback from "./pages/AuthCallback";
import Roll from './pages/Roll';
import NotFound from './pages/NotFound';
import Resources from "./pages/Resources";
import Community from "./pages/Community";
import TavusSession from "./pages/TavusSession";
import "./i18n";
import ChatWidget from "./components/ChatWidget";
import EmergencyWidget from "./components/EmergencyWidget";
import { WidgetErrorBoundary } from "./components/WidgetErrorBoundary";



const queryClient = new QueryClient();

// ✅ Layout with Navigation
const MainLayout = () => (
  <div className="min-h-screen">
    <NavigationUniversal />
    <Outlet />
  </div>
);

// ✅ Layout without Navigation
const AuthLayout = () => (
  <div className="min-h-screen">
    <Outlet />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={routerFutureConfig}>
        <AuthProvider>
          <TavusProvider>
            <Routes>
              {/* Public routes WITH navbar */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Landing />} />
              </Route>

              {/* Public routes WITHOUT navbar */}
              <Route path="/role" element={<Roll />} />

              {/* Auth routes (only accessible when NOT logged in) */}
              <Route path="/auth" element={
                <PublicRoute>
                  <AuthUniversal />
                </PublicRoute>
              } />
              <Route path="/login" element={
                <PublicRoute>
                  <AuthUniversal />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <AuthUniversal />
                </PublicRoute>
              } />
              <Route path="/forgot-password" element={
                <PublicRoute>
                  <AuthUniversal />
                </PublicRoute>
              } />
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Protected routes WITH navbar */}
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute>
                    <Community />
                  </ProtectedRoute>
                } />
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <Resources />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                <Route path="/booking" element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                } />
                <Route path="/tavus" element={
                  <ProtectedRoute>
                    <TavusSession />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Protected routes WITHOUT navbar (full screen) */}
              <Route element={<AuthLayout />}>
                <Route path="/session" element={
                  <ProtectedRoute>
                    <Session />
                  </ProtectedRoute>
                } />
              </Route>

              {/* 404 Not Found */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            {/* Widgets wrapped in error boundaries - fail silently without blocking app */}
            <WidgetErrorBoundary widgetName="ChatWidget">
              <ChatWidget />
            </WidgetErrorBoundary>
            <WidgetErrorBoundary widgetName="EmergencyWidget">
              <EmergencyWidget />
            </WidgetErrorBoundary>
          </TavusProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
