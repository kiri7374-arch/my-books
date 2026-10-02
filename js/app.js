/* =========================================================
   MY BOOKS
   Flip Reader + Study Mode
   Split Study JSON Support
========================================================= */

const bookShelf = document.getElementById("bookShelf");
const libraryView = document.getElementById("libraryView");
const bookDetailView = document.getElementById("bookDetailView");
const readerView = document.getElementById("readerView");
const studyView = document.getElementById("studyView");

const backToLibrary = document.getElementById("backToLibrary");
const backToBookDetail = document.getElementById("backToBookDetail");
const backFromStudy = document.getElementById("backFromStudy");
const readBookButton = document.getElementById("readBookButton");

const detailCover = document.getElementById("detailCover");
const detailCategory = document.getElementById("detailCategory");
const detailTitle = document.getElementById("detailTitle");
const detailSubtitle = document.getElementById("detailSubtitle");
const detailTitleLarge = document.getElementById("detailTitleLarge");
const detailSubtitleLarge = document.getElementById("detailSubtitleLarge");
const detailType = document.getElementById("detailType");
const detailCategoryText = document.getElementById("detailCategoryText");

const readerBookTitle = document.getElementById("readerBookTitle");
const readerPageStatus = document.getElementById("readerPageStatus");
const pageFlipElement = document.getElementById("pageFlip");
const prevPageButton = document.getElementById("prevPageButton");
const nextPageButton = document.getElementById("nextPageButton");
const tableOfContentsButton = document.getElementById("tableOfContentsButton");
const contentsOverlay = document.getElementById("contentsOverlay");
const contentsBookTitle = document.getElementById("contentsBookTitle");
const contentsList = document.getElementById("contentsList");
const closeContentsButton = document.getElementById("closeContentsButton");

const studyBookTitle = document.getElementById("studyBookTitle");
const studyGradeBadge = document.getElementById("studyGradeBadge");
const studyHomePanel = document.getElementById("studyHomePanel");
const studySubjectPanel = document.getElementById("studySubjectPanel");
const studyQuestionPanel = document.getElementById("studyQuestionPanel");
const studySubjectGrid = document.getElementById("studySubjectGrid");
const backToStudyHome = document.getElementById("backToStudyHome");
const backToStudyUnits = document.getElementById("backToStudyUnits");
const studySubjectEnglish = document.getElementById("studySubjectEnglish");
const studySubjectTitle = document.getElementById("studySubjectTitle");
const studySubjectDescription = document.getElementById("studySubjectDescription");
const studyUnitList = document.getElementById("studyUnitList");
const studyQuestionUnitTitle = document.getElementById("studyQuestionUnitTitle");
const studyQuestionUnitDescription = document.getElementById("studyQuestionUnitDescription");
const studyQuestionList = document.getElementById("studyQuestionList");

const answerModal = document.getElementById("answerModal");
const closeAnswerModalButton = document.getElementById("closeAnswerModal");
const answerModalDone = document.getElementById("answerModalDone");
const answerModalNumber = document.getElementById("answerModalNumber");
const answerModalQuestion = document.getElementById("answerModalQuestion");
const answerModalAnswer = document.getElementById("answerModalAnswer");
const answerModalExplanation = document.getElementById("answerModalExplanation");
const answerModalWhy = document.getElementById("answerModalWhy");

let books = [];
let selectedBook = null;
let selectedBookData = null;
let pageFlip = null;
let currentStudySubject = null;
let currentStudySubjectData = null;
const studyUnitCache = new Map();

function getStudyBasePath() {
  if (!selectedBook) return "books/study5";
  return `books/${selectedBook.id}`;
}

function getStudySubjectConfig(subjectKey) {
  const base = getStudyBasePath();

  const configs = {
    math: {
      title: "算数",
      en: "MATH",
      description: "計算の仕方だけでなく、なぜそうなるのかまで理解しながら学習します。",
      file: `${base}/math/index.json?v=20261003-v6`,
      splitUnits: true
    },
    science: {
      title: "理科",
      en: "SCIENCE",
      description: "観察や実験の結果から、理由を考える力を身につけます。",
      file: `${base}/science.json?v=20261003-sci1`,
      splitUnits: false
    },
    english: {
      title: "英語",
      en: "ENGLISH",
      description: "単語だけでなく、短い文章や会話の中で英語を使います。",
      file: `${base}/english.json`,
      splitUnits: false
    },
    japanese: {
      title: "国語",
      en: "JAPANESE",
      description: `${selectedBook?.id === "study6" ? "6" : "5"}年生で学ぶ漢字を中心に、読み・書き・意味・書き順を学びます。`,
      file: `${base}/japanese.json`,
      splitUnits: false
    }
  };

  return configs[subjectKey] || null;
}

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function isStudyBook(book) {
  if (!book) return false;
  return book.id === "study5" || book.id === "study6" || book.type === "study";
}

function isImageCoverBook(book) {
  if (!book) return false;
  return book.id === "study5" || book.id === "study6" || book.coverMode === "image";
}

async function loadBooks() {
  try {
    const response = await fetch("data/books.json");
    if (!response.ok) throw new Error("BOOK一覧を読み込めませんでした。");
    books = await response.json();
    renderBooks(books);
  } catch (error) {
    console.error(error);
    bookShelf.innerHTML = `<div class="error-message">BOOKデータの読み込みに失敗しました。</div>`;
  }
}

