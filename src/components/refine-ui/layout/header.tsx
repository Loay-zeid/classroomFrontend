import { UserAvatar } from "@/components/refine-ui/layout/user-avatar";
import { ThemeToggle } from "@/components/refine-ui/theme/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  useActiveAuthProvider,
  useLogout,
  useRefineOptions,
} from "@refinedev/core";
import { LogOutIcon, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";

export const Header = () => {
  const { isMobile } = useSidebar();

  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      const trimmed = query.trim();
      if (trimmed) {
        nextParams.set("q", trimmed);
      } else {
        nextParams.delete("q");
      }
      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchParams, setSearchParams]);

  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-16",
        "shrink-0",
        "items-center",
        "gap-4",
        "border-b",
        "border-border",
        "bg-sidebar",
        "pr-3",
        "justify-end",
        "z-40"
      )}
    >
      <div className="relative hidden w-full max-w-sm md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="global-search"
          name="global-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search..."
          className="pl-9"
        />
      </div>
      <ThemeToggle />
      <UserDropdown />
    </header>
  );
}

function MobileHeader() {
  const { open, isMobile } = useSidebar();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");

  const { title } = useRefineOptions();
  const titleText = title?.text ?? "Classrom";
  const titleIcon = title?.icon ?? null;

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    if (urlQuery !== query) {
      setQuery(urlQuery);
    }
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const nextParams = new URLSearchParams(searchParams);
      const trimmed = query.trim();
      if (trimmed) {
        nextParams.set("q", trimmed);
      } else {
        nextParams.delete("q");
      }
      if (nextParams.toString() !== searchParams.toString()) {
        setSearchParams(nextParams, { replace: true });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchParams, setSearchParams]);

  return (
    <header
      className={cn(
        "sticky",
        "top-0",
        "flex",
        "h-12",
        "shrink-0",
        "items-center",
        "gap-2",
        "border-b",
        "border-border",
        "bg-sidebar",
        "pr-3",
        "justify-between",
        "z-40"
      )}
    >
      <SidebarTrigger
        className={cn("text-muted-foreground", "rotate-180", "ml-1", {
          "opacity-0": open,
          "opacity-100": !open || isMobile,
          "pointer-events-auto": !open || isMobile,
          "pointer-events-none": open && !isMobile,
        })}
      />

      <div
        className={cn(
          "whitespace-nowrap",
          "flex",
          "flex-row",
          "h-full",
          "items-center",
          "justify-start",
          "gap-2",
          "transition-discrete",
          "duration-200",
          {
            "pl-3": !open,
            "pl-5": open,
          }
        )}
      >
        <div>{titleIcon}</div>
        <h2
          className={cn(
            "text-sm",
            "font-bold",
            "transition-opacity",
            "duration-200",
            {
              "opacity-0": !open,
              "opacity-100": open,
            }
          )}
        >
          {titleText}
        </h2>
      </div>

      <div className="relative flex-1 max-w-[160px]">
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="global-search-mobile"
          name="global-search-mobile"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search..."
          className="h-8 pl-7 text-xs"
        />
      </div>

      <ThemeToggle className={cn("h-8", "w-8")} />
    </header>
  );
}

const UserDropdown = () => {
  const { mutate: logout, isPending: isLoggingOut } = useLogout();

  const authProvider = useActiveAuthProvider();

  if (!authProvider?.getIdentity) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            logout();
          }}
        >
          <LogOutIcon
            className={cn("text-destructive", "hover:text-destructive")}
          />
          <span className={cn("text-destructive", "hover:text-destructive")}>
            {isLoggingOut ? "Logging out..." : "Logout"}
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

Header.displayName = "Header";
MobileHeader.displayName = "MobileHeader";
DesktopHeader.displayName = "DesktopHeader";
