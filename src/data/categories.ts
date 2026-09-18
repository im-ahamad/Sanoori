import type { ProductCategory } from "@/types/product";

export const categories: ProductCategory[] = [
  {
    id: "cat-1",
    name: "Sanitary Ware",
    slug: "sanitary-ware",
    description:
      "Premium quality sanitary ware for modern bathrooms and kitchens. From elegant basins to comfortable commodes.",
    image: "/images/categories/sanitary-ware.jpg",
    displayOrder: 1,
    isActive: true,
    subcategories: [
      { id: "sub-1-1", name: "Commode / Toilet", slug: "commode-toilet", categoryId: "cat-1" },
      { id: "sub-1-2", name: "Basin", slug: "basin", categoryId: "cat-1" },
      { id: "sub-1-3", name: "Faucet / Tap", slug: "faucet-tap", categoryId: "cat-1" },
      { id: "sub-1-4", name: "Shower", slug: "shower", categoryId: "cat-1" },
      { id: "sub-1-5", name: "Bathroom Accessories", slug: "bathroom-accessories", categoryId: "cat-1" },
      { id: "sub-1-6", name: "Other Sanitary Products", slug: "other-sanitary-products", categoryId: "cat-1" },
    ],
  },
  {
    id: "cat-2",
    name: "Tiles",
    slug: "tiles",
    description:
      "Wide range of ceramic and porcelain tiles for floors, walls, and decorative applications.",
    image: "/images/categories/tiles.jpg",
    displayOrder: 2,
    isActive: true,
    subcategories: [
      { id: "sub-2-1", name: "Floor Tiles", slug: "floor-tiles", categoryId: "cat-2" },
      { id: "sub-2-2", name: "Wall Tiles", slug: "wall-tiles", categoryId: "cat-2" },
      { id: "sub-2-3", name: "Bathroom Tiles", slug: "bathroom-tiles", categoryId: "cat-2" },
      { id: "sub-2-4", name: "Kitchen Tiles", slug: "kitchen-tiles", categoryId: "cat-2" },
      { id: "sub-2-5", name: "Decorative Tiles", slug: "decorative-tiles", categoryId: "cat-2" },
      { id: "sub-2-6", name: "Other Tiles", slug: "other-tiles", categoryId: "cat-2" },
    ],
  },
  {
    id: "cat-3",
    name: "Building Materials",
    slug: "building-materials",
    description:
      "Essential building and construction materials for residential and commercial projects.",
    image: "/images/categories/building-materials.jpg",
    displayOrder: 3,
    isActive: true,
    subcategories: [],
  },
];

export function getCategoryBySlug(slug: string): ProductCategory | undefined {
  return categories.find((cat) => cat.slug === slug && cat.isActive);
}

export function getActiveCategories(): ProductCategory[] {
  return categories.filter((cat) => cat.isActive);
}
