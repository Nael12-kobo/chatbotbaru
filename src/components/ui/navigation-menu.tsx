"use client";

import {
  createContext,
  useContext,
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from "react";
import { cn } from "cn";
import { ChevronDown } from "lucide-react";

// --- Context ---
interface NavMenuContextValue {
  activeTrigger: string | null;
  setActiveTrigger: (id: string | null) => void;
}

const NavMenuContext = createContext<NavMenuContextValue>({
  activeTrigger: null,
  setActiveTrigger: () => {},
});

// --- Root ---
function NavigationMenu({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [activeTrigger, setActiveTrigger] = useState<string | null>(null);
  return (
    <NavMenuContext.Provider value={{ activeTrigger, setActiveTrigger }}>
      <div
        className={cn(
          "relative z-10 flex items-center justify-center",
          className
        )}
      >
        {children}
      </div>
    </NavMenuContext.Provider>
  );
}

// --- List ---
function NavigationMenuList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <ul
      className={cn(
        "group flex flex-1 items-center justify-center gap-1",
        className
      )}
    >
      {children}
    </ul>
  );
}

// --- Item ---
function NavigationMenuItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <li className={cn("relative", className)}>
      {children}
    </li>
  );
}

// --- Trigger ---
function NavigationMenuTrigger({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const { activeTrigger, setActiveTrigger } = useContext(NavMenuContext);
  const isOpen = activeTrigger === id;

  return (
    <button
      onClick={() => setActiveTrigger(isOpen ? null : id ?? null)}
      className={cn(
        "group inline-flex h-8 items-center justify-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-400 focus:bg-blue-50 dark:focus:bg-zinc-800 focus:text-blue-700 dark:focus:text-blue-400 outline-none text-gray-700 dark:text-zinc-200",
        isOpen && "bg-blue-50 dark:bg-zinc-800 text-blue-700 dark:text-blue-400",
        className
      )}
    >
      {children}
      <ChevronDown
        className={cn(
          "size-3 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </button>
  );
}

// --- Content ---
function NavigationMenuContent({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id: string;
}) {
  const { activeTrigger, setActiveTrigger } = useContext(NavMenuContext);
  const ref = useRef<HTMLDivElement>(null);
  const isOpen = activeTrigger === id;

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setActiveTrigger(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen, setActiveTrigger]);

  return (
    <div
      ref={ref}
      className={cn(
        "absolute left-1/2 top-full -translate-x-1/2 pt-2 transition-all duration-200",
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto"
          : "opacity-0 -translate-y-1 pointer-events-none",
        className
      )}
    >
      <div className="rounded-xl bg-white dark:bg-zinc-950 border border-blue-100 dark:border-zinc-800 shadow-xl p-3 min-w-[200px]">
        {children}
      </div>
    </div>
  );
}

// --- Link (inside dropdown) ---
function NavigationMenuLink({
  children,
  className,
  href,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  href?: string;
  onClick?: () => void;
}) {
  const { setActiveTrigger } = useContext(NavMenuContext);
  const handleClick = () => {
    setActiveTrigger(null);
    onClick?.();
  };

  if (href) {
    return (
      <a
        href={href}
        onClick={handleClick}
        className={cn(
          "block rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-400 transition-colors outline-none focus:bg-blue-50 dark:focus:bg-zinc-800",
          className
        )}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "block w-full text-left rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-zinc-300 hover:bg-blue-50 dark:hover:bg-zinc-800 hover:text-blue-700 dark:hover:text-blue-400 transition-colors outline-none focus:bg-blue-50 dark:focus:bg-zinc-800 cursor-pointer",
        className
      )}
    >
      {children}
    </button>
  );
}

// --- Indicator (optional visual bar) ---
function NavigationMenuIndicator() {
  return null;
}

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  NavigationMenuIndicator,
};
