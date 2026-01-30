import * as React from "react";
import { cn } from "../../lib/utils";

type Variant = "default" | "secondary" | "outline" | "destructive" | "ghost";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  default: "bg-black text-white hover:bg-neutral-800",
  secondary: "bg-neutral-100 text-neutral-900 hover:bg-neutral-200",
  outline: "border bg-white hover:bg-neutral-50",
  destructive: "bg-red-600 text-white hover:bg-red-700",
  ghost: "hover:bg-neutral-100",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-6 text-base",
};

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }
>(({ className, variant = "default", size = "md", type = "button", ...props }, ref) => (
  <button
    ref={ref}
    type={type}
    className={cn(
      "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition disabled:opacity-60 disabled:pointer-events-none",
      variantClass[variant],
      sizeClass[size],
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
