const API_BASE = (
  import.meta?.env?.VITE_API_URL || "https://api.dev.cwe.su"
).replace(/\/+$/, "");

const PRODUCTS_ENDPOINT = "/api/products/?populate=*";

const escUrl = (url) => String(url ?? "");
const isHttp = (value) => /^https?:\/\//i.test(value ?? "");

const absoluteUrl = (base, url) => {
  const safeUrl = escUrl(url);
  if (!safeUrl) return "";
  if (isHttp(safeUrl)) return safeUrl;
  const normalized = safeUrl.startsWith("/") ? safeUrl : `/${safeUrl}`;
  return `${base}${normalized}`;
};

function mapProduct(node) {
  const source = node?.attributes ?? node ?? {};
  const coverUrl =
    source?.cover?.data?.attributes?.url ||
    source?.cover?.url ||
    source?.image ||
    "";

  const price = Number(source.price) || 0;
  const discountPercent = Number(source.discountPercent) || 0;
  const finalPrice =
    discountPercent > 0
      ? Math.max(price - (price * discountPercent) / 100, 0)
      : price;
  const material = source.material || source.materials || "";
  const size = source.size || source.dimension || source.dimensions || "";

  return {
    id: node?.id ?? source.id ?? null,
    title: source.title ?? "",
    price,
    finalPrice,
    discountPercent,
    itemsInStock: Number.isFinite(source.itemsInStock)
      ? source.itemsInStock
      : 0,
    image: absoluteUrl(API_BASE, coverUrl),
    material: typeof material === "string" ? material : "",
    size: typeof size === "string" ? size : "",
  };
}

export async function fetchProducts() {
  const response = await fetch(`${API_BASE}${PRODUCTS_ENDPOINT}`);
  if (!response.ok)
    throw new Error(`Failed to fetch products: ${response.status}`);

  const json = await response.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  return items.map(mapProduct).filter((product) => product.id != null);
}
