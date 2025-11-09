const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL
        ? String(import.meta.env.VITE_API_BASE_URL)
        : "https://api.dev.cwe.su"
).replace(/\/+$/, "");

const API_URL = API_BASE + "/api/products?populate=*&pagination[pageSize]=100";

function esc(value) {
    const s = String(value == null ? "" : value);
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return s.replace(/[&<>"']/g, m => map[m]);
}

function toNum(v) {
    const n = Number(String(v == null ? 0 : v).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
}

function pickImg(src) {
    if (!src) return "";
    if (src.data?.attributes?.url) return src.data.attributes.url;
    if (src.attributes?.url) return src.attributes.url;
    if (src.url) return src.url;
    if (Array.isArray(src.data) && src.data[0]?.attributes?.url) return src.data[0].attributes.url;
    if (typeof src === "string") return src;
    return "";
}

// -------- API --------
async function fetchProducts() {
    const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error("HTTP_" + res.status);

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    return rows.map(row => {
        const a = row.attributes || row || {};

        const raw =
            pickImg(a.image) ||
            pickImg(a.cover) ||
            pickImg(a.images) ||
            pickImg(a.imageMobile);

        const img = raw
            ? (raw.startsWith("http")
                ? raw
                : API_BASE + (raw.startsWith("/") ? "" : "/") + raw)
            : "";

        return {
            id: row.id ?? a.id ?? a.documentId ?? a.slug ?? String(Math.random()).slice(2),
            title: a.title || a.name || a.productName || "Без названия",
            price: toNum(a.price ?? a.cost),
            discount: toNum(a.discountPercent),
            img
        };
    });
}

function renderCard(p) {
    const hasSale = Number(p.discount) > 0;
    const newPrice = hasSale ? Number(p.price) * (1 - Number(p.discount) / 100) : Number(p.price);

    const money = n =>
        "$ " + new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2 }).format(n);

    return `
    <div class="shop-latest__card">
      <div class="shop-latest__image">
        <img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy" />
        ${hasSale ? `<span class="shop-latest__badge">- ${esc(p.discount)} %</span>` : ""}

        <div class="shop-latest__actions">
          <button class="shop-latest__icon-btn" aria-label="Add to cart (disabled)">
            <img src="/src/assets/svg/cart.svg" alt="" />
          </button>
          <button class="shop-latest__icon-btn" aria-label="View product">
            <img src="/src/assets/svg/eye-svgrepo-mini.svg" alt="" />
          </button>
          <button class="shop-latest__icon-btn" aria-label="Wishlist">
            <img src="/src/assets/svg/heart-svgrepo-mini.svg" alt="" />
          </button>
        </div>
      </div>

      <div class="shop-latest__info">
        <div class="shop-latest__name">${esc(p.title)}</div>
        <div class="shop-latest__prices">
          ${hasSale ? `<span class="shop-latest__price shop-latest__price--old">${money(p.price)}</span>` : ""}
          <span class="shop-latest__price shop-latest__price--new">${money(newPrice)}</span>
        </div>
      </div>
    </div>
  `;
}

function attachHover(scopeEl) {
    scopeEl.addEventListener(
        "mouseenter",
        e => {
            const imgWrap = e.target.closest(".shop-latest__image");
            if (imgWrap && scopeEl.contains(imgWrap)) imgWrap.classList.add("is-hover");
        },
        true
    );

    scopeEl.addEventListener(
        "mouseleave",
        e => {
            const imgWrap = e.target.closest(".shop-latest__image");
            if (imgWrap && scopeEl.contains(imgWrap)) imgWrap.classList.remove("is-hover");
        },
        true
    );
}

export async function initIndexShop() {
    const grid = document.querySelector(".shop-latest__grid");
    if (!grid) return;

    let products = [];
    try {
        products = await fetchProducts();
    } catch (e) {
        console.error("Products fetch error:", e);
    }

    grid.innerHTML = products.map(renderCard).join("");
    attachHover(grid.closest(".shop-latest") || document.body);
}
