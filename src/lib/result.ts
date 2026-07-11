/**
 * The shared return shape for every Server Action in this codebase
 * (Phase 4 §21 coding standards: "Server Actions return a typed
 * `{ data } | { error }` result, never throw across the client/server
 * boundary"). Callers must handle both branches explicitly — there is no
 * exception to catch.
 *
 * `success` is a discriminant, not extra ceremony: `error: string` alone
 * can't be narrowed soundly by a truthiness check (an empty string is
 * falsy but still the error branch), so every call site checks
 * `result.success` rather than `if (result.error)`.
 */
export type ActionResult<T> =
  { success: true; data: T } | { success: false; error: string };

export function actionOk<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function actionError<T>(error: string): ActionResult<T> {
  return { success: false, error };
}
