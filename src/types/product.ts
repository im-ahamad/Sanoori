export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  displayOrder: number;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Subcategory {
  id: string;
  name: string;
  slug: string;
  categoryId: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  categoryId: string;
  subcategoryId?: string;
  images: string[];
  specifications: Record<string, string>;
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
  metaTitle: string;
  metaDescription: string;
}
