import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { CrudFilter, useNotification } from "@refinedev/core";
import { Search } from "lucide-react";
import dayjs from "dayjs";
import { User } from "@/types";
import { ListView } from "@/components/refine-ui/views/list-view";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/refine-ui/data-table/data-table";
import { Button } from "@/components/ui/button";
import { ShowButton } from "@/components/refine-ui/buttons/show";
import { BACKEND_BASE_URL } from "@/constence";

type EnrollmentRow = {
  id: number;
  studentId: string;
  classId: number;
  created_at?: string;
  createdAt?: string;
  student?: User;
  class?: { id: number; name?: string };
};

const EnrollmentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [processingKey, setProcessingKey] = useState<string | null>(null);
  const { open } = useNotification();

  const enrollmentsTable = useTable<EnrollmentRow>({
    columns: useMemo<ColumnDef<EnrollmentRow>[]>(
      () => [
        {
          id: "student",
          accessorFn: (row) => row.student?.name ?? "Unknown",
          size: 220,
          header: () => <p className="column-title">Student</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "email",
          accessorFn: (row) => row.student?.email ?? "-",
          size: 240,
          header: () => <p className="column-title">Email</p>,
          cell: ({ getValue }) => (
            <span className="text-muted-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "class",
          accessorFn: (row) => row.class?.name ?? "-",
          size: 220,
          header: () => <p className="column-title">Class</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
        {
          id: "createdAt",
          accessorKey: "created_at",
          size: 160,
          header: () => <p className="column-title">Enrolled</p>,
          cell: ({ row }) => {
            const raw = row.original.createdAt ?? row.original.created_at;
            const formatted =
              raw && dayjs(raw).isValid()
                ? dayjs(raw).format("MMM D, YYYY")
                : "-";
            return <span className="text-muted-foreground">{formatted}</span>;
          },
        },
        {
          id: "actions",
          size: 220,
          header: () => <p className="column-title">Actions</p>,
          cell: ({ row }) => {
            const key = `${row.original.classId}:${row.original.studentId}`;
            return (
              <div className="flex items-center gap-2">
                <ShowButton
                  resource="classes"
                  recordItemId={row.original.classId}
                  size="sm"
                  variant="outline"
                >
                  View Class
                </ShowButton>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    handleUnenroll(row.original.classId, row.original.studentId)
                  }
                  disabled={processingKey === key}
                >
                  {processingKey === key ? "Removing..." : "Unenroll"}
                </Button>
              </div>
            );
          },
        },
      ],
      [processingKey]
    ),
    enableColumnPinning: true,
    initialState: {
      columnPinning: {
        right: ["actions"],
      },
    },
    refineCoreProps: {
      resource: "enrollments",
      pagination: { pageSize: 10, mode: "server" },
    },
  });

  const { setFilters, tableQuery } = enrollmentsTable.refineCore;
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

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
        field: "search",
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
        : error.message || "Failed to load enrollments";

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

  const getErrorMessage = async (response: Response) => {
    try {
      const payload = (await response.clone().json()) as {
        message?: string;
        error?: string;
      };
      return payload.error ?? payload.message ?? "Request failed.";
    } catch {
      return "Request failed.";
    }
  };

  const handleUnenroll = async (classId: number, studentId: string) => {
    const key = `${classId}:${studentId}`;
    setProcessingKey(key);
    try {
      const response = await fetch(
        `${BACKEND_BASE_URL}/classes/${classId}/enrollments/${studentId}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      open?.({
        type: "success",
        message: "Student unenrolled",
        description: "Enrollment removed.",
      });
      await tableQuery.refetch();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to unenroll student.";
      open?.({
        type: "error",
        message: "Unenroll failed",
        description: message,
      });
    } finally {
      setProcessingKey(null);
    }
  };

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Enrollments</h1>
      <div className="intro-row">
        <p>Track enrolled students across classes.</p>
      </div>
      <div className="actions-row">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            value={searchQuery}
            placeholder="Search by student or class..."
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10"
          />
        </div>
      </div>
      <DataTable table={enrollmentsTable} />
    </ListView>
  );
};

export default EnrollmentsList;
