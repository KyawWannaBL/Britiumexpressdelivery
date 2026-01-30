import React from "react";
import { NavLink, Outlet } from "react-router-dom";

type IconProps = { className?: string; "aria-hidden"?: true };

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const Icons = {
  Home: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-6v-7H10v7H4a1 1 0 0 1-1-1v-10.5Z" />
    </svg>
  ),
  Package: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M21 8.5 12 3 3 8.5 12 14l9-5.5Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 8.5V16l9 5 9-5V8.5" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 14v7" />
    </svg>
  ),
  Users: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 21a9 9 0 0 1 18 0" />
    </svg>
  ),
  Truck: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h11v10H3V7Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M14 10h4l3 3v4h-7v-7Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M18.5 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" />
    </svg>
  ),
  MapPin: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-4.35 7-11a7 7 0 1 0-14 0c0 6.65 7 11 7 11Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />
    </svg>
  ),
  CreditCard: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 7h18v10H3V7Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M3 10h18" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M7 15h4" />
    </svg>
  ),
  Shield: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 2 20 6v7c0 5-3.5 9-8 9s-8-4-8-9V6l8-4Z" />
    </svg>
  ),
  Settings: (p: IconProps) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className={p.className} aria-hidden="true">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a7.9 7.9 0 0 0 .1-1l2-1.2-2-3.6-2.3.7a7.7 7.7 0 0 0-1.7-1L13.2 2h-2.4L9.5 8.9a7.7 7.7 0 0 0-1.7 1L5.5 9.2l-2 3.6 2 1.2a7.9 7.9 0 0 0 .1 1 7.9 7.9 0 0 0-.1 1l-2 1.2 2 3.6 2.3-.7a7.7 7.7 0 0 0 1.7 1L10.8 22h2.4l1.3-6.9a7.7 7.7 0 0 0 1.7-1l2.3.7 2-3.6-2-1.2a7.9 7.9 0 0 0-.1-1Z" />
    </svg>
  ),
};

export type AppNavItem = {
  to: string;
  label: string;
  end?: boolean;
  icon?: keyof typeof Icons;
};

export type AppShellProps = {
  brand: { name: string; href?: string };
  nav: AppNavItem[];
  /** Right side of header (e.g. user menu, sign in button). */
  headerRight?: React.ReactNode;
  /** Optional footer below content. */
  footer?: React.ReactNode;
  /** For SEO + clarity. */
  title?: string;

  /** Public layout = no sidebar. */
  variant?: "app" | "public";
};

export default function AppShell({
  brand,
  nav,
  headerRight,
  footer,
  title,
  variant = "app",
}: AppShellProps) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (!title) return;
    const prev = document.title;
    document.title = title;
    return () => {
      document.title = prev;
    };
  }, [title]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const Sidebar = (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:bg-white">
      <div className="h-16 px-5 flex items-center gap-3 border-b">
        <a href={brand.href ?? "/"} className="font-semibold tracking-tight">
          {brand.name}
        </a>
        <span className="ml-auto text-xs text-neutral-500">v1</span>
      </div>

      <nav className="p-3" aria-label="Primary">
        <ul className="space-y-1">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                    "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                    isActive ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                  )
                }
              >
                {item.icon ? React.createElement(Icons[item.icon], { className: "h-4 w-4" }) : null}
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto p-4 text-xs text-neutral-500">
        <div className="rounded-md bg-neutral-50 p-3 border">
          <div className="font-medium text-neutral-700">Tips</div>
          <div className="mt-1">Use the sidebar to navigate quickly.</div>
        </div>
      </div>
    </aside>
  );

  const MobileDrawer = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onMouseDown={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-80 bg-white border-r md:hidden",
          "transform transition-transform",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="h-16 px-5 flex items-center gap-3 border-b">
          <a href={brand.href ?? "/"} className="font-semibold tracking-tight" onClick={() => setMobileOpen(false)}>
            {brand.name}
          </a>
          <button
            type="button"
            className="ml-auto rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <nav className="p-3" aria-label="Primary mobile">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm",
                      "transition-colors outline-none focus-visible:ring-2 focus-visible:ring-black/30",
                      isActive ? "bg-neutral-900 text-white" : "text-neutral-700 hover:bg-neutral-100"
                    )
                  }
                >
                  {item.icon ? React.createElement(Icons[item.icon], { className: "h-4 w-4" }) : null}
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );

  const Header = (
    <header className="h-16 border-b bg-white flex items-center">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:ring-2 focus:ring-black/40"
      >
        Skip to content
      </a>

      <div className="w-full px-4 md:px-6 flex items-center gap-3">
        {variant === "app" ? (
          <button
            type="button"
            className="md:hidden rounded-md px-2 py-1 hover:bg-neutral-100"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
        ) : null}

        <a href={brand.href ?? "/"} className="font-semibold tracking-tight md:hidden">
          {brand.name}
        </a>

        <div className="ml-auto flex items-center gap-2">{headerRight}</div>
      </div>
    </header>
  );

  if (variant === "public") {
    return (
      <div className="min-h-dvh bg-neutral-50 text-neutral-900">
        {Header}
        <main id="main" className="mx-auto w-full max-w-5xl px-4 py-8 md:px-6">
          <Outlet />
        </main>
        {footer ? <footer className="border-t bg-white">{footer}</footer> : null}
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-neutral-50 text-neutral-900">
      {MobileDrawer}
      <div className="flex min-h-dvh">
        {Sidebar}
        <div className="flex-1 flex flex-col">
          {Header}
          <main id="main" className="flex-1 px-4 py-6 md:px-6">
            <Outlet />
          </main>
          {footer ? <footer className="border-t bg-white">{footer}</footer> : null}
        </div>
      </div>
    </div>
  );
}

export { Icons };
