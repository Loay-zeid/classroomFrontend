import { useEffect, useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useTable } from "@refinedev/react-table";
import { CrudFilter, useShow } from "@refinedev/core";
import dayjs from "dayjs";
import { ClassDetails, Subject } from "@/types";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/refine-ui/data-table/data-table";

const SubjectsShow = () => {
  const { query } = useShow<Subject>({ resource: "subjects" });
  const subject = query.data?.data;

  const classesTable = useTable<ClassDetails>({
    columns: useMemo<ColumnDef<ClassDetails>[]>(
      () => [
        {
          id: "name",
          accessorKey: "name",
          size: 240,
          header: () => <p className="column-title">Class Name</p>,
          cell: ({ getValue }) => (
            <span className="text-foreground">{getValue<string>()}</span>
          ),
        },
      ],
      []
    ),
    refineCoreProps: {
      resource: "classes",
      pagination: { pageSize: 5, mode: "server" },
    },
  });

  const { setFilters } = classesTable.refineCore;

  useEffect(() => {
    if (!subject?.id) return;
    const nextFilters: CrudFilter[] = [
      { field: "subjectId", operator: "eq", value: subject.id },
    ];
    setFilters(nextFilters, "replace");
  }, [subject?.id, setFilters]);

  if (query.isLoading || query.isError || !subject) {
    return (
      <ShowView>
        <ShowViewHeader resource="subjects" title="Subject Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading subject details..."
            : query.isError
            ? "Failed to fetch subject details..."
            : "Subject details not found."}
        </p>
      </ShowView>
    );
  }

  const createdAt = subject.createdAt;
  const formattedCreated =
    createdAt && dayjs(createdAt).isValid()
      ? dayjs(createdAt).format("MMM D, YYYY")
      : "-";

  return (
    <ShowView>
      <ShowViewHeader resource="subjects" title="Subject Details" />

      <div className="space-y-6">
        <Card className="border p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Subject ID</p>
              <p className="text-base font-medium">{subject.id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Department</p>
              <p className="text-base font-medium">{subject.department}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base font-medium">{subject.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-base font-medium">{formattedCreated}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <div>
            <h2 className="text-lg font-semibold">Classes</h2>
            <p className="text-sm text-muted-foreground">
              Classes linked to this subject.
            </p>
          </div>
          <DataTable table={classesTable} />
        </div>
      </div>
    </ShowView>
  );
};

export default SubjectsShow;
