document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------------------------------------
    // 1. HELPER FUNCTIONS AND INITIAL SETUP
    // -----------------------------------------------------------

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
    
    // Load common parts
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
    let currentLang = localStorage.getItem("lang") || 'ko';
    let allProducts = []; // <-- Moved to a global scope for access by product logic and hash listener

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

        const event = new CustomEvent("languageChange", { detail: { lang: lang } });
        window.dispatchEvent(event);
    }

    // -----------------------------------------------------------
    // 2. MAIN APPLICATION INITIALIZATION
    // -----------------------------------------------------------

    function initializeApp() {
        // --- MOBILE MENU / SMOOTH SCROLLING / INTERSECTION OBSERVER ---
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
        
        // --- GENERAL MODAL LOGIC (lang, terms, notice, about) ---
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
        
        // Modal Event Listeners
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

        // --- CONTACT FORM LOGIC ---
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
        
        // -----------------------------------------------------------
        // 3. PRODUCTS PAGE LOGIC (Product Grid, Filter, and Hash) - CORRECTED
        // -----------------------------------------------------------
        
        const productGrid = document.querySelector("#product-grid");
        const filtersContainer = document.getElementById("category-filters");

        if (productGrid) {
            
            // Product Modal Specific Functions
            function showProductDetails(product, modal) {
                if (!product || !modal) return;
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

                // Fill table
                const tableBody = document.getElementById('modal-table-body');
                tableBody.innerHTML = '';
                if (product.table && product.table.length > 1) {
                    // Skip first row if it's headers
                    for (let i = 1; i < product.table.length; i++) {
                        const row = product.table[i];
                        const tr = document.createElement('tr');
                        row.forEach(cell => {
                            const td = document.createElement('td');
                            td.className = "px-4 py-2 border-b border-gray-800";
                            td.textContent = cell;
                            tr.appendChild(td);
                        });
                        tableBody.appendChild(tr);
                    }
                }

                // Force show modal
                modal.classList.remove("hidden", "opacity-0");
                modal.classList.add("flex");
                modal.className = modal.className.replace(/\bhidden\b/g, '').replace(/\bopacity-0\b/g, '').replace(/\s+/g, ' ').trim();
                if (!modal.classList.contains('flex')) modal.classList.add('flex');
            }

            const closeModalProduct = (modal) => {
                if (!modal) return;
                modal.classList.add("opacity-0");
                setTimeout(() => {
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                }, 300);
            };

            // Function to handle the URL hash (e.g., #3)
            function handleProductHash(productsData, modal) {
                const hash = window.location.hash.substring(1);
                if (hash) {
                    const productIDFromURL = hash;
                    const targetProduct = productsData.find(p => p.id == productIDFromURL);
                    
                    if (targetProduct) {
                        showProductDetails(targetProduct, modal);
                    }
                }
            }

            // Function to generate filter buttons dynamically
            function generateFilterButtons(productsData) {
                if (!filtersContainer) return;
                const categories = [...new Set(productsData.map(p => p.category).filter(c => c))];

                filtersContainer.innerHTML = '';
                const allBtn = document.createElement('button');
                allBtn.textContent = translations[currentLang]['Show All'] || 'Show All';
                allBtn.setAttribute('data-category', 'all');
                allBtn.className = 'filter-btn px-3 py-1 mx-1 rounded-full font-semibold transition-all duration-300 focus:outline-none active:scale-95';
                allBtn.style.backgroundColor = 'white';
                allBtn.style.color = '#333';
                allBtn.style.cursor = 'pointer';
                allBtn.onmouseover = () => {
                    allBtn.style.backgroundColor = '#cdad59';
                    allBtn.style.color = 'white';
                };
                allBtn.onmouseout = () => {
                    allBtn.style.backgroundColor = 'white';
                    allBtn.style.color = '#333';
                };
                filtersContainer.appendChild(allBtn);

                categories.forEach(category => {
                    const button = document.createElement('button');
                    button.textContent = translations[currentLang][category] || category;
                    button.setAttribute('data-category', category);
                    button.className = 'filter-btn px-3 py-1 mx-1 rounded-full font-semibold transition-all duration-300 focus:outline-none active:scale-95';
                    button.style.backgroundColor = 'white';
                    button.style.color = '#333';
                    button.style.cursor = 'pointer';
                    button.onmouseover = () => {
                        button.style.backgroundColor = '#cdad59';
                        button.style.color = 'white';
                    };
                    button.onmouseout = () => {
                        button.style.backgroundColor = 'white';
                        button.style.color = '#333';
                    };
                    filtersContainer.appendChild(button);
                });
            }

            // Function to apply filtering and re-render the grid
            function filterProducts(category) {
                // Update button active state
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.style.backgroundColor = 'white';
                    btn.style.color = '#333';
                });

                const currentButton = document.querySelector(`[data-category="${category}"]`);
                if (currentButton) {
                    currentButton.style.backgroundColor = '#cdad59';
                    currentButton.style.color = 'white';
                }

                productGrid.innerHTML = ""; // Clear the grid

                const productsToDisplay = (category === 'all') 
                    ? allProducts 
                    : allProducts.filter(p => p.category === category);

                // Rebuild and display filtered product cards
                productsToDisplay.forEach((product) => {
                    const gradient = `linear-gradient(135deg, ${product.color} 0%, #2C3E50 100%)`;
                    productGrid.innerHTML += `
                        <div class="product-card rounded-xl shadow-lg text-white" style="background: ${gradient};">
                            <div class="image-wrapper rounded-t-xl overflow-hidden p-4">
                                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
                            </div>
                            <div class="p-6 text-center">
                                <h2 class="text-xl font-bold mb-2 text-white">${product.name}</h2>
                                <p class="text-gray-200 font-bold text-lg mb-4">${product.viscosity}</p>
                                <button class="view-details-btn w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-lg font-bold hover:bg-white/30 transition-all duration-300" data-i18n="View Details" data-product-id="${product.id}">
                                    View Details
                                </button>
                            </div>
                        </div>
                    `;
                });
                
                // Reapply Intersection Observer and set language on new cards
                document.querySelectorAll(".product-card").forEach((card) => {
                     observer.observe(card);
                });
                setLang(currentLang);

                // *** CRITICAL FIX: RE-ATTACH EVENT LISTENERS TO NEW BUTTONS ***
                const modal = document.getElementById("product-modal");
                document.querySelectorAll(".view-details-btn").forEach((button) => {
                    button.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const productId = button.getAttribute("data-product-id");
                        const product = allProducts.find((p) => p.id == productId);
                        showProductDetails(product, modal);
                    });
                });
            }

            fetch("products.json")
                .then((response) => response.json())
                .then((products) => {
                    allProducts = products; 
                    
                    // 1. Generate and attach filters
                    generateFilterButtons(products);

                    // 2. Attach filter event listeners
                    document.querySelectorAll('.filter-btn').forEach(button => {
                        button.addEventListener('click', () => {
                            const category = button.getAttribute('data-category');
                            filterProducts(category);
                        });
                    });

                    // 3. Display all products by default
                    filterProducts('all');
                    
                    // 4. Setup modal listeners and handle initial URL Hash
                    const modal = document.getElementById("product-modal");
                    const closeModalButton = document.getElementById("close-modal");

                    // Event listeners for product details buttons are now managed by filterProducts

                    closeModalButton?.addEventListener("click", () => closeModalProduct(modal));
                    
                    // Close modal when clicking outside the content
                    modal?.addEventListener("click", (e) => {
                        if (e.target === modal) {
                            closeModalProduct(modal);
                        }
                    });

                    handleProductHash(products, modal); 

                })
                .catch((e) => console.error("Could not load products:", e));
        }
        
        // 💡 HASH CHANGE LISTENER (Correctly placed inside initializeApp)
        window.addEventListener("hashchange", () => {
            const productGrid = document.querySelector("#product-grid");
            // Check allProducts.length > 0 to ensure data is loaded before attempting hash resolution
            if (productGrid && allProducts.length > 0) {
                const modal = document.getElementById("product-modal");
                handleProductHash(allProducts, modal);
            }
        });

    } // End of initializeApp

    // -----------------------------------------------------------
    // 4. STARTUP SEQUENCE
    // -----------------------------------------------------------

    // Fetch translations, then load the header and start the app
    fetch("translation.json")
        .then((res) => res.json())
        .then((data) => {
            Object.assign(translations, data);
            setLang(currentLang);
            loadHTML("#header-placeholder", "layout/header.html", initializeApp);
        })
        .catch((e) => console.error("Could not load translations:", e));
});

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
const defaultLang = 'ko';
let currentLang = localStorage.getItem('lang') || defaultLang;

// Ensure the selected language persists
document.addEventListener('DOMContentLoaded', () => {
  loadLanguage(currentLang);
  localStorage.setItem('lang', currentLang);
});