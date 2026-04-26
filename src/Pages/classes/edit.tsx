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
import { classEditSchema } from "@/lib/schema";
import UploadWidget from "@/components/upload-widget";
import { Subject, UploadWidgetValue, User } from "@/types";
import type { ControllerRenderProps } from "react-hook-form";
import * as z from "zod";
import { DeleteButton } from "@/components/refine-ui/buttons/delete";

const ClassesEdit = () => {
  const back = useBack();
  const { id: recordItemId } = useResourceParams();
  type ClassFormValues = z.infer<typeof classEditSchema>;

  const form = useForm<any, HttpError, ClassFormValues>({
    resolver: zodResolver(classEditSchema),
    refineCoreProps: {
      resource: "classes",
      action: "edit",
      id: recordItemId,
    },
    defaultValues: {
      status: "active",
      schedules: [{ day: "", startTime: "", endTime: "" }],
    },
  });

  const {
    refineCore: { onFinish, query },
    handleSubmit,
    formState: { isSubmitting, errors },
    setError,
    control,
  } = form;

  const bannerPublicId = form.watch("bannerCldPubId");

  const setBannerImage = (
    file: UploadWidgetValue | null,
    field: ControllerRenderProps<ClassFormValues, "bannerUrl">
  ) => {
    if (file) {
      field.onChange(file.url);
      form.setValue("bannerCldPubId", file.publicId, {
        shouldValidate: true,
        shouldDirty: true,
      });
      return;
    }

    field.onChange("");
    form.setValue("bannerCldPubId", "", {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onSubmit = async (values: ClassFormValues) => {
    try {
      await onFinish(values);
    } catch (error) {
      console.error("Error updating class:", error);
      setError("root", {
        message: "Failed to update class. Please try again.",
      });
      throw error;
    }
  };

  const { query: subjectsQuery, result: subjectsResult } = useList<Subject>({
    resource: "subjects",
    pagination: {
      pageSize: 100,
    },
  });

  const { query: teachersQuery, result: teachersResult } = useList<User>({
    resource: "users",
    filters: [{ field: "role", operator: "eq", value: "teacher" }],
    pagination: {
      pageSize: 100,
    },
  });

  const subjectsLoading = subjectsQuery.isLoading;
  const teachersLoading = teachersQuery.isLoading;
  const subjects = subjectsResult.data ?? [];
  const teachers = teachersResult.data ?? [];

  return (
    <EditView className="class-view">
      <EditViewHeader
        resource="classes"
        title="Edit Class"
        actionsSlot={
          <DeleteButton
            resource="classes"
            recordItemId={recordItemId}
            size="sm"
          />
        }
      />

      {query?.isLoading ? (
        <p className="state-message">Loading class details...</p>
      ) : (
        <>
          <div className="intro-row">
            <p>Update the class information below.</p>
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
                      name="bannerUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Banner Image
                          </FormLabel>
                          <FormControl>
                            <UploadWidget
                              value={
                                field.value
                                  ? {
                                      url: field.value,
                                      publicId: bannerPublicId ?? "",
                                    }
                                  : null
                              }
                              onChange={(file) => setBannerImage(file, field)}
                            />
                          </FormControl>
                          <FormMessage />
                          {errors.bannerCldPubId && !errors.bannerUrl && (
                            <p className="text-destructive text-sm">
                              {errors.bannerCldPubId.message?.toString()}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Class Name <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Introduction to Biology" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="subjectId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Subject <span className="text-orange-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={(value) =>
                                field.onChange(Number(value))
                              }
                              value={field.value ? field.value.toString() : ""}
                              disabled={subjectsLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a subject" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {subjects.map((subject) => (
                                  <SelectItem
                                    key={subject.id}
                                    value={subject.id.toString()}
                                  >
                                    {subject.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="teacherId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Teacher <span className="text-orange-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ? field.value.toString() : ""}
                              disabled={teachersLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {teachers.map((teacher) => (
                                  <SelectItem key={teacher.id} value={teacher.id}>
                                    {teacher.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="capacity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Capacity <span className="text-orange-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                placeholder="30"
                                onChange={(e) => {
                                  const value = e.target.value;
                                  field.onChange(value ? Number(value) : undefined);
                                }}
                                value={(field.value as number | undefined) ?? ""}
                                name={field.name}
                                ref={field.ref}
                                onBlur={field.onBlur}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={control}
                        name="status"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Status <span className="text-orange-600">*</span>
                            </FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value ?? "active"}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Description <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Brief description about the class" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={control}
                      name="schedules.0.day"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Schedule Day <span className="text-orange-600">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Monday" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={control}
                        name="schedules.0.startTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Start Time <span className="text-orange-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={control}
                        name="schedules.0.endTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              End Time <span className="text-orange-600">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

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

export default ClassesEdit;
