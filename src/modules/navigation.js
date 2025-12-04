const NAV_SECTIONS = [
  {
    key: "primary",
    items: [
      { label: "Home", href: "/" },
      { label: "Shop", href: "/src/pages/shop.html" },
    ],
  },
  {
    key: "account",
    items: [
      { label: "My account", href: "#", icon: "public/icons/profile.svg" },
      { label: "Logout", href: "#", icon: "public/icons/icon-logout.svg" },
    ],
  },
];

const SELECTORS = {
  toggle: "[data-nav-toggle]",
  close: "[data-nav-close]",
};

const CLASSNAMES = {
  open: "nav-drawer--open",
  activeLink: "nav-drawer__link--active",
  bodyLocked: "has-nav-open",
};

let drawerInstance;
let navigationReady = false;

function createNavItem({ label, href, icon }) {
  const item = document.createElement("li");
  item.className = "nav-drawer__item";

  const link = document.createElement("a");
  link.className = "nav-drawer__link";
  link.href = href;
  link.textContent = label;

  if (icon) {
    const iconElement = document.createElement("img");
    iconElement.src = icon;
    iconElement.alt = "";
    iconElement.className = "nav-drawer__icon";
    iconElement.setAttribute("aria-hidden", "true");
    link.prepend(iconElement);
  }

  item.append(link);
  return item;
}

function normalizePath(url) {
  const { pathname } = new URL(url, window.location.origin);
  return pathname.replace(/index\.html$/, "/");
}

function markActiveLinks(drawer) {
  const currentPath = normalizePath(window.location.href);

  drawer.querySelectorAll(".nav-drawer__link").forEach((link) => {
    const linkPath = normalizePath(link.href);
    const isActive = linkPath === currentPath || currentPath.startsWith(linkPath);

    if (isActive) {
      link.classList.add(CLASSNAMES.activeLink);
      link.setAttribute("aria-current", "page");
    } else {
      link.classList.remove(CLASSNAMES.activeLink);
      link.removeAttribute("aria-current");
    }
  });
}

function createNavList(items, modifier) {
  const list = document.createElement("ul");
  list.className = `nav-drawer__list${modifier ? ` nav-drawer__list--${modifier}` : ""}`;

  items.forEach((item) => list.append(createNavItem(item)));
  return list;
}

function buildNavDrawer() {
  if (drawerInstance) return drawerInstance;

  const drawer = document.createElement("div");
  drawer.className = "nav-drawer";
  drawer.setAttribute("role", "dialog");
  drawer.setAttribute("aria-modal", "true");
  drawer.setAttribute("aria-label", "Navigation menu");
  drawer.setAttribute("aria-hidden", "true");

  drawer.innerHTML = `
    <div class="nav-drawer__panel">
      <div class="nav-drawer__header">
        <a href="/" class="nav-drawer__logo" aria-label="Shoppe">
          <img src="/icons/header_logo.svg" alt="Shoppe" class="nav-drawer__logo-img" />
        </a>
        <div class="nav-drawer__actions">
          <a
            href="#"
            class="header__icon header__icon_cart nav-drawer__action"
            aria-label="Cart"
            data-cart-toggle
          >
            <img
              src="/icons/header_shopping-cart.svg"
              alt=""
              class="header__icon-img"
              aria-hidden="true"
            />
            <span class="header__cart-count" aria-hidden="true">0</span>
          </a>
          <button type="button" class="nav-drawer__close" aria-label="Close menu" data-nav-close></button>
        </div>
      </div>
      <nav class="nav-drawer__body" aria-label="Mobile navigation"></nav>
    </div>
  `;

  const body = drawer.querySelector(".nav-drawer__body");
  NAV_SECTIONS.forEach((section, index) => {
    const sectionList = createNavList(section.items, section.key);
    const sectionWrapper = document.createElement("div");
    sectionWrapper.className = "nav-drawer__section";
    sectionWrapper.append(sectionList);

    body.append(sectionWrapper);

    if (index < NAV_SECTIONS.length - 1) {
      const divider = document.createElement("div");
      divider.className = "nav-drawer__divider";
      body.append(divider);
    }
  });

  document.body.append(drawer);
  drawerInstance = drawer;
  return drawer;
}

function toggleAriaExpanded(toggles, isExpanded) {
  toggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(isExpanded)));
}

function createControls(drawer, toggles) {
  const closeButton = drawer.querySelector(SELECTORS.close);
  const links = Array.from(drawer.querySelectorAll(".nav-drawer__link"));

  const closeDrawer = () => {
    drawer.classList.remove(CLASSNAMES.open);
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove(CLASSNAMES.bodyLocked);
    toggleAriaExpanded(toggles, false);
  };

  const openDrawer = () => {
    drawer.classList.add(CLASSNAMES.open);
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add(CLASSNAMES.bodyLocked);
    toggleAriaExpanded(toggles, true);
  };

  const handleToggleClick = (event) => {
    event.preventDefault();
    if (drawer.classList.contains(CLASSNAMES.open)) {
      closeDrawer();
    } else {
      openDrawer();
    }
  };

  toggles.forEach((toggle) => toggle.addEventListener("click", handleToggleClick));
  closeButton?.addEventListener("click", closeDrawer);

  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && drawer.classList.contains(CLASSNAMES.open)) {
      closeDrawer();
    }
  });

  links.forEach((link) => link.addEventListener("click", closeDrawer));

  return { openDrawer, closeDrawer };
}

export function initNavigation() {
  if (navigationReady) return;

  const toggles = Array.from(document.querySelectorAll(SELECTORS.toggle));
  if (!toggles.length) return;

  const drawer = buildNavDrawer();
  markActiveLinks(drawer);
  createControls(drawer, toggles);

  navigationReady = true;
}
