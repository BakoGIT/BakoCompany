document.addEventListener("DOMContentLoaded", () => {
    // ... (loadHTML function, footer/about loading, translation setup, and setLang function are correct) ...
    const loadHTML = (selector, url, callback) => {
        fetch(url)
            .then(response => response.text())
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = data;
                } else {
                    console.error(`Element with selector ${selector} not found.`);
                }
                if (callback) {
                    callback();
                }
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    };
    
    // ... (rest of initial fetches and translation setup) ...

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
        // --- MOBILE MENU / SMOOTH SCROLLING / INTERSECTION OBSERVER / MODAL LOGIC (Correct) ---
        // ... (All existing logic for menu, scrolling, observer, and modals remains here) ...
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
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener("click", function (e) {
                e.preventDefault();
                const targetElement = document.querySelector(this.getAttribute("href"));
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            });
        });

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
        
        const langModal = document.getElementById("lang-modal");
        const termsModal = document.getElementById("terms-modal");
        const noticeModal = document.getElementById("notice-modal");
        const aboutModal = document.getElementById("about-modal");

        function openModal(modal) {
            // ... (openModal logic) ...
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
            // ... (closeModal logic) ...
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
        // ... (Modal event listeners are correct) ...
        document.getElementById("open-lang-modal")?.addEventListener("click", () => openModal(langModal));
        document.getElementById("open-lang-modal-mobile")?.addEventListener("click", () => openModal(langModal));
        document.getElementById("terms-link")?.addEventListener("click", (e) => { e.preventDefault(); openModal(termsModal); });
        document.getElementById("notice-link")?.addEventListener("click", (e) => { e.preventDefault(); openModal(noticeModal); });
        document.getElementById("footer-about-link")?.addEventListener("click", (e) => { e.preventDefault(); openModal(aboutModal); });
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
        document.querySelectorAll(".lang-modal-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                setLang(lang);
                closeModal(langModal);
            });
        });


        // --- CONTACT FORM LOGIC (Correct) ---
        const contactForm = document.getElementById("contact-form");
        if (contactForm) {
            contactForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const message = document.getElementById("message").value;
                const toEmail = "Abd.bako.company@gmail.com";
                const subject = "Message from Website Contact Form";
                const mailtoLink = `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
                window.location.href = mailtoLink;
            });
        }

        // --- PRODUCTS PAGE LOGIC ---
        const productGrid = document.querySelector("#product-grid");
        if (productGrid) {
            let allProducts = [];
            
            function showProductDetails(product, modal) {
                if (!product || !modal) return;
                // ... (modal content filling logic is correct) ...
                const modalContent = modal.querySelector(".modal-content");
                const modalImage = document.getElementById("modal-image");
                const modalName = document.getElementById("modal-name");
                const modalViscosity = document.getElementById("modal-viscosity");
                const modalDescription = document.getElementById("modal-description");
                
                const gradient = `linear-gradient(135deg, ${product.color} 0%, #1a202c 100%)`;
                modalContent.style.background = gradient;

                modalImage.src = product.image;
                modalName.textContent = product.name;
                modalViscosity.textContent = product.viscosity;
                modalDescription.textContent = product.description; 

                modal.classList.remove("hidden", "opacity-0");
                modal.classList.add("flex");
            }

            const closeModal = (modal) => {
                // ... (closeModal logic is correct) ...
                if (!modal) return;
                modal.classList.add("opacity-0");
                setTimeout(() => {
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                }, 300);
            };

            // **تعريف دالة معالجة الهاش (Correct)**
            function handleProductHash(productsData, modal) {
                const hash = window.location.hash.substring(1);
                if (hash) {
                    const productIDFromURL = hash;
                    const targetProduct = productsData.find(p => p.id == productIDFromURL);
                    
                    if (targetProduct) {
                        showProductDetails(targetProduct, modal);
                        // history.replaceState(null, null, ' '); 
                    }
                }
            }

            fetch("products.json")
                .then((response) => response.json())
                .then((products) => {
                    allProducts = products;
                    productGrid.innerHTML = "";

                    // ... (product card generation loop is correct) ...
                    products.forEach((product) => {
                        const gradient = `linear-gradient(135deg, ${product.color} 0%, #2C3E50 100%)`;
                        productGrid.innerHTML += `
                            <div class="product-card rounded-xl shadow-lg text-white" style="background: ${gradient};">
                                <div class="image-wrapper rounded-t-xl overflow-hidden p-4">
                                    <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                                </div>
                                <div class="p-6 text-center">
                                    <h2 class="text-xl font-bold mb-2 text-white">${product.name}</h2>
                                    <p class="text-gray-200 font-bold text-lg mb-4">${product.viscosity}</p>
                                    <button class="view-details-btn w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-lg font-bold hover:bg-white/30 transition-all duration-300" data-product-id="${product.id}">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        `;
                    });

                    const modal = document.getElementById("product-modal");
                    const closeModalButton = document.getElementById("close-modal");
                    
                    // ... (event listeners for buttons/modal are correct) ...
                    document.querySelectorAll(".view-details-btn").forEach((button) => {
                        button.addEventListener("click", (e) => {
                            e.stopPropagation();
                            const productId = button.getAttribute("data-product-id");
                            const product = products.find((p) => p.id == productId);
                            showProductDetails(product, modal);
                        });
                    });

                    closeModalButton.addEventListener("click", () => closeModal(modal));
                    modal.addEventListener("click", (e) => {
                        if (e.target === modal) {
                            closeModal(modal);
                        }
                    });

                    // **Execution Point (Correct)**
                    handleProductHash(products, modal); 
                })
                .catch((e) => console.error("Could not load products:", e));
        }
    }

    // Fetch translations, then initialize the app (Correct)
    fetch("translation.json")
        .then((res) => res.json())
        .then((data) => {
            Object.assign(translations, data);
            setLang(currentLang);
            loadHTML("#header-placeholder", "layout/header.html", initializeApp);
        })
        .catch((e) => console.error("Could not load translations:", e));
});
