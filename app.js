const references = [
  {
    title: "Hyper Light Drifter",
    year: "2016",
    studio: "Heart Machine",
    style: "Synthwave Pixel",
    notes: "Неоновые акценты, пустоты окружения, минималистичный UI.",
    image: "./assets/img/ref-bg-02.png"
  },
  {
    title: "Hades",
    year: "2020",
    studio: "Supergiant Games",
    style: "Painterly Myth",
    notes: "Контрастные эффекты, выразительные силуэты, премиальная анимация.",
    image: "./assets/img/ref-bg-01.png"
  },
  {
    title: "Dead Cells",
    year: "2018",
    studio: "Motion Twin",
    style: "Pixel Action",
    notes: "Ритм боя и читаемость hit-feedback в динамике.",
    image: "./assets/img/ref-thumb-01.png"
  },
  {
    title: "Inside",
    year: "2016",
    studio: "Playdead",
    style: "Cinematic Minimal",
    notes: "Свет, туман, композиция кадра и тишина как инструмент.",
    image: "./assets/img/ref-bg-03.png"
  },
  {
    title: "Cuphead",
    year: "2017",
    studio: "Studio MDHR",
    style: "Hand-Drawn Vintage",
    notes: "Сильная стилизация под анимацию 30-х, единый арт-язык.",
    image: "./assets/img/ref-thumb-02.png"
  },
  {
    title: "Spiritfarer",
    year: "2020",
    studio: "Thunder Lotus",
    style: "Cozy Painterly",
    notes: "Мягкий цвет, эмоциональные сцены, спокойный темп UI.",
    image: "./assets/img/ref-thumb-03.png"
  },
  {
    title: "Katana ZERO",
    year: "2019",
    studio: "Askiisoft",
    style: "Neo-Noir Pixel",
    notes: "Глитч-ритм, резкий контраст и динамичный motion.",
    image: "./assets/img/woods-tileset.png"
  },
  {
    title: "Signalis",
    year: "2022",
    studio: "rose-engine",
    style: "Retro Horror PSX",
    notes: "Низкополигональная эстетика и тревожный интерфейс.",
    image: "./assets/img/ref-bg-03.png"
  },
  {
    title: "Sea of Stars",
    year: "2023",
    studio: "Sabotage Studio",
    style: "Modern Retro RPG",
    notes: "Пиксель+объем, мягкий свет, насыщенная цветовая палитра.",
    image: "./assets/img/deco-sun.png"
  },
  {
    title: "Cocoon",
    year: "2023",
    studio: "Geometric Interactive",
    style: "Abstract Sci-Fi",
    notes: "Минимализм, формы и чистая визуальная логика.",
    image: "./assets/img/deco-pine.png"
  }
];

const carouselItems = [
  {
    title: "Лесной силуэт",
    subtitle: "Ассет Pack 01 — атмосфера для обложек и разделителей",
    image: "./assets/img/ref-bg-01.png"
  },
  {
    title: "Пиксельный горизонт",
    subtitle: "Фоновые планы для moodboard и key art",
    image: "./assets/img/ref-bg-02.png"
  },
  {
    title: "Ночной лес",
    subtitle: "Контраст и читаемость силуэта в UI-журнале",
    image: "./assets/img/ref-bg-03.png"
  },
  {
    title: "Тайлсет 16×16",
    subtitle: "pixel_16_woods — текстуры и реквизит для пиксель-UI",
    image: "./assets/img/woods-tileset.png"
  }
];

const byId = (id) => document.getElementById(id);

const searchInput = byId("searchInput");
const yearFilter = byId("yearFilter");
const studioFilter = byId("studioFilter");
const styleFilter = byId("styleFilter");
const grid = byId("referenceGrid");
const resultCount = byId("resultCount");
const clearBtn = byId("clearFilters");
const carouselTrack = byId("carouselTrack");
const carouselDots = byId("carouselDots");
const carouselPrev = byId("carouselPrev");
const carouselNext = byId("carouselNext");

function setOptions(selectEl, values) {
  selectEl.innerHTML = "";
  const all = document.createElement("option");
  all.value = "";
  all.textContent = "Все";
  selectEl.appendChild(all);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = value;
    selectEl.appendChild(option);
  });
}

