import { apiUrl } from './apiConfig.js';

// Navbar mobile menu logic
(function() {
    const navbarToggle = document.getElementById('navbar-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMenu = document.getElementById('close-menu');
    // Open mobile menu
    navbarToggle.addEventListener('click', () => {
        mobileMenu.classList.remove('translate-x-full');
        document.body.style.overflow = 'hidden';
    });
    // Close mobile menu
    closeMenu.addEventListener('click', () => {
        mobileMenu.classList.add('translate-x-full');
        document.body.style.overflow = '';
    });
    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
            document.body.style.overflow = '';
        });
    });
})();
