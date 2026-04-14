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
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router";

export const Header = () => {
  const { isMobile } = useSidebar();

  return <>{isMobile ? <MobileHeader /> : <DesktopHeader />}</>;
};

function DesktopHeader() {
  const { query, setQuery, submitSearch } = useGlobalSearchInput();

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
      <form
        className="w-full max-w-sm"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(query);
        }}
      >
        <div className="relative hidden w-full md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="global-search"
            name="global-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search all sections..."
            className="pl-9"
          />
        </div>
      </form>
      <ThemeToggle />
      <UserDropdown />
    </header>
  );
}

function MobileHeader() {
  const { open, isMobile } = useSidebar();
  const { query, setQuery, submitSearch } = useGlobalSearchInput();

  const { title } = useRefineOptions();
  const titleText = title?.text ?? "Classrom";
  const titleIcon = title?.icon ?? null;

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

      <form
        className="relative flex-1 max-w-[160px]"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch(query);
        }}
      >
        <Search className="absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="global-search-mobile"
          name="global-search-mobile"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search all..."
          className="h-8 pl-7 text-xs"
        />
      </form>

      <ThemeToggle className={cn("h-8", "w-8")} />
    </header>
  );
}

const useGlobalSearchInput = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const isGlobalSearchPage = location.pathname === "/search";
  const [query, setQuery] = useState(
    isGlobalSearchPage ? searchParams.get("q") ?? "" : ""
  );

  useEffect(() => {
    if (!isGlobalSearchPage) return;
    const urlQuery = searchParams.get("q") ?? "";
    setQuery((currentQuery) =>
      currentQuery === urlQuery ? currentQuery : urlQuery
    );
  }, [isGlobalSearchPage, searchParams]);

  const submitSearch = (inputValue: string) => {
    const trimmed = inputValue.trim();
    const nextParams = new URLSearchParams();
    if (trimmed) {
      nextParams.set("q", trimmed);
    }

    navigate({
      pathname: "/search",
      search: nextParams.toString() ? `?${nextParams.toString()}` : "",
    });
  };

  return { query, setQuery, submitSearch };
};

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
