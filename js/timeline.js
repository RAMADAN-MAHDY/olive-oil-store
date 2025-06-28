import { apiUrl } from './apiConfig.js';

// Timeline scroll effect and navigation
(function() {
    const sections = [
        document.getElementById('home'),
        document.getElementById('features'),
        document.getElementById('product'),
        document.getElementById('testimonials'),
        document.getElementById('order')
    ];
    const timelinePoints = document.querySelectorAll('.timeline-point');
    function activateTimelinePoint() {
        let index = 0;
        const scrollY = window.scrollY + window.innerHeight / 3;
        for (let i = 0; i < sections.length; i++) {
            if (sections[i].offsetTop <= scrollY) {
                index = i;
            }
        }
        timelinePoints.forEach((point, i) => {
            if (i === index) point.classList.add('active');
            else point.classList.remove('active');
        });
    }
    window.addEventListener('scroll', activateTimelinePoint);
    activateTimelinePoint();
    // Click to scroll
    timelinePoints.forEach((point, i) => {
        point.addEventListener('click', function (e) {
            e.preventDefault();
            const target = sections[i];
            window.scrollTo({
                top: target.offsetTop - 60,
                behavior: 'smooth'
            });
        });
    });
    // أضف أيقونة متحركة للنقطة النشطة
    function updateTimelineActive() {
        const points = document.querySelectorAll('.timeline-point');
        points.forEach((point, i) => {
            if (point.classList.contains('active')) {
                point.querySelector('.animate-pulse')?.style.setProperty('display', 'block');
            } else {
                point.querySelector('.animate-pulse')?.style.setProperty('display', 'none');
            }
        });
    }
    window.addEventListener('scroll', updateTimelineActive);
    updateTimelineActive();
})();
