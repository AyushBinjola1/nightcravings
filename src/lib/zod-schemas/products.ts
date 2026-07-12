import { z } from "zod";

/** Phase 3 §5 — Product Management. Photo is a URL, not a file upload:
 * this reuses the same "paste a link" pattern the catalogue's own seed
 * data already uses (CDN links), rather than adding a Storage upload
 * flow this screen doesn't need yet. */
export const productFormSchema = z.object({
  categoryId: z.string().uuid("Choose a category"),
  name: z.string().trim().min(1, "Enter a name"),
  description: z.string().trim().max(200).optional(),
  price: z.coerce.number().positive("Enter a price above ₹0"),
  imageUrl: z
    .string()
    .trim()
    .url("Enter a valid image URL")
    .optional()
    .or(z.literal("")),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const createProductSchema = productFormSchema.extend({
  stockQty: z.coerce.number().int().min(0, "Enter a stock quantity"),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = productFormSchema.extend({
  productId: z.string().uuid(),
});
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const adjustStockSchema = z.object({
  productId: z.string().uuid(),
  delta: z.coerce
    .number()
    .int()
    .refine((n) => n !== 0, "Enter a non-zero amount"),
});
export type AdjustStockInput = z.infer<typeof adjustStockSchema>;
