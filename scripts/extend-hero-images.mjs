import sharp from "sharp";
import path from "path";

const IMAGES_DIR = path.join(process.cwd(), "public/images");

const IMAGES_TO_EXTEND = [
  "product-hero.png",
  "contact-hero.png",
  "sanitary-hero.png",
  "tiles-hero.png",
  "building-hero.png",
];

async function getEdgeColors(imagePath) {
  // Create separate instances for each extract to avoid pipeline issues
  const meta = await sharp(imagePath).metadata();
  const { width, height } = meta;

  // Sample left edge (1px wide strip)
  const leftEdgeBuffer = await sharp(imagePath)
    .extract({ left: 0, top: 0, width: 1, height })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Sample right edge (1px wide strip) - new instance
  const rightEdgeBuffer = await sharp(imagePath)
    .extract({ left: width - 1, top: 0, width: 1, height })
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Calculate average color for each edge
  const avgColor = (buffer) => {
    let r = 0, g = 0, b = 0;
    const data = buffer.data;
    for (let i = 0; i < data.length; i += 3) {
      r += data[i];
      g += data[i + 1];
      b += data[i + 2];
    }
    const count = data.length / 3;
    return { r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) };
  };

  return {
    left: avgColor(leftEdgeBuffer),
    right: avgColor(rightEdgeBuffer),
  };
}

async function extendImageTo3to1(imagePath, outputPath) {
  const metadata = await sharp(imagePath).metadata();
  const { width, height } = metadata;

  const currentRatio = width / height;
  const targetRatio = 3;

  console.log(`Processing ${path.basename(imagePath)}: ${width}x${height} (ratio: ${currentRatio.toFixed(4)})`);

  if (Math.abs(currentRatio - targetRatio) < 0.01) {
    console.log(`  Already 3:1, skipping`);
    return;
  }

  const targetWidth = Math.round(height * targetRatio);
  const extendBy = targetWidth - width;
  const extendLeft = Math.floor(extendBy / 2);
  const extendRight = extendBy - extendLeft;

  console.log(`  Target: ${targetWidth}x${height} (3:1)`);
  console.log(`  Extending left by ${extendLeft}px, right by ${extendRight}px`);

  // Get edge colors for natural extension
  const { left, right } = await getEdgeColors(imagePath);
  console.log(`  Left edge color: rgb(${left.r}, ${left.g}, ${left.b})`);
  console.log(`  Right edge color: rgb(${right.r}, ${right.g}, ${right.b})`);

  // Create left fill
  const leftFillBuffer = await sharp({
    create: {
      width: extendLeft,
      height,
      channels: 3,
      background: { r: left.r, g: left.g, b: left.b },
    },
  }).png().toBuffer();

  // Create right fill
  const rightFillBuffer = await sharp({
    create: {
      width: extendRight,
      height,
      channels: 3,
      background: { r: right.r, g: right.g, b: right.b },
    },
  }).png().toBuffer();

  // Composite: left fill | original | right fill
  await sharp({
    create: {
      width: targetWidth,
      height,
      channels: 3,
      background: { r: 0, g: 0, b: 0 },
    },
  })
    .composite([
      { input: leftFillBuffer, left: 0, top: 0 },
      { input: imagePath, left: extendLeft, top: 0 },
      { input: rightFillBuffer, left: extendLeft + width, top: 0 },
    ])
    .png()
    .toFile(outputPath);

  console.log(`  Saved to ${outputPath}`);
}

async function main() {
  console.log("Extending hero images to 3:1 ratio...\n");

  for (const filename of IMAGES_TO_EXTEND) {
    const inputPath = path.join(IMAGES_DIR, filename);
    const outputPath = path.join(IMAGES_DIR, filename.replace(".png", "-extended.png"));

    try {
      await extendImageTo3to1(inputPath, outputPath);
      console.log("");
    } catch (error) {
      console.error(`Error processing ${filename}:`, error);
    }
  }

  console.log("Done!");
}

main().catch(console.error);