import { useShow } from "@refinedev/core";
import dayjs from "dayjs";
import { Department } from "@/types";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card, CardContent } from "@/components/ui/card";

const DepartmentsShow = () => {
  const { query } = useShow<Department>({ resource: "departments" });
  const department = query.data?.data;

  if (query.isLoading || query.isError || !department) {
    return (
      <ShowView>
        <ShowViewHeader resource="departments" title="Department Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading department details..."
            : query.isError
            ? "Failed to fetch department details..."
            : "Department details not found."}
        </p>
      </ShowView>
    );
  }

  const createdAt = department.createdAt ?? department.created_at;
  const formattedCreated =
    createdAt && dayjs(createdAt).isValid()
      ? dayjs(createdAt).format("MMM D, YYYY")
      : "-";

  const subjectsCount =
    typeof department.subjectsCount === "number" ? department.subjectsCount : 0;
  const classesCount =
    typeof department.classesCount === "number" ? department.classesCount : 0;
  const enrollmentsCount =
    typeof department.enrollmentsCount === "number"
      ? department.enrollmentsCount
      : 0;

  return (
    <ShowView>
      <ShowViewHeader resource="departments" title="Department Details" />

      <div className="space-y-6">
        <Card className="border p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Department ID</p>
              <p className="text-base font-medium">{department.id}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Code</p>
              <p className="text-base font-medium">{department.code ?? "-"}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="text-base font-medium">{department.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="text-base font-medium">{formattedCreated}</p>
            </div>
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm text-muted-foreground">Description</p>
              <p className="text-base font-medium">
                {department.description?.trim() || "-"}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Subjects</p>
              <div className="text-2xl font-semibold mt-1">{subjectsCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Classes</p>
              <div className="text-2xl font-semibold mt-1">{classesCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Enrolled Students</p>
              <div className="text-2xl font-semibold mt-1">
                {enrollmentsCount}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ShowView>
  );
};

export default DepartmentsShow;
