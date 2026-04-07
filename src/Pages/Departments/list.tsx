import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { CrudFilter, useGetIdentity, useNotification } from "@refinedev/core";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import { Department } from "@/types";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { EditButton } from "@/components/refine-ui/buttons/edit";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const DepartmentsList = () => {
  const { open } = useNotification();
  const { data: currentUser } = useGetIdentity<{ role?: string }>();
  const isAdmin = currentUser?.role === "admin";
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const departmentsTable = useTable<Department>({
    columns: useMemo<ColumnDef<Department>[]>(
      () => [
        {
          id: "id",
          accessorKey: "id",
          size: 140,
          header: () => <p className="column-title">ID</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue<number>()}</span>
          ),
        },
        {
          id: "name",
          accessorKey: "name",
          size: 240,
          header: () => <p className="column-title">Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "code",
          accessorKey: "code",
          size: 180,
          header: () => <p className="column-title">Code</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "subjectsCount",
          accessorKey: "subjectsCount",
          size: 160,
          header: () => <p className="column-title">Subjects</p>,
          cell: ({ getValue }) => {
            const value = getValue<number | null | undefined>();
            const count = typeof value === "number" ? value : 0;
            return <Badge variant="secondary">{count}</Badge>;
          },
        },
        {
          id: "createdAt",
          accessorFn: (row) => row.createdAt ?? row.created_at,
          size: 160,
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
                resource="departments"
                recordItemId={row.original.id}
                size="sm"
                variant="outline"
              />
              {isAdmin ? (
                <EditButton
                  resource="departments"
                  recordItemId={row.original.id}
                  size="sm"
                  variant="outline"
                />
              ) : null}
            </div>
          ),
        },
      ],
      [isAdmin]
    ),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        right: ["actions"],
      },
    },
    refineCoreProps: {
      resource: "departments",
      pagination: { pageSize: 10, mode: "server" },
    },
  });

  const { tableQuery } = departmentsTable.refineCore;
  const { setFilters } = departmentsTable.refineCore;

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const nextFilters: CrudFilter[] = [];

    if (debouncedSearch) {
      nextFilters.push({
        field: "name",
        operator: "contains",
        value: debouncedSearch,
      });
    }

    setFilters(nextFilters, "replace");
  }, [debouncedSearch, setFilters]);

  useEffect(() => {
    if (!tableQuery.error) return;

    const error = tableQuery.error as { message?: string; statusCode?: number };
    const status = error.statusCode;
    const message =
      status === 403
        ? "Too many requests"
        : error.message || "Failed to load departments";

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
      <h1 className="page-title">Departments</h1>
      <div className="intro-row">
        <p>Manage departments and track total subjects per department.</p>
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
        <div className="flex w-full justify-end sm:w-auto">
          {isAdmin ? <CreateButton resource="departments" /> : null}
        </div>
      </div>
      <DataTable table={departmentsTable} />
    </ListView>
  );
};

export default DepartmentsList;
