document.addEventListener("DOMContentLoaded", () => {
    const translations = {};
    let currentLang = localStorage.getItem("lang") || "en";

    // 1. Robust HTML Loader
    const loadHTML = (selector, url, callback) => {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            })
            .then(data => {
                const element = document.querySelector(selector);
                if (element) {
                    element.innerHTML = data;
                    console.log(`Successfully loaded ${url} into ${selector}`);
                } else {
                    console.error(`Error: Selector "${selector}" not found in DOM.`);
                }
                if (callback) {
                    callback();
                }
            })
            .catch(error => console.error(`Error loading ${url}:`, error));
    };

    // 2. Internationalization (i18n) Logic
    function setLang(lang) {
        currentLang = lang;
        localStorage.setItem("lang", lang);
        document.querySelectorAll("[data-i18n]").forEach((el) => {
            const key = el.getAttribute("data-i18n");
            const translationText = translations[lang] && translations[lang][key];
            if (translationText) {
                el.innerText = translationText;
            }
        });
        const langBtnSpans = document.querySelectorAll(".language-selector span");
        langBtnSpans.forEach((span) => {
            if (span) span.innerText = lang.toUpperCase();
        });

        const event = new CustomEvent("languageChange", { detail: { lang: lang } });
        window.dispatchEvent(event);
    }

    // 3. Main Application Initialization
    function initializeApp() {
        // --- MOBILE MENU / SMOOTH SCROLLING / INTERSECTION OBSERVER / MODAL LOGIC (Standard app features) ---

        // Mobile Menu Logic
        const mobileMenuButton = document.getElementById("mobile-menu-button");
        const mobileMenu = document.getElementById("mobile-menu");
        if (mobileMenuButton && mobileMenu) {
            mobileMenuButton.addEventListener("click", function () {
                const body = document.body;
                const isHidden = mobileMenu.classList.contains("hidden");
                mobileMenu.classList.toggle("hidden", !isHidden);
                setTimeout(() => mobileMenu.classList.toggle("scale-y-0", !isHidden), 10);
                body.classList.toggle("mobile-menu-open", isHidden);
            });
        }
        
        // Modal definitions for general use
        const langModal = document.getElementById("lang-modal");
        const termsModal = document.getElementById("terms-modal");
        const noticeModal = document.getElementById("notice-modal");
        const aboutModal = document.getElementById("about-modal");

        function openModal(modal) {
             if (!modal) return;
             modal.classList.remove("hidden", "opacity-0");
             const modalContent = modal.querySelector(".bg-white");
             if (modalContent) {
                 modalContent.classList.remove("animate-scale-out");
                 modalContent.classList.add("animate-scale-in");
             }
        }

        function closeModal(modal) {
             if (!modal) return;
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

        // Modal event listeners (Opening and Closing)
        document.getElementById("open-lang-modal")?.addEventListener("click", () => closeModal(mobileMenu) || openModal(langModal)); // Added mobile menu close
        document.getElementById("open-lang-modal-mobile")?.addEventListener("click", () => closeModal(mobileMenu) || openModal(langModal)); // Added mobile menu close
        document.getElementById("terms-link")?.addEventListener("click", (e) => { e.preventDefault(); openModal(termsModal); });
        document.getElementById("notice-link")?.addEventListener("click", (e) => { e.preventDefault(); openModal(noticeModal); });
        document.getElementById("footer-about-link")?.addEventListener("click", (e) => { e.preventDefault(); openModal(aboutModal); });

        document.querySelectorAll("[id^='close-']").forEach(btn => {
            btn.addEventListener("click", () => {
                // Determine which modal to close based on ID or a data attribute if needed
                if (btn.id.includes("lang")) closeModal(langModal);
                if (btn.id.includes("terms")) closeModal(termsModal);
                if (btn.id.includes("notice")) closeModal(noticeModal);
                if (btn.id.includes("about")) closeModal(aboutModal);
            });
        });

        // Handle language selection from modal
        document.querySelectorAll(".lang-modal-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const lang = btn.getAttribute("data-lang");
                setLang(lang);
                closeModal(langModal);
            });
        });
        
        // --- PRODUCTS PAGE LOGIC ---
        const productGrid = document.querySelector("#product-grid");
        const productDetailModal = document.getElementById("product-modal");
        
        if (productGrid && productDetailModal) {
            let allProducts = [];

            // Helper function to show product details in the modal
            function showProductDetails(product, modal) {
                if (!product || !modal) return;
                
                // Get elements inside the modal, ensuring they exist
                const modalContent = modal.querySelector(".modal-content");
                const modalImage = document.getElementById("modal-image");
                const modalName = document.getElementById("modal-name");
                const modalViscosity = document.getElementById("modal-viscosity");
                const modalDescription = document.getElementById("modal-description");
                
                if (!modalContent || !modalImage || !modalName || !modalViscosity || !modalDescription) {
                    console.error("Product modal elements not found.");
                    return;
                }
                
                const gradient = `linear-gradient(135deg, ${product.color} 0%, #1a202c 100%)`;
                modalContent.style.background = gradient;

                modalImage.src = product.image;
                modalName.textContent = product.name;
                modalViscosity.textContent = product.viscosity;
                modalDescription.textContent = product.description; 

                // Use the existing openModal logic for product modal
                modal.classList.remove("hidden", "opacity-0");
                modal.classList.add("flex");
                
                // Set the URL hash without scrolling the page
                history.pushState(null, null, `#${product.id}`); 
            }

            // Function to close the product detail modal
            const closeProductModal = (modal) => {
                if (!modal) return;
                modal.classList.add("opacity-0");
                setTimeout(() => {
                    modal.classList.add("hidden");
                    modal.classList.remove("flex");
                }, 300);
                // Clear the URL hash on close
                history.pushState(null, null, ' ');
            };
            
            // Handle URL hash to open a specific product detail modal
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
            
            // Fetch products and render the grid
            fetch("products.json")
                .then((response) => {
                    if (!response.ok) throw new Error("Failed to load products.json");
                    return response.json();
                })
                .then((products) => {
                    allProducts = products;
                    productGrid.innerHTML = ""; 

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

                    // Event listener function for product buttons
                    function productDetailHandler(e) {
                         e.stopPropagation();
                         const productId = this.getAttribute("data-product-id");
                         const product = products.find((p) => p.id == productId);
                         showProductDetails(product, productDetailModal);
                    }
                    
                    // Bind the 'View Details' buttons
                    document.querySelectorAll(".view-details-btn").forEach((button) => {
                        button.addEventListener("click", productDetailHandler);
                    });

                    // Bind the close buttons and outside click for the product modal
                    document.getElementById("close-product-modal")?.addEventListener("click", () => closeProductModal(productDetailModal));
                    productDetailModal.addEventListener("click", (e) => {
                        if (e.target === product
