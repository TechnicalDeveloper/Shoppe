export const formatPrice = (value) => `$ ${value.toFixed(2)}`;

export function getLatestCardTemplate(product) {
  const badge =
    product.discountPercent > 0
      ? `<span class="shop-latest__badge">-${product.discountPercent}%</span>`
      : "";
  const outOfStock = Number.isFinite(product.itemsInStock)
    ? product.itemsInStock <= 0
    : false;
  const disabledAttr = outOfStock ? "disabled" : "";

  return `
    <div class="shop-latest__image">
      <img src="${product.image}" alt="${product.title}" loading="lazy" />
      ${badge}
      <div class="shop-latest__actions">
        <button class="shop-latest__icon-btn js-add-to-cart" aria-label="Add to cart" data-id="${product.id}" ${disabledAttr}>
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
        <button class="shop-latest__add-to-cart js-add-to-cart" data-id="${product.id}" ${disabledAttr}>ADD TO CART</button>
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
}

export function getShopCardTemplate(product) {
  const soldOut = product.itemsInStock <= 0;
  const onSale = product.discountPercent > 0;
  const badge = soldOut
    ? '<span class="shop-card__badge shop-card__badge--soldout">Sold out</span>'
    : onSale
      ? `<span class="shop-card__badge">-${product.discountPercent}%</span>`
      : "";
  const disabledAttr = soldOut ? "disabled" : "";

  return `
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
}
