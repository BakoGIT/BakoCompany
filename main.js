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
        
        // Modal Event Listeners (omitted for brevity, assume they are correct)
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
        // 3. PRODUCTS PAGE LOGIC (Product Grid, Filter, and Hash)
        // -----------------------------------------------------------
        
        let allProducts = []; // Stores all fetched product data
        const productGrid = document.querySelector("#product-grid");
        const filtersContainer = document.getElementById("category-filters"); // New filter container ID

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

                // Force show modal and log class for debug
                modal.classList.remove("hidden", "opacity-0");
                modal.classList.add("flex");
                // Remove any duplicate 'hidden' or 'opacity-0' if present
                modal.className = modal.className.replace(/\bhidden\b/g, '').replace(/\bopacity-0\b/g, '').replace(/\s+/g, ' ').trim();
                if (!modal.classList.contains('flex')) modal.classList.add('flex');
                console.log('Modal class after show:', modal.className);
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
                // Get unique categories, ensuring 'all' is not duplicated
                const categories = [...new Set(productsData.map(p => p.category).filter(c => c))];
                
                // Always ensure the 'all' button is present
                filtersContainer.innerHTML = '';
                const allBtn = document.createElement('button');
                allBtn.textContent = 'Show All';
                allBtn.setAttribute('data-category', 'all');
                allBtn.className = 'filter-btn bg-gray-700 text-white font-bold py-2 px-4 rounded-full shadow-md hover:bg-gray-600 transition duration-300';
                filtersContainer.appendChild(allBtn);

                // Debug: log categories
                console.log('Categories found:', categories);

                if (categories.length === 0) {
                    // Show a message if no categories found
                    const msg = document.createElement('span');
                    msg.textContent = 'No categories found.';
                    filtersContainer.appendChild(msg);
                }

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

                // Re-attach event listeners to new View Details buttons
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
                    
                    // 4. Handle initial URL Hash
                    const modal = document.getElementById("product-modal");
                    const closeModalButton = document.getElementById("close-modal");

                    // Event listeners for product details buttons
                    document.querySelectorAll(".view-details-btn").forEach((button) => {
                        button.addEventListener("click", (e) => {
                            e.stopPropagation();
                            const productId = button.getAttribute("data-product-id");
                            const product = products.find((p) => p.id == productId);
                            showProductDetails(product, modal);
                        });
                    });

                    closeModalButton.addEventListener("click", () => closeModalProduct(modal));
                    modal.addEventListener("click", (e) => {
                        if (e.target === modal) {
                            closeModalProduct(modal);
                        }
                    });

                    handleProductHash(products, modal); 

                })
                .catch((e) => console.error("Could not load products:", e));
        }
        
        // 💡 HASH CHANGE LISTENER (Correctly placed inside initializeApp)
        // Handles internal navigation to a product link (e.g., from another page)
        window.addEventListener("hashchange", () => {
            const productGrid = document.querySelector("#product-grid");
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