import "../styles/style.scss";
import { initHeroSlider } from "./hero-slider.js";
import { fetchProducts } from "./products-api.js";
import { addToCart, initCartUI } from "./cart.js";

const MAX_LATEST_ITEMS = 6;

const formatPrice = (value) => `$ ${value.toFixed(2)}`;

function createLatestCard(product) {
  const card = document.createElement("article");
  card.className = "shop-latest__card";

  const badge = product.discountPercent > 0
    ? `<span class="shop-latest__badge">-${product.discountPercent}%</span>`
    : "";

  card.innerHTML = `
    <div class="shop-latest__image">
      <img src="${product.image}" alt="${product.title}" loading="lazy" />
      ${badge}
      <div class="shop-latest__actions">
        <button class="shop-latest__icon-btn js-add-to-cart" aria-label="Add to cart" data-id="${product.id}">
          <img src="/icons/cart.svg" alt="Add to cart" />
        </button>
        <button class="shop-latest__icon-btn" aria-label="View">
          <img src="/icons/eye-svgrepo-mini.svg" alt="View" />
        </button>
        <button class="shop-latest__icon-btn" aria-label="Wishlist">
          <img src="/icons/heart-svgrepo-mini.svg" alt="Wishlist" />
        </button>
      </div>
      <div class="shop-latest__cta--mobile">
        <button class="shop-latest__add-to-cart js-add-to-cart" data-id="${product.id}">ADD TO CART</button>
      </div>
    </div>
    <div class="shop-latest__info">
      <div class="shop-latest__name">${product.title}</div>
      <div class="shop-latest__prices">
        ${
      product.discountPercent > 0
          ? `<span class="shop-latest__price shop-latest__price--old">${formatPrice(
              product.price,
          )}</span>`
          : ""
  }
        <span class="shop-latest__price shop-latest__price--new">${formatPrice(product.finalPrice)}</span>
      </div>
    </div>
  `;

  return card;
}

async function renderLatestProducts() {
  const grid = document.querySelector(".shop-latest__grid");
  if (!grid) return;

  grid.innerHTML = "";
  try {
    const products = await fetchProducts();
    const latest = products.slice(0, MAX_LATEST_ITEMS);
    const fragment = document.createDocumentFragment();
    latest.forEach((product) => {
      fragment.append(createLatestCard(product));
    });
    grid.append(fragment);

    grid.querySelectorAll(".js-add-to-cart").forEach((btn) => {
      btn.addEventListener("click", () => {
        const id = btn.dataset.id;
        const product = latest.find((item) => String(item.id) === String(id));
        if (product) addToCart(product);
      });
    });
  } catch (error) {
    grid.innerHTML = `<p class="shop-latest__error">Не удалось загрузить товары.</p>`;
    console.error(error);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initCartUI();
  renderLatestProducts();
});
