import Swiper from "swiper";
import { Autoplay, Keyboard, A11y, EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";

const ROOT_SELECTOR = ".hero__slider";
const AUTOPLAY_MS = 5000;
const MOBILE_MQ = "(max-width: 768px)";
const IMG_SIZES = "(max-width: 768px) 100vw, 1248px";

const SLIDES_PER_VIEW = 1;
const SLIDE_SPEED_MS = 650;
const GRAB_CURSOR = true;
const SIMULATE_TOUCH = true;
const ALLOW_TOUCH_MOVE = true;
const TOUCH_RATIO = 1.05;
const RESISTANCE_RATIO = 0.85;
const DRAG_THRESHOLD_PX = 5;

const EFFECT = "creative";
const CREATIVE_EFFECT = {
  prev: { translate: ["-100%", 0, 0], opacity: 1 },
  next: { translate: ["100%", 0, 0], opacity: 1 },
  limitProgress: 1,
  perspective: false,
};

const API_BASE = (
  import.meta?.env?.VITE_API_URL || "https://api.dev.cwe.su"
).replace(/\/+$/, "");
const PROMOS_ENDPOINT = "/api/promos?populate=*";

const FALLBACK_SLIDES = [
  {
    title: "Gold big hoops",
    price: "68,00",
    img: assetUrl("../assets/img_hero.png"),
    imgMobile: assetUrl("../assets/img_hero_mobile.png"),
  },
  {
    title: "This is Barsic kitty",
    price: "55,00",
    img: assetUrl("../assets/img_hero_2.png"),
    imgMobile: assetUrl("../assets/img_hero_2.png"),
  },
  {
    title: "This is Nikol kitty",
    price: "39,00",
    img: assetUrl("../assets/img_hero_3.png"),
    imgMobile: assetUrl("../assets/img_hero_3.png"),
  },
  {
    title: "This is Sofa kitty",
    price: "49,00",
    img: assetUrl("../assets/img_hero_4.png"),
    imgMobile: assetUrl("../assets/img_hero_4.png"),
  },
];

function esc(s) {
  return String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );
}

function assetUrl(relativePathFromThisFile) {
  try {
    return new URL(relativePathFromThisFile, import.meta.url).href;
  } catch {
    return relativePathFromThisFile;
  }
}

function absolute(apiOrRelativeUrl) {
  if (!apiOrRelativeUrl) return "";
  if (/^https?:\/\//i.test(apiOrRelativeUrl)) return apiOrRelativeUrl;
  return `${API_BASE}${apiOrRelativeUrl.startsWith("/") ? "" : "/"}${apiOrRelativeUrl}`;
}

function renderHeroPicture({ title, img, imgMobile }) {
  const mobile = imgMobile || img;
  const desktop = img;
  return `
    <picture class="hero-slide__picture">
      ${mobile ? `<source media="${MOBILE_MQ}" srcset="${esc(mobile)}">` : ""}
      <img class="hero-slide__img"
           src="${esc(desktop)}"
           alt="${esc(title)}"
           loading="lazy"
           decoding="async"
           sizes="${esc(IMG_SIZES)}" />
    </picture>
  `;
}

function createSlideElement(slideData, contentHTML) {
  const slide = document.createElement("div");
  slide.className = "swiper-slide hero-slide";
  slide.innerHTML = `${renderHeroPicture(slideData)}${contentHTML}`;

  const content = slide.querySelector(".hero__content");
  if (content) {
    const t = content.querySelector(".hero__title");
    const p = content.querySelector(".hero__price");
    if (t) t.textContent = slideData.title ?? "";
    if (p) p.textContent = slideData.price ? `$ ${slideData.price}` : "";
  }

  const img = slide.querySelector(".hero-slide__img");
  if (img) img.draggable = false;

  return slide;
}

async function fetchSlidesFromApi(signal) {
  const resp = await fetch(`${API_BASE}${PROMOS_ENDPOINT}`, { signal });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const json = await resp.json();

  const items = Array.isArray(json?.data) ? json.data : [];
  return items
    .map((item) => {
      const a = item?.attributes || item;
      const image =
        a?.image?.data?.attributes?.url ||
        a?.banner?.data?.attributes?.url ||
        a?.cover?.data?.attributes?.url ||
        a?.img?.url ||
        a?.img;

      const imageMobile =
        a?.imageMobile?.data?.attributes?.url ||
        a?.mobile?.data?.attributes?.url ||
        a?.imgMobile?.url ||
        a?.imgMobile ||
        null;

      return {
        title: a?.title || a?.name || "",
        price: a?.price ?? "",
        img: absolute(image),
        imgMobile: imageMobile ? absolute(imageMobile) : null,
      };
    })
    .filter((s) => s.img);
}

export async function initHeroSlider() {
  const root = document.querySelector(ROOT_SELECTOR);
  if (!root) return;

  root.style.background = "none";
  root.classList.add("hero--with-swiper");

  const contentTemplate = root.querySelector(".hero__content");
  if (!contentTemplate) return;
  const contentHTML = contentTemplate.outerHTML;
  contentTemplate.remove();

  const swiperEl = document.createElement("div");
  swiperEl.className = "hero-swiper swiper";
  const wrapperEl = document.createElement("div");
  wrapperEl.className = "swiper-wrapper";

  let slides = FALLBACK_SLIDES;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 7000);
    const apiSlides = await fetchSlidesFromApi(ctrl.signal);
    clearTimeout(timer);
    if (apiSlides?.length) slides = apiSlides;
  } catch {}

  slides.forEach((s) =>
    wrapperEl.appendChild(createSlideElement(s, contentHTML)),
  );
  swiperEl.appendChild(wrapperEl);
  root.appendChild(swiperEl);

  let paginationEl = root.querySelector(".hero__pagination");
  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.className = "hero__pagination";
    paginationEl.setAttribute("role", "tablist");
    root.appendChild(paginationEl);
  } else {
    paginationEl.innerHTML = "";
  }

  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay, Keyboard, A11y, EffectCreative],
    slidesPerView: SLIDES_PER_VIEW,
    loop: true,
    speed: SLIDE_SPEED_MS,
    grabCursor: GRAB_CURSOR,
    simulateTouch: SIMULATE_TOUCH,
    allowTouchMove: ALLOW_TOUCH_MOVE,
    touchRatio: TOUCH_RATIO,
    resistanceRatio: RESISTANCE_RATIO,
    threshold: DRAG_THRESHOLD_PX,
    effect: EFFECT,
    creativeEffect: CREATIVE_EFFECT,
    autoplay: {
      delay: AUTOPLAY_MS,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: { enabled: true },
  });

  const bullets = slides.map((_, index) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "hero__bullet";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", `Go to slide ${index + 1}`);
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

  swiper.on("init", setActive);
  swiper.on("slideChange", setActive);
  setActive();
}
