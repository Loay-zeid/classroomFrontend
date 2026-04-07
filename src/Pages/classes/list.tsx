import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { Search } from "lucide-react";
import { CrudFilter, useGetIdentity, useList, useNotification } from "@refinedev/core";
import { ClassDetails, Subject, User } from "@/types";
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
import {ShowButton} from "@/components/refine-ui/buttons/show.tsx";
import { EditButton } from "@/components/refine-ui/buttons/edit.tsx";
import { useSearchParams } from "react-router";

const ClassesList = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(
        searchParams.get("q") ?? ""
    );
    const [selectedSubject, setSelectedSubject] = useState(
        searchParams.get("subject") ?? "all"
    );
    const [selectedTeacher, setSelectedTeacher] = useState(
        searchParams.get("teacher") ?? "all"
    );
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { open } = useNotification();
    const { data: currentUser } = useGetIdentity<{ role?: string }>();
    const canManageClasses =
        currentUser?.role === "admin" || currentUser?.role === "teacher";

    const { result: subjectsResult } = useList<Subject>({
        resource: "subjects",
        pagination: {
            pageSize: 100,
        },
    });

    const { result: teachersResult } = useList<User>({
        resource: "users",
        filters: [{ field: "role", operator: "eq", value: "teacher" }],
        pagination: {
            pageSize: 100,
        },
    });

    const subjects = subjectsResult.data ?? [];
    const teachers = teachersResult.data ?? [];

    const classesTable = useTable<ClassDetails>({
        columns: useMemo<ColumnDef<ClassDetails>[]>(
            () => [
                {
                    id: "bannerUrl",
                    accessorKey: "bannerUrl",
                    size: 140,
                    header: () => <p className="column-title ml-2">Banner</p>,
                    cell: ({ getValue }) => {
                        const url = getValue<string | null | undefined>();
                        if (!url) {
                            return (
                                <div className="ml-2 flex h-10 w-14 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                                    N/A
                                </div>
                            );
                        }
                        return (
                            <img
                                src={url}
                                alt="Class banner"
                                className="ml-2 h-10 w-14 rounded-md object-cover"
                            />
                        );
                    },
                },
                {
                    id: "name",
                    accessorKey: "name",
                    size: 220,
                    enableSorting: true,
                    header: () => <p className="column-title">Class Name</p>,
                    cell: ({ getValue }) => (
                        <span className="text-foreground">{getValue<string>()}</span>
                    ),
                },
                {
                    id: "status",
                    accessorKey: "status",
                    size: 120,
                    enableSorting: true,
                    header: () => <p className="column-title">Status</p>,
                    cell: ({ getValue }) => {
                        const status = String(getValue<string>() ?? "");
                        const variant = status === "active" ? "default" : "secondary";
                        return <Badge variant={variant}>{status}</Badge>;
                    },
                },
                {
                    id: "subject",
                    accessorFn: (row) => row.subject?.name ?? "N/A",
                    size: 200,
                    header: () => <p className="column-title">Subject</p>,
                    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
                },
                {
                    id: "teacher",
                    accessorFn: (row) => row.teacher?.name ?? "N/A",
                    size: 200,
                    header: () => <p className="column-title">Teacher</p>,
                    cell: ({ getValue }) => <span>{getValue<string>()}</span>,
                },
                {
                    id: "capacity",
                    accessorKey: "capacity",
                    size: 120,
                    enableSorting: true,
                    header: () => <p className="column-title">Capacity</p>,
                    cell: ({ getValue }) => <span>{getValue<number>()}</span>,
                },
                {
                    id: "capacityStatus",
                    accessorKey: "capacity",
                    size: 160,
                    header: () => <p className="column-title">Capacity Status</p>,
                    cell: ({ getValue }) => {
                        const capacity = Number(getValue<number>() ?? 0);
                        const status =
                            capacity <= 10 ? "Low" : capacity <= 25 ? "Medium" : "Healthy";
                        const variant =
                            status === "Low" ? "destructive" : status === "Medium" ? "secondary" : "default";
                        return <Badge variant={variant}>{status}</Badge>;
                    },
                },
                {
                    id: "actions",
                    size: 200,
                    header: () => <p className="column-title">Actions</p>,
                    cell: ({ row }) => (
                        <div className="flex items-center gap-2">
                            <ShowButton resource="classes" recordItemId={row.original.id} variant="outline" size="sm" >
                                View
                            </ShowButton>
                            {canManageClasses ? (
                                <EditButton resource="classes" recordItemId={row.original.id} variant="outline" size="sm" />
                            ) : null}
                        </div>
                    )
                }
            ],
            [canManageClasses],
        ),
        enableColumnPinning: true,
        initialState: {
            columnPinning: {
                right: ["actions"],
            },
        },
        refineCoreProps: {
            resource: "classes",
            pagination: { pageSize: 10, mode: "server" },
            sorters: { mode: "server" },
        },
    });

    const { setFilters, setSorters, sorters } = classesTable.refineCore;
    const { tableQuery } = classesTable.refineCore;
    const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(searchQuery.trim());
        }, 350);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    useEffect(() => {
        const urlQuery = searchParams.get("q") ?? "";
        const urlSubject = searchParams.get("subject") ?? "all";
        const urlTeacher = searchParams.get("teacher") ?? "all";

        if (urlQuery !== searchQuery) {
            setSearchQuery(urlQuery);
        }

        if (urlSubject !== selectedSubject) {
            setSelectedSubject(urlSubject);
        }

        if (urlTeacher !== selectedTeacher) {
            setSelectedTeacher(urlTeacher);
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
    }, [
        searchParams,
        searchQuery,
        selectedSubject,
        selectedTeacher,
        setSorters,
        sorters,
    ]);

    useEffect(() => {
        const nextFilters: CrudFilter[] = [];

        if (selectedSubject !== "all") {
            nextFilters.push({
                field: "subject",
                operator: "eq",
                value: selectedSubject,
            });
        }

        if (selectedTeacher !== "all") {
            nextFilters.push({
                field: "teacher",
                operator: "eq",
                value: selectedTeacher,
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
    }, [selectedSubject, selectedTeacher, debouncedSearch, setFilters]);

    useEffect(() => {
        const nextParams = new URLSearchParams(searchParams);
        if (debouncedSearch) {
            nextParams.set("q", debouncedSearch);
        } else {
            nextParams.delete("q");
        }

        if (selectedSubject !== "all") {
            nextParams.set("subject", selectedSubject);
        } else {
            nextParams.delete("subject");
        }

        if (selectedTeacher !== "all") {
            nextParams.set("teacher", selectedTeacher);
        } else {
            nextParams.delete("teacher");
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
    }, [
        debouncedSearch,
        selectedSubject,
        selectedTeacher,
        sorters,
        searchParams,
        setSearchParams,
    ]);

    useEffect(() => {
        if (!tableQuery.error) return;

        const error = tableQuery.error as { message?: string; statusCode?: number };
        const status = error.statusCode;
        const message =
            status === 403
                ? "Too many requests"
                : error.message || "Failed to load classes";

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
            <h1 className="page-title">Classes</h1>
            <div className="intro-row">
                <p>Quick access to essential metrics and management tools.</p>
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
                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by subject..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All subjects</SelectItem>
                            {subjects.map((subject) => (
                                <SelectItem key={subject.id} value={subject.name}>
                                    {subject.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by teacher..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All teachers</SelectItem>
                            {teachers.map((teacher) => (
                                <SelectItem key={teacher.id} value={teacher.name}>
                                    {teacher.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {canManageClasses ? <CreateButton resource="classes" /> : null}
                </div>
            </div>
            <DataTable table={classesTable} />
        </ListView>
    );
};

export default ClassesList;
