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
import { EditView, EditViewHeader } from "@/components/refine-ui/views/edit-view";
import { useBack, useList, useResourceParams, type HttpError } from "@refinedev/core";
import { Loader2 } from "lucide-react";
import { subjectSchema } from "@/lib/schema";
import { Department } from "@/types";
import * as z from "zod";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

const SubjectsEdit = () => {
  const back = useBack();
  const { id: recordItemId } = useResourceParams();
  type SubjectFormValues = z.infer<typeof subjectSchema>;

  const form = useForm<any, HttpError, SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    refineCoreProps: {
      resource: "subjects",
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

  const { result: departmentsResult, query: departmentsQuery } = useList<Department>({
    resource: "departments",
    pagination: {
      pageSize: 100,
    },
  });

  const departmentsLoading = departmentsQuery.isLoading;
  const departments = departmentsResult.data ?? [];

  const onSubmit = async (values: SubjectFormValues) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating subject:", error);
      setError("root", {
        message: "Failed to update subject. Please try again.",
      });
      throw error;
    }
  };

  return (
    <EditView>
      <EditViewHeader
        resource="subjects"
        title="Edit Subject"
        actionsSlot={
          <DeleteButton
            resource="subjects"
            recordItemId={recordItemId}
            size="sm"
          />
        }
      />

      {query?.isLoading ? (
        <p className="state-message">Loading subject details...</p>
      ) : (
        <>
          <div className="intro-row">
            <p>Update subject details below.</p>
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
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Name <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Calculus I" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="departmentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Department <span className="text-orange-600">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={(value) => field.onChange(Number(value))}
                            value={field.value?.toString()}
                            disabled={departmentsLoading}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a department" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((department) => (
                                <SelectItem
                                  key={department.id}
                                  value={department.id.toString()}
                                >
                                  {department.name}
                                </SelectItem>
                              ))}
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

export default SubjectsEdit;
