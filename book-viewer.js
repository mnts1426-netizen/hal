// قارئ الكتب داخل البرنامج: يعرض صفحات الكتاب في نفس الصفحة بدون الخروج لتطبيق أو موقع آخر
(function () {
  const PDFJS = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/";
  let libPromise = null;

  function loadLib() {
    if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib);
    if (!libPromise)
      libPromise = new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = PDFJS + "pdf.min.js";
        s.onload = () => {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            PDFJS + "pdf.worker.min.js";
          resolve(window.pdfjsLib);
        };
        s.onerror = () => {
          libPromise = null;
          reject(new Error("pdf.js load failed"));
        };
        document.head.appendChild(s);
      });
    return libPromise;
  }

  const CSS = `
  .bv-overlay { position: fixed; inset: 0; z-index: 10000; background: #e2e8f0; display: none; flex-direction: column; direction: rtl; font-family: inherit; }
  .bv-overlay.open { display: flex; }
  .bv-bar { background: var(--primary-blue, #1e3a8a); color: #fff; padding: 8px 10px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; box-shadow: 0 2px 6px rgba(0,0,0,.2); }
  .bv-title { font-weight: 800; font-size: 0.95rem; flex: 1; min-width: 140px; }
  .bv-bar button { background: rgba(255,255,255,.15); color: #fff; border: 1px solid rgba(255,255,255,.35); border-radius: 6px; padding: 6px 10px; font: inherit; font-size: 0.85rem; font-weight: 700; cursor: pointer; }
  .bv-bar button:hover { background: rgba(255,255,255,.28); }
  .bv-bar .bv-close { background: #fff; color: var(--primary-blue, #1e3a8a); }
  .bv-nav { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
  .bv-pageinfo { display: flex; align-items: center; gap: 4px; font-size: 0.85rem; font-weight: 700; }
  .bv-pageinfo input { width: 64px; padding: 4px 6px; border-radius: 6px; border: none; font: inherit; text-align: center; }
  .bv-scroll { flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; padding: 10px 0 30px; }
  .bv-pages { margin: 0 auto; display: flex; flex-direction: column; gap: 10px; align-items: center; }
  .bv-page { width: 100%; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.18); position: relative; }
  .bv-page canvas { width: 100%; height: 100%; display: block; }
  .bv-msg { text-align: center; padding: 2rem 1rem; font-weight: 800; color: var(--primary-blue, #1e3a8a); }
  @media (max-width: 520px) {
    .bv-bar { gap: 6px; padding: 6px 8px; }
    .bv-bar button { padding: 5px 8px; font-size: 0.8rem; }
    .bv-nav { gap: 4px; width: 100%; justify-content: space-between; flex-wrap: nowrap; }
    .bv-pageinfo input { width: 48px; }
    .bv-scroll { padding-top: 6px; }
  }
  `;

  const st = {
    built: false,
    doc: null,
    book: null,
    zoom: 1,
    pages: [],
    observer: null,
    viewport1: null,
    token: 0,
  };
  let el = {};

  function build() {
    if (st.built) return;
    const style = document.createElement("style");
    style.textContent = CSS;
    document.head.appendChild(style);
    const ov = document.createElement("div");
    ov.className = "bv-overlay";
    ov.innerHTML = `
      <div class="bv-bar">
        <button type="button" class="bv-close">✕ إغلاق</button>
        <span class="bv-title"></span>
        <div class="bv-nav">
          <button type="button" data-act="prev">السابقة</button>
          <span class="bv-pageinfo">صفحة <input type="number" min="1" inputmode="numeric" class="bv-input"> <span class="bv-total"></span></span>
          <button type="button" data-act="next">التالية</button>
          <button type="button" data-act="zoomout" title="تصغير">−</button>
          <button type="button" data-act="zoomin" title="تكبير">+</button>
        </div>
      </div>
      <div class="bv-scroll"><div class="bv-pages"></div><div class="bv-msg"></div></div>`;
    document.body.appendChild(ov);
    el = {
      ov,
      title: ov.querySelector(".bv-title"),
      input: ov.querySelector(".bv-input"),
      total: ov.querySelector(".bv-total"),
      scroll: ov.querySelector(".bv-scroll"),
      pages: ov.querySelector(".bv-pages"),
      msg: ov.querySelector(".bv-msg"),
    };
    ov.querySelector(".bv-close").addEventListener("click", () => close(true));
    ov.querySelector('[data-act="prev"]').addEventListener("click", () =>
      goToIndex(currentIndex() - 1),
    );
    ov.querySelector('[data-act="next"]').addEventListener("click", () =>
      goToIndex(currentIndex() + 1),
    );
    ov.querySelector('[data-act="zoomin"]').addEventListener("click", () =>
      setZoom(st.zoom * 1.25),
    );
    ov.querySelector('[data-act="zoomout"]').addEventListener("click", () =>
      setZoom(st.zoom / 1.25),
    );
    el.input.addEventListener("change", () => {
      const n = parseInt(el.input.value);
      if (!isNaN(n)) goToIndex(n + offset() - 1);
    });
    el.scroll.addEventListener("scroll", updateInput, { passive: true });
    // زر الرجوع في الجوال يغلق الكتاب ويبقى في البرنامج
    window.addEventListener("popstate", () => {
      if (el.ov.classList.contains("open")) close(false);
    });
    st.built = true;
  }

  // الفرق بين رقم صفحة الملف ورقم الصفحة المطبوع في الكتاب
  function offset() {
    return (st.book && st.book.pageOffset) || 0;
  }

  function currentIndex() {
    if (!st.pages.length) return 0;
    const h = st.pages[0].wrap.offsetHeight + 10;
    return Math.min(
      st.pages.length - 1,
      Math.max(0, Math.round(el.scroll.scrollTop / h)),
    );
  }

  function updateInput() {
    if (!st.pages.length || document.activeElement === el.input) return;
    const printed = currentIndex() + 1 - offset();
    el.input.value = printed >= 1 ? printed : "";
  }

  function goToIndex(i) {
    if (!st.pages.length) return;
    i = Math.min(st.pages.length - 1, Math.max(0, i));
    el.scroll.scrollTop = st.pages[i].wrap.offsetTop - el.pages.offsetTop;
    updateInput();
    // الصفحة المطلوبة وما حولها تُرسم فوراً
    for (let k = i - 1; k <= i + 1; k++) if (st.pages[k]) render(st.pages[k]);
  }

  function unrender(p) {
    if (p.task) {
      try {
        p.task.cancel();
      } catch (e) {}
      p.task = null;
    }
    if (p.canvas) {
      p.canvas.width = 0;
      p.canvas.height = 0;
      p.canvas.remove();
      p.canvas = null;
    }
  }

  async function render(p) {
    if (p.canvas || !st.doc) return;
    const token = st.token;
    const canvas = document.createElement("canvas");
    p.canvas = canvas;
    p.wrap.appendChild(canvas);
    try {
      const page = await st.doc.getPage(p.index + 1);
      if (token !== st.token || p.canvas !== canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const base = page.getViewport({ scale: 1 });
      const viewport = page.getViewport({
        scale: (p.wrap.clientWidth / base.width) * dpr,
      });
      canvas.width = Math.floor(viewport.width);
      canvas.height = Math.floor(viewport.height);
      p.task = page.render({ canvasContext: canvas.getContext("2d"), viewport });
      await p.task.promise;
      p.task = null;
    } catch (e) {
      if (e && e.name !== "RenderingCancelledException") console.warn(e);
    }
  }

  function setupPages(n) {
    st.pages.forEach(unrender);
    if (st.observer) st.observer.disconnect();
    el.pages.innerHTML = "";
    el.pages.style.width = `min(${Math.round(st.zoom * 100)}%, ${Math.round(st.zoom * 900)}px)`;
    const ratio = st.viewport1.width / st.viewport1.height;
    st.pages = [];
    // تُرسم الصفحات القريبة من الشاشة فقط، وتُحذف البعيدة لتخفيف الجوال
    st.observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          const p = st.pages[+en.target.dataset.i];
          if (!p) return;
          if (en.isIntersecting) render(p);
          else unrender(p);
        }),
      { root: el.scroll, rootMargin: "1200px 0px" },
    );
    for (let i = 0; i < n; i++) {
      const wrap = document.createElement("div");
      wrap.className = "bv-page";
      wrap.dataset.i = i;
      wrap.style.aspectRatio = String(ratio);
      el.pages.appendChild(wrap);
      st.pages.push({ index: i, wrap, canvas: null, task: null });
      st.observer.observe(wrap);
    }
  }

  function setZoom(z) {
    if (!st.doc) return;
    const keep = currentIndex();
    st.zoom = Math.min(3, Math.max(0.6, z));
    st.token++;
    setupPages(st.doc.numPages);
    goToIndex(keep);
  }

  async function open(bookOrId, startPrinted) {
    const book =
      typeof bookOrId === "string"
        ? (window.TERM_BOOKS || []).find((b) => b.id === bookOrId)
        : bookOrId;
    if (!book) return;
    build();
    if (st.doc) close(false, true);
    st.book = book;
    st.zoom = 1;
    st.token++;
    const token = st.token;
    el.title.textContent = "📖 " + book.name;
    el.total.textContent = "";
    el.input.value = "";
    el.pages.innerHTML = "";
    el.msg.textContent = "جاري تحميل الكتاب...";
    el.ov.classList.add("open");
    document.body.style.overflow = "hidden";
    if (!(history.state && history.state.bookViewer))
      history.pushState({ bookViewer: true }, "");
    try {
      const lib = await loadLib();
      const doc = await lib.getDocument({
        url: book.file,
        cMapUrl: PDFJS + "cmaps/",
        cMapPacked: true,
        standardFontDataUrl: PDFJS + "standard_fonts/",
        // خطوط الكتب خاصة: تُرسم الحروف من أشكالها في الكتاب نفسه حتى لا تتقطع الحروف العربية
        disableFontFace: true,
        useSystemFonts: false,
      }).promise;
      if (token !== st.token) {
        doc.destroy();
        return;
      }
      st.doc = doc;
      const first = await doc.getPage(1);
      st.viewport1 = first.getViewport({ scale: 1 });
      const printedTotal = doc.numPages - offset();
      el.total.textContent = offset() ? `من ${printedTotal}` : `من ${doc.numPages}`;
      el.msg.textContent = "";
      setupPages(doc.numPages);
      goToIndex(startPrinted ? startPrinted + offset() - 1 : 0);
    } catch (e) {
      console.error(e);
      if (token === st.token)
        el.msg.textContent =
          "تعذر فتح الكتاب، تأكد من الاتصال بالإنترنت ثم حاول مرة أخرى.";
    }
  }

  function close(fromButton, keepOpen) {
    st.token++;
    st.pages.forEach(unrender);
    st.pages = [];
    if (st.observer) st.observer.disconnect();
    st.observer = null;
    if (st.doc) {
      st.doc.destroy();
      st.doc = null;
    }
    if (keepOpen) return;
    el.pages.innerHTML = "";
    el.ov.classList.remove("open");
    document.body.style.overflow = "";
    if (fromButton && history.state && history.state.bookViewer) history.back();
  }

  window.openBookViewer = open;
})();
