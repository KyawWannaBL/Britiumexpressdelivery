import * as React from "react";

/**
 * SharedComponents.tsx
 * Dashboard-friendly wrappers and shared UI blocks.
 */

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={[
        "rounded-2xl border bg-white shadow-sm",
        className ?? "",
      ].join(" ")}
      {...props}
    />
  );
}

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["p-4 pb-2", className ?? ""].join(" ")} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={["text-base font-extrabold", className ?? ""].join(" ")} {...props} />;
}

export function CardContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["p-4 pt-2", className ?? ""].join(" ")} {...props} />;
}

export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-neutral-600">{subtitle}</p> : null}
      </div>
      {right ? <div className="flex items-center gap-2">{right}</div> : null}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">{label}</div>
          <div className="mt-2 text-2xl font-extrabold text-neutral-900">{value}</div>
          {hint ? <div className="mt-1 text-xs text-neutral-500">{hint}</div> : null}
        </div>
        {icon ? <div className="mt-1 text-neutral-600">{icon}</div> : null}
      </div>
    </Card>
  );
}
