const references = [
  {
    title: "Hyper Light Drifter",
    year: "2016",
    studio: "Heart Machine",
    style: "Synthwave Pixel",
    notes: "Неоновые акценты, пустоты окружения, минималистичный UI."
  },
  {
    title: "Hades",
    year: "2020",
    studio: "Supergiant Games",
    style: "Painterly Myth",
    notes: "Контрастные эффекты, выразительные силуэты, премиальная анимация."
  },
  {
    title: "Dead Cells",
    year: "2018",
    studio: "Motion Twin",
    style: "Pixel Action",
    notes: "Ритм боя и читаемость hit-feedback в динамике."
  },
  {
    title: "Inside",
    year: "2016",
    studio: "Playdead",
    style: "Cinematic Minimal",
    notes: "Свет, туман, композиция кадра и тишина как инструмент."
  },
  {
    title: "Cuphead",
    year: "2017",
    studio: "Studio MDHR",
    style: "Hand-Drawn Vintage",
    notes: "Сильная стилизация под анимацию 30-х, единый арт-язык."
  },
  {
    title: "Spiritfarer",
    year: "2020",
    studio: "Thunder Lotus",
    style: "Cozy Painterly",
    notes: "Мягкий цвет, эмоциональные сцены, спокойный темп UI."
  },
  {
    title: "Katana ZERO",
    year: "2019",
    studio: "Askiisoft",
    style: "Neo-Noir Pixel",
    notes: "Глитч-ритм, резкий контраст и динамичный motion."
  },
  {
    title: "Signalis",
    year: "2022",
    studio: "rose-engine",
    style: "Retro Horror PSX",
    notes: "Низкополигональная эстетика и тревожный интерфейс."
  },
  {
    title: "Sea of Stars",
    year: "2023",
    studio: "Sabotage Studio",
    style: "Modern Retro RPG",
    notes: "Пиксель+объем, мягкий свет, насыщенная цветовая палитра."
  },
  {
    title: "Cocoon",
    year: "2023",
    studio: "Geometric Interactive",
    style: "Abstract Sci-Fi",
    notes: "Минимализм, формы и чистая визуальная логика."
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
    card.innerHTML =
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
