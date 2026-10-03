import "dotenv/config";
import { db } from '@/lib/db';

async function main() {
  const categories = await db.category.findMany({
    include: { subcategories: true, _count: { select: { products: true } } }
  });
  console.log("CATEGORIES:");
  categories.forEach(c => {
    console.log(`- ${c.name} (${c.slug}): ${c._count.products} products`);
    c.subcategories.forEach(s => console.log(`  - ${s.name} (${s.slug})`));
  });
  
  const products = await db.product.findMany({
    include: { category: true, subcategory: true },
    where: { isActive: true }
  });
  console.log("\n\nACTIVE PRODUCTS BY CATEGORY:");
  const byCategory = products.reduce((acc, p) => {
    if (!acc[p.category.name]) acc[p.category.name] = [];
    acc[p.category.name].push(p);
    return acc;
  }, {} as Record<string, typeof products>);
  
  for (const [cat, prods] of Object.entries(byCategory)) {
    console.log(`\n${cat} (${prods.length} products):`);
    prods.slice(0, 5).forEach(p => {
      const hasSpecs = p.specifications && Object.keys(p.specifications as object).length > 0;
      const hasFeatures = p.features && p.features.length > 0;
      const hasVariants = p.variants && (p.variants as any[]).length > 0;
      console.log(`  - ${p.name} (${p.productCode || 'no code'}) specs:${hasSpecs} feats:${hasFeatures} variants:${hasVariants}`);
    });
    if (prods.length > 5) console.log(`  ... and ${prods.length - 5} more`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
