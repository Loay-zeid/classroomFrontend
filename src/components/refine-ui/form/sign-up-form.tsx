"use client";

import { useState } from "react";
import { USER_ROLES } from "@/constence";
import { InputPassword } from "@/components/refine-ui/form/input-password";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  useLink,
  useNotification,
  useRefineOptions,
  useRegister,
} from "@refinedev/core";

type SignUpFormProps = {
  role: typeof USER_ROLES.TEACHER | typeof USER_ROLES.STUDENT;
};

const roleCopy = {
  [USER_ROLES.TEACHER]: {
    heading: "Hello Teacher",
    description:
      "Create your account and send your access request to the admin team.",
    submitLabel: "Create Teacher Account",
    altQuestion: "Are you a student?",
    altLinkLabel: "Go to student sign up",
    altLinkPath: "/register/student",
  },
  [USER_ROLES.STUDENT]: {
    heading: "Hello Student",
    description: "Create your account and continue directly to your dashboard.",
    submitLabel: "Create Student Account",
    altQuestion: "Are you a teacher?",
    altLinkLabel: "Go to teacher sign up",
    altLinkPath: "/register",
  },
} as const;

export const SignUpForm = ({ role }: SignUpFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { open } = useNotification();
  const Link = useLink();
  const { title } = useRefineOptions();
  const { mutate: register } = useRegister();
  const copy = roleCopy[role];

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      open?.({
        type: "error",
        message: "Passwords don't match",
        description:
          "Please make sure both password fields contain the same value.",
      });
      return;
    }

    register({
      name,
      email,
      password,
      role,
    });
  };

  return (
    <div
      className={cn(
        "flex",
        "flex-col",
        "items-center",
        "justify-center",
        "px-6",
        "py-8",
        "min-h-svh"
      )}
    >
      <div className={cn("flex", "items-center", "justify-center", "gap-2")}>
        {title.icon && (
          <div
            className={cn("text-foreground", "[&>svg]:w-12", "[&>svg]:h-12")}
          >
            {title.icon}
          </div>
        )}
      </div>

      <Card className={cn("sm:w-[456px]", "p-12", "mt-6")}>
        <CardHeader className={cn("px-0")}>
          <CardTitle
            className={cn(
              "text-green-600",
              "dark:text-green-400",
              "text-3xl",
              "font-semibold"
            )}
          >
            {copy.heading}
          </CardTitle>
          <CardDescription
            className={cn("text-muted-foreground", "font-medium")}
          >
            {copy.description}
          </CardDescription>
        </CardHeader>

        <Separator />

        <CardContent className={cn("px-0")}>
          <form onSubmit={handleSignUp}>
            <div className={cn("flex", "flex-col", "gap-2")}>
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className={cn("flex", "flex-col", "gap-2", "mt-6")}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div
              className={cn("relative", "flex", "flex-col", "gap-2", "mt-6")}
            >
              <Label htmlFor="password">Password</Label>
              <InputPassword
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div
              className={cn("relative", "flex", "flex-col", "gap-2", "mt-6")}
            >
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <InputPassword
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button
              type="submit"
              size="lg"
              className={cn(
                "w-full",
                "mt-6",
                "bg-green-600",
                "hover:bg-green-700",
                "text-white"
              )}
            >
              {copy.submitLabel}
            </Button>
          </form>
        </CardContent>

        <Separator />

        <CardFooter className={cn("flex-col", "items-start", "gap-2")}>
          <div className={cn("w-full", "text-center", "text-sm")}>
            <span className={cn("text-sm", "text-muted-foreground")}>
              You have an account already?{" "}
            </span>
            <Link
              to="/login"
              className={cn(
                "text-blue-600",
                "dark:text-blue-400",
                "font-semibold",
                "underline"
              )}
            >
              Sign in
            </Link>
          </div>
          <div className={cn("w-full", "text-center", "text-sm")}>
            <span className={cn("text-sm", "text-muted-foreground")}>
              {copy.altQuestion}{" "}
            </span>
            <Link
              to={copy.altLinkPath}
              className={cn(
                "text-green-600",
                "dark:text-green-400",
                "font-semibold",
                "underline"
              )}
            >
              {copy.altLinkLabel}
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

SignUpForm.displayName = "SignUpForm";
