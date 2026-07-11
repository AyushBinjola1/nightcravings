"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signInStaff } from "@/server/actions/auth";
import { staffLoginSchema, type StaffLoginInput } from "@/lib/zod-schemas/auth";

/** Owner Console sign-in (Phase 4 §4) — email + password, staff only. */
export function StaffLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<StaffLoginInput>({
    resolver: zodResolver(staffLoginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = await signInStaff(values);
      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      router.replace("/console/dashboard");
      router.refresh();
    });
  });

  const rootError = form.formState.errors.root?.message;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex w-full max-w-sm flex-col gap-4"
    >
      <Field label="Email" error={form.formState.errors.email?.message}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            type="email"
            autoComplete="email"
            aria-invalid={Boolean(form.formState.errors.email)}
            aria-describedby={describedBy}
            {...form.register("email")}
          />
        )}
      </Field>

      <Field label="Password" error={form.formState.errors.password?.message}>
        {({ fieldId, describedBy }) => (
          <Input
            id={fieldId}
            type="password"
            autoComplete="current-password"
            aria-invalid={Boolean(form.formState.errors.password)}
            aria-describedby={describedBy}
            {...form.register("password")}
          />
        )}
      </Field>

      {rootError && (
        <p role="alert" className="text-danger text-sm">
          {rootError}
        </p>
      )}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
