import Swiper from "swiper";
import { Autoplay, Keyboard, A11y, EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";

const CONFIG = {
  selectors: {
    root: ".hero__slider",
    templateId: "#hero-content-template",
    fallbackContent: ".hero__content",
    pagination: ".hero__pagination",
    overrides: "[data-hero-override]",
  },
  images: {
    mobileMq: "(max-width: 768px)",
    sizes: "(max-width: 768px) 100vw, 1248px",
  },
  api: {
    baseUrl: (
      import.meta?.env?.VITE_API_URL || "https://api.dev.cwe.su"
    ).replace(/\/+$/, ""),
    promosEndpoint: "/api/promos/?populate=*",
    timeoutMs: 8000,
    limit: null,
  },
  swiper: {
    slidesPerView: 1,
    loop: true,
    speedMs: 650,
    grabCursor: true,
    simulateTouch: true,
    allowTouchMove: true,
    touchRatio: 1.05,
    resistanceRatio: 0.85,
    dragThresholdPx: 5,
    autoplayDelayMs: 5000,
    effect: "creative",
    creativeEffect: {
      prev: { translate: ["-100%", 0, 0], opacity: 1 },
      next: { translate: ["100%", 0, 0], opacity: 1 },
      limitProgress: 1,
      perspective: false,
    },
  },
  a11y: { goToSlidePrefix: "Go to slide" },
};

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
const isHttp = (u) => /^https?:\/\//i.test(u ?? "");
const absolute = (base, url) =>
  !url
    ? ""
    : isHttp(url)
      ? url
      : `${base}${url.startsWith("/") ? "" : "/"}${url}`;
function withTimeout(promise, ms, ctrl) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      ctrl?.abort?.();
      reject(new Error(`Request timeout after ${ms}ms`));
    }, ms);
    promise
      .then((v) => {
        clearTimeout(id);
        resolve(v);
      })
      .catch((e) => {
        clearTimeout(id);
        reject(e);
      });
  });
}
function neutralizeImages(container) {
  container.querySelectorAll("img[src]").forEach((img) => {
    img.setAttribute("data-src", img.getAttribute("src"));
    img.removeAttribute("src");
  });
  container.querySelectorAll("source[srcset]").forEach((s) => {
    s.setAttribute("data-srcset", s.getAttribute("srcset"));
    s.removeAttribute("srcset");
  });
  container.style.background = "none";
}

async function fetchSlides(cfgApi) {
  const { baseUrl, promosEndpoint, timeoutMs, limit } = cfgApi;
  const ctrl = new AbortController();
  const resp = await withTimeout(
    fetch(`${baseUrl}${promosEndpoint}`, { signal: ctrl.signal }),
    timeoutMs,
    ctrl,
  );
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();
  const items = Array.isArray(json?.data) ? json.data : [];
  let slides = items
    .map((item) => {
      const desktop = item?.desktopImage;
      const mobile = item?.mobileImage || null;
      const title = item?.product?.title || "";
      const price = item?.product?.price ?? "";
      return {
        title,
        price,
        img: absolute(baseUrl, desktop),
        imgMobile: mobile ? absolute(baseUrl, mobile) : null,
      };
    })
    .filter((s) => s.img);
  if (Number.isInteger(limit) && limit > 0) slides = slides.slice(0, limit);
  return slides;
}

function readHtmlOverrides(root) {
  const map = new Map();
  root.querySelectorAll(CONFIG.selectors.overrides).forEach((el) => {
    const i = Number(el.dataset.index);
    if (Number.isInteger(i))
      map.set(i, {
        title: el.dataset.title ?? undefined,
        price: el.dataset.price ?? undefined,
      });
  });
  return map;
}

function renderHeroPicture(cfgImages, { title, img, imgMobile }, eager) {
  const mobile = imgMobile || img;
  return `
    <picture class="hero-slide__picture">
      ${mobile ? `<source media="${esc(cfgImages.mobileMq)}" srcset="${esc(mobile)}">` : ""}
      <img class="hero-slide__img" src="${esc(img)}" alt="${esc(title)}" loading="${eager ? "eager" : "lazy"}" decoding="async" sizes="${esc(cfgImages.sizes)}" />
    </picture>
  `;
}

