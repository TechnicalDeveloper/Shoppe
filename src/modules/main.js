import "../styles/style.scss";
import "../styles/shop.scss";
import { initHeroSlider } from "./hero-slider.js";
import { initIndexShop } from "./shop-index-api.js";
import { initCatalogShop } from "./shop-page-api.js";

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
  initIndexShop();    // index.html → .shop-latest__grid
  initCatalogShop();  // shop.html   → .shop-page__grid
});
