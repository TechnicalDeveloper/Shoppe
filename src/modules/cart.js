const STORAGE_KEY = "shoppe-cart";

const formatPrice = (value) => `$ ${value.toFixed(2)}`;

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    if (Array.isArray(parsed)) return parsed;
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
  return {
    id: product.id,
    title: product.title,
    price: product.finalPrice ?? product.price ?? 0,
    image: product.image || "",
    quantity: 1,
  };
}

function updateBadges(count) {
  document.querySelectorAll(".header__cart-count").forEach((badge) => {
    badge.textContent = count;
    badge.hidden = count <= 0;
  });
}

function createSidebar() {
  if (document.querySelector(".cart-sidebar")) return;

  const overlay = document.createElement("div");
  overlay.className = "cart-overlay";

  const sidebar = document.createElement("aside");
  sidebar.className = "cart-sidebar";
  sidebar.innerHTML = `
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
    itemsRoot.innerHTML =
      '<p class="cart-sidebar__empty">Ваша корзина пуста</p>';
    totalEl.textContent = formatPrice(0);
    return;
  }

  const fragment = document.createDocumentFragment();
  let total = 0;

  cart.forEach((item) => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div class="cart-item__img-wrapper">
        <img src="${item.image}" alt="${item.title}" class="cart-item__img" loading="lazy" />
      </div>
      <div class="cart-item__info">
        <div class="cart-item__title">${item.title}</div>
        <div class="cart-item__price">${formatPrice(item.price)}</div>
        <div class="cart-item__controls">
          <button type="button" class="cart-item__btn" data-action="dec">−</button>
          <span class="cart-item__qty">${item.quantity}</span>
          <button type="button" class="cart-item__btn" data-action="inc">+</button>
        </div>
      </div>
      <button type="button" class="cart-item__remove" aria-label="Удалить">×</button>
    `;

    row.dataset.id = item.id;
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

function attachItemControls() {
  const itemsRoot = document.querySelector(".cart-sidebar__items");
  if (!itemsRoot) return;

  itemsRoot.addEventListener("click", (event) => {
    const target = event.target;
    const row = target.closest(".cart-item");
    if (!row) return;

    const id = row.dataset.id;
    const cart = readCart();
    const item = cart.find((p) => String(p.id) === String(id));
    if (!item) return;

    if (target.matches("[data-action='inc']")) {
      item.quantity += 1;
    } else if (target.matches("[data-action='dec']")) {
      item.quantity = Math.max(1, item.quantity - 1);
    } else if (target.classList.contains("cart-item__remove")) {
      const idx = cart.indexOf(item);
      cart.splice(idx, 1);
    } else {
      return;
    }

    writeCart(cart);
    updateBadges(getItemCount(cart));
    renderSidebar(cart);
  });
}

export function initCartUI() {
  if (typeof window === "undefined") return;
  createSidebar();
  attachItemControls();

  const cart = readCart();
  updateBadges(getItemCount(cart));
  renderSidebar(cart);

  document.querySelectorAll(".header__icon_cart").forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      openSidebar();
    });
  });
}

export function addToCart(product) {
  const cart = readCart();
  const existing = cart.find((item) => String(item.id) === String(product.id));
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(ensureCartItem(product));
  }
  writeCart(cart);
  updateBadges(getItemCount(cart));
  renderSidebar(cart);
  openSidebar();
}
