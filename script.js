document.getElementById('down-arrow').addEventListener('click', function() {
    // إظهار القسم السفلي عند الضغط على السهم
    const moreContent = document.getElementById('more-content');
    moreContent.classList.add('visible');
    moreContent.scrollIntoView({ behavior: 'smooth' });
});

// أنميشن تلقائي لظهور الصور
window.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.images img').forEach((img, i) => {
        img.style.opacity = 0;
        setTimeout(() => {
            img.style.transition = 'opacity 1s';
            img.style.opacity = 1;
        }, 400 + i * 300);
    });
});

// عند إظهار القسم السفلي، أضف كلاس visible
const moreContent = document.getElementById('more-content');
if (moreContent) {
    moreContent.classList.remove('visible');
}

// سلايدر الصور
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
const prevBtn = document.querySelector('.slider-btn.prev');
const nextBtn = document.querySelector('.slider-btn.next');

function showSlide(idx) {
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === idx);
        dots[i].classList.toggle('active', i === idx);
    });
    currentSlide = idx;
}
if (slides.length) {
    showSlide(0);
    prevBtn.addEventListener('click', () => {
        showSlide((currentSlide - 1 + slides.length) % slides.length);
    });
    nextBtn.addEventListener('click', () => {
        showSlide((currentSlide + 1) % slides.length);
    });
    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => showSlide(i));
    });
}

// --- Language Selection Modal ---
  // --- Modal open/close ---
  const openLangModal = document.getElementById("open-lang-modal");
  const closeLangModal = document.getElementById("close-lang-modal");
  const langModal = document.getElementById("lang-modal");

  openLangModal?.addEventListener("click", () => langModal.classList.remove("hidden"));
  closeLangModal?.addEventListener("click", () => langModal.classList.add("hidden"));
  langModal?.addEventListener("click", (e) => {
    if (e.target === langModal) langModal.classList.add("hidden");
  });

  // --- Load saved or default language ---
  document.addEventListener("DOMContentLoaded", () => {
    let savedLang = localStorage.getItem("selectedLanguage");

    // ✅ Set default to Korean on first visit
    if (!savedLang) {
      savedLang = "ko";
      localStorage.setItem("selectedLanguage", savedLang);
    }

    // ✅ Wait for header/footer to load before applying translations
    const observer = new MutationObserver(() => {
      applyLanguage(savedLang);
    });

    // Observe header & footer containers
    const header = document.getElementById("header-placeholder");
    const footer = document.getElementById("footer-placeholder");
    if (header) observer.observe(header, { childList: true, subtree: true });
    if (footer) observer.observe(footer, { childList: true, subtree: true });

    // Apply immediately for main page content
    applyLanguage(savedLang);
  });

  // --- Apply language translations ---
  function applyLanguage(lang) {
    fetch(`lang/${lang}.json`)
      .then((response) => response.json())
      .then((translations) => {
        document.querySelectorAll("[data-i18n]").forEach((el) => {
          const key = el.getAttribute("data-i18n");
          if (translations[key]) el.textContent = translations[key];
        });
      })
      .catch((error) => console.error("Translation load error:", error));
  }

  // --- When user selects a language ---
  document.querySelectorAll(".lang-modal-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const selectedLang = btn.getAttribute("data-lang");
      localStorage.setItem("selectedLanguage", selectedLang); // Save selection
      applyLanguage(selectedLang); // Apply immediately

      // Re-apply after header/footer reload (if reloaded by navigation)
      const header = document.getElementById("header-placeholder");
      const footer = document.getElementById("footer-placeholder");
      if (header) header.addEventListener("DOMSubtreeModified", () => applyLanguage(selectedLang));
      if (footer) footer.addEventListener("DOMSubtreeModified", () => applyLanguage(selectedLang));

      langModal.classList.add("hidden");
    });
  });