function initFilters() {
  if (!yearFilter || !studioFilter || !styleFilter) return;
  const years = [...new Set(references.map((item) => item.year))].sort();
  const studios = [...new Set(references.map((item) => item.studio))].sort();
  const styles = [...new Set(references.map((item) => item.style))].sort();
  setOptions(yearFilter, years);
  setOptions(studioFilter, studios);
  setOptions(styleFilter, styles);
}

function renderCards(items) {
  if (!grid) return;
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "ref-card";
    const src = item.image || "./assets/img/ref-bg-01.png";
    card.innerHTML =
      '<div class="ref-card-visual pixel-art-wrap">' +
      '<img class="ref-card-img pixel-art" src="' +
      src +
      '" alt="" loading="lazy" />' +
      "</div>" +
      '<p class="meta">' +
      item.year +
      " · " +
      item.studio +
      "</p>" +
      "<h3>" +
      item.title +
      "</h3>" +
      '<p class="tag">' +
      item.style +
      "</p>" +
      "<p>" +
      item.notes +
      "</p>";
    grid.appendChild(card);
  });
  if (resultCount) {
    resultCount.textContent = "Найдено: " + items.length;
  }
}

function applyFilters() {
  const term = (searchInput?.value || "").trim().toLowerCase();
  const year = yearFilter?.value || "";
  const studio = studioFilter?.value || "";
  const style = styleFilter?.value || "";

  const filtered = references.filter((item) => {
    const haystack = (
      item.title +
      " " +
      item.studio +
      " " +
      item.style +
      " " +
      item.notes
    ).toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    const matchesYear = !year || item.year === year;
    const matchesStudio = !studio || item.studio === studio;
    const matchesStyle = !style || item.style === style;
    return matchesSearch && matchesYear && matchesStudio && matchesStyle;
  });

  renderCards(filtered);
}

if (grid) {
  initFilters();
  applyFilters();
  [searchInput, yearFilter, studioFilter, styleFilter].forEach((el) => {
    if (el) el.addEventListener("input", applyFilters);
    if (el) el.addEventListener("change", applyFilters);
  });
}

if (clearBtn) {
  clearBtn.addEventListener("click", () => {
    if (searchInput) searchInput.value = "";
    if (yearFilter) yearFilter.value = "";
    if (studioFilter) studioFilter.value = "";
    if (styleFilter) styleFilter.value = "";
    applyFilters();
  });
}

if (carouselTrack && carouselDots) {
  let currentSlide = 0;
  let autoSlideTimer = null;

  function renderCarousel() {
    carouselTrack.innerHTML = "";
    carouselDots.innerHTML = "";

    carouselItems.forEach((item, index) => {
      const slide = document.createElement("article");
      slide.className = "carousel-slide";
      slide.innerHTML =
        '<img class="pixel-art" src="' +
        item.image +
        '" alt="' +
        item.title +
        '" loading="lazy" />' +
        '<div class="carousel-caption"><h4>' +
        item.title +
        "</h4><p>" +
        item.subtitle +
        "</p></div>";
      carouselTrack.appendChild(slide);

      const dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Слайд " + (index + 1));
      dot.addEventListener("click", () => {
        goToSlide(index);
        resetAutoSlide();
      });
      carouselDots.appendChild(dot);
    });
  }

  function updateCarouselUI() {
    carouselTrack.style.transform = "translateX(-" + currentSlide * 100 + "%)";
    [...carouselDots.children].forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  function goToSlide(index) {
    if (index < 0) {
      currentSlide = carouselItems.length - 1;
    } else if (index >= carouselItems.length) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }
    updateCarouselUI();
  }

  function startAutoSlide() {
    autoSlideTimer = window.setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 4200);
  }

  function resetAutoSlide() {
    if (autoSlideTimer) window.clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  renderCarousel();
  updateCarouselUI();
  startAutoSlide();

  if (carouselPrev) {
    carouselPrev.addEventListener("click", () => {
      goToSlide(currentSlide - 1);
      resetAutoSlide();
    });
  }

  if (carouselNext) {
    carouselNext.addEventListener("click", () => {
      goToSlide(currentSlide + 1);
      resetAutoSlide();
    });
  }
}
