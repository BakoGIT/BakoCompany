document.addEventListener("DOMContentLoaded", () => {
    // Helper function to load HTML content
    const loadHTML = (selector, url, callback) => {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = data;
                }
                if (callback) {
                    callback();
                }
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    };

    // Initial HTML loads (Footer and About Modal content)
    loadHTML("#footer-placeholder", "layout/footer.html");

    // Load about.html into the modal placeholder
    fetch("about.html")
        .then((response) => response.text())
        .then((data) => {
            const placeholder = document.getElementById("about-modal-placeholder");
            if (placeholder) {
                placeholder.innerHTML = data;
            }
        })
        .catch((error) => console.error("Error loading about.html:", error));

    const translations = {};
    let currentLang = localStorage.getItem("lang") || "en";

    function setLang(lang) {
        currentLang = lang;
        localStorage.setItem("lang", lang);
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            // Use the language-specific translation if available, otherwise fall back to the key's original text (if needed)
            if (translations[lang] && translations[lang][key]) {
                el.innerText = translations[lang][key];
            }
        });
        const langBtnSpans = document.querySelectorAll(".language-selector span");
        langBtnSpans.forEach((span) => {
            if (span) span.innerText = lang.toUpperCase();
        });

        // Dispatch a custom event to notify other scripts of the language change
        const event = new CustomEvent("languageChange", { detail: { lang: lang } });
        window.dispatchEvent(event);
    }

    function initializeApp() {
        // --- MOBILE MENU / SMOOTH SCROLLING / INTERSECTION OBSERVER / MODAL LOGIC remain the same ---
        const mobileMenuButton = document.getElementById("mobile-menu-button");
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener("click", function () {
                const body = document.body;
                if (mobileMenu.classList.contains("hidden")) {
                    mobileMenu.classList.remove("hidden");
                    setTimeout(() => mobileMenu.classList.remove("scale-y-0"), 10);
                    body.classList.add("mobile-menu-open");
                } else {
                    mobileMenu.classList.add("scale-y-0");
                    setTimeout(() => mobileMenu.classList.add("hidden"), 300);
                    body.classList.remove("mobile-menu-open");
                }
            });
        }

        // --- SMOOTH SCROLLING ---
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute("href"));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

        // --- INTERSECTION OBSERVER FOR ANIMATIONS ---
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("animate-fadeIn");
                    }
                });
            },
            { threshold: 0.1 }
        );
        document.querySelectorAll(".product-card").forEach((card) => {
            observer.observe(card);
        });

        // --- MODAL LOGIC ---
        const langModal = document.getElementById("lang-modal");
        const termsModal = document.getElementById("terms-modal");
        const noticeModal = document.getElementById("notice-modal");
        const aboutModal = document.getElementById("about-modal");

        function openModal(modal) {
            if (modal) {
                modal.classList.remove("hidden");
                const modalContent = modal.querySelector(".bg-white");
                if (modalContent) {
                    modalContent.classList.remove("animate-scale-out");
                    modalContent.classList.add("animate-scale-in");
                }
                setTimeout(() => {
                    modal.classList.remove("opacity-0");
                }, 10);
            }
        }

        function closeModal(modal) {
            if (modal) {
                const modalContent = modal.querySelector(".bg-white");
                if (modalContent) {
                    modalContent.classList.remove("animate-scale-in");
                    modalContent.classList.add("animate-scale-out");
                }
                modal.classList.add("opacity-0");
                setTimeout(() => {
                    modal.classList.add("hidden");
                }, 300);
            }
        }
        
        // --- Modal event listeners (Opening) ---
        document.getElementById("open-lang-modal")?.addEventListener("click", () => openModal(langModal));
        document.getElementById("open-lang-modal-mobile")?.addEventListener("click", () => openModal(langModal));
        document.getElementById("terms-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            openModal(termsModal);
        });
        document.getElementById("notice-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            openModal(noticeModal);
        });
        document.getElementById("footer-about-link")?.addEventListener("click", (e) => {
            e.preventDefault();
            openModal(aboutModal);
        });

        // --- Modal event listeners (Closing) ---
        document.getElementById("close-lang-modal")?.addEventListener("click", () => closeModal(langModal));
        document.getElementById("close-terms-modal")?.addEventListener("click", () => closeModal(termsModal));
        document.getElementById("close-notice-modal")?.addEventListener("click", () => closeModal(noticeModal));
        document.getElementById("close-about-modal")?.addEventListener("click", () => closeModal(aboutModal));
        document.getElementById("close-terms-modal-button")?.addEventListener("click", () => closeModal(termsModal));
        document.getElementById("close-notice-modal-button")?.addEventListener("click", () => closeModal(noticeModal));
        document.getElementById("close-about-modal-button")?.addEventListener("click", () => closeModal(aboutModal));

        window.addEventListener("click", (e) => {
            if (e.target === langModal) closeModal(langModal);
            if (e.target === termsModal) closeModal(termsModal);
            if (e.target === noticeModal) closeModal(noticeModal);
            if (e.target === aboutModal) closeModal(aboutModal);
        });

        // Handle language selection from modal
        document.querySelectorAll(".lang-modal-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                setLang(lang);
                closeModal(langModal);
            });
        });

        // --- CONTACT FORM LOGIC ---
        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
            contactForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const message = document.getElementById("message").value;
                const toEmail = "Abd.bako.company@gmail.com";
                const subject = "Message from Website Contact Form";
                const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(
                    subject
                )}&body=${encodeURIComponent(message)}`;
                window.location.href = mailtoLink;
            });
        }

        // --- PRODUCTS PAGE LOGIC ---
        const productGrid = document.querySelector("#product-grid"); // Use a specific ID
        const productDetailModal = document.getElementById("product-modal"); // Define the product modal here
        
        if (productGrid && productDetailModal) {