function renderBooks(bookList) {
  bookShelf.innerHTML = "";

  bookList.forEach((book) => {
    const card = document.createElement("article");
    card.className = "book-card";
    card.dataset.bookId = book.id;

    const useImageCover = isImageCoverBook(book);

    card.innerHTML = `
      <div class="book-cover ${useImageCover ? "book-cover-image-mode" : ""}">
        ${
          useImageCover && book.cover
            ? `<img class="book-cover-image" src="${escapeHTML(book.cover)}" alt="${escapeHTML(book.title)} 表紙">`
            : ""
        }
        <div class="book-cover-inner">
          <span class="book-category">${escapeHTML(book.category)}</span>
          <h3>${escapeHTML(book.title)}</h3>
          <p>${escapeHTML(book.subtitle)}</p>
        </div>
      </div>
      <div class="book-info">
        <h3>${escapeHTML(book.title)}</h3>
        <p>${escapeHTML(book.subtitle)}</p>
        <button class="open-book-button" type="button">OPEN BOOK</button>
      </div>
    `;

    card.querySelector(".book-cover").addEventListener("click", () => openBookDetail(book.id));
    card.querySelector(".open-book-button").addEventListener("click", () => openBookDetail(book.id));
    bookShelf.appendChild(card);
  });
}

async function openBookDetail(bookId) {
  const book = books.find((item) => item.id === bookId);
  if (!book) return;

  selectedBook = book;
  selectedBookData = null;
  currentStudySubject = null;
  currentStudySubjectData = null;
  studyUnitCache.clear();

  detailCategory.textContent = book.category;
  detailTitle.textContent = book.title;
  detailSubtitle.textContent = book.subtitle;
  detailTitleLarge.textContent = book.title;
  detailSubtitleLarge.textContent = book.subtitle;
  detailType.textContent = book.type;
  detailCategoryText.textContent = book.category;

  detailCover.className = "detail-cover";
  detailCover.style.backgroundImage = "";

  if (book.id === "perfume001") detailCover.classList.add("detail-cover-perfume");
  if (book.id === "accounting001") detailCover.classList.add("detail-cover-accounting");
  if (book.id === "trial001") detailCover.classList.add("detail-cover-trial");

  if (isImageCoverBook(book) && book.cover) {
    detailCover.classList.add("detail-cover-image-mode");
    detailCover.style.backgroundImage = `url("${book.cover}")`;
  }

  showView(bookDetailView);

  try {
    selectedBookData = await loadBookData(book.bookData);
  } catch (error) {
    console.error(error);
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadBookData(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`JSONを読み込めませんでした: ${path}`);
  return await response.json();
}

readBookButton.addEventListener("click", async () => {
  if (!selectedBook) return;

  if (isStudyBook(selectedBook)) {
    openStudyMode();
    return;
  }

  if (!selectedBookData) {
    try {
      selectedBookData = await loadBookData(selectedBook.bookData);
    } catch (error) {
      console.error(error);
      alert("BOOK本文の読み込みに失敗しました。");
      return;
    }
  }

  readerBookTitle.textContent = selectedBookData.title || selectedBook.title;
  showView(readerView);
  window.setTimeout(buildPageFlipBook, 80);
});

function openStudyMode() {
  destroyPageFlip();
  studyBookTitle.textContent = selectedBook.title;
  studyGradeBadge.textContent = selectedBook.id === "study6" ? "6年" : "5年";
  showStudyHome();
  showView(studyView);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function hideStudyPanels() {
  studyHomePanel.classList.remove("study-panel-active");
  studySubjectPanel.classList.remove("study-panel-active");
  studyQuestionPanel.classList.remove("study-panel-active");
}

function showStudyHome() {
  hideStudyPanels();
  studyHomePanel.classList.add("study-panel-active");
  currentStudySubject = null;
  currentStudySubjectData = null;
}

studySubjectGrid
  .querySelectorAll(".study-mode-subject-card")
  .forEach((button) => {
    button.addEventListener("click", () => openStudySubject(button.dataset.subject));
  });

async function openStudySubject(subjectKey) {
  const subject = getStudySubjectConfig(subjectKey);
  if (!subject) return;

  currentStudySubject = subjectKey;

  studySubjectEnglish.textContent = subject.en;
  studySubjectTitle.textContent = subject.title;
  studySubjectDescription.textContent = subject.description;
  studyUnitList.innerHTML = `<div class="study-loading">読み込み中...</div>`;

  hideStudyPanels();
  studySubjectPanel.classList.add("study-panel-active");

  try {
    currentStudySubjectData = await loadBookData(subject.file);

    if (!currentStudySubjectData || !Array.isArray(currentStudySubjectData.units)) {
      throw new Error("単元データがありません。");
    }

    currentStudySubjectData.__splitUnits = Boolean(subject.splitUnits);
    renderStudyUnits(currentStudySubjectData.units);
  } catch (error) {
    console.error(error);
    studyUnitList.innerHTML = `
      <div class="study-empty-message">
        <strong>この教科は準備中です。</strong>
        <p>${escapeHTML(subject.file)} を確認してください。</p>
      </div>
    `;
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderStudyUnits(units) {
  studyUnitList.innerHTML = "";

  units.forEach((unit, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "study-unit-button";

    const currentQuestionCount =
      Number(unit.questionCount ?? (Array.isArray(unit.questions) ? unit.questions.length : 0));

    const targetQuestions = Number(unit.targetQuestions || currentQuestionCount || 0);

    button.innerHTML = `
      <span class="study-unit-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="study-unit-copy">
        <strong>${escapeHTML(unit.title)}</strong>
        <small>${escapeHTML(unit.description)}</small>
        ${
          targetQuestions > 0
            ? `<span class="study-unit-progress">${currentQuestionCount} / ${targetQuestions}問</span>`
            : ""
        }
      </span>
    `;

    button.addEventListener("click", () => openStudyUnit(unit));
    studyUnitList.appendChild(button);
  });
}

async function openStudyUnit(unit) {
  studyQuestionUnitTitle.textContent = unit.title;
  studyQuestionUnitDescription.textContent = unit.description;

  hideStudyPanels();
  studyQuestionPanel.classList.add("study-panel-active");

  studyQuestionList.innerHTML = `<div class="study-loading">問題を読み込んでいます...</div>`;
  window.scrollTo({ top: 0, behavior: "smooth" });

  try {
    let questions = [];

    if (Array.isArray(unit.questions)) {
      questions = unit.questions;
    } else if (unit.file) {
      let unitData = studyUnitCache.get(unit.file);

      if (!unitData) {
        unitData = await loadBookData(unit.file);
        studyUnitCache.set(unit.file, unitData);
      }

      questions = Array.isArray(unitData.questions) ? unitData.questions : [];
    }

    if (questions.length === 0) {
      studyQuestionList.innerHTML = `
        <div class="study-empty-message">
          <strong>この単元は準備中です。</strong>
          <p>問題データを追加すると、ここに自動表示されます。</p>
        </div>
      `;
      return;
    }

    renderStudyQuestions(questions);
  } catch (error) {
    console.error(error);
    studyQuestionList.innerHTML = `
      <div class="study-empty-message">
        <strong>問題データを読み込めませんでした。</strong>
        <p>${escapeHTML(unit.file || "")}</p>
      </div>
    `;
  }
}


function renderQuestionVisual(visual, compact = false) {
  if (!visual || !visual.type) return "";

  const cls = compact ? "study-visual study-visual-compact" : "study-visual";

  const safeNum = (value, fallback = "") => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  };

  const polygonPoints = (sides, cx = 120, cy = 90, radius = 62) => {
    const n = Math.max(3, Math.min(12, Number(sides) || 3));
    return Array.from({ length: n }, (_, index) => {
      const angle = -Math.PI / 2 + (index * 2 * Math.PI) / n;
      return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
    }).join(" ");
  };

  switch (visual.type) {
    case "triangle":
      return `
        <div class="${cls}" aria-label="三角形の図">
          <svg viewBox="0 0 260 170" role="img">
            <polygon points="35,135 220,135 145,30" class="study-svg-shape"/>
            <line x1="145" y1="30" x2="145" y2="135" class="study-svg-guide"/>
            <text x="115" y="158" class="study-svg-label">底辺 ${escapeHTML(visual.base)}${escapeHTML(visual.unit || "")}</text>
            <text x="151" y="86" class="study-svg-label">高さ ${escapeHTML(visual.height)}${escapeHTML(visual.unit || "")}</text>
          </svg>
        </div>`;

    case "parallelogram":
      return `
        <div class="${cls}" aria-label="平行四辺形の図">
          <svg viewBox="0 0 260 170" role="img">
            <polygon points="65,35 220,35 190,135 35,135" class="study-svg-shape"/>
            <line x1="65" y1="35" x2="65" y2="135" class="study-svg-guide"/>
            <text x="98" y="158" class="study-svg-label">底辺 ${escapeHTML(visual.base)}${escapeHTML(visual.unit || "")}</text>
            <text x="72" y="88" class="study-svg-label">高さ ${escapeHTML(visual.height)}${escapeHTML(visual.unit || "")}</text>
          </svg>
        </div>`;

    case "trapezoid":
      return `
        <div class="${cls}" aria-label="台形の図">
          <svg viewBox="0 0 280 180" role="img">
            <polygon points="90,35 190,35 235,140 45,140" class="study-svg-shape"/>
            <line x1="90" y1="35" x2="90" y2="140" class="study-svg-guide"/>
            <text x="112" y="25" class="study-svg-label">上底 ${escapeHTML(visual.top)}${escapeHTML(visual.unit || "")}</text>
            <text x="98" y="166" class="study-svg-label">下底 ${escapeHTML(visual.bottom)}${escapeHTML(visual.unit || "")}</text>
            <text x="96" y="90" class="study-svg-label">高さ ${escapeHTML(visual.height)}${escapeHTML(visual.unit || "")}</text>
          </svg>
        </div>`;

    case "rhombus":
      return `
        <div class="${cls}" aria-label="ひし形の図">
          <svg viewBox="0 0 280 180" role="img">
            <polygon points="140,22 240,90 140,158 40,90" class="study-svg-shape"/>
            <line x1="40" y1="90" x2="240" y2="90" class="study-svg-guide"/>
            <line x1="140" y1="22" x2="140" y2="158" class="study-svg-guide"/>
            <text x="93" y="82" class="study-svg-label">${escapeHTML(visual.diagonal1)}${escapeHTML(visual.unit || "")}</text>
            <text x="148" y="56" class="study-svg-label">${escapeHTML(visual.diagonal2)}${escapeHTML(visual.unit || "")}</text>
          </svg>
        </div>`;

    case "polygon": {
      const sides = Math.max(3, Math.min(12, Number(visual.sides) || 3));
      return `
        <div class="${cls}" aria-label="${sides}角形の図">
          <svg viewBox="0 0 240 180" role="img">
            <polygon points="${polygonPoints(sides)}" class="study-svg-shape"/>
            <text x="120" y="168" text-anchor="middle" class="study-svg-label">${visual.regular ? "正" : ""}${sides}角形</text>
          </svg>
        </div>`;
    }

    case "triangle-angles":
      return `
        <div class="${cls}" aria-label="三角形の角の図">
          <svg viewBox="0 0 260 170" role="img">
            <polygon points="35,135 220,135 135,28" class="study-svg-shape"/>
            ${(visual.angles || []).slice(0, 3).map((a, i) => {
              const pos = [[52,125],[194,125],[132,52]][i] || [120,90];
              return `<text x="${pos[0]}" y="${pos[1]}" class="study-svg-label">${escapeHTML(a)}°</text>`;
            }).join("")}
          </svg>
        </div>`;

    case "quadrilateral-angles":
      return `
        <div class="${cls}" aria-label="四角形の角の図">
          <svg viewBox="0 0 260 180" role="img">
            <polygon points="45,45 210,35 225,135 65,150" class="study-svg-shape"/>
            ${(visual.angles || []).slice(0, 4).map((a, i) => {
              const pos = [[60,62],[184,55],[194,127],[78,135]][i] || [120,90];
              return `<text x="${pos[0]}" y="${pos[1]}" class="study-svg-label">${escapeHTML(a)}°</text>`;
            }).join("")}
          </svg>
        </div>`;

    case "circle":
      return `
        <div class="${cls}" aria-label="円の図">
          <svg viewBox="0 0 240 180" role="img">
            <circle cx="120" cy="85" r="62" class="study-svg-shape"/>
            ${visual.showDiameter !== false ? `<line x1="58" y1="85" x2="182" y2="85" class="study-svg-guide"/>` : ""}
            ${visual.diameter ? `<text x="120" y="76" text-anchor="middle" class="study-svg-label">直径 ${escapeHTML(visual.diameter)}${escapeHTML(visual.unit || "")}</text>` : ""}
            ${visual.circumference ? `<text x="120" y="165" text-anchor="middle" class="study-svg-label">円周 ${escapeHTML(visual.circumference)}${escapeHTML(visual.unit || "")}</text>` : ""}
          </svg>
        </div>`;

    case "congruent-triangles":
      return `
        <div class="${cls}" aria-label="合同な三角形の図">
          <svg viewBox="0 0 340 180" role="img">
            <polygon points="25,135 135,135 72,35" class="study-svg-shape"/>
            <polygon points="205,135 315,135 252,35" class="study-svg-shape"/>
            <text x="20" y="150" class="study-svg-label">A</text>
            <text x="138" y="150" class="study-svg-label">B</text>
            <text x="68" y="28" class="study-svg-label">C</text>
            <text x="200" y="150" class="study-svg-label">D</text>
            <text x="318" y="150" class="study-svg-label">E</text>
            <text x="248" y="28" class="study-svg-label">F</text>
            ${visual.sideLabel ? `<text x="78" y="154" text-anchor="middle" class="study-svg-label">${escapeHTML(visual.sideLabel)}</text>` : ""}
            ${visual.angleLabel ? `<text x="38" y="125" class="study-svg-label">${escapeHTML(visual.angleLabel)}</text>` : ""}
            <text x="170" y="95" text-anchor="middle" class="study-svg-equal">≡</text>
          </svg>
        </div>`;

    case "congruent-shapes":
      return `
        <div class="${cls}" aria-label="合同を比べる図">
          <svg viewBox="0 0 340 180" role="img">
            <polygon points="25,135 135,135 72,35" class="study-svg-shape"/>
            ${
              visual.variant === "different-size"
                ? `<polygon points="200,145 325,145 255,25" class="study-svg-shape study-svg-shape-alt"/>`
                : `<polygon points="205,135 315,135 252,35" class="study-svg-shape"/>`
            }
            ${visual.variant === "translated" ? `<line x1="145" y1="85" x2="190" y2="85" class="study-svg-arrow"/>` : ""}
          </svg>
        </div>`;

    case "prism": {
      const sides = Math.max(3, Math.min(8, Number(visual.sides) || 4));
      return `
        <div class="${cls}" aria-label="${sides}角柱の図">
          <svg viewBox="0 0 280 190" role="img">
            <polygon points="70,45 175,45 215,75 110,75" class="study-svg-shape"/>
            <polygon points="70,45 110,75 110,155 70,125" class="study-svg-shape"/>
            <polygon points="110,75 215,75 215,155 110,155" class="study-svg-shape"/>
            <line x1="70" y1="125" x2="175" y2="125" class="study-svg-guide"/>
            <line x1="175" y1="45" x2="175" y2="125" class="study-svg-guide"/>
            <line x1="175" y1="125" x2="215" y2="155" class="study-svg-guide"/>
            <text x="140" y="178" text-anchor="middle" class="study-svg-label">${sides}角柱</text>
          </svg>
        </div>`;
    }

    case "cylinder":
      return `
        <div class="${cls}" aria-label="円柱の図">
          <svg viewBox="0 0 240 190" role="img">
            <ellipse cx="120" cy="45" rx="65" ry="22" class="study-svg-shape"/>
            <path d="M55 45 V140 M185 45 V140" class="study-svg-guide"/>
            <ellipse cx="120" cy="140" rx="65" ry="22" class="study-svg-shape"/>
            <text x="120" y="178" text-anchor="middle" class="study-svg-label">円柱</text>
          </svg>
        </div>`;

    case "rectangular-prism":
      return `
        <div class="${cls}" aria-label="直方体の図">
          <svg viewBox="0 0 290 200" role="img">
            <polygon points="55,65 180,65 230,105 105,105" class="study-svg-shape"/>
            <polygon points="55,65 105,105 105,165 55,125" class="study-svg-shape"/>
            <polygon points="105,105 230,105 230,165 105,165" class="study-svg-shape"/>
            <text x="157" y="185" text-anchor="middle" class="study-svg-label">縦 ${escapeHTML(visual.length)}${escapeHTML(visual.unit || "")}・横 ${escapeHTML(visual.width)}${escapeHTML(visual.unit || "")}・高さ ${escapeHTML(visual.height)}${escapeHTML(visual.unit || "")}</text>
          </svg>
        </div>`;

    case "cube":
      return `
        <div class="${cls}" aria-label="立方体の図">
          <svg viewBox="0 0 260 200" role="img">
            <polygon points="65,60 165,60 205,95 105,95" class="study-svg-shape"/>
            <polygon points="65,60 105,95 105,165 65,130" class="study-svg-shape"/>
            <polygon points="105,95 205,95 205,165 105,165" class="study-svg-shape"/>
            <text x="135" y="188" text-anchor="middle" class="study-svg-label">1辺 ${escapeHTML(visual.side)}${escapeHTML(visual.unit || "")}</text>
          </svg>
        </div>`;

    case "pie-chart": {
      const pct = Math.max(0, Math.min(100, safeNum(visual.percent, 0)));
      return `
        <div class="${cls}" aria-label="円グラフ">
          <div class="study-pie-chart" style="--study-pie-percent:${pct}%;">
            <span>${escapeHTML(visual.label || "A")}<br>${pct}%</span>
          </div>
        </div>`;
    }

    case "bar-chart": {
      const pct = Math.max(0, Math.min(100, safeNum(visual.percent, 0)));
      return `
        <div class="${cls}" aria-label="帯グラフ">
          <div class="study-bar-chart">
            <div class="study-bar-chart-main" style="width:${pct}%;">
              <span>${escapeHTML(visual.label || "A")} ${pct}%</span>
            </div>
            <div class="study-bar-chart-rest" style="width:${100 - pct}%;">
              <span>残り ${100 - pct}%</span>
            </div>
          </div>
        </div>`;
    }

    default:
      return "";
  }
}

function syncAnswerModalVisual(question) {
  let visualContainer = document.getElementById("answerModalVisual");

  if (!visualContainer) {
    visualContainer = document.createElement("div");
    visualContainer.id = "answerModalVisual";
    visualContainer.className = "answer-modal-visual";

    answerModalQuestion.insertAdjacentElement("afterend", visualContainer);
  }

  visualContainer.innerHTML = renderQuestionVisual(question.visual, false);
  visualContainer.style.display = question.visual ? "" : "none";
}


function formatStudyMathText(value) {
  const escaped = escapeHTML(value ?? "");

  return escaped.replace(
    /(^|[^\d])(\d+)\/(\d+)(?!\d)/g,
    (match, prefix, numerator, denominator) => {
      return `${prefix}<span class="study-fraction" aria-label="${denominator}分の${numerator}">
        <span class="study-fraction-num">${numerator}</span>
        <span class="study-fraction-bar"></span>
        <span class="study-fraction-den">${denominator}</span>
      </span>`;
    }
  );
}

function renderStudyQuestions(questions) {
  studyQuestionList.innerHTML = "";

  questions.forEach((question) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "study-question-button";

    const questionText = String(question.question || "");
    const isWordProblem = questionText.length > 18;

    button.innerHTML = `
      <span class="study-question-number">${escapeHTML(question.id)}</span>
      <span class="study-question-text ${isWordProblem ? "study-question-word" : ""}">
        ${formatStudyMathText(questionText)}
      </span>
      ${renderQuestionVisual(question.visual, true)}
      <span class="study-question-hint">タップして答え・解説を見る →</span>
    `;

    button.addEventListener("click", () => openAnswerModal(question));
    studyQuestionList.appendChild(button);
  });
}

function openAnswerModal(question) {
  answerModalNumber.textContent = question.id || "";
  answerModalQuestion.innerHTML =
    formatStudyMathText(question.question || "");

  answerModalAnswer.innerHTML =
    formatStudyMathText(question.answer || "");

  answerModalExplanation.innerHTML =
    formatStudyMathText(
      question.explanation || "解説は準備中です。"
    );

  answerModalWhy.innerHTML =
    formatStudyMathText(
      question.why || "詳しい理由説明は準備中です。"
    );
  syncAnswerModalVisual(question);

  answerModal.classList.add("answer-modal-open");
  answerModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("answer-modal-visible");
}

function closeAnswerModal() {
  answerModal.classList.remove("answer-modal-open");
  answerModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("answer-modal-visible");
}

closeAnswerModalButton.addEventListener("click", closeAnswerModal);
answerModalDone.addEventListener("click", closeAnswerModal);

document.querySelectorAll("[data-close-answer-modal]").forEach((element) => {
  element.addEventListener("click", closeAnswerModal);
});

backToStudyHome.addEventListener("click", () => {
  showStudyHome();
  window.scrollTo({ top: 0, behavior: "smooth" });
});

backToStudyUnits.addEventListener("click", () => {
  if (!currentStudySubject || !currentStudySubjectData) return;

  const subject = getStudySubjectConfig(currentStudySubject);

  studySubjectEnglish.textContent = subject.en;
  studySubjectTitle.textContent = subject.title;
  studySubjectDescription.textContent = subject.description;

  renderStudyUnits(currentStudySubjectData.units);
  hideStudyPanels();
  studySubjectPanel.classList.add("study-panel-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

backFromStudy.addEventListener("click", () => {
  closeAnswerModal();

  if (isStudyOnlyMode()) {
    window.location.replace("study.html");
    return;
  }

  showStudyHome();
  showView(bookDetailView);
});

function destroyPageFlip() {
  if (!pageFlip) return;

  try {
    pageFlip.destroy();
  } catch (error) {
    console.warn(error);
  }

  pageFlip = null;
}

function buildPageFlipBook() {
  if (!selectedBookData || !Array.isArray(selectedBookData.pages)) return;

  destroyPageFlip();
  pageFlipElement.innerHTML = "";

  selectedBookData.pages.forEach((page, index) => {
    const pageElement = document.createElement("div");
    pageElement.className = "page";

    const type = page.type || "article";
    const layout = page.layout || type;

    pageElement.classList.add(`page-${type}`);
    pageElement.classList.add(`layout-${layout}`);
    pageElement.setAttribute(
      "data-density",
      type === "cover" || type === "back-cover" ? "hard" : "soft"
    );

    pageElement.innerHTML = createPageHTML(page, index);
    pageFlipElement.appendChild(pageElement);
  });

  pageFlip = new St.PageFlip(pageFlipElement, {
    width: 520,
    height: 700,
    size: "stretch",
    minWidth: 280,
    maxWidth: 560,
    minHeight: 420,
    maxHeight: 760,
    maxShadowOpacity: 0.45,
    showCover: true,
    mobileScrollSupport: false,
    useMouseEvents: true,
    swipeDistance: 30,
    clickEventForward: true,
    usePortrait: true,
    startPage: 0
  });

  pageFlip.loadFromHTML(document.querySelectorAll("#pageFlip .page"));
  updatePageStatus();
  updateButtons();

  pageFlip.on("flip", () => {
    updatePageStatus();
    updateButtons();
  });
}

function createPageHTML(page, index) {
  const type = page.type || "article";
  const layout = page.layout || type;

  if (type === "cover") return createCoverPageHTML(page);
  if (type === "back-cover") return createBackCoverHTML(page);
  if (layout === "reference" || Array.isArray(page.blocks)) return createReferencePageHTML(page, index);
  if (layout === "data") return createDataPageHTML(page, index);
  if (layout === "split") return createSplitPageHTML(page, index);
  if (layout === "image") return createImagePageHTML(page, index);
  if (layout === "glossary") return createGlossaryPageHTML(page, index);
  return createArticlePageHTML(page, index);
}

function createRunningHead(page) {
  const runningTitle = page.runningTitle || "";
  if (!runningTitle) return "";
  return `<div class="reference-running-head">${escapeHTML(runningTitle)}</div>`;
}

function createReferencePageHTML(page, index) {
  const blocks = Array.isArray(page.blocks) ? page.blocks : [];
  const blocksHTML = blocks.map(renderReferenceBlock).join("");

  return `
    <div class="page-content reference-page">
      ${createRunningHead(page)}
      ${createPageNumber(index)}
      ${page.title ? `<h2 class="reference-page-title">${escapeHTML(page.title)}</h2>` : ""}
      <div class="reference-page-body">${blocksHTML}</div>
    </div>
  `;
}

function renderReferenceBlock(block) {
  if (!block || !block.type) return "";

  switch (block.type) {
    case "lead":
      return `<p class="reference-lead">${escapeHTML(block.text)}</p>`;
    case "heading":
      return `<h3 class="reference-heading">${escapeHTML(block.text)}</h3>`;
    case "subheading":
      return `<h4 class="reference-subheading">${escapeHTML(block.text)}</h4>`;
    case "paragraph":
      return `<p class="reference-paragraph">${escapeHTML(block.text)}</p>`;
    case "bullets":
      return createBulletBlock(block);
    case "point":
      return createPointBlock(block);
    case "column":
      return createColumnBlock(block);
    case "note":
      return `<p class="reference-note">${escapeHTML(block.text)}</p>`;
    case "table":
      return createReferenceTable(block);
    case "diagram":
      return createDiagramBlock(block);
    case "figure":
      return createFigureBlock(block);
    default:
      return "";
  }
}

function createBulletBlock(block) {
  const items = Array.isArray(block.items) ? block.items : [];
  return `<ul class="reference-bullets">${items.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}</ul>`;
}

function createPointBlock(block) {
  return `
    <aside class="reference-point">
      <span class="reference-point-label">${escapeHTML(block.label || "POINT")}</span>
      <p>${escapeHTML(block.text)}</p>
    </aside>
  `;
}

function createColumnBlock(block) {
  return `
    <aside class="reference-column">
      ${block.title ? `<h4>${escapeHTML(block.title)}</h4>` : ""}
      <p>${escapeHTML(block.text)}</p>
    </aside>
  `;
}

function createReferenceTable(block) {
  const headers = Array.isArray(block.headers) ? block.headers : [];
  const rows = Array.isArray(block.rows) ? block.rows : [];

  return `
    <div class="reference-table-wrap">
      <table class="reference-table">
        ${
          headers.length
            ? `<thead><tr>${headers.map((header) => `<th>${escapeHTML(header)}</th>`).join("")}</tr></thead>`
            : ""
        }
        <tbody>
          ${rows.map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => `<td>${escapeHTML(cell)}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function createDiagramBlock(block) {
  const items = Array.isArray(block.items) ? block.items : [];
  return `
    <div class="reference-diagram">
      ${items.map((item, index) => `
        <div class="reference-diagram-item">
          <div class="reference-diagram-box">${escapeHTML(item)}</div>
          ${index < items.length - 1 ? `<div class="reference-diagram-arrow">↓</div>` : ""}
        </div>
      `).join("")}
    </div>
  `;
}

function createFigureBlock(block) {
  if (!block.image) {
    return `
      <div class="reference-figure-placeholder">
        <span>FIGURE</span>
        <p>${escapeHTML(block.caption || "図解")}</p>
      </div>
    `;
  }

  return `
    <figure class="reference-figure">
      <img src="${escapeHTML(block.image)}" alt="${escapeHTML(block.alt || "")}">
      ${block.caption ? `<figcaption>${escapeHTML(block.caption)}</figcaption>` : ""}
    </figure>
  `;
}

function createCoverPageHTML(page) {
  return `
    <div class="page-content page-content-cover">
      <div class="cover-design">
        <p class="cover-eyebrow">MY BOOKS</p>
        <h1 class="cover-title">${escapeHTML(page.title)}</h1>
        <p class="cover-subtitle">${escapeHTML(page.subtitle)}</p>
        <div class="cover-number">01</div>
      </div>
    </div>
  `;
}

function createBackCoverHTML(page) {
  return `
    <div class="page-content page-content-back-cover">
      <div class="back-cover-design">
        <p class="back-cover-title">${escapeHTML(page.title)}</p>
        <p class="back-cover-subtitle">${escapeHTML(page.subtitle)}</p>
      </div>
    </div>
  `;
}

function createArticlePageHTML(page, index) {
  return `
    <div class="page-content">
      ${createPageNumber(index)}
      <h2>${escapeHTML(page.title)}</h2>
      <p class="page-text">${escapeHTML(page.text)}</p>
    </div>
  `;
}

function createSplitPageHTML(page, index) {
  return `
    <div class="page-content page-content-split">
      ${createPageNumber(index)}
      <div class="split-layout">
        <div class="split-visual">
          ${
            page.image
              ? `<img src="${escapeHTML(page.image)}" alt="${escapeHTML(page.imageAlt || "")}" class="split-image">`
              : `<div class="split-image-placeholder">FIGURE</div>`
          }
        </div>
        <div class="split-copy">
          <h2>${escapeHTML(page.title)}</h2>
          <p class="page-text">${escapeHTML(page.text)}</p>
        </div>
      </div>
    </div>
  `;
}

function createImagePageHTML(page, index) {
  return `
    <div class="page-content page-content-image">
      ${createPageNumber(index)}
      <div class="image-page-visual">
        ${
          page.image
            ? `<img src="${escapeHTML(page.image)}" alt="${escapeHTML(page.imageAlt || "")}" class="image-page-image">`
            : `<div class="image-page-placeholder">FIGURE</div>`
        }
      </div>
      <h2>${escapeHTML(page.title)}</h2>
      <p class="page-text">${escapeHTML(page.text)}</p>
    </div>
  `;
}

function createDataPageHTML(page, index) {
  const rows = Array.isArray(page.data) ? page.data : [];

  return `
    <div class="page-content page-content-data">
      ${createPageNumber(index)}
      <h2>${escapeHTML(page.title)}</h2>
      <p class="page-text">${escapeHTML(page.text)}</p>
      <div class="data-list">
        ${rows.map((item) => `
          <div class="data-row">
            <span class="data-label">${escapeHTML(item.label)}</span>
            <strong class="data-value">${escapeHTML(item.value)}</strong>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function createGlossaryPageHTML(page, index) {
  const terms = Array.isArray(page.terms) ? page.terms : [];

  return `
    <div class="page-content page-content-glossary">
      ${createPageNumber(index)}
      <h2>${escapeHTML(page.title)}</h2>
      <div class="glossary-grid">
        ${terms.map((item) => `
          <div class="glossary-card">
            <strong>${escapeHTML(item.term)}</strong>
            <p>${escapeHTML(item.description)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function createPageNumber(index) {
  return `<span class="page-number">${String(index + 1).padStart(2, "0")}</span>`;
}

function updatePageStatus() {
  if (!pageFlip) return;
  const current = pageFlip.getCurrentPageIndex();
  const total = pageFlip.getPageCount();
  readerPageStatus.textContent = `PAGE ${current + 1} / ${total}`;
}

function updateButtons() {
  if (!pageFlip) return;
  const current = pageFlip.getCurrentPageIndex();
  const total = pageFlip.getPageCount();
  prevPageButton.disabled = current <= 0;
  nextPageButton.disabled = current >= total - 1;
}

prevPageButton.addEventListener("click", () => {
  if (pageFlip) pageFlip.flipPrev();
});

nextPageButton.addEventListener("click", () => {
  if (pageFlip) pageFlip.flipNext();
});

tableOfContentsButton.addEventListener("click", openContents);

function openContents() {
  if (!selectedBookData) return;
  contentsBookTitle.textContent = selectedBookData.title || selectedBook.title;
  renderContents();
  contentsOverlay.classList.add("contents-open");
  contentsOverlay.setAttribute("aria-hidden", "false");
}

function renderContents() {
  const pages = selectedBookData.pages || [];
  contentsList.innerHTML = "";

  pages.forEach((page, index) => {
    if (page.type === "back-cover" || page.showInContents === false) return;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "contents-item";

    button.innerHTML = `
      <span class="contents-page-number">${String(index + 1).padStart(2, "0")}</span>
      <span class="contents-item-text">
        <small>${escapeHTML(page.runningTitle || page.chapter || "")}</small>
        <strong>${escapeHTML(page.title)}</strong>
      </span>
      <span class="contents-arrow">→</span>
    `;

    button.addEventListener("click", () => {
      if (pageFlip) pageFlip.turnToPage(index);
      closeContents();
    });

    contentsList.appendChild(button);
  });
}

function closeContents() {
  contentsOverlay.classList.remove("contents-open");
  contentsOverlay.setAttribute("aria-hidden", "true");
}

closeContentsButton.addEventListener("click", closeContents);

contentsOverlay.addEventListener("click", (event) => {
  if (event.target === contentsOverlay) closeContents();
});

backToBookDetail.addEventListener("click", () => {
  destroyPageFlip();

  if (isStudyOnlyMode()) {
    window.location.replace("study.html");
    return;
  }

  showView(bookDetailView);
});

backToLibrary.addEventListener("click", () => {
  destroyPageFlip();

  if (isStudyOnlyMode()) {
    window.location.replace("study.html");
    return;
  }

  selectedBook = null;
  selectedBookData = null;
  showView(libraryView);
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;

  if (answerModal.classList.contains("answer-modal-open")) {
    closeAnswerModal();
    return;
  }

  closeContents();
});

function showView(view) {
  document.querySelectorAll(".view").forEach((item) => item.classList.remove("active-view"));
  view.classList.add("active-view");
}

/* =========================================================
   STUDY-ONLY MODE
   study.html から起動した場合は本棚へ戻さない
========================================================= */

function getStudyOnlyBookId() {
  const params = new URLSearchParams(window.location.search);
  const studyBookIdFromURL = params.get("study");

  if (
    studyBookIdFromURL === "study5" ||
    studyBookIdFromURL === "study6"
  ) {
    sessionStorage.setItem(
      "myBooksStudyOnlyBookId",
      studyBookIdFromURL
    );

    return studyBookIdFromURL;
  }

  const storedBookId =
    sessionStorage.getItem(
      "myBooksStudyOnlyBookId"
    );

  if (
    storedBookId === "study5" ||
    storedBookId === "study6"
  ) {
    return storedBookId;
  }

  return null;
}

function isStudyOnlyMode() {
  return Boolean(
    sessionStorage.getItem(
      "myBooksStudyOnlyBookId"
    ) ||
    new URLSearchParams(
      window.location.search
    ).get("study")
  );
}

async function launchStudyFromURL() {
  const studyBookId = getStudyOnlyBookId();

  if (!studyBookId) {
    return;
  }

  sessionStorage.setItem(
    "myBooksStudyOnlyBookId",
    studyBookId
  );

  document.body.classList.add(
    "study-only-mode"
  );

  if (backFromStudy) {
    backFromStudy.textContent = "← 学年選択";
  }

  let retryCount = 0;
  const maxRetries = 120;

  const timer = window.setInterval(() => {
    retryCount += 1;

    if (Array.isArray(books) && books.length > 0) {
      window.clearInterval(timer);

      const targetBook = books.find((book) => book.id === studyBookId);

      if (!targetBook) {
        console.warn(`Study book not found: ${studyBookId}`);
        window.location.replace("study.html");
        return;
      }

      selectedBook = targetBook;
      selectedBookData = null;
      currentStudySubject = null;
      currentStudySubjectData = null;
      studyUnitCache.clear();

      openStudyMode();
      return;
    }

    if (retryCount >= maxRetries) {
      window.clearInterval(timer);
      console.warn("BOOKデータの読み込み待機がタイムアウトしました。");
      window.location.replace("study.html");
    }
  }, 50);
}

loadBooks();
launchStudyFromURL();
