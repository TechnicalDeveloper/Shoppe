<script setup>
import { RouterLink } from 'vue-router';
const cartCount = 0;
</script>

<template>
  <header class="header">
    <div class="header__container container">
      <RouterLink to="/" class="header__logo" aria-label="Shoppe">
        <img
          src="/icons/header_logo.svg"
          alt="Shoppe Logo"
          class="header__logo-img"
        />
      </RouterLink>

      <nav class="header__nav">
        <ul class="header__menu">
          <li class="header__menu-item">
            <RouterLink to="/shop" class="header__menu-link">Shop</RouterLink>
          </li>
        </ul>

        <span class="header__divider"></span>

        <RouterLink
          to="/shop"
          class="header__icon header__icon_cart"
          aria-label="Cart"
        >
          <img
            src="/icons/header_shopping-cart.svg"
            alt="Cart"
            class="header__icon-img"
          />
          <span class="header__cart-count">{{ cartCount }}</span>
        </RouterLink>

        <a href="#" class="header__icon header__icon_user" aria-label="Profile">
          <img
            src="/icons/header_icon-color.svg"
            alt="User"
            class="header__icon-img"
          />
        </a>
      </nav>

      <button
        type="button"
        class="header__menu-toggle"
        aria-label="Toggle menu"
        aria-expanded="false"
      >
        <img
          src="/icons/icon-burger.svg"
          alt=""
          class="header__menu-icon"
          aria-hidden="true"
        />
      </button>
    </div>
  </header>
</template>
