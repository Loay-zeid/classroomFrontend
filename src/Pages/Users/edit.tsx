import { useForm } from "@refinedev/react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EditView } from "@/components/refine-ui/views/edit-view";
import { EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useBack, useResourceParams, type HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { USER_ROLES } from "@/constence";
import { userSchema } from "@/lib/schema";
import * as z from "zod";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

const UsersEdit = () => {
  const back = useBack();
  const { id: recordItemId } = useResourceParams();
  type UserFormValues = z.infer<typeof userSchema>;

  const form = useForm<any, HttpError, UserFormValues>({
    resolver: zodResolver(userSchema),
    refineCoreProps: {
      resource: "users",
      action: "edit",
    },
  });

  const {
    refineCore: { onFinish, query },
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    control,
  } = form;

  const onSubmit = async (values: UserFormValues) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating user:", error);
      const status =
        (error as { statusCode?: number; status?: number })?.statusCode ??
        (error as { statusCode?: number; status?: number })?.status;
      const message =
        status === 403
          ? "You do not have permission to update this user."
          : status === 401
          ? "Your session expired. Please sign in again."
          : "Failed to update user. Please try again.";
      setError("root", {
        message,
      });
      throw error;
    }
  };

  return (
    <EditView>
      <EditViewHeader
        resource="users"
        title="Edit User"
        actionsSlot={
          <DeleteButton
            resource="users"
            recordItemId={recordItemId}
            size="sm"
          />
        }
      />

      {query?.isLoading ? (
        <p className="state-message">Loading user details...</p>
      ) : (
        <>
          <div className="intro-row">
            <p>Update user details below.</p>
            <Button onClick={() => back()}>Go Back</Button>
          </div>

          <Separator />

          <div className="my-4 flex items-center">
            <Card className="class-form-card">
              <CardHeader className="relative z-10">
                <CardTitle className="text-2xl pb-0 font-bold text-gradient-orange">
                  Edit form
                </CardTitle>
              </CardHeader>

              <Separator />

              <CardContent className="mt-7">
                <Form {...form}>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    {errors.root?.message && (
                      <p className="text-destructive text-sm">
                        {errors.root.message}
                      </p>
                    )}
                    <FormField
                      control={control}
                      name="id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            User ID <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Name <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Email <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="jane@school.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Role <span className="text-orange-600">*</span>
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value={USER_ROLES.ADMIN}>Admin</SelectItem>
                              <SelectItem value={USER_ROLES.TEACHER}>Teacher</SelectItem>
                              <SelectItem value={USER_ROLES.STUDENT}>Student</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting}
                      aria-disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex gap-1">
                          <span>Saving changes...</span>
                          <Loader2 className="inline-block ml-2 animate-spin" />
                        </div>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </EditView>
  );
};

export default UsersEdit;
