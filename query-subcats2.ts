import "dotenv/config";
import { db } from '@/lib/db';

async function main() {
  const bmCategory = await db.category.findUnique({
    where: { slug: 'building-materials' },
    include: { 
      subcategories: { 
        include: { 
          _count: { select: { products: true } }
        } 
      } 
    }
  });
  
  console.log(`Building Materials subcategories:`);
  bmCategory?.subcategories.forEach(s => {
    console.log(`  - ${s.name} (${s.slug}): ${s._count.products} products`);
  });
  
  // Also check products with no subcategory
  const productsNoSubcat = await db.product.findMany({
    where: { categoryId: bmCategory?.id, subcategoryId: null, isActive: true },
    select: { name: true, productCode: true }
  });
  console.log(`\nProducts in Building Materials with no subcategory: ${productsNoSubcat.length}`);
  productsNoSubcat.forEach(p => console.log(`  - ${p.name} (${p.productCode})`));
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
