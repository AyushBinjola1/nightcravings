"use client";

import { useId, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { signInStaff } from "@/server/actions/auth";
import { staffLoginSchema, type StaffLoginInput } from "@/lib/zod-schemas/auth";

/** Owner Console sign-in (Phase 4 §4) — email + password, staff only. */
export function StaffLoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const emailFieldId = useId();
  const passwordFieldId = useId();
  const errorId = useId();

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
      router.replace("/dashboard");
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
      <div className="flex flex-col gap-1.5">
        <label htmlFor={emailFieldId} className="text-ink text-sm font-medium">
          Email
        </label>
        <input
          id={emailFieldId}
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(form.formState.errors.email)}
          aria-describedby={
            form.formState.errors.email ? `${emailFieldId}-error` : undefined
          }
          className="border-border bg-paper text-ink focus:border-accent rounded-md border px-3 py-2.5 outline-none"
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p
            id={`${emailFieldId}-error`}
            role="alert"
            className="text-danger text-sm"
          >
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={passwordFieldId}
          className="text-ink text-sm font-medium"
        >
          Password
        </label>
        <input
          id={passwordFieldId}
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          aria-describedby={
            form.formState.errors.password
              ? `${passwordFieldId}-error`
              : undefined
          }
          className="border-border bg-paper text-ink focus:border-accent rounded-md border px-3 py-2.5 outline-none"
          {...form.register("password")}
        />
        {form.formState.errors.password && (
          <p
            id={`${passwordFieldId}-error`}
            role="alert"
            className="text-danger text-sm"
          >
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      {rootError && (
        <p id={errorId} role="alert" className="text-danger text-sm">
          {rootError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-accent text-paper rounded-md px-4 py-2.5 font-medium transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
