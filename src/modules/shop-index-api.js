const API_BASE = (import.meta?.env?.VITE_API_BASE_URL || "https://api.dev.cwe.su").replace(/\/+$/, "");
const API_URL = `${API_BASE}/api/products?populate=*&pagination[pageSize]=100`;

const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (m) => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[m]));
const toNum = (v) => {
    const n = Number(String(v ?? 0).replace(",", "."));
    return Number.isFinite(n) ? n : 0;
};
const pickImg = (src) =>
    src?.data?.attributes?.url ||
    src?.attributes?.url ||
    src?.url ||
    (Array.isArray(src?.data) && src.data[0]?.attributes?.url) ||
    (typeof src === "string" && src) ||
    "";

// --- API
async function fetchProducts() {
    const res = await fetch(API_URL, { headers: { Accept: "application/json" } });
    if (!res.ok) throw new Error(`HTTP_${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows.map((row) => {
        const a = row?.attributes ?? row ?? {};
        const raw = pickImg(a.image) || pickImg(a.cover) || pickImg(a.images) || pickImg(a.imageMobile);
        const img = raw ? (raw.startsWith("http") ? raw : `${API_BASE}${raw.startsWith("/") ? "" : "/"}${raw}`) : "";
        return {
            id: row?.id ?? a?.id ?? a?.documentId ?? a?.slug ?? String(Math.random()).slice(2),
            title: a.title || a.name || a.productName || "Без названия",
            price: toNum(a.price ?? a.cost ?? 0),
            discount: toNum(a.discountPercent ?? 0),
            img,
        };
    });
}

// --- Cart (LS)
const CART_KEY = "shoppe_cart_v1";
const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } };
const writeCart = (c) => localStorage.setItem(CART_KEY, JSON.stringify(c || {}));
function addToCart(item) {
    const c = readCart();
    const k = String(item.id);
    c[k] = { ...(c[k] || item), qty: (c[k]?.qty || 0) + 1 };
    writeCart(c);
}

function renderCard(p) {
    const hasSale = p.discount > 0;
    const newPrice = hasSale ? p.price * (1 - p.discount / 100) : p.price;
    const money = (v) =>
        `$ ${new Intl.NumberFormat("ru-RU", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Number(v || 0))}`;

    return `
    <div class="shop-latest__card">
      <div class="shop-latest__image">
        <img src="${esc(p.img)}" alt="${esc(p.title)}" loading="lazy" />
        ${hasSale ? `<span class="shop-latest__badge">- ${esc(p.discount)} %</span>` : ""}
        <div class="shop-latest__actions">
          <button class="shop-latest__icon-btn" aria-label="Add to cart" data-add="${esc(p.id)}">
            <img src="/src/assets/svg/cart.svg" alt="" />
          </button>
          <button class="shop-latest__icon-btn" aria-label="View">
            <img src="/src/assets/svg/eye-svgrepo-mini.svg" alt="" />
          </button>
          <button class="shop-latest__icon-btn" aria-label="Wishlist">
            <img src="/src/assets/svg/heart-svgrepo-mini.svg" alt="" />
          </button>
        </div>
        <div class="shop-latest__cta--mobile">
          <button class="shop-latest__add-to-cart" data-add="${esc(p.id)}">ADD TO CART</button>
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

function attachScopedHandlers(scopeEl, products) {
    scopeEl.addEventListener("mouseenter", (e) => {
        const imgWrap = e.target.closest(".shop-latest__image");
        if (imgWrap && scopeEl.contains(imgWrap)) imgWrap.classList.add("is-hover");
    }, true);

    scopeEl.addEventListener("mouseleave", (e) => {
        const imgWrap = e.target.closest(".shop-latest__image");
        if (imgWrap && scopeEl.contains(imgWrap)) imgWrap.classList.remove("is-hover");
    }, true);

    scopeEl.addEventListener("touchstart", (e) => {
        const imgWrap = e.target.closest(".shop-latest__image");
        if (!imgWrap || !scopeEl.contains(imgWrap)) return;
        if (!imgWrap.classList.contains("is-hover")) {
            imgWrap.classList.add("is-hover");
        }
    }, { passive: true });

    // Click: add to cart
    scopeEl.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-add]");
        if (!btn || !scopeEl.contains(btn)) return;
        const id = btn.getAttribute("data-add");
        const item = products.find((x) => String(x.id) === String(id));
        if (item) addToCart(item);
    });
}

export async function initIndexShop() {
    const grid = document.querySelector(".shop-latest__grid");
    if (!grid) return;

    const section = grid.closest(".shop-latest") || grid.parentElement || document.body;

    let products = [];
    try {
        products = await fetchProducts();
    } catch (e) {
        console.error("Products fetch error:", e);
        products = [];
    }

    const html = products.map(renderCard).join("");
    grid.innerHTML = html;

    attachScopedHandlers(section, products);
}
