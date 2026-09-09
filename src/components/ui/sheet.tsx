"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { cn } from "cn";
import { X } from "lucide-react";

interface SheetContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SheetContext = createContext<SheetContextValue>({
  open: false,
  setOpen: () => {},
});

interface SheetProps {
  children: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

function Sheet({ children, open: openProp, onOpenChange }: SheetProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = openProp ?? internalOpen;
  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalOpen(value);
      }
    },
    [onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ children, className }: { children: ReactNode; className?: string }) {
  const { setOpen } = useContext(SheetContext);
  return (
    <button
      onClick={() => setOpen(true)}
      className={cn("inline-flex items-center justify-center", className)}
    >
      {children}
    </button>
  );
}

function SheetContent({
  children,
  side = "left",
  className,
  dir,
  ...props
}: {
  children: ReactNode;
  side?: "left" | "right";
  className?: string;
  dir?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { open, setOpen } = useContext(SheetContext);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Panel */}
      <div
        dir={dir}
        className={cn(
          "fixed z-50 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out",
          side === "left" ? "left-0" : "right-0",
          "w-72",
          open
            ? "translate-x-0"
            : side === "left"
              ? "-translate-x-full"
              : "translate-x-full",
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between border-b border-sky-100 px-4 py-3">
          <span className="font-semibold text-sm text-gray-800">Menu</span>
          <button
            onClick={() => setOpen(false)}
            className="rounded-md p-1 text-gray-400 hover:text-gray-600 hover:bg-sky-50 transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </>
  );
}

function SheetHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
      {children}
    </div>
  );
}

function SheetTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <h2 className={cn("text-lg font-semibold text-gray-900", className)}>
      {children}
    </h2>
  );
}

function SheetDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={cn("text-sm text-gray-500", className)}>{children}</p>
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
};
