export type ProductCategory = "Mulch" | "Stone" | "Sand" | "Soil";

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  startingPrice: number;
  unit: "cubic yard";
  description: string;
  availability: "In stock" | "Limited today" | "Fastest delivery";
  imageClassName: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};
