import { fetchProducts } from "./products-api.js";
import { addToCart, initCartUI } from "./cart.js";
import { getShopCardTemplate } from "./product-templates.js";
import { initNavigation } from "./navigation.js";

function createShopCard(product) {
  const soldOut = product.itemsInStock <= 0;
  const onSale = product.discountPercent > 0;
  const card = document.createElement("article");
  card.className = `shop-card${soldOut ? " shop-card--soldout" : ""}${onSale ? " shop-card--onsale" : ""}`;

  card.innerHTML = getShopCardTemplate(product);

  return card;
}

async function renderCatalog() {
  const grid = document.querySelector(".shop-page__grid");
  if (!grid) return;

  grid.innerHTML = "";
  try {
    const products = (await fetchProducts()).slice(0, 6);
    const fragment = document.createDocumentFragment();
    products.forEach((product) => fragment.append(createShopCard(product)));
    grid.append(fragment);

    grid.querySelectorAll(".js-add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const product = products.find((item) => String(item.id) === String(id));
        if (product && product.itemsInStock > 0) addToCart(product);
      });
    });
  } catch (error) {
    grid.innerHTML = `<p class="shop-latest__error">Не удалось загрузить товары.</p>`;
    console.error(error);
  }
}

function runWhenReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, { once: true });
  } else {
    callback();
  }
}

runWhenReady(() => {
  initCartUI();
  initNavigation();
  initFilters();
  renderCatalog();
});

function initFilters() {
  const filtersToggle = document.querySelector(".shop-page__filters-toggle");
  const sidebar = document.getElementById("shop-filters");
  if (filtersToggle && sidebar) {
    filtersToggle.addEventListener("click", () => {
      const visible = sidebar.classList.toggle("is-open");
      filtersToggle.setAttribute("aria-expanded", String(visible));
    });
  }
}
