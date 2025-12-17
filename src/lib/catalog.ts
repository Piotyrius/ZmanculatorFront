export type CatalogItem = {
  slug: string;
  title: string;
  shortDescription: string;
  category: "tops" | "bottoms" | "dresses" | "outerwear" | "childrenswear" | "unisex";
  categoryLabel: string;
  complexityLabel: "Simple" | "Standard" | "Advanced";
  supportedBodyTypes: string[];
  imageSrc: string;
  defaults: {
    garment_type: string;
    category: string;
  };
};

export const catalogItems: CatalogItem[] = [
  {
    slug: "womens-basic-top",
    title: "Women’s basic top block",
    shortDescription:
      "Clean, versatile block for blouses and simple tops. Ideal base for everyday womenswear.",
    category: "tops",
    categoryLabel: "Womenswear · Tops",
    complexityLabel: "Standard",
    supportedBodyTypes: ["Standard", "Curvy", "Petite"],
    imageSrc: "/images/clothing/categories/womenswear.svg",
    defaults: {
      garment_type: "womens_top",
      category: "womenswear",
    },
  },
  {
    slug: "mens-shirt",
    title: "Men’s shirt block",
    shortDescription:
      "Classic menswear shirt silhouette suitable for business and casual shirts.",
    category: "tops",
    categoryLabel: "Menswear · Tops",
    complexityLabel: "Standard",
    supportedBodyTypes: ["Regular", "Tall"],
    imageSrc: "/images/clothing/categories/menswear.svg",
    defaults: {
      garment_type: "mens_shirt",
      category: "menswear",
    },
  },
  {
    slug: "child-basic-dress",
    title: "Childrens basic dress",
    shortDescription:
      "Comfort-focused block for childrens dresses with room for growth and play.",
    category: "dresses",
    categoryLabel: "Childrenswear · Dresses",
    complexityLabel: "Simple",
    supportedBodyTypes: ["Kids 3–6", "Kids 7–12"],
    imageSrc: "/images/clothing/categories/childrenswear.svg",
    defaults: {
      garment_type: "child_dress",
      category: "childrenswear",
    },
  },
];


