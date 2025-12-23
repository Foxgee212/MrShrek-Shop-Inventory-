export type Brand = {
  name: string;
  hasOutOfStock: boolean;
};

export type Category = {
  name: string;
  hasOutOfStock: boolean;
  imageUrl: string;
  brands: Brand[];
};

// Fetch categories directly from your API or database
export async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`/api/items/categories-with-stock`, {
      cache: "no-store", // always fresh data for SSR
    });

    if (!res.ok) {
      console.error("Failed to fetch categories");
      return [];
    }

    const data = await res.json();

    return Array.isArray(data.categories) ? data.categories : [];
  } catch (err) {
    console.error("Fetch error:", err);
    return [];
  }
}

// Normalize strings for comparison
export function normalize(str: string) {
  return str.replace(/\s+/g, " ").trim().toLowerCase();
}
