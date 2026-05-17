import { Outlet, useLocation } from "react-router";
import Navigation from "./shared/Navigation";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "../../context/AuthContext";

export default function Root() {
  const location = useLocation();

  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <AuthProvider>
        <div className="min-h-screen bg-background text-foreground">
          <Navigation />
          <main className="pb-16">
            <Outlet />
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
