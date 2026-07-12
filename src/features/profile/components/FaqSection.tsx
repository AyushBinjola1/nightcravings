const FAQS = [
  {
    question: "How is my order verified?",
    answer:
      "There's no payment gateway — you pay by UPI and upload a screenshot. A person at the store checks it and confirms your order, usually within a few minutes.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. Your name, phone, and room number are saved only in this browser so Checkout can prefill them next time — nothing is tied to a login.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes — after checkout you land on a live tracking page that updates automatically as the store confirms, prepares, and delivers your order.",
  },
  {
    question: "What if the store is closed?",
    answer:
      "The Home page shows the store's open/closed status and hours up front. Outside those hours you can still message the store for anything urgent.",
  },
] as const;

/** Phase 2 §10 (Profile) "FAQ" row: "kept short enough to actually be
 * read." Every answer here describes real, shipped behavior — nothing
 * aspirational. */
export function FaqSection() {
  return (
    <div className="flex flex-col gap-2">
      {FAQS.map((faq) => (
        <details
          key={faq.question}
          className="border-border group rounded-md border px-3 py-2.5"
        >
          <summary className="text-ink cursor-pointer text-sm font-medium marker:content-none">
            {faq.question}
          </summary>
          <p className="text-ink-soft mt-2 text-sm">{faq.answer}</p>
        </details>
      ))}
    </div>
  );
}
