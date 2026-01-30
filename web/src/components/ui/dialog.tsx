import * as React from "react";
import { cn } from "../../lib/utils";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onOpenChange(false);
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={() => onOpenChange(false)} />
      <div className="absolute left-1/2 top-1/2 w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
}

export function DialogContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl bg-white p-5 shadow-xl", className)} {...props} />;
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-3 space-y-1", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-extrabold", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-neutral-600", className)} {...props} />;
}
