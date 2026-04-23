import { Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useGetIdentity, useLogout } from "@refinedev/core";

const TeacherApprovalPending = () => {
  const { mutate: logout } = useLogout();
  const { data: user } = useGetIdentity<{ approvalStatus?: string }>();
  const isRejected = user?.approvalStatus === "rejected";

  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-100 px-6 py-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <Card className="w-full max-w-xl border border-blue-100 shadow-lg dark:border-slate-800">
        <CardHeader className="items-center text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
            <Clock3 className="h-7 w-7" />
          </div>
          <Badge className="mb-3 bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">
            {isRejected ? "Canceled by Admin" : "Pending Approval"}
          </Badge>
          <CardTitle className="text-2xl">
            {isRejected
              ? "Teacher Account Request Canceled by Admin"
              : "Teacher Account Request Received"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          {isRejected ? (
            <p className="text-muted-foreground">
              Your teacher access request was cancelled by the admin. Contact the
              admin team to submit a new request.
            </p>
          ) : (
            <p className="text-muted-foreground">
              Your teacher account is waiting for admin approval. This usually
              takes around 3 hours.
            </p>
          )}
          <p className="text-sm text-muted-foreground">
            {isRejected
              ? "You can still sign in later after admin reviews your case."
              : "You will get access to the teacher dashboard after approval."}
          </p>
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={() => {
                logout();
              }}
            >
              Back to login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeacherApprovalPending;
