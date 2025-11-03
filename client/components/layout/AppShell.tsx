import { PropsWithChildren } from "react";

export default function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0 z-20">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">AI</span>
            <span className="font-semibold tracking-tight">Feature Scoper</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
            <span className="hidden md:inline">Effort sizing: S / M / L</span>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t">
        <div className="container flex items-center justify-between py-6 text-xs text-muted-foreground">
          <span>Feature Scoper • Effort sizing for proposals</span>
          <span>3–8 granular modules • Risk flags • S/M/L</span>
        </div>
      </footer>
    </div>
  );
}
