import Swiper from "swiper";
import { Autoplay, Keyboard, A11y, EffectCreative } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-creative";

const ROOT_SELECTOR = ".hero__slider";
const AUTOPLAY_MS = 5000;
const MOBILE_MQ = "(max-width: 768px)";
const IMG_SIZES = "(max-width: 768px) 100vw, 1248px";

const SLIDES = [
  {
    title: "Gold big hoops",
    price: "68,00",
    img: "/src/assets/img_hero.png",
    imgMobile: "/src/assets/img_hero_mobile.png",
  },
  {
    title: "This is Barsic kitty",
    price: "55,00",
    img: "/src/assets/img_hero_2.png",
    imgMobile: "/src/assets/img_hero_2.png",
  },
  {
    title: "This is Nikol kitty",
    price: "39,00",
    img: "/src/assets/img_hero_3.png",
    imgMobile: "/src/assets/img_hero_3.png",
  },
  {
    title: "This is Sofa kitty",
    price: "49,00",
    img: "/src/assets/img_hero_4.png",
    imgMobile: "/src/assets/img_hero_4.png",
  },
];

const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"']/g,
    (m) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        m
      ],
  );

function pictureHTML({ title, img, imgMobile }) {
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

export function initHeroSlider() {
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

  SLIDES.forEach((s) => {
    const slide = document.createElement("div");
    slide.className = "swiper-slide hero-slide";
    slide.innerHTML = `
      ${pictureHTML(s)}
      ${contentHTML}
    `;
    const content = slide.querySelector(".hero__content");
    content.querySelector(".hero__title").textContent = s.title;
    content.querySelector(".hero__price").textContent = `$ ${s.price}`;
    const img = slide.querySelector(".hero-slide__img");
    img.draggable = false;
    wrapperEl.appendChild(slide);
  });

  swiperEl.appendChild(wrapperEl);
  root.appendChild(swiperEl);

  let paginationEl = root.querySelector(".hero__pagination");
  if (!paginationEl) {
    paginationEl = document.createElement("div");
    paginationEl.className = "hero__pagination";
    root.appendChild(paginationEl);
  }

  const swiper = new Swiper(swiperEl, {
    modules: [Autoplay, Keyboard, A11y, EffectCreative],
    slidesPerView: 1,
    loop: true,
    speed: 650,
    grabCursor: true,
    simulateTouch: true,
    allowTouchMove: true,
    touchRatio: 1.05,
    resistanceRatio: 0.85,
    threshold: 5,
    effect: "creative",
    creativeEffect: {
      prev: { translate: ["-100%", 0, 0], opacity: 1 },
      next: { translate: ["100%", 0, 0], opacity: 1 },
      limitProgress: 1,
      perspective: false,
    },
    autoplay: {
      delay: AUTOPLAY_MS,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    keyboard: { enabled: true, onlyInViewport: true },
    a11y: { enabled: true },
  });

  paginationEl.innerHTML = "";
  const bullets = SLIDES.map((_, index) => {
    const b = document.createElement("span");
    b.className = "hero__bullet";
    b.setAttribute("role", "button");
    b.setAttribute("tabindex", "0");
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
    const idx = swiper.realIndex % SLIDES.length;
    bullets.forEach((b, i) => {
      const on = i === idx;
      b.classList.toggle("hero__bullet--active", on);
      if (on) {
        b.setAttribute("aria-current", "true");
        b.setAttribute("aria-pressed", "true");
      } else {
        b.removeAttribute("aria-current");
        b.setAttribute("aria-pressed", "false");
      }
    });
  };

  swiper.on("init", setActive);
  swiper.on("slideChange", setActive);
  setActive();
}
