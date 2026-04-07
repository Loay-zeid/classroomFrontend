import { useMemo } from "react";
import { useList } from "@refinedev/core";
import dayjs from "dayjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Department, ClassDetails } from "@/types";

const StudentDashboard = () => {
  const { query: classesQuery, result: classesResult } = useList<ClassDetails>({
    resource: "classes",
    pagination: { pageSize: 100 },
  });

  const { query: departmentsQuery, result: departmentsResult } =
    useList<Department>({
      resource: "departments",
      pagination: { pageSize: 100 },
    });

  const classes = classesResult.data ?? [];
  const departments = departmentsResult.data ?? [];
  const isLoading = classesQuery.isLoading || departmentsQuery.isLoading;

  const recentClasses = useMemo(() => {
    return classes
      .slice()
      .sort((a, b) => {
        const aDate = a.createdAt ?? a.created_at ?? "";
        const bDate = b.createdAt ?? b.created_at ?? "";
        return dayjs(bDate).valueOf() - dayjs(aDate).valueOf();
      })
      .slice(0, 6);
  }, [classes]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome back</h1>
        <p className="text-muted-foreground">
          Here is a quick view of your classes and enrollments.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{classes.length}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{departments.length}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">
            Recent classes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={`enrollment-skeleton-${index}`} className="h-6" />
              ))}
            </div>
          ) : recentClasses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No classes available yet.
            </p>
          ) : (
            recentClasses.map((item) => {
              const createdAt = item.createdAt ?? item.created_at;
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {item.name ?? "Class"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created{" "}
                      {createdAt && dayjs(createdAt).isValid()
                        ? dayjs(createdAt).format("MMM D, YYYY")
                        : "-"}
                    </p>
                  </div>
                  <Badge variant="secondary">
                    {item.status ?? "active"}
                  </Badge>
                </div>
              );
            })
          )}

          <div className="pt-2">
            <Button variant="secondary" asChild>
              <a href="/classes">View classes</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDashboard;
