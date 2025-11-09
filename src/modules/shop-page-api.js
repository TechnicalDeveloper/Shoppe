const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "https://api.dev.cwe.su").replace(/\/+$/, "");
const API_URL = `${API_BASE}/api/products?populate=*&pagination[pageSize]=100`;
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
const toNum = (v) => { const n = Number(String(v ?? 0).replace(",", ".")); return Number.isFinite(n) ? n : 0; };
const pickImg = (src) => src?.data?.attributes?.url || src?.attributes?.url || src?.url || (Array.isArray(src?.data) && src.data[0]?.attributes?.url) || (typeof src === "string" && src) || "";
const money = (v) => `$ ${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0))}`;

async function fetchProducts() {
    const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows.map((row) => {
        const a = row?.attributes ?? row ?? {};
        const img = pickImg(a.image) || pickImg(a.cover) || pickImg(a.images) || pickImg(a.imageMobile);
        return {
            id: row?.id ?? a?.id ?? a?.documentId ?? a?.slug ?? String(Math.random()).slice(2),
            title: a.title || a.name || a.productName || "Без названия",
            price: toNum(a.price ?? a.cost ?? 0),
            discount: toNum(a.discountPercent ?? 0),
            img: img?.startsWith("http") ? img : `${API_BASE}${img?.startsWith("/") ? "" : "/"}${img}`,
        };
    });
}

function renderCard(p) {
    const hasSale = p.discount > 0;
    const newPrice = hasSale ? p.price * (1 - p.discount / 100) : p.price;

    return `
    <div class="shop-latest__card">
      <div class="shop-latest__image">
        <img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy" />
        ${hasSale ? `<span class="shop-latest__badge">- ${esc(p.discount)} %</span>` : ""}
        <div class="shop-latest__actions">
          <button class="shop-latest__icon-btn" data-add="${esc(p.id)}"><img src="/src/assets/svg/cart.svg" alt="" /></button>
          <button class="shop-latest__icon-btn"><img src="/src/assets/svg/eye-svgrepo-mini.svg" alt="" /></button>
          <button class="shop-latest__icon-btn"><img src="/src/assets/svg/heart-svgrepo-mini.svg" alt="" /></button>
        </div>
        <div class="shop-latest__cta--mobile"><button class="shop-latest__add-to-cart" data-add="${esc(p.id)}">ADD TO CART</button></div>
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

export async function initCatalogShop() {
    const grid = document.querySelector(".shop-page__grid");
    if (!grid) return;

    const items = await fetchProducts();
    grid.innerHTML = items.map(renderCard).join("");

    grid.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (!btn) return;
        const id = btn.getAttribute("data-add");
        const item = items.find((x) => String(x.id) === String(id));
        if (!item) return;

        const c = JSON.parse(localStorage.getItem("shoppe_cart_v1") || "{}");
        const k = String(item.id);
        c[k] = { ...(c[k] || item), qty: (c[k]?.qty || 0) + 1 };
        localStorage.setItem("shoppe_cart_v1", JSON.stringify(c));
    });
}
