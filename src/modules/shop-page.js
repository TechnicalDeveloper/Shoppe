import { fetchProducts } from "./products-api.js";
import { addToCart, initCartUI } from "./cart.js";

const formatPrice = (value) => `$ ${value.toFixed(2)}`;

function createShopCard(product) {
  const soldOut = product.itemsInStock <= 0;
  const onSale = product.discountPercent > 0;
  const card = document.createElement("article");
  card.className = `shop-card${soldOut ? " shop-card--soldout" : ""}${onSale ? " shop-card--onsale" : ""}`;

  const badge = soldOut
    ? '<span class="shop-card__badge shop-card__badge--soldout">Sold out</span>'
    : onSale
      ? `<span class="shop-card__badge">-${product.discountPercent}%</span>`
      : "";

  const disabledAttr = soldOut ? "disabled" : "";

  card.innerHTML = `
    ${badge}
    <div class="shop-card__img">
      <img src="${product.image}" alt="${product.title}" loading="lazy" />
      <div class="shop-latest__actions" aria-hidden="true">
        <button type="button" class="shop-latest__icon-btn js-add-to-cart" aria-label="Add to cart" data-id="${product.id}" ${disabledAttr}>
          <img src="/icons/cart.svg" alt="Add to cart" aria-hidden="true" />
        </button>
        <button type="button" class="shop-latest__icon-btn" aria-label="View">
          <img src="/icons/eye-svgrepo-mini.svg" alt="View" aria-hidden="true" />
        </button>
        <button type="button" class="shop-latest__icon-btn" aria-label="Wishlist">
          <img src="/icons/heart-svgrepo-mini.svg" alt="Wishlist" aria-hidden="true" />
        </button>
      </div>
      <div class="shop-latest__cta--mobile">
        <button class="shop-latest__add-to-cart js-add-to-cart" data-id="${product.id}" ${disabledAttr}>ADD TO CART</button>
      </div>
    </div>
    <div class="shop-card__info">
      <div class="shop-card__name">${product.title}</div>
      <div class="shop-card__prices">
        ${
      product.discountPercent > 0
          ? `<span class="shop-card__price shop-card__price--old">${formatPrice(
              product.price,
          )}</span>`
          : ""
  }
        <span class="shop-card__price shop-card__price--new">${formatPrice(product.finalPrice)}</span>
      </div>
    </div>
  `;

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

document.addEventListener("DOMContentLoaded", () => {
  initCartUI();
  renderCatalog();
});
