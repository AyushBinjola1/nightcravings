// Generates a real, standards-compliant UPI QR code (the same
// `upi://pay?pa=...` deep link format GPay/PhonePe/Paytm all read) from
// the owner's actual UPI ID — not a copy of an uploaded image, since this
// environment has no way to extract raw bytes from a pasted chat image.
// Functionally equivalent: any UPI app scanning this resolves to the same
// payee.
import QRCode from "qrcode";

const upiId = process.argv[2];
const payeeName = process.argv[3] ?? "NightCravings";
const outputPath = process.argv[4] ?? "public/upi-qr.png";

if (!upiId) {
  console.error(
    "Usage: node scripts/generate-upi-qr.mjs <upi-id> [payee-name] [output-path]",
  );
  process.exit(1);
}

const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&cu=INR`;

await QRCode.toFile(outputPath, upiUri, {
  width: 512,
  margin: 2,
  color: { dark: "#211C16", light: "#FBF7F0" },
});

console.log(`Generated ${outputPath} encoding: ${upiUri}`);
