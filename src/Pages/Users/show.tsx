import { useShow } from "@refinedev/core";
import dayjs from "dayjs";
import { User } from "@/types";
import { ShowView, ShowViewHeader } from "@/components/refine-ui/views/show-view";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const UsersShow = () => {
  const { query } = useShow<User>({ resource: "users" });
  const user = query.data?.data;

  if (query.isLoading || query.isError || !user) {
    return (
      <ShowView>
        <ShowViewHeader resource="users" title="User Details" />
        <p className="state-message">
          {query.isLoading
            ? "Loading user details..."
            : query.isError
            ? "Failed to fetch user details..."
            : "User details not found."}
        </p>
      </ShowView>
    );
  }

  const createdAt = user.createdAt
    ? dayjs(user.createdAt).isValid()
      ? dayjs(user.createdAt).format("MMM D, YYYY")
      : "—"
    : "—";
  const updatedAt = user.updatedAt
    ? dayjs(user.updatedAt).isValid()
      ? dayjs(user.updatedAt).format("MMM D, YYYY")
      : "—"
    : "—";

  return (
    <ShowView>
      <ShowViewHeader resource="users" title="User Details" />

      <Card className="p-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">User ID</p>
            <p className="text-base font-medium">{user.id}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Role</p>
            <Badge variant="secondary">{user.role}</Badge>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-base font-medium">{user.name}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-base font-medium">{user.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Created</p>
            <p className="text-base font-medium">{createdAt}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Last Updated</p>
            <p className="text-base font-medium">{updatedAt}</p>
          </div>
        </div>
      </Card>
    </ShowView>
  );
};

export default UsersShow;
