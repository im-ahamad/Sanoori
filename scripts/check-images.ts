import "dotenv/config";
import { db } from "@/lib/db";

async function main() {
  const images = await db.productImage.findMany({
    include: {
      product: {
        select: { id: true, name: true, productCode: true, slug: true }
      }
    }
  });
  
  console.log('=== PRODUCT IMAGES IN DATABASE ===');
  console.log('Total images:', images.length);
  console.log('');
  
  for (const img of images) {
    console.log('---');
    console.log('Image ID:', img.id);
    console.log('Product:', img.product.name);
    console.log('Product Code:', img.product.productCode);
    console.log('Product DB ID:', img.product.id);
    console.log('Public ID:', img.publicId);
    console.log('URL:', img.url);
    console.log('Alt:', img.alt);
    console.log('');
  }
}

main().catch(console.error).finally(() => db.$disconnect());