import "../styles/style.scss";
import { initHeroSlider } from "./hero-slider.js";
import { fetchProducts } from "./products-api.js";
import { addToCart, initCartUI } from "./cart.js";
import { getLatestCardTemplate } from "./product-templates.js";
import { initNavigation } from "./navigation.js";

const MAX_LATEST_ITEMS = 6;

function createLatestCard(product) {
  const card = document.createElement("article");
  card.className = "shop-latest__card";

  card.innerHTML = getLatestCardTemplate(product);

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
  initNavigation();
  renderLatestProducts();
});
