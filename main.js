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
        
        // --- GENERAL MODAL LOGIC (openModal / closeModal are now used for all) ---
        const langModal = document.getElementById("lang-modal");
        const termsModal = document.getElementById("terms-modal");
        const noticeModal = document.getElementById("notice-modal");
        const aboutModal = document.getElementById("about-modal");

        function openModal(modal) {
            if (modal) {
                modal.classList.remove("hidden");
                const modalContent = modal.querySelector(".bg-white, .modal-content-product"); // Added product modal content class
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
                const modalContent = modal.querySelector(".bg-white, .modal-content-product"); // Added product modal content class
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
            // Note: Product modal event is handled separately below.
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
        // 3. PRODUCTS PAGE LOGIC (Product Grid and Filter ONLY)
        // -----------------------------------------------------------
        
        let allProducts = [];
        const productGrid = document.querySelector("#product-grid");
        const filtersContainer = document.getElementById("category-filters"); // Assuming you added this container

        if (productGrid) {
            
            // Product Modal Specific Functions
            function showProductDetails(product) { // Removed modal argument
                const modal = document.getElementById("product-modal");
                if (!product || !modal) return;

                // **NOTE:** You MUST update your product modal HTML to have class="modal-content-product" 
                // on the inner div (the one with the background) for the general closeModal to work properly.
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

                openModal(modal); // Use general openModal
            }

            // Function to generate filter buttons dynamically
            function generateFilterButtons(productsData) {
                if (!filtersContainer) return;
                const categories = [...new Set(productsData.map(p => p.category).filter(c => c))];
                
                // Clear all filters except the 'all' button (which is static in HTML)
                const allButtonHTML = filtersContainer.querySelector('[data-category="all"]').outerHTML;
                filtersContainer.innerHTML = allButtonHTML;

                categories.forEach(category => {
                    const button = document.createElement('button');
                    button.textContent = category; 
                    button.setAttribute('data-category', category);
                    button.className = 'filter-btn bg-white text-gray-800 font-bold py-2 px-4 rounded-full shadow-md hover:bg-gray-200 transition duration-300';
                    filtersContainer.appendChild(button);
                });
            }

            // Function to apply filtering and re-render the grid
            function filterProducts(category) {
                // Update button active state
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.classList.remove('bg-gray-900', 'text-white');
                    btn.classList.add('bg-white', 'text-gray-800');
                });
                
                const currentButton = document.querySelector(`[data-category="${category}"]`);
                if (currentButton) {
                    currentButton.classList.remove('bg-white', 'text-gray-800', 'bg-gray-700');
                    currentButton.classList.add('bg-gray-900', 'text-white');
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
                                <button class="view-details-btn w-full bg-white/20 backdrop-blur-sm text-white py-2 px-4 rounded-lg font-bold hover:bg-white/30 transition-all duration-300" data-product-id="${product.id}">
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
                
                // Re-attach product detail listeners (since innerHTML overwrote them)
                attachProductDetailListeners(productsToDisplay);
            }
            
            // New function to attach listeners after grid re-render
            function attachProductDetailListeners(products) {
                document.querySelectorAll(".view-details-btn").forEach((button) => {
                    button.addEventListener("click", (e) => {
                        e.stopPropagation();
                        const productId = button.getAttribute("data-product-id");
                        const product = products.find((p) => p.id == productId);
                        showProductDetails(product);
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
                    
                    // 4. Attach modal closing logic for the product modal
                    const modal = document.getElementById("product-modal");
                    const closeModalButton = document.getElementById("close-modal");

                    closeModalButton.addEventListener("click", () => closeModal(modal));
                    modal.addEventListener("click", (e) => {
                        if (e.target === modal) {
                            closeModal(modal);
                        }
                    });

                    // We NO LONGER call handleProductHash here
                })
                .catch((e) => console.error("Could not load products:", e));
        }
        
        // We NO LONGER attach window.addEventListener("hashchange", ...) here

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
