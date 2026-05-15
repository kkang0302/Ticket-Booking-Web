import { Outlet, useLocation } from "react-router";
import Navigation from "./shared/Navigation";
import { ThemeProvider } from "next-themes";

export default function Root() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <div className="min-h-screen bg-background text-foreground">
        <Navigation isAdmin={isAdminRoute} />
        <main className="pb-16">
          <Outlet />
        </main>
      </div>
    </ThemeProvider>
  );
}
