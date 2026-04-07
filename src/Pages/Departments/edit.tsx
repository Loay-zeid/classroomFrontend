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
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useBack, useResourceParams, type HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { departmentSchema } from "@/lib/schema";
import * as z from "zod";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

const DepartmentsEdit = () => {
  const back = useBack();
  const { id: recordItemId } = useResourceParams();
  type DepartmentFormValues = z.infer<typeof departmentSchema>;

  const form = useForm<any, HttpError, DepartmentFormValues>({
    resolver: zodResolver(departmentSchema),
    refineCoreProps: {
      resource: "departments",
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

  const onSubmit = async (values: DepartmentFormValues) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating department:", error);
      setError("root", {
        message: "Failed to update department. Please try again.",
      });
      throw error;
    }
  };

  return (
    <EditView>
      <EditViewHeader
        resource="departments"
        title="Edit Department"
        actionsSlot={
          <DeleteButton
            resource="departments"
            recordItemId={recordItemId}
            size="sm"
          />
        }
      />

      {query?.isLoading ? (
        <p className="state-message">Loading department details...</p>
      ) : (
        <>
          <div className="intro-row">
            <p>Update department details below.</p>
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
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Code <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="CS" {...field} />
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
                            <Input placeholder="Computer Science" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Optional department description"
                              {...field}
                            />
                          </FormControl>
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

export default DepartmentsEdit;
