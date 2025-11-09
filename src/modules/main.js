import "../styles/style.scss";
import { initHeroSlider } from "./hero-slider.js";
import { initIndexShop } from "./shop-index-api.js";

function initBurger() {
  const burger = document.querySelector(".header__menu-toggle");
  burger?.addEventListener("click", () => burger.classList.toggle("open"));
}

document.addEventListener("DOMContentLoaded", () => {
  initBurger();
  initHeroSlider();
  initIndexShop();
});