function createSlideElement(cfgImages, slideData, contentHTML, eager) {
  const slide = document.createElement("div");
  slide.className = "swiper-slide hero-slide";
  slide.innerHTML = `${renderHeroPicture(cfgImages, slideData, eager)}${contentHTML}`;
  const content = slide.querySelector(".hero__content");
  if (content) {
    const t = content.querySelector(".hero__title");
    const p = content.querySelector(".hero__price");
    if (t) t.textContent = slideData.title ?? "";
    if (p)
      p.textContent =
        slideData.price !== "" && slideData.price != null
          ? `$ ${slideData.price}`
          : "";
  }
  const img = slide.querySelector(".hero-slide__img");
  if (img) img.draggable = false;
  return slide;
}

function buildSwiperOptions(cfg) {
  const s = cfg.swiper;
  return {
    modules: [Autoplay, Keyboard, A11y, EffectCreative],
    slidesPerView: s.slidesPerView,
    loop: s.loop,
    speed: s.speedMs,
    grabCursor: s.grabCursor,
    simulateTouch: s.simulateTouch,
    allowTouchMove: s.allowTouchMove,
    touchRatio: s.touchRatio,
    resistanceRatio: s.resistanceRatio,
    threshold: s.dragThresholdPx,
    effect: s.effect,
    creativeEffect: s.creativeEffect,
    autoplay: {
      delay: s.autoplayDelayMs,
      disableOnInteraction: false,
      pauseOnMouseEnter: false,
    },
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: { enabled: true },
  };
}

export async function initHeroSlider(overrides = {}) {
  const cfg = {
    ...CONFIG,
    ...overrides,
    api: { ...CONFIG.api, ...(overrides?.api || {}) },
    swiper: { ...CONFIG.swiper, ...(overrides?.swiper || {}) },
  };
  const root = document.querySelector(cfg.selectors.root);
  if (!root) return;

  neutralizeImages(root);

  let contentHTML = "";
  const tpl = root.querySelector(cfg.selectors.templateId);
  if (tpl && tpl instanceof HTMLTemplateElement) {
    contentHTML = tpl.innerHTML.trim();
    tpl.remove();
  } else {
    const fallback = root.querySelector(cfg.selectors.fallbackContent);
    if (!fallback) return;
    neutralizeImages(fallback);
    contentHTML = fallback.outerHTML;
    fallback.remove();
  }

  let slides = [];
  try {
    slides = await fetchSlides(cfg.api);
  } catch (e) {
    console.warn("[hero] API error:", e);
  }
  if (!slides?.length) return;

  const overridesMap = readHtmlOverrides(root);
  const swiperEl = document.createElement("div");
  swiperEl.className = "hero-swiper swiper";
  const wrapperEl = document.createElement("div");
  wrapperEl.className = "swiper-wrapper";

  slides.forEach((s, idx) => {
    const ov = overridesMap.get(idx);
    const merged = {
      ...s,
      title: ov?.title ?? s.title,
      price: ov?.price ?? s.price,
    };
    wrapperEl.appendChild(
      createSlideElement(cfg.images, merged, contentHTML, idx === 0),
    );
  });

  swiperEl.appendChild(wrapperEl);
  root.appendChild(swiperEl);

  let paginationEl = root.querySelector(cfg.selectors.pagination);
  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.className = "hero__pagination";
    paginationEl.setAttribute("role", "tablist");
    root.appendChild(paginationEl);
  } else paginationEl.innerHTML = "";

  const swiper = new Swiper(swiperEl, buildSwiperOptions(cfg));

  const bullets = slides.map((_, index) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hero__bullet";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `${cfg.a11y.goToSlidePrefix} ${index + 1}`);
    b.addEventListener("click", () => swiper.slideToLoop(index));
    b.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        swiper.slideToLoop(index);
      }
    });
    paginationEl.appendChild(b);
    return b;
  });

  const setActive = () => {
    const idx = swiper.realIndex % slides.length;
    bullets.forEach((b, i) => {
      const on = i === idx;
      b.classList.toggle("hero__bullet--active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
      if (on) b.setAttribute("aria-current", "true");
      else b.removeAttribute("aria-current");
    });
  };

  swiper.on("slideChange", setActive);
  setActive();
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroSlider();
});
