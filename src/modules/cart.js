const STORAGE_KEY = "shoppe-cart";
const UNLIMITED_STOCK = Infinity;

const formatPrice = (value) => `$ ${value.toFixed(2)}`;

const getMaxQuantity = (item) => {
  const stock = Number(item?.itemsInStock);
  return Number.isFinite(stock) && stock > 0 ? stock : UNLIMITED_STOCK;
};

const normalizeCartItem = (item) => {
  const normalized = {
    id: item?.id ?? null,
    title: item?.title ?? "",
    price: Number(item?.price) || 0,
    image: item?.image || "",
    material: typeof item?.material === "string" ? item.material : "",
    size: typeof item?.size === "string" ? item.size : "",
    quantity: Number.isFinite(item?.quantity)
      ? Math.max(1, Math.trunc(item.quantity))
      : Math.max(1, Number(item?.quantity) || 1),
    itemsInStock: Number.isFinite(item?.itemsInStock) ? item.itemsInStock : null,
  };

  normalized.quantity = Math.min(normalized.quantity, getMaxQuantity(normalized));
  return normalized;
};

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return parsed.map(normalizeCartItem);
  } catch (e) {
    console.warn("Failed to parse cart", e);
  }
  return [];
}

function writeCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function getItemCount(cart) {
  return cart.reduce((acc, item) => acc + (item.quantity || 0), 0);
}

function ensureCartItem(product) {
  return normalizeCartItem({
    id: product.id,
    title: product.title,
    price: product.finalPrice ?? product.price ?? 0,
    image: product.image || "",
    material: product.material || "",
    size: product.size || "",
    quantity: 1,
    itemsInStock: Number.isFinite(product.itemsInStock) ? product.itemsInStock : null,
  });
}

function updateBadges(count) {
  document.querySelectorAll(".header__cart-count").forEach((badge) => {
    badge.textContent = count;
    badge.hidden = count <= 0;
  });
}

const getSidebarTemplate = () => `
    <div class="cart-sidebar__header">
      <h3 class="cart-sidebar__title">Корзина</h3>
      <button type="button" class="cart-sidebar__close" aria-label="Закрыть корзину">×</button>
    </div>
    <div class="cart-sidebar__body">
      <div class="cart-sidebar__items"></div>
    </div>
    <div class="cart-sidebar__footer">
      <div class="cart-sidebar__summary">
        <span>Итого:</span>
        <strong class="cart-sidebar__total">$ 0.00</strong>
      </div>
      <button type="button" class="cart-sidebar__checkout">Перейти к оплате</button>
    </div>
`;

function getCartElementTemplate(item) {
  const maxQty = getMaxQuantity(item);
  const isLimited = Number.isFinite(maxQty);
  const isMax = isLimited && item.quantity >= maxQty;
  const isMin = item.quantity <= 1;
  const stockHint = isLimited
    ? `<span class="cart-item__stock">Доступно: ${maxQty}</span>`
    : "";
  const metaRows = [
    ["Размер", item.size],
    ["Материал", item.material],
  ]
    .filter(([, value]) => typeof value === "string" && value.trim() !== "")
    .map(
      ([label, value]) =>
        `<span class=\"cart-item__meta-item\"><span class=\"cart-item__meta-label\">${label}:</span> ${value}</span>`,
    )
    .join("");

  return `
      <div class="cart-item__img-wrapper">
        <img src="${item.image}" alt="${item.title}" class="cart-item__img" loading="lazy" />
      </div>
      <div class="cart-item__info">
        <div class="cart-item__title">${item.title}</div>
        <div class="cart-item__price">${formatPrice(item.price)}</div>
        ${metaRows ? `<div class="cart-item__meta">${metaRows}</div>` : ""}
        ${stockHint}
        <div class="cart-item__controls" data-max="${isLimited ? maxQty : ""}">
          <button type="button" class="cart-item__btn" data-action="dec" ${
    isMin ? "disabled aria-disabled=\"true\"" : ""
  }>−</button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button type="button" class="cart-item__btn" data-action="inc" ${
    isMax ? "disabled aria-disabled=\"true\"" : ""
  }>+</button>
        </div>
      </div>
      <button type="button" class="cart-item__remove" data-action="remove" aria-label="Удалить">×</button>
    `;
}

