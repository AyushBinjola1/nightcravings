// Generates real PWA icon assets. The customer app's icons are resized
// directly from the real brand logo (public/logo.png); the Owner
// Console has no separate logo asset, so it keeps the drawn crescent +
// dot mark on the brand's night-violet, so the two installed PWAs stay
// visually distinguishable on a home screen. Run manually
// (`node scripts/generate-icons.mjs`) whenever either mark changes; the
// output PNGs are committed since Vercel's build shouldn't depend on
// sharp running at build time for static assets that don't change per
// deploy.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const PAPER = "#FAF8FC";
const NIGHT = "#5B21B6";
const LOGO_PATH = "public/logo.png";

function markSvg(background) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${background}"/>
  <path d="M 320 150
           A 120 120 0 1 0 320 362
           A 145 145 0 1 1 320 150 Z"
        fill="${PAPER}"/>
  <circle cx="360" cy="150" r="16" fill="${PAPER}"/>
</svg>`;
}

/** Maskable variant needs the mark inside a smaller safe-zone circle. */
function maskableSvg(background) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${background}"/>
  <g transform="translate(96 96) scale(0.625)">
    <path d="M 320 150
             A 120 120 0 1 0 320 362
             A 145 145 0 1 1 320 150 Z"
          fill="${PAPER}"/>
    <circle cx="360" cy="150" r="16" fill="${PAPER}"/>
  </g>
</svg>`;
}

mkdirSync("public/icons", { recursive: true });

for (const size of [192, 512]) {
  await sharp(LOGO_PATH)
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-customer-${size}.png`);
}
// Maskable safe zone: the logo at ~70% scale, centered on its own
// background color so nothing gets clipped by a circular/rounded mask.
await sharp({
  create: { width: 512, height: 512, channels: 4, background: PAPER },
})
  .composite([
    {
      input: await sharp(LOGO_PATH).resize(358, 358).toBuffer(),
      gravity: "center",
    },
  ])
  .png()
  .toFile("public/icons/icon-customer-maskable-512.png");
console.log("Generated public/icons/icon-customer-{192,512,maskable-512}.png");

for (const size of [192, 512]) {
  await sharp(Buffer.from(markSvg(NIGHT)))
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-console-${size}.png`);
}
await sharp(Buffer.from(maskableSvg(NIGHT)))
  .resize(512, 512)
  .png()
  .toFile("public/icons/icon-console-maskable-512.png");
console.log("Generated public/icons/icon-console-{192,512,maskable-512}.png");
