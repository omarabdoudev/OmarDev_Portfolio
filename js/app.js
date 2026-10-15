/* ============================================================
   OMARDEV PORTFOLIO — app.js
   ============================================================
   1. Navbar (menu toggle)
   2. Animation de la photo au scroll (Home -> About)
   3. Initialisation
   ============================================================ */


/* ============================================================
   1. NAVBAR
   ============================================================ */
const navbar = document.querySelector('#navbar');
const toggleBtn = document.querySelector('#toggleBtn');
const navLinks = document.querySelectorAll('.nav-links a');

function setMenuState(isOpen) {
    navbar.classList.toggle('open', isOpen);
    toggleBtn.textContent = isOpen ? 'X' : '...';
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
}

toggleBtn.addEventListener('click', () => {
    setMenuState(!navbar.classList.contains('open'));
});

// Ferme le menu après un clic sur un lien
navLinks.forEach((link) => {
    link.addEventListener('click', () => setMenuState(false));
});

// Ferme le menu avec la touche Échap
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && navbar.classList.contains('open')) {
        setMenuState(false);
        toggleBtn.focus();
    }
});


/* ============================================================
   2. ANIMATION DE LA PHOTO AU SCROLL
   ============================================================ */
const profilePhoto = document.getElementById('profilePhoto');
const profilePhotoPlaceholder = document.querySelector('.profile-photo-placeholder');
const homeSection = document.getElementById('home');
const photoSlot = document.getElementById('photoSlot');

// Paramètres de l'animation (faciles à ajuster)
const ANIMATION = {
    scrollRatio: 0.7,   // fraction de la hauteur de #home pour atteindre progress = 1
    maxRotation: 12,    // inclinaison maximale (degrés) à mi-parcours
    startBlur: 3,       // flou initial (px)
    startOpacity: 0.6   // opacité initiale
};

let startRect = null;
let endRect = null;
let ticking = false;

function lerp(a, b, t) {
    return a + (b - a) * t;
}

// Capture les positions de départ/arrivée en coordonnées "document"
// (indépendantes du scroll courant)
function captureRects() {
    const placeholderNow = profilePhotoPlaceholder.getBoundingClientRect();
    const slotNow = photoSlot.getBoundingClientRect();

    startRect = {
        top: placeholderNow.top + window.scrollY,
        left: placeholderNow.left + window.scrollX,
        width: placeholderNow.width,
        height: placeholderNow.height
    };

    endRect = {
        top: slotNow.top + window.scrollY,
        left: slotNow.left + window.scrollX,
        width: photoSlot.offsetWidth,
        height: photoSlot.offsetHeight
    };
}

function updatePhoto() {
    if (!startRect || !endRect) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    const homeHeight = homeSection.offsetHeight;
    const progress = Math.min(Math.max(scrollY / (homeHeight * ANIMATION.scrollRatio), 0), 1);

    const top = lerp(startRect.top, endRect.top, progress) - scrollY;
    const left = lerp(startRect.left, endRect.left, progress) - scrollX;
    const width = lerp(startRect.width, endRect.width, progress);
    const height = lerp(startRect.height, endRect.height, progress);

    // Rotation en cloche : 0° au départ, pic à mi-parcours, 0° à l'arrivée
    const rotate = Math.sin(progress * Math.PI) * ANIMATION.maxRotation;

    // Flou et opacité : photo floue/transparente au départ, nette à l'arrivée
    const blur = lerp(ANIMATION.startBlur, 0, progress);
    const opacity = lerp(ANIMATION.startOpacity, 1, progress);

    profilePhoto.style.top = `${top}px`;
    profilePhoto.style.left = `${left}px`;
    profilePhoto.style.width = `${width}px`;
    profilePhoto.style.height = `${height}px`;
    profilePhoto.style.transform = `rotate(${rotate}deg)`;
    profilePhoto.style.filter = `blur(${blur}px)`;
    profilePhoto.style.opacity = opacity;
}

function refreshPhoto() {
    captureRects();
    updatePhoto();
}

// Limite les mises à jour à une par frame d'écran (scroll plus fluide)
function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
        updatePhoto();
        ticking = false;
    });
}


/* ============================================================
   3. INITIALISATION
   ============================================================ */
function init() {
    refreshPhoto();
    profilePhoto.style.visibility = 'visible'; // révélée une fois bien positionnée
}

// Les modules sont différés, mais on gère les deux cas par sécurité
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Recalcule les positions quand les polices Google Fonts sont chargées
// (elles peuvent modifier la hauteur du texte et donc le layout)
if (document.fonts) {
    document.fonts.ready.then(refreshPhoto);
}

// Recalcule aussi quand toutes les ressources (images) sont chargées
window.addEventListener('load', refreshPhoto);
window.addEventListener('resize', refreshPhoto);
window.addEventListener('scroll', onScroll, { passive: true });