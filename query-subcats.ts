import "dotenv/config";
import { db } from '@/lib/db';

async function main() {
  const categories = await db.category.findMany({
    include: { 
      subcategories: { 
        include: { 
          _count: { select: { products: true } }
        } 
      } 
    }
  });
  
  categories.forEach(c => {
    console.log(`\n${c.name} (${c.slug}): ${c._count?.products || 0} products`);
    c.subcategories.forEach(s => {
      console.log(`  - ${s.name} (${s.slug}): ${s._count.products} products`);
    });
  });
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
