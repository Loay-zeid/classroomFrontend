import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { Search } from "lucide-react";
import { CrudFilter, useGetIdentity, useNotification } from "@refinedev/core";
import dayjs from "dayjs";
import { Subject } from "@/types";
import { DEPARTMENT_OPTIONS } from "@/constence";
import { ListView } from "@/components/refine-ui/views/list-view.tsx";
import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb.tsx";
import { Input } from "@/components/ui/input.tsx";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import { CreateButton } from "@/components/refine-ui/buttons/create.tsx";
import { DataTable } from "@/components/refine-ui/data-table/data-table.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { EditButton } from "@/components/refine-ui/buttons/edit.tsx";
import { ShowButton } from "@/components/refine-ui/buttons/show.tsx";
import { useSearchParams } from "react-router";

const SubjectList = () => {
    const { data: currentUser } = useGetIdentity<{ role?: string }>();
    const canManageSubjects =
        currentUser?.role === "admin" || currentUser?.role === "teacher";
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("q") ?? ""
    );
    const [selectedDepartment, setSelectedDepartment] = useState(
        searchParams.get("department") ?? "all"
    );
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { open } = useNotification();

    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(
            () => [
                {
                    id: "name",
                    accessorKey: "name",
                    size: 260,
                    enableSorting: true,
                    header: () => <p className="column-title">Name</p>,
                    cell: ({ getValue }) => (
                        <span className="text-foreground">{getValue<string>()}</span>
                    ),
                },
                {
                    id: "department",
                    accessorKey: "department",
                    size: 200,
                    enableSorting: true,
                    header: () => <p className="column-title">Department</p>,
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
                                resource="subjects"
                                recordItemId={row.original.id}
                                size="sm"
                                variant="outline"
                            />
                            {canManageSubjects ? (
                                <EditButton
                                    resource="subjects"
                                    recordItemId={row.original.id}
                                    size="sm"
                                    variant="outline"
                                />
                            ) : null}
                        </div>
                    ),
                },
            ],
            [canManageSubjects],
        ),
        enableColumnPinning: true,
        initialState: {
            columnPinning: {
                right: ["actions"],
            },
        },
        refineCoreProps: {
            resource: "subjects",
            pagination: { pageSize: 10, mode: "server" },
            sorters: { mode: "server" },
        },
    });
    const { setFilters, setSorters, sorters } = subjectTable.refineCore;
    const { tableQuery } = subjectTable.refineCore;
    const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const urlQuery = searchParams.get("q") ?? "";
        const urlDepartment = searchParams.get("department") ?? "all";

        if (urlQuery !== searchQuery) {
            setSearchQuery(urlQuery);
        }

        if (urlDepartment !== selectedDepartment) {
            setSelectedDepartment(urlDepartment);
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

        if (selectedDepartment !== "all") {
            nextFilters.push({
                field: "department",
                operator: "eq",
                value: selectedDepartment,
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
    }, [selectedDepartment, debouncedSearch, setFilters]);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams);
        if (debouncedSearch) {
            nextParams.set("q", debouncedSearch);
        } else {
            nextParams.delete("q");
        }

        if (selectedDepartment !== "all") {
            nextParams.set("department", selectedDepartment);
        } else {
            nextParams.delete("department");
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
    }, [debouncedSearch, selectedDepartment, sorters, searchParams, setSearchParams]);

    useEffect(() => {
        if (!tableQuery.error) return;

        const error = tableQuery.error as { message?: string; statusCode?: number };
        const status = error.statusCode;
        const message =
            status === 403
                ? "Too many requests"
                : error.message || "Failed to load subjects";

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
            <h1 className="page-title">Subjects</h1>
            <div className="intro-row">
                <p>Browse and filter the available subjects.</p>
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
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by department..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All departments</SelectItem>
                            {DEPARTMENT_OPTIONS.map((department) => (
                                <SelectItem key={department.value} value={department.value}>
                                    {department.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {canManageSubjects ? <CreateButton /> : null}
                </div>
            </div>
            <DataTable table={subjectTable} />
        </ListView>
    );
};

export default SubjectList;

