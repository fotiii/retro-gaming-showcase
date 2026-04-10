const byId = (id) => document.getElementById(id);

const searchInput = byId("searchInput");
const categoryFilter = byId("categoryFilter");
const packFilter = byId("packFilter");
const grid = byId("referenceGrid");
const resultCount = byId("resultCount");
const clearBtn = byId("clearFilters");
const catalogLoading = byId("catalogLoading");
const carouselTrack = byId("carouselTrack");
const carouselDots = byId("carouselDots");
const carouselPrev = byId("carouselPrev");
const carouselNext = byId("carouselNext");

let catalog = [];
let carouselSlides = [];

function imagePath(item) {
  return "./assets/img/" + item.file;
}

async function loadCatalog() {
  const res = await fetch("./assets/catalog.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Не удалось загрузить catalog.json");
  const data = await res.json();
  catalog = data.map((row) => ({
    ...row,
    image: imagePath(row)
  }));
}

function setOptions(selectEl, values) {
  if (!selectEl) return;
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
  if (!categoryFilter || !packFilter) return;
  const categories = [...new Set(catalog.map((item) => item.category))].sort();
  const packs = [...new Set(catalog.map((item) => item.pack))].sort();
  setOptions(categoryFilter, categories);
  setOptions(packFilter, packs);
}

function shortSource(source) {
  if (!source) return "";
  const parts = source.split("/");
  return parts.length > 2 ? parts.slice(-2).join("/") : source;
}

function renderCards(items) {
  if (!grid) return;
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "ref-card";
    const src = item.image;
    const meta = item.category + " · " + item.pack;
    const tag = shortSource(item.source);
    card.innerHTML =
      '<div class="ref-card-visual pixel-art-wrap">' +
      '<img class="ref-card-img pixel-art" src="' +
      src +
      '" alt="' +
      item.title +
      '" loading="lazy" />' +
      "</div>" +
      '<p class="meta">' +
      meta +
      "</p>" +
      "<h3>" +
      item.title +
      "</h3>" +
      '<p class="tag">' +
      tag +
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
  const category = categoryFilter?.value || "";
  const pack = packFilter?.value || "";

  const filtered = catalog.filter((item) => {
    const haystack = (
      item.title +
      " " +
      item.category +
      " " +
      item.pack +
      " " +
      (item.source || "") +
      " " +
      item.notes
    ).toLowerCase();
    const matchesSearch = !term || haystack.includes(term);
    const matchesCategory = !category || item.category === category;
    const matchesPack = !pack || item.pack === pack;
    return matchesSearch && matchesCategory && matchesPack;
  });

  renderCards(filtered);
}

function buildCarouselSlides() {
  if (!catalog.length) return [];
  const seen = new Set();
  const picks = [];
  const add = (item) => {
    if (item && !seen.has(item.id)) {
      seen.add(item.id);
      picks.push(item);
    }
  };

  catalog.filter((c) => c.category === "Фон").forEach(add);
  catalog.filter((c) => c.category === "Тайлсет").forEach(add);
  catalog.filter((c) => c.category === "Вода").slice(0, 3).forEach(add);
  catalog.filter((c) => c.category === "Деревья").slice(0, 3).forEach(add);
  catalog.filter((c) => c.category === "Камни").slice(0, 2).forEach(add);

  const step = Math.max(1, Math.floor(catalog.length / 15));
  for (let i = 0; i < catalog.length && picks.length < 18; i += step) {
    add(catalog[i]);
  }
  return picks.slice(0, 16);
}

function initCarousel() {
  if (!carouselTrack || !carouselDots) return;

  carouselSlides = buildCarouselSlides();
  let currentSlide = 0;
  let autoSlideTimer = null;

  function renderCarousel() {
    carouselTrack.innerHTML = "";
    carouselDots.innerHTML = "";

    carouselSlides.forEach((item, index) => {
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
        item.category +
        " · " +
        shortSource(item.source) +
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
    if (!carouselSlides.length) return;
    carouselTrack.style.transform = "translateX(-" + currentSlide * 100 + "%)";
    [...carouselDots.children].forEach((dot, index) => {
      dot.classList.toggle("active", index === currentSlide);
    });
  }

  function goToSlide(index) {
    if (!carouselSlides.length) return;
    if (index < 0) {
      currentSlide = carouselSlides.length - 1;
    } else if (index >= carouselSlides.length) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }
    updateCarouselUI();
  }

  function startAutoSlide() {
    if (carouselSlides.length < 2) return;
    autoSlideTimer = window.setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 4200);
  }

  function resetAutoSlide() {
    if (autoSlideTimer) window.clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  renderCarousel();
  currentSlide = 0;
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

async function boot() {
  try {
    await loadCatalog();
    if (catalogLoading) catalogLoading.hidden = true;
    initFilters();
    applyFilters();
    initCarousel();

    [searchInput, categoryFilter, packFilter].forEach((el) => {
      if (el) el.addEventListener("input", applyFilters);
      if (el) el.addEventListener("change", applyFilters);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        if (searchInput) searchInput.value = "";
        if (categoryFilter) categoryFilter.value = "";
        if (packFilter) packFilter.value = "";
        applyFilters();
      });
    }
  } catch (e) {
    if (catalogLoading) {
      catalogLoading.textContent =
        "Ошибка загрузки каталога. Проверьте, что assets/catalog.json доступен.";
    }
    console.error(e);
  }
}

if (grid || carouselTrack) {
  boot();
}
