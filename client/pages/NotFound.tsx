import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import AppShell from "@/components/layout/AppShell";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <AppShell>
      <div className="container py-24 text-center">
        <h1 className="text-5xl font-extrabold mb-4">404</h1>
        <p className="text-lg text-muted-foreground mb-6">Oops! Page not found.</p>
        <a href="/" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">Return to Home</a>
      </div>
    </AppShell>
  );
};

export default NotFound;
