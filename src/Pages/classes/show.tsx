import { useEffect, useMemo, useState } from "react";
import { useList, useNotification, useShow } from "@refinedev/core";
import dayjs from "dayjs";
import { ClassDetails, Subject, User } from "@/types";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view.tsx";
import { Card } from "@/components/ui/card.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Separator } from "@/components/ui/separator.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select.tsx";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table.tsx";
import { AdvancedImage } from "@cloudinary/react";
import { bannerPhoto } from "@/lib/cloudinary.ts";
import { BACKEND_BASE_URL } from "@/constence";

type EnrollmentRow = {
    id: number;
    studentId: string;
    classId: number;
    created_at?: string;
    createdAt?: string;
    student?: User;
};

const Show = () => {

    const {query} = useShow<ClassDetails>({resource: "classes"})
    const { open } = useNotification();
    const classDetails = query.data?.data;
    const { isLoading, isError } = query;
    const [enrollments, setEnrollments] = useState<EnrollmentRow[]>([]);
    const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
    const [enrollmentsError, setEnrollmentsError] = useState<string | null>(null);
    const [enrollStudentId, setEnrollStudentId] = useState("");
    const [joinStudentId, setJoinStudentId] = useState("");
    const [inviteCodeInput, setInviteCodeInput] = useState("");
    const [isEnrolling, setIsEnrolling] = useState(false);
    const [isJoining, setIsJoining] = useState(false);
    const [processingStudentId, setProcessingStudentId] = useState<string | null>(
        null
    );

    const { result: studentsResult } = useList<User>({
        resource: "users",
        filters: [{ field: "role", operator: "eq", value: "student" }],
        pagination: {
            pageSize: 200,
        },
    });

    const students = studentsResult.data ?? [];

    const { result: subjectsResult } = useList<Subject>({
        resource: "subjects",
        pagination: {
            pageSize: 200,
        },
    });

    const { result: teachersResult } = useList<User>({
        resource: "users",
        filters: [{ field: "role", operator: "eq", value: "teacher" }],
        pagination: {
            pageSize: 200,
        },
    });

    const subjects = subjectsResult.data ?? [];
    const teachers = teachersResult.data ?? [];

    const enrolledStudents = useMemo(
        () => new Set(enrollments.map((item) => item.studentId)),
        [enrollments],
    );

    useEffect(() => {
        if (!classDetails?.inviteCode) return;
        setInviteCodeInput((prev) => (prev ? prev : classDetails.inviteCode ?? ""));
    }, [classDetails?.inviteCode]);

    const apiBaseUrl = (() => {
        const trimmed = BACKEND_BASE_URL.replace(/\/+$/, "");
        return trimmed.includes("/api") ? trimmed : `${trimmed}/api`;
    })();

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

    const loadEnrollments = async () => {
        if (!classDetails?.id) return;
        setEnrollmentsLoading(true);
        setEnrollmentsError(null);
        try {
            const response = await fetch(
                `${apiBaseUrl}/classes/${classDetails.id}/enrollments`,
                { credentials: "include" }
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            const payload = (await response.json()) as { data?: EnrollmentRow[] };
            setEnrollments(payload.data ?? []);
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to load enrollments.";
            setEnrollmentsError(message);
            open?.({
                type: "error",
                message: "Failed to load enrollments",
                description: message,
            });
        } finally {
            setEnrollmentsLoading(false);
        }
    };

    useEffect(() => {
        if (!classDetails?.id) return;
        void loadEnrollments();
    }, [classDetails?.id]);

    if(isLoading || isError || !classDetails){
        return (
            <ShowView className="class-view class-shows">
                <ShowViewHeader resource="classes" title="Class Details" />
                <p className="state-message">
                    {isLoading ? "Loading class details..." : isError ? 'Failed to fetch class details...' : 'Class details not found.' }
                </p>
            </ShowView>
        )
    }

    const details = classDetails;
    const subjectFromList =
        details.subject ??
        subjects.find((item) => item.id === details.subjectId);
    const teacherFromList =
        details.teacher ??
        teachers.find((item) => item.id === details.teacherId);
    const departmentFromList = details.department ?? subjectFromList?.department;

    const subjectDetails = subjectFromList as
        | (typeof subjectFromList & { code?: string; description?: string })
        | undefined;
    const subjectCode =
        subjectDetails?.courseCode ??
        subjectDetails?.code ??
        "N/A";
    const subjectName = subjectDetails?.name ?? "Unknown";
    const subjectDescription =
        subjectDetails?.briefDescription ??
        subjectDetails?.description ??
        "";

    const teacherName= teacherFromList?.name ?? 'Unknown';
    const teacherInitials =
        teacherName.split('')
            .filter(Boolean)
            .slice(0,2)
            .map((part)=> part[0]?.toUpperCase())
            .join(' ');


    const placeholderUrl = `https://placehold.co/600x400?text=${encodeURIComponent(teacherInitials || 'NA')}`;

    const { name, description, status, capacity, bannerCldPubId, bannerUrl } = details;
    const statusLabel = (typeof status === "string" ? status : "inactive").toUpperCase();
    const inviteCode = details.inviteCode?.trim() ?? "";
    const inviteCodeLabel = inviteCode || "Not available";

    const handleCopyInvite = async () => {
        if (!inviteCode) {
            open?.({
                type: "error",
                message: "Invite code not available",
                description: "This class does not have an invite code yet.",
            });
            return;
        }

        try {
            await navigator.clipboard.writeText(inviteCode);
            open?.({
                type: "success",
                message: "Invite code copied",
                description: "You can now paste it to join the class.",
            });
        } catch {
            open?.({
                type: "error",
                message: "Copy failed",
                description: "Please copy the invite code manually.",
            });
        }
    };

    const handleEnrollStudent = async () => {
        if (!classDetails?.id) return;

        if (!enrollStudentId) {
            open?.({
                type: "error",
                message: "Select a student",
                description: "Choose a student before enrolling.",
            });
            return;
        }

        setIsEnrolling(true);
        try {
            const response = await fetch(
                `${apiBaseUrl}/classes/${classDetails.id}/enrollments`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ studentId: enrollStudentId }),
                    credentials: "include",
                },
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            open?.({
                type: "success",
                message: "Student enrolled",
                description: "Enrollment has been created.",
            });
            setEnrollStudentId("");
            await loadEnrollments();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to enroll student.";
            open?.({
                type: "error",
                message: "Enrollment failed",
                description: message,
            });
        } finally {
            setIsEnrolling(false);
        }
    };

    const handleJoinByInvite = async () => {
        if (!classDetails?.id) return;

        if (!inviteCodeInput.trim()) {
            open?.({
                type: "error",
                message: "Invite code required",
                description: "Enter an invite code to join the class.",
            });
            return;
        }

        if (!joinStudentId) {
            open?.({
                type: "error",
                message: "Select a student",
                description: "Choose a student before joining.",
            });
            return;
        }

        setIsJoining(true);
        try {
            const response = await fetch(`${apiBaseUrl}/classes/join`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    inviteCode: inviteCodeInput.trim(),
                    studentId: joinStudentId,
                }),
                credentials: "include",
            });

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            open?.({
                type: "success",
                message: "Student joined",
                description: "Invite code accepted.",
            });
            setJoinStudentId("");
            await loadEnrollments();
        } catch (error) {
            const message =
                error instanceof Error ? error.message : "Failed to join class.";
            open?.({
                type: "error",
                message: "Join failed",
                description: message,
            });
        } finally {
            setIsJoining(false);
        }
    };

    const handleUnenroll = async (studentId: string) => {
        if (!classDetails?.id) return;
        setProcessingStudentId(studentId);
        try {
            const response = await fetch(
                `${apiBaseUrl}/classes/${classDetails.id}/enrollments/${studentId}`,
                { method: "DELETE", credentials: "include" },
            );

            if (!response.ok) {
                throw new Error(await getErrorMessage(response));
            }

            open?.({
                type: "success",
                message: "Student unenrolled",
                description: "Enrollment removed.",
            });
            await loadEnrollments();
        } catch (error) {
            const message =
                error instanceof Error
                    ? error.message
                    : "Failed to unenroll student.";
            open?.({
                type: "error",
                message: "Unenroll failed",
                description: message,
            });
        } finally {
            setProcessingStudentId(null);
        }
    };

    const formatDate = (value?: string) => {
        if (!value) return "-";
        return dayjs(value).isValid() ? dayjs(value).format("MMM D, YYYY") : "-";
    };

    return (
        <ShowView className="class-view class-show">
            <ShowViewHeader resource="classes" title="Class Details" />

            <div className="banner">
                {bannerCldPubId ? (
                    <AdvancedImage
                        alt="Class Banner"
                        cldImg={bannerPhoto(bannerCldPubId ?? "" , name)}
                    />
                ) : bannerUrl ? (
                    <img src={bannerUrl} alt="Class Banner" />
                ) : (
                    <div className="placeholder"/>
                )}
            </div>

            <Card className="details-card">
                <div className="details-header">
                    <div>
                        <h1>
                            {name}
                        </h1>
                        <p>
                            {description}
                        </p>
                </div>
                    <div>
                        <Badge variant="outline" >{capacity} spots</Badge>
                        <Badge
                            variant={status == 'active'?'default' : 'secondary'}
                            data-status={status ?? "inactive"}
                        >
                            {statusLabel}
                        </Badge>
                    </div>
                </div>
                <div className="details-grid">
                    <div className="instructor">
                        <p>
                            instructor
                        </p>
                        <div>
                            <img src={teacherFromList?.image ?? placeholderUrl} alt={teacherName} />
                            <div>
                                <p>{teacherName}</p>
                                <p>{teacherFromList?.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="department">
                        <p>Department</p>

                        <div>
                           <p> {typeof departmentFromList === "string" ? departmentFromList : departmentFromList?.name ?? "Unknown"} </p>
                            <p> {typeof departmentFromList === "string" ? "" : departmentFromList?.description ?? ""}</p>
                        </div>
                    </div>
                </div>

                <Separator/>

                <div className="subject">
                    <p>Subject</p>
                    <div>
                        <Badge variant="outline">Code: {subjectCode}</Badge>
                        <p>{subjectName}</p>
                        <p>{subjectDescription}</p>
                    </div>
                </div>

                <Separator/>
                <div className="join">
                    <h2>Join Class</h2>

                    <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Invite code</span>
                        <Badge variant="outline">{inviteCodeLabel}</Badge>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleCopyInvite}
                            disabled={!inviteCode}
                        >
                            Copy
                        </Button>
                    </div>

                    <ol>
                        <li>Ask your teacher for the invite code </li>
                        <li>Click on "join class" button </li>
                        <li>Paste the code and click "join" </li>

                    </ol>
                </div>
                <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
                    <Input
                        value={inviteCodeInput}
                        onChange={(event) => setInviteCodeInput(event.target.value)}
                        placeholder="Invite code"
                    />
                    <Select value={joinStudentId} onValueChange={setJoinStudentId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select student" />
                        </SelectTrigger>
                        <SelectContent>
                            {students.length === 0 ? (
                                <SelectItem value="none" disabled>
                                    No students available
                                </SelectItem>
                            ) : (
                                students.map((student) => (
                                    <SelectItem key={student.id} value={String(student.id)}>
                                        {student.name || student.email}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                    <Button
                        className="w-full sm:w-auto"
                        size="lg"
                        onClick={handleJoinByInvite}
                        disabled={isJoining}
                    >
                        {isJoining ? "Joining..." : "Join Class"}
                    </Button>
                </div>
            </Card>

            <Card className="mt-6 p-6 sm:p-8 space-y-6 shadow-md">
                <div className="space-y-2">
                    <h2 className="text-lg font-semibold">Enrollments</h2>
                    <p className="text-sm text-muted-foreground">
                        Manage students enrolled in this class.
                    </p>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Enroll student
                        </p>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <Select
                                value={enrollStudentId}
                                onValueChange={setEnrollStudentId}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select student" />
                                </SelectTrigger>
                                <SelectContent>
                                    {students.length === 0 ? (
                                        <SelectItem value="none" disabled>
                                            No students available
                                        </SelectItem>
                                    ) : (
                                        students.map((student) => (
                                            <SelectItem
                                                key={student.id}
                                                value={String(student.id)}
                                            >
                                                {student.name || student.email}
                                                {enrolledStudents.has(String(student.id))
                                                    ? " (Enrolled)"
                                                    : ""}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                onClick={handleEnrollStudent}
                                disabled={isEnrolling}
                            >
                                {isEnrolling ? "Enrolling..." : "Enroll"}
                            </Button>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Invite code
                        </p>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">
                                {inviteCodeLabel}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                                Share this code with students.
                            </p>
                        </div>
                    </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="text-base font-semibold">Enrolled students</h3>
                            <p className="text-sm text-muted-foreground">
                                {enrollments.length} student
                                {enrollments.length === 1 ? "" : "s"}
                            </p>
                        </div>
                    </div>

                    {enrollmentsLoading ? (
                        <p className="text-sm text-muted-foreground">
                            Loading enrollments...
                        </p>
                    ) : enrollmentsError ? (
                        <p className="text-sm text-destructive">{enrollmentsError}</p>
                    ) : enrollments.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No students enrolled yet.
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Enrolled</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {enrollments.map((enrollment) => (
                                    <TableRow key={enrollment.id}>
                                        <TableCell>
                                            {enrollment.student?.name ?? "Unknown"}
                                        </TableCell>
                                        <TableCell>
                                            {enrollment.student?.email ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(
                                                enrollment.createdAt ??
                                                    enrollment.created_at
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() =>
                                                    handleUnenroll(enrollment.studentId)
                                                }
                                                disabled={
                                                    processingStudentId === enrollment.studentId
                                                }
                                            >
                                                {processingStudentId === enrollment.studentId
                                                    ? "Removing..."
                                                    : "Unenroll"}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </div>
            </Card>
        </ShowView>
    )
}
export default Show
