// Generates real PWA icon assets from the brand tokens in
// src/app/globals.css — not stock art, not a placeholder. Run manually
// (`node scripts/generate-icons.mjs`) whenever the mark changes; the
// output PNGs are committed since Vercel's build shouldn't depend on
// sharp running at build time for static assets that don't change per
// deploy.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const AMBER = "#B4520A";
const PAPER = "#FBF7F0";
const NIGHT = "#2E2A6E";

/** A crescent + dot — "night" — the same mark for both apps, only the
 * background hue differs (amber for customers, night-indigo for staff),
 * so the two installed PWAs are visually distinguishable on a home screen. */
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

const jobs = [
  { name: "icon-customer", background: AMBER },
  { name: "icon-console", background: NIGHT },
];

for (const { name, background } of jobs) {
  for (const size of [192, 512]) {
    await sharp(Buffer.from(markSvg(background)))
      .resize(size, size)
      .png()
      .toFile(`public/icons/${name}-${size}.png`);
  }
  await sharp(Buffer.from(maskableSvg(background)))
    .resize(512, 512)
    .png()
    .toFile(`public/icons/${name}-maskable-512.png`);
  console.log(`Generated public/icons/${name}-{192,512,maskable-512}.png`);
}
