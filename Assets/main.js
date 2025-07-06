// Mobile menu toggle
document
  .getElementById("mobile-menu-button")
  .addEventListener("click", function () {
    const menu = document.getElementById("mobile-menu");
    if (menu.classList.contains("hidden")) {
      menu.classList.remove("hidden");
      setTimeout(() => menu.classList.remove("scale-y-0"), 10);
    } else {
      menu.classList.add("scale-y-0");
      setTimeout(() => menu.classList.add("hidden"), 300);
    }
  });

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// Add animation to product cards when they come into view
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
