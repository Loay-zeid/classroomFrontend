import { useEffect, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { Search } from "lucide-react";
import { CrudFilter } from "@refinedev/core";
import { Subject } from "@/types";
import { DEPARTMENTS_OPTIONS } from "@/constence";
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

const SubjectList = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");

    const subjectTable = useTable<Subject>({
        columns: useMemo<ColumnDef<Subject>[]>(
            () => [
                {
                    id: "courseCode",
                    accessorKey: "courseCode",
                    size: 120,
                    header: () => <p className="column-title ml-2">Course Code</p>,
                    cell: ({ getValue }) => <Badge>{getValue<string>()}</Badge>,
                },
                {
                    id: "name",
                    accessorKey: "name",
                    size: 220,
                    header: () => <p className="column-title">Name</p>,
                    cell: ({ getValue }) => (
                        <span className="text-foreground">{getValue<string>()}</span>
                    ),
                },
                {
                    id: "department",
                    accessorKey: "department",
                    size: 120,
                    header: () => <p className="column-title">Department</p>,
                    cell: ({ getValue }) => <Badge variant="secondary">{getValue<string>()}</Badge>,
                },
                {
                    id: "briefDescription",
                    accessorKey: "briefDescription",
                    size: 350,
                    header: () => <p className="column-title">Brief Description</p>,
                    cell: ({ getValue }) => (
                        <span className="line-clamp-2">{getValue<string>()}</span>
                    ),
                },
            ],
            [],
        ),
        refineCoreProps: {
            resource: "subjects",
            pagination: { pageSize: 10, mode: "server" },
        },
    });
    const { setFilters } = subjectTable.refineCore;

    useEffect(() => {
        const nextFilters: CrudFilter[] = [];

        if (selectedDepartment !== "all") {
            nextFilters.push({
                field: "department",
                operator: "eq",
                value: selectedDepartment,
            });
        }

        if (searchQuery.trim()) {
            nextFilters.push({
                field: "name",
                operator: "contains",
                value: searchQuery.trim(),
            });
        }

        setFilters(nextFilters, "replace");
    }, [selectedDepartment, searchQuery, setFilters]);

    return (
        <ListView>
            <Breadcrumb />
            <h1 className="page-title">Subjects</h1>
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
                    <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                        <SelectTrigger>
                            <SelectValue placeholder="Filter by department..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All departments</SelectItem>
                            {DEPARTMENTS_OPTIONS.map((department) => (
                                <SelectItem key={department.value} value={department.value}>
                                    {department.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <CreateButton />
                </div>
            </div>
            <DataTable table={subjectTable} />
        </ListView>
    );
};

export default SubjectList;
