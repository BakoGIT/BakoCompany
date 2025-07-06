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

// لغة الصفحة
const langBtn = document.getElementById('lang-btn');
const langList = document.getElementById('lang-list');
const langSwitcher = document.querySelector('.lang-switcher');

langBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    langSwitcher.classList.toggle('active');
});
langList.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', function() {
        const lang = this.getAttribute('data-lang');
        changeLang(lang);
        langSwitcher.classList.remove('active');
    });
});
document.addEventListener('click', function(e) {
    langSwitcher.classList.remove('active');
});

function changeLang(lang) {
    document.querySelectorAll('[data-en]').forEach(el => {
        el.textContent = el.getAttribute('data-' + lang);
    });
}