function createSidebar() {
  if (document.querySelector(".cart-sidebar")) return;

  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";

  const sidebar = document.createElement("aside");
  sidebar.className = "cart-sidebar";
  sidebar.innerHTML = getSidebarTemplate();

  document.body.append(overlay, sidebar);

  overlay.addEventListener("click", closeSidebar);
  sidebar
    .querySelector(".cart-sidebar__close")
    ?.addEventListener("click", closeSidebar);
}

function renderSidebar(cart) {
  const itemsRoot = document.querySelector(".cart-sidebar__items");
  const totalEl = document.querySelector(".cart-sidebar__total");
  if (!itemsRoot || !totalEl) return;

  if (!cart.length) {
    itemsRoot.innerHTML = '<p class="cart-sidebar__empty">Ваша корзина пуста</p>';
    totalEl.textContent = formatPrice(0);
    return;
  }

  const fragment = document.createDocumentFragment();
  let total = 0;

  cart.forEach((rawItem, index) => {
    const item = normalizeCartItem(rawItem);
    cart[index] = item;

    const lineTotal = item.price * item.quantity;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.dataset.id = item.id;
    row.innerHTML = getCartElementTemplate(item);

    fragment.append(row);
  });

  itemsRoot.replaceChildren(fragment);
  totalEl.textContent = formatPrice(total);
}

function openSidebar() {
  document.querySelector(".cart-overlay")?.classList.add("is-open");
  document.querySelector(".cart-sidebar")?.classList.add("is-open");
}

function closeSidebar() {
  document.querySelector(".cart-overlay")?.classList.remove("is-open");
  document.querySelector(".cart-sidebar")?.classList.remove("is-open");
}

const CART_ACTIONS = {
  inc: ({ item }) => {
    const maxQty = getMaxQuantity(item);
    item.quantity = Math.min(item.quantity + 1, maxQty);
  },
  dec: ({ item }) => {
    item.quantity = Math.max(1, item.quantity - 1);
  },
  remove: ({ cart, index }) => {
    cart.splice(index, 1);
  },
};

function attachItemControls() {
  const itemsRoot = document.querySelector(".cart-sidebar__items");
  if (!itemsRoot) return;

  itemsRoot.addEventListener("click", (event) => {
    const target = event.target;
    const row = target.closest(".cart-item");
    const actionName = target.closest("[data-action]")?.dataset.action;
    if (!row || !actionName || !CART_ACTIONS[actionName]) return;

    const id = row.dataset.id;
    const cart = readCart();
    const index = cart.findIndex((p) => String(p.id) === String(id));
    if (index === -1) return;

    const item = cart[index];
    CART_ACTIONS[actionName]({ cart, item, index });
    if (cart[index]) cart[index] = normalizeCartItem(cart[index]);

    syncCart(cart);
  });
}

function syncCart(cart) {
  writeCart(cart);
  updateBadges(getItemCount(cart));
  renderSidebar(cart);
}

let cartTogglesBound = false;

function bindCartToggles() {
  if (cartTogglesBound) return;
  cartTogglesBound = true;

  const activate = (event) => {
    const toggle = event.target.closest(".header__icon_cart, [data-cart-toggle]");
    if (!toggle) return;

    event.preventDefault();
    openSidebar();
  };

  document.addEventListener("click", activate);

  document.querySelectorAll(".header__icon_cart, [data-cart-toggle]").forEach((btn) => {
    btn.addEventListener("click", activate);
  });
}

export function initCartUI() {
  if (typeof window === "undefined") return;
  createSidebar();
  attachItemControls();

  const cart = readCart();
  syncCart(cart);

  bindCartToggles();
}

export function addToCart(product) {
  const cart = readCart();
  const maxQty = getMaxQuantity(product);
  if (maxQty <= 0) return;

  const index = cart.findIndex((item) => String(item.id) === String(product.id));
  if (index !== -1) {
    const existing = cart[index];
    if (!Number.isFinite(existing.itemsInStock) && Number.isFinite(product.itemsInStock)) {
      existing.itemsInStock = product.itemsInStock;
    }
    existing.quantity = Math.min(existing.quantity + 1, getMaxQuantity(existing));
    cart[index] = normalizeCartItem(existing);
  } else {
    cart.push(ensureCartItem(product));
  }

  syncCart(cart);
}
