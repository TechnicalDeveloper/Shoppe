import "../styles/style.scss";
import "../styles/shop.scss";
import { initCatalogShop } from "./shop-page-api.js";

function initBurger() {
    const burger = document.querySelector(".header__menu-toggle");
    burger?.addEventListener("click", () => burger.classList.toggle("open"));
}

document.addEventListener("DOMContentLoaded", () => {
    initBurger();
    initCatalogShop();
});
