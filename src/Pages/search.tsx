import { Breadcrumb } from "@/components/refine-ui/layout/breadcrumb";
import { ListView } from "@/components/refine-ui/views/list-view";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ClassDetails, Department, Subject, User } from "@/types";
import { useList } from "@refinedev/core";
import { Link, useSearchParams } from "react-router";

type EnrollmentSearchRow = {
  id: number;
  studentId: string;
  classId: number;
  student?: User;
  class?: { id: number; name?: string };
  createdAt?: string;
  created_at?: string;
};

const RESULT_LIMIT = 5;

const GlobalSearch = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get("q") ?? "").trim();
  const hasQuery = query.length > 0;

  const { result: subjectsResult } = useList<Subject>({
    resource: "subjects",
    filters: hasQuery
      ? [{ field: "name", operator: "contains", value: query }]
      : [],
    pagination: { pageSize: RESULT_LIMIT },
    queryOptions: { enabled: hasQuery },
  });

  const { result: usersResult } = useList<User>({
    resource: "users",
    filters: hasQuery
      ? [{ field: "name", operator: "contains", value: query }]
      : [],
    pagination: { pageSize: RESULT_LIMIT },
    queryOptions: { enabled: hasQuery },
  });

  const { result: departmentsResult } = useList<Department>({
    resource: "departments",
    filters: hasQuery
      ? [{ field: "name", operator: "contains", value: query }]
      : [],
    pagination: { pageSize: RESULT_LIMIT },
    queryOptions: { enabled: hasQuery },
  });

  const { result: classesResult } = useList<ClassDetails>({
    resource: "classes",
    filters: hasQuery
      ? [{ field: "name", operator: "contains", value: query }]
      : [],
    pagination: { pageSize: RESULT_LIMIT },
    queryOptions: { enabled: hasQuery },
  });

  const { result: enrollmentsResult } = useList<EnrollmentSearchRow>({
    resource: "enrollments",
    filters: hasQuery
      ? [{ field: "search", operator: "contains", value: query }]
      : [],
    pagination: { pageSize: RESULT_LIMIT },
    queryOptions: { enabled: hasQuery },
  });

  const subjects = subjectsResult.data ?? [];
  const users = usersResult.data ?? [];
  const departments = departmentsResult.data ?? [];
  const classes = classesResult.data ?? [];
  const enrollments = enrollmentsResult.data ?? [];

  const hasAnyResult =
    subjects.length > 0 ||
    users.length > 0 ||
    departments.length > 0 ||
    classes.length > 0 ||
    enrollments.length > 0;

  return (
    <ListView>
      <Breadcrumb />
      <h1 className="page-title">Global Search</h1>
      <div className="intro-row">
        <p>
          Search results across Subjects, Users, Departments, Classes, and
          Enrollments.
        </p>
      </div>

      {!hasQuery ? (
        <Card>
          <CardHeader>
            <CardTitle>Start a search</CardTitle>
            <CardDescription>
              Use the fixed header search bar and press Enter to search all
              sections.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {hasQuery && !hasAnyResult ? (
        <Card>
          <CardHeader>
            <CardTitle>No global matches</CardTitle>
            <CardDescription>
              No records matched <span className="font-medium">{query}</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : null}

      {hasQuery ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <SearchSection
            title="Subjects"
            description="Matched by subject name."
            isLoading={subjectsResult.isLoading}
            items={subjects.map((subject) => ({
              id: subject.id,
              label: subject.name,
              to: `/subjects/show/${subject.id}`,
              meta: subject.department || "No department",
            }))}
          />

          <SearchSection
            title="Users"
            description="Matched by user name."
            isLoading={usersResult.isLoading}
            items={users.map((user) => ({
              id: user.id,
              label: user.name,
              to: `/users/show/${user.id}`,
              meta: `${user.email} · ${user.role}`,
            }))}
          />

          <SearchSection
            title="Departments"
            description="Matched by department name."
            isLoading={departmentsResult.isLoading}
            items={departments.map((department) => ({
              id: department.id,
              label: department.name,
              to: `/departments/show/${department.id}`,
              meta: department.code ? `Code: ${department.code}` : "Department",
            }))}
          />

          <SearchSection
            title="Classes"
            description="Matched by class name."
            isLoading={classesResult.isLoading}
            items={classes.map((classItem) => ({
              id: classItem.id,
              label: classItem.name,
              to: `/classes/show/${classItem.id}`,
              meta: classItem.subject?.name ?? "No subject",
            }))}
          />

          <SearchSection
            title="Enrollments"
            description="Matched by student or class."
            isLoading={enrollmentsResult.isLoading}
            items={enrollments.map((enrollment) => ({
              id: enrollment.id,
              label: enrollment.student?.name ?? "Unknown Student",
              to: `/classes/show/${enrollment.classId}`,
              meta: enrollment.class?.name
                ? `Class: ${enrollment.class.name}`
                : `Class ID: ${enrollment.classId}`,
            }))}
          />
        </div>
      ) : null}
    </ListView>
  );
};

type SearchItem = {
  id: number | string;
  label: string;
  meta: string;
  to: string;
};

type SearchSectionProps = {
  title: string;
  description: string;
  isLoading?: boolean;
  items: SearchItem[];
};

const SearchSection = ({
  title,
  description,
  isLoading,
  items,
}: SearchSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={`${title}-skeleton-${index}`} className="h-10 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No matches.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={`${title}-${item.id}`}
                className="flex flex-col rounded-md border p-3"
              >
                <Link
                  to={item.to}
                  className="text-sm font-medium text-foreground hover:underline"
                >
                  {item.label}
                </Link>
                <span className="text-xs text-muted-foreground">{item.meta}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};

export default GlobalSearch;
