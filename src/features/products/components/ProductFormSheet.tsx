"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Sheet } from "@/components/ui/sheet";
import { useToastStore } from "@/stores/toast";
import { createProduct, updateProduct } from "@/server/actions/products";
import {
  createProductSchema,
  type UpdateProductInput,
} from "@/lib/zod-schemas/products";
import type { Category, Product } from "@/server/queries/catalogue";

/**
 * One schema (the create schema, a superset with `stockQty`) drives both
 * modes — editing just never sends `stockQty` on to `updateProduct`. A
 * conditional resolver type here would otherwise make react-hook-form's
 * inferred value type a union it can't register fields against cleanly.
 *
 * `z.coerce.number()` fields make the schema's input type (what the raw
 * `<input>` elements register against, e.g. price as a string) diverge
 * from its output type (a real `number`, post-coercion) — react-hook-
 * form's third generic is exactly for that split.
 */
type FormInput = z.input<typeof createProductSchema>;
type FormOutput = z.output<typeof createProductSchema>;

/**
 * Phase 3 §5 — one form, two modes: creating sets an initial stock
 * quantity directly; editing an existing product never touches
 * `stock_qty` here (that's `StockAdjuster`'s job — see
 * `adjustStock`'s own comment for why it's a separate, append-only path).
 */
export function ProductFormSheet({
  open,
  onOpenChange,
  hostelId,
  categories,
  product,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hostelId: string;
  categories: Category[];
  product: Product | null;
  onSaved: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const isEditing = product !== null;

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createProductSchema),
    values: {
      categoryId: product?.category_id ?? categories[0]?.id ?? "",
      name: product?.name ?? "",
      description: product?.description ?? "",
      price: product?.price ?? 0,
      imageUrl: product?.image_url ?? "",
      stockQty: product?.stock_qty ?? 0,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    startTransition(async () => {
      const result = isEditing
        ? await updateProduct({
            productId: product.id,
            categoryId: values.categoryId,
            name: values.name,
            description: values.description,
            price: values.price,
            imageUrl: values.imageUrl,
          } satisfies UpdateProductInput)
        : await createProduct(hostelId, values);

      if (!result.success) {
        form.setError("root", { message: result.error });
        return;
      }
      useToastStore
        .getState()
        .show(isEditing ? "Product updated" : "Product added", "success");
      onSaved();
      onOpenChange(false);
    });
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit product" : "Add product"}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        <Field label="Name" error={form.formState.errors.name?.message}>
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              aria-describedby={describedBy}
              {...form.register("name")}
            />
          )}
        </Field>

        <Field
          label="Category"
          error={form.formState.errors.categoryId?.message}
        >
          {({ fieldId, describedBy }) => (
            <select
              id={fieldId}
              aria-describedby={describedBy}
              className="border-border bg-paper text-ink focus:border-accent w-full rounded-md border px-3 py-2.5 outline-none"
              {...form.register("categoryId")}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        <Field
          label="Description (optional)"
          error={form.formState.errors.description?.message}
        >
          {({ fieldId }) => (
            <Input id={fieldId} {...form.register("description")} />
          )}
        </Field>

        <Field label="Price (₹)" error={form.formState.errors.price?.message}>
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              type="number"
              step="1"
              min="0"
              aria-describedby={describedBy}
              {...form.register("price")}
            />
          )}
        </Field>

        {!isEditing && (
          <Field
            label="Starting stock"
            error={form.formState.errors.stockQty?.message}
          >
            {({ fieldId, describedBy }) => (
              <Input
                id={fieldId}
                type="number"
                step="1"
                min="0"
                aria-describedby={describedBy}
                {...form.register("stockQty")}
              />
            )}
          </Field>
        )}

        <Field
          label="Photo URL (optional)"
          error={form.formState.errors.imageUrl?.message}
        >
          {({ fieldId, describedBy }) => (
            <Input
              id={fieldId}
              type="url"
              placeholder="https://…"
              aria-describedby={describedBy}
              {...form.register("imageUrl")}
            />
          )}
        </Field>

        {form.formState.errors.root && (
          <p role="alert" className="text-danger text-sm">
            {form.formState.errors.root.message}
          </p>
        )}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEditing ? "Save changes" : "Add product"}
        </Button>
      </form>
    </Sheet>
  );
}
