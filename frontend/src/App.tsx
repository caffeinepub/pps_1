import { RouterProvider, createRouter, createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import LoginPage from './pages/Login';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import { useAppStore } from './store/appStore';

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster />
    </>
  ),
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  beforeLoad: () => {
    const state = useAppStore.getState();
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      throw redirect({ to: '/login' });
    }
  },
  component: AdminDashboard,
});

const teacherRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/teacher',
  beforeLoad: () => {
    const state = useAppStore.getState();
    if (!state.currentUser || state.currentUser.role !== 'teacher') {
      throw redirect({ to: '/login' });
    }
  },
  component: TeacherDashboard,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const state = useAppStore.getState();
    if (state.currentUser) {
      if (state.currentUser.role === 'admin') throw redirect({ to: '/admin' });
      if (state.currentUser.role === 'teacher') throw redirect({ to: '/teacher' });
    }
    throw redirect({ to: '/login' });
  },
  component: () => null,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, adminRoute, teacherRoute]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
