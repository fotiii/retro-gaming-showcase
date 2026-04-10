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
const selectionCount = byId("selectionCount");
const selectFilteredBtn = byId("selectFilteredBtn");
const clearSelectionBtn = byId("clearSelectionBtn");
const downloadSelectedBtn = byId("downloadSelectedBtn");
const downloadStatus = byId("downloadStatus");

const SELECTION_KEY = "indieFrameSelectedAssets";

let catalog = [];
let carouselSlides = [];
let lastFiltered = [];
let selectedIds = new Set();

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

function loadSelection() {
  try {
    const raw = localStorage.getItem(SELECTION_KEY);
    if (!raw) return;
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      selectedIds = new Set(arr.map(Number).filter((n) => !Number.isNaN(n)));
    }
  } catch (_) {
    selectedIds = new Set();
  }
}

function saveSelection() {
  localStorage.setItem(SELECTION_KEY, JSON.stringify([...selectedIds]));
}

function updateSelectionUI() {
  const n = selectedIds.size;
  if (selectionCount) selectionCount.textContent = "Выбрано: " + n;
  if (clearSelectionBtn) clearSelectionBtn.disabled = n === 0;
  if (downloadSelectedBtn) downloadSelectedBtn.disabled = n === 0;
}

function renderCards(items) {
  if (!grid) return;
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "ref-card";
    if (selectedIds.has(item.id)) card.classList.add("ref-card--selected");

    const src = item.image;
    const meta = item.category + " · " + item.pack;
    const tag = shortSource(item.source);
    const fileName =
      (item.file && item.file.split("/").pop()) || item.title + ".png";

    const toolbar = document.createElement("div");
    toolbar.className = "ref-card-toolbar";

    const label = document.createElement("label");
    label.className = "ref-card-pick";
    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.checked = selectedIds.has(item.id);
    cb.addEventListener("change", () => {
      if (cb.checked) selectedIds.add(item.id);
      else selectedIds.delete(item.id);
      saveSelection();
      updateSelectionUI();
      card.classList.toggle("ref-card--selected", cb.checked);
    });
    const pickSpan = document.createElement("span");
    pickSpan.textContent = "В выбор";
    label.appendChild(cb);
    label.appendChild(pickSpan);

    const dl = document.createElement("a");
    dl.className = "ref-card-dl";
    dl.href = src;
    dl.download = fileName;
    dl.textContent = "PNG";
    dl.setAttribute("aria-label", "Скачать файл " + item.title);

    toolbar.appendChild(label);
    toolbar.appendChild(dl);

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

    card.insertBefore(toolbar, card.firstChild);
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

  lastFiltered = filtered;
  renderCards(filtered);
}

async function downloadSelectedZip() {
  if (typeof JSZip === "undefined") {
    window.alert(
      "Модуль архива не загружен. Обновите страницу или проверьте файл assets/vendor/jszip.min.js."
    );
    return;
  }
  const items = catalog.filter((i) => selectedIds.has(i.id));
  if (!items.length) return;

  if (downloadSelectedBtn) downloadSelectedBtn.disabled = true;
  if (downloadStatus) {
    downloadStatus.hidden = false;
    downloadStatus.textContent = "Сборка архива… 0 / " + items.length;
  }

  const zip = new JSZip();
  try {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const res = await fetch(item.image, { cache: "force-cache" });
      if (!res.ok) throw new Error("fetch " + item.file);
      const blob = await res.blob();
      zip.file(String(item.file).replace(/\\/g, "/"), blob);
      if (downloadStatus) {
        downloadStatus.textContent =
          "Сборка архива… " + (i + 1) + " / " + items.length;
      }
    }
    if (downloadStatus) downloadStatus.textContent = "Сжатие…";
    const out = await zip.generateAsync({ type: "blob" });
    const name = "indie-frame-assets-" + items.length + "-files.zip";
    const url = URL.createObjectURL(out);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 2500);
    if (downloadStatus) {
      downloadStatus.textContent = "Готово: " + name;
      window.setTimeout(() => {
        downloadStatus.hidden = true;
      }, 4500);
    }
  } catch (e) {
    console.error(e);
    if (downloadStatus) {
      downloadStatus.textContent =
        "Ошибка архива. Попробуйте меньше файлов за раз или обновите страницу.";
    }
  } finally {
    if (downloadSelectedBtn) downloadSelectedBtn.disabled = selectedIds.size === 0;
  }
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
    loadSelection();
    updateSelectionUI();
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

    if (selectFilteredBtn) {
      selectFilteredBtn.addEventListener("click", () => {
        lastFiltered.forEach((item) => selectedIds.add(item.id));
        saveSelection();
        updateSelectionUI();
        renderCards(lastFiltered);
      });
    }

    if (clearSelectionBtn) {
      clearSelectionBtn.addEventListener("click", () => {
        selectedIds.clear();
        saveSelection();
        updateSelectionUI();
        renderCards(lastFiltered);
      });
    }

    if (downloadSelectedBtn) {
      downloadSelectedBtn.addEventListener("click", () => {
        downloadSelectedZip();
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
