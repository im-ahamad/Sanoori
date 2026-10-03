import "dotenv/config";
import { db } from '@/lib/db';

async function main() {
  const categories = await db.category.findMany({
    include: { subcategories: true, products: true }
  });
  console.log("CATEGORIES:");
  console.log(JSON.stringify(categories, null, 2));
  
  const products = await db.product.findMany({
    include: { category: true, subcategory: true, images: true }
  });
  console.log("\n\nPRODUCTS:");
  console.log(JSON.stringify(products, null, 2));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
