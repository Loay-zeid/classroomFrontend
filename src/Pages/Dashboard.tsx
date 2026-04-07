import { useEffect, useMemo, useState } from "react";
import { useList, useNotification } from "@refinedev/core";
import dayjs from "dayjs";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateButton } from "@/components/refine-ui/buttons/create";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { ClassDetails, Subject, User } from "@/types";

type EnrollmentRow = {
  id: number;
  studentId: string;
  classId: number;
  created_at?: string;
  createdAt?: string;
  student?: User;
  class?: { id: number; name?: string; subjectId?: number };
};

type ActivityItem = {
  id: string;
  title: string;
  subtitle: string;
  createdAt?: string;
};

const Dashboard = () => {
  const { open } = useNotification();
  const [lastError, setLastError] = useState<string | null>(null);

  const { query: usersQuery, result: usersResult } = useList<User>({
    resource: "users",
    pagination: { pageSize: 200 },
  });
  const { query: subjectsQuery, result: subjectsResult } = useList<Subject>({
    resource: "subjects",
    pagination: { pageSize: 200 },
  });
  const { query: classesQuery, result: classesResult } = useList<ClassDetails>({
    resource: "classes",
    pagination: { pageSize: 200 },
  });
  const { query: enrollmentsQuery, result: enrollmentsResult } = useList<EnrollmentRow>({
    resource: "enrollments",
    pagination: { pageSize: 200 },
  });

  const users = usersResult?.data ?? [];
  const subjects = subjectsResult?.data ?? [];
  const classes = classesResult?.data ?? [];
  const enrollments = enrollmentsResult?.data ?? [];

  const isLoading =
    usersQuery.isLoading ||
    subjectsQuery.isLoading ||
    classesQuery.isLoading ||
    enrollmentsQuery.isLoading;

  const usersTotal = usersResult?.total ?? users.length;
  const subjectsTotal = subjectsResult?.total ?? subjects.length;
  const classesTotal = classesResult?.total ?? classes.length;
  const enrollmentsTotal = enrollmentsResult?.total ?? enrollments.length;

  const activityFeed = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    users.forEach((user) => {
      items.push({
        id: `user-${user.id}`,
        title: `New user: ${user.name ?? "Unknown"}`,
        subtitle: user.email ?? "User added",
        createdAt: user.createdAt,
      });
    });

    subjects.forEach((subject) => {
      items.push({
        id: `subject-${subject.id}`,
        title: `New subject: ${subject.name ?? "Untitled"}`,
        subtitle: "Subject created",
        createdAt: subject.createdAt,
      });
    });

    classes.forEach((classRow) => {
      items.push({
        id: `class-${classRow.id}`,
        title: `New class: ${classRow.name ?? "Untitled"}`,
        subtitle: classRow.subject?.name ?? "Class created",
        createdAt: classRow.createdAt ?? classRow.created_at,
      });
    });

    enrollments.forEach((enrollment) => {
      const studentName = enrollment.student?.name ?? "Student";
      const className = enrollment.class?.name ?? "Class";
      items.push({
        id: `enrollment-${enrollment.id}`,
        title: `${studentName} enrolled`,
        subtitle: className,
        createdAt: enrollment.createdAt ?? enrollment.created_at,
      });
    });

    return items
      .filter((item) => item.createdAt)
      .sort((a, b) =>
        dayjs(b.createdAt as string).valueOf() -
        dayjs(a.createdAt as string).valueOf()
      )
      .slice(0, 6);
  }, [users, subjects, classes, enrollments]);

  const enrollmentTrendData = useMemo(() => {
    const days = Array.from({ length: 14 }).map((_, index) => {
      const day = dayjs().subtract(13 - index, "day");
      return {
        key: day.format("YYYY-MM-DD"),
        label: day.format("MMM D"),
        count: 0,
      };
    });

    const indexByDay = new Map(days.map((item) => [item.key, item]));
    enrollments.forEach((enrollment) => {
      const raw = enrollment.createdAt ?? enrollment.created_at;
      if (!raw) return;
      const key = dayjs(raw).format("YYYY-MM-DD");
      const target = indexByDay.get(key);
      if (target) target.count += 1;
    });

    return days.map(({ label, count }) => ({ label, count }));
  }, [enrollments]);

  const classesByDepartmentData = useMemo(() => {
    const subjectDepartmentMap = new Map<number, string>();
    subjects.forEach((subject) => {
      if (typeof subject.id === "number") {
        subjectDepartmentMap.set(subject.id, subject.department ?? "Unknown");
      }
    });

    const counts = new Map<string, number>();
    classes.forEach((classRow) => {
      const subjectId =
        classRow.subject?.id ?? classRow.subjectId ?? classRow.subject?.id;
      const departmentName =
        (subjectId ? subjectDepartmentMap.get(subjectId) : undefined) ??
        classRow.department?.name ??
        "Unknown";
      counts.set(departmentName, (counts.get(departmentName) ?? 0) + 1);
    });

    return Array.from(counts.entries()).map(([label, value]) => ({
      label,
      value,
    }));
  }, [classes, subjects]);

  const capacityUsageData = useMemo(() => {
    const enrollmentCounts = new Map<number, number>();
    enrollments.forEach((enrollment) => {
      enrollmentCounts.set(
        enrollment.classId,
        (enrollmentCounts.get(enrollment.classId) ?? 0) + 1
      );
    });

    const buckets = {
      Low: 0,
      Medium: 0,
      High: 0,
    };

    classes.forEach((classRow) => {
      const capacity = classRow.capacity ?? 0;
      if (capacity <= 0) return;
      const enrolled = enrollmentCounts.get(classRow.id) ?? 0;
      const ratio = enrolled / capacity;
      if (ratio <= 0.5) buckets.Low += 1;
      else if (ratio <= 0.8) buckets.Medium += 1;
      else buckets.High += 1;
    });

    return [
      { label: "Low", value: buckets.Low },
      { label: "Medium", value: buckets.Medium },
      { label: "High", value: buckets.High },
    ];
  }, [classes, enrollments]);

  const userDistributionData = useMemo(() => {
    const counts = new Map<string, number>();
    users.forEach((user) => {
      const key = user.role ?? "unknown";
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    return Array.from(counts.entries()).map(([label, value]) => ({
      label,
      value,
    }));
  }, [users]);

  useEffect(() => {
    const errorMessage =
      usersQuery.error?.message ||
      subjectsQuery.error?.message ||
      classesQuery.error?.message ||
      enrollmentsQuery.error?.message ||
      null;

    if (!errorMessage || errorMessage === lastError) return;

    setLastError(errorMessage);
    open?.({
      type: "error",
      message: "Failed to load dashboard data",
      description: errorMessage,
    });
  }, [usersResult, subjectsResult, classesResult, enrollmentsResult, lastError, open]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Welcome back</h1>
        <p className="text-muted-foreground">
          Here is a quick snapshot of your classroom system.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{usersTotal}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Admin, teachers, students
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{subjectsTotal}</div>
            )}
            <p className="text-xs text-muted-foreground">Active catalog</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Classes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{classesTotal}</div>
            )}
            <p className="text-xs text-muted-foreground">Live and upcoming</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Enrollments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-2xl font-semibold">{enrollmentsTotal}</div>
            )}
            <p className="text-xs text-muted-foreground">
              Total students enrolled
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Activity feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={`activity-skeleton-${index}`} className="space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))}
              </div>
            ) : activityFeed.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity yet.
              </p>
            ) : (
              activityFeed.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.subtitle}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.createdAt && dayjs(item.createdAt).isValid()
                      ? dayjs(item.createdAt).format("MMM D, YYYY")
                      : "-"}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Quick actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <CreateButton resource="users" className="w-full">
                Create user
              </CreateButton>
              <CreateButton resource="subjects" className="w-full">
                Create subject
              </CreateButton>
              <CreateButton resource="classes" className="w-full">
                Create class
              </CreateButton>
              <CreateButton resource="departments" className="w-full">
                Create department
              </CreateButton>
            </div>
            <Button variant="secondary" className="w-full" asChild>
              <a href="/enrollments">View enrollments</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Enrollment trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : enrollmentTrendData.every((item) => item.count === 0) ? (
              <p className="text-sm text-muted-foreground">
                No enrollment activity yet.
              </p>
            ) : (
              <ChartContainer
                config={{
                  count: { label: "Enrollments", color: "#2563eb" },
                }}
                className="h-56 w-full"
              >
                <LineChart data={enrollmentTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    dataKey="count"
                    type="monotone"
                    stroke="var(--color-count)"
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Classes by department
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : classesByDepartmentData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No classes found yet.
              </p>
            ) : (
              <ChartContainer
                config={{
                  value: { label: "Classes", color: "#f59e0b" },
                }}
                className="h-64 w-full"
              >
                <BarChart data={classesByDepartmentData} layout="vertical" margin={{ left: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="label" width={140} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" fill="var(--color-value)" radius={6} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              Capacity usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : capacityUsageData.every((item) => item.value === 0) ? (
              <p className="text-sm text-muted-foreground">
                No capacity data yet.
              </p>
            ) : (
              <ChartContainer
                config={{
                  Low: { label: "Low", color: "#22c55e" },
                  Medium: { label: "Medium", color: "#f59e0b" },
                  High: { label: "High", color: "#ef4444" },
                }}
                className="h-56 w-full"
              >
                <BarChart data={capacityUsageData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="value" radius={6}>
                    {capacityUsageData.map((entry) => {
                      const color =
                        entry.label === "Low"
                          ? "var(--color-Low)"
                          : entry.label === "Medium"
                          ? "var(--color-Medium)"
                          : "var(--color-High)";
                      return (
                        <Cell key={entry.label} fill={color} />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">
              User distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-56 w-full" />
            ) : userDistributionData.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No users yet.
              </p>
            ) : (
              <ChartContainer
                config={{
                  admin: { label: "Admin", color: "#0ea5e9" },
                  teacher: { label: "Teacher", color: "#8b5cf6" },
                  student: { label: "Student", color: "#22c55e" },
                  unknown: { label: "Unknown", color: "#94a3b8" },
                }}
                className="h-56 w-full"
              >
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Pie
                    data={userDistributionData}
                    dataKey="value"
                    nameKey="label"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {userDistributionData.map((entry) => {
                      const color =
                        entry.label === "admin"
                          ? "var(--color-admin)"
                          : entry.label === "teacher"
                          ? "var(--color-teacher)"
                          : entry.label === "student"
                          ? "var(--color-student)"
                          : "var(--color-unknown)";
                      return <Cell key={entry.label} fill={color} />;
                    })}
                  </Pie>
                </PieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
