import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { Search } from "lucide-react";
import { CrudFilter, useGetIdentity, useNotification } from "@refinedev/core";
import dayjs from "dayjs";
import { User } from "@/types";
import { USER_ROLES } from "@/constence";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Badge } from "@/components/ui/badge";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { useSearchParams } from "react-router";

const UsersList = () => {
  const { data: currentUser } = useGetIdentity<{ role?: string }>();
  const isAdmin = currentUser?.role === "admin";
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("q") ?? ""
  );
  const [selectedRole, setSelectedRole] = useState(
    searchParams.get("role") ?? "all"
  );
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { open } = useNotification();

  const usersTable = useTable<User>({
    columns: useMemo<ColumnDef<User>[]>(
      () => [
        {
          id: "id",
          accessorKey: "id",
          size: 200,
          enableSorting: true,
          header: () => <p className="column-title">User ID</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "name",
          accessorKey: "name",
          size: 220,
          enableSorting: true,
          header: () => <p className="column-title">Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "email",
          accessorKey: "email",
          size: 260,
          enableSorting: true,
          header: () => <p className="column-title">Email</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "role",
          accessorKey: "role",
          size: 140,
          enableSorting: true,
          header: () => <p className="column-title">Role</p>,
          cell: ({ getValue }) => (
            <Badge variant="secondary">{getValue<string>()}</Badge>
          ),
        },
        {
          id: "createdAt",
          accessorKey: "createdAt",
          size: 160,
          enableSorting: true,
          header: () => <p className="column-title">Created</p>,
          cell: ({ getValue }) => {
            const value = getValue<string | undefined>();
            if (!value) return <span className="text-muted-foreground">—</span>;
            const formatted = dayjs(value).isValid()
              ? dayjs(value).format("MMM D, YYYY")
              : "—";
            return <span className="text-muted-foreground">{formatted}</span>;
          },
        },
        {
          id: "actions",
          size: 200,
          header: () => <p className="column-title">Actions</p>,
          cell: ({ row }) => (
            <div className="flex items-center gap-2">
              <ShowButton
                resource="users"
                recordItemId={row.original.id}
                size="sm"
                variant="outline"
              />
              {isAdmin ? (
                <EditButton
                  resource="users"
                  recordItemId={row.original.id}
                  size="sm"
                  variant="outline"
                />
              ) : null}
            </div>
          ),
        },
      ],
      []
    ),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        right: ["actions"],
      },
    },
    refineCoreProps: {
      resource: "users",
      pagination: { pageSize: 10, mode: "server" },
      sorters: { mode: "server" },
    },
  });

  const { setFilters, setSorters, sorters } = usersTable.refineCore;
  const { tableQuery } = usersTable.refineCore;
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const urlQuery = searchParams.get("q") ?? "";
    const urlRole = searchParams.get("role") ?? "all";

    if (urlQuery !== searchQuery) {
      setSearchQuery(urlQuery);
    }

    if (urlRole !== selectedRole) {
      setSelectedRole(urlRole);
    }

    const sortField = searchParams.get("sort");
    const sortOrder = searchParams.get("order") as "asc" | "desc" | null;
    const currentSorter = sorters?.[0];

    if (sortField && sortOrder) {
      if (
        currentSorter?.field !== sortField ||
        currentSorter?.order !== sortOrder
      ) {
        setSorters([{ field: sortField, order: sortOrder }]);
      }
    } else if (currentSorter) {
      setSorters([]);
    }
  }, [searchParams, setSorters, sorters]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const nextFilters: CrudFilter[] = [];

    if (selectedRole !== "all") {
      nextFilters.push({
        field: "role",
        operator: "eq",
        value: selectedRole,
      });
    }

    if (debouncedSearch) {
      nextFilters.push({
        field: "name",
        operator: "contains",
        value: debouncedSearch,
      });
    }

    setFilters(nextFilters, "replace");
  }, [selectedRole, debouncedSearch, setFilters]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);
    if (debouncedSearch) {
      nextParams.set("q", debouncedSearch);
    } else {
      nextParams.delete("q");
    }

    if (selectedRole !== "all") {
      nextParams.set("role", selectedRole);
    } else {
      nextParams.delete("role");
    }

    const currentSorter = sorters?.[0];
    if (currentSorter?.field) {
      nextParams.set("sort", currentSorter.field);
      nextParams.set("order", currentSorter.order);
    } else {
      nextParams.delete("sort");
      nextParams.delete("order");
    }

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [debouncedSearch, selectedRole, sorters, searchParams, setSearchParams]);

  useEffect(() => {
    if (!tableQuery.error) return;

    const error = tableQuery.error as { message?: string; statusCode?: number };
    const status = error.statusCode;
    const message =
      status === 403 ? "Too many requests" : error.message || "Failed to load users";

    if (message === lastErrorMessage) return;

    setLastErrorMessage(message);
    open?.({
      type: "error",
      message,
      description:
        status === 403
          ? "Please wait a minute and try again."
          : "Try again in a moment.",
    });
  }, [tableQuery.error, lastErrorMessage, open]);

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Users</h1>
      <div className="intro-row">
        <p>Manage admin, teacher, and student accounts.</p>
      </div>
      <div className="actions-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            placeholder="Search by name..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
              <SelectItem value={USER_ROLES.TEACHER}>Teacher</SelectItem>
              <SelectItem value={USER_ROLES.STUDENT}>Student</SelectItem>
            </SelectContent>
          </Select>
          {isAdmin ? <CreateButton resource="users" /> : null}
        </div>
      </div>
      <DataTable table={usersTable} />
    </ListView>
  );
};

export default UsersList;
