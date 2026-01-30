import React from "react";
import { createPortal } from "react-dom";

export interface ModalProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;

  onClose: () => void;

  footer?: React.ReactNode;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;

  maxWidth?: number; // px
}

function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export default function Modal({
  open,
  title,
  children,
  onClose,
  footer,
  closeOnBackdrop = true,
  closeOnEsc = true,
  maxWidth = 520,
}: ModalProps) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const lastActiveRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    lastActiveRef.current = document.activeElement as HTMLElement;

    // Focus the dialog for accessibility
    setTimeout(() => dialogRef.current?.focus(), 0);

    const onKeyDown = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") onClose();
      // basic focus trap: if tab goes out, keep focus inside
      if (e.key === "Tab") {
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      lastActiveRef.current?.focus?.();
    };
  }, [open, closeOnEsc, onClose]);

  if (!open) return null;

  const backdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!closeOnBackdrop) return;
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="presentation"
      onMouseDown={backdropClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "Dialog"}
        tabIndex={-1}
        ref={dialogRef}
        className={classNames(
          "w-full rounded-lg bg-white shadow-lg outline-none",
          "max-h-[85vh] overflow-hidden"
        )}
        style={{ maxWidth }}
      >
        {(title || onClose) && (
          <div className="flex items-center justify-between border-b px-4 py-3">
            <div className="text-base font-semibold">{title ?? ""}</div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-2 py-1 text-sm hover:bg-neutral-100"
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}

        <div className="px-4 py-4 overflow-auto max-h-[60vh]">{children}</div>

        {footer ? (
          <div className="border-t px-4 py-3 flex items-center justify-end gap-2">{footer}</div>
        ) : null}
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
