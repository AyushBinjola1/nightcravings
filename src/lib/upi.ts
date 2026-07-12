/** The standard `upi://pay` deep link every UPI app (GPay, PhonePe, Paytm,
 * BHIM) recognizes when scanned. */
export function buildUpiUri(upiId: string, payeeName: string): string {
  const params = new URLSearchParams({ pa: upiId, pn: payeeName, cu: "INR" });
  return `upi://pay?${params.toString()}`;
}
