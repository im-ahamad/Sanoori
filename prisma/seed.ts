import { PrismaClient } from "../src/generated/prisma/client";
import { Availability } from "../src/generated/prisma/enums";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL ?? "",
});
const prisma = new PrismaClient({ adapter });

/**
 * Seed script — DEMO / reference data only.
 *
 * Categories and subcategories mirror the website's public catalogue.
 * Products are clearly marked with the "[DEMO]" prefix and are NOT
 * presented as real Sanoori Trading inventory.
 *
 * Run manually with: npm run db:seed
 */
async function main() {
  const sanitaryWare = await prisma.category.upsert({
    where: { slug: "sanitary-ware" },
    update: { displayOrder: 1 },
    create: {
      name: "Sanitary Ware",
      slug: "sanitary-ware",
      description:
        "Premium quality sanitary ware for modern bathrooms and kitchens. From elegant basins to comfortable commodes.",
      image: "/images/categories/sanitary-ware.jpg",
      displayOrder: 1,
    },
  });

  const tiles = await prisma.category.upsert({
    where: { slug: "tiles" },
    update: { displayOrder: 2 },
    create: {
      name: "Tiles",
      slug: "tiles",
      description:
        "Wide range of ceramic and porcelain tiles for floors, walls, and decorative applications.",
      image: "/images/categories/tiles.jpg",
      displayOrder: 2,
    },
  });

  await prisma.category.upsert({
    where: { slug: "building-materials" },
    update: { displayOrder: 3 },
    create: {
      name: "Building Materials",
      slug: "building-materials",
      description:
        "Essential building and construction materials for residential and commercial projects.",
      image: "/images/categories/building-materials.jpg",
      displayOrder: 3,
    },
  });

  const sanitarySubcategories = [
    { name: "Commode / Toilet", slug: "commode-toilet" },
    { name: "Basin", slug: "basin" },
    { name: "Faucet / Tap", slug: "faucet-tap" },
    { name: "Shower", slug: "shower" },
    { name: "Bathroom Accessories", slug: "bathroom-accessories" },
    { name: "Other Sanitary Products", slug: "other-sanitary-products" },
  ];

  for (const sub of sanitarySubcategories) {
    await prisma.subcategory.upsert({
      where: { slug: sub.slug },
      update: { categoryId: sanitaryWare.id },
      create: { ...sub, categoryId: sanitaryWare.id },
    });
  }

  const tileSubcategories = [
    { name: "Floor Tiles", slug: "floor-tiles" },
    { name: "Wall Tiles", slug: "wall-tiles" },
    { name: "Bathroom Tiles", slug: "bathroom-tiles" },
    { name: "Kitchen Tiles", slug: "kitchen-tiles" },
    { name: "Decorative Tiles", slug: "decorative-tiles" },
    { name: "Other Tiles", slug: "other-tiles" },
  ];

  for (const sub of tileSubcategories) {
    await prisma.subcategory.upsert({
      where: { slug: sub.slug },
      update: { categoryId: tiles.id },
      create: { ...sub, categoryId: tiles.id },
    });
  }

  // Clearly-marked demo products — NOT real inventory.
  const floorSubcategory = await prisma.subcategory.findUniqueOrThrow({
    where: { slug: "floor-tiles" },
  });

  await prisma.product.upsert({
    where: { slug: "demo-porcelain-floor-tile" },
    update: {},
    create: {
      name: "[DEMO] Porcelain Floor Tile",
      slug: "demo-porcelain-floor-tile",
      productCode: "DEMO-TILE-001",
      categoryId: tiles.id,
      subcategoryId: floorSubcategory.id,
      shortDescription:
        "Sample listing used to test the product schema. Not real inventory.",
      description:
        "DEMO content — replace with an actual Sanoori Trading product before going live.",
      features: ["Demo feature A", "Demo feature B"],
      specifications: { material: "porcelain", size: "600 x 600 mm" },
      variants: [{ color: "grey" }, { color: "beige" }],
      availability: Availability.ON_REQUEST,
      featured: false,
      isActive: true,
    },
  });

  await prisma.product.upsert({
    where: { slug: "demo-wall-mount-basin" },
    update: {},
    create: {
      name: "[DEMO] Wall-Mount Basin",
      slug: "demo-wall-mount-basin",
      productCode: "DEMO-SAN-002",
      categoryId: sanitaryWare.id,
      subcategoryId: (
        await prisma.subcategory.findUniqueOrThrow({ where: { slug: "basin" } })
      ).id,
      shortDescription:
        "Sample listing used to test the product schema. Not real inventory.",
      description:
        "DEMO content — replace with an actual Sanoori Trading product before going live.",
      features: ["Demo feature A"],
      availability: Availability.ON_REQUEST,
      featured: false,
      isActive: true,
    },
  });

  const counts = {
    categories: await prisma.category.count(),
    subcategories: await prisma.subcategory.count(),
    products: await prisma.product.count(),
  };

  console.log("Seed complete:", counts);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });