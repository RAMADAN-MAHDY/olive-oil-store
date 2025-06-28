import { apiUrl } from './apiConfig.js';

// عرض التقييمات مع حد أقصى وزر عرض المزيد
let allReviews = [];
let reviewsShown = 3;

async function loadReviews() {
    const testimonialsSection = document.getElementById('testimonials-list');
    const showMoreBtn = document.getElementById('show-more-reviews');
    if (!testimonialsSection) return;
    testimonialsSection.innerHTML = '<div class="text-center text-gray-500 py-8">جاري تحميل التقييمات...</div>';
    try {
        const res = await fetch(apiUrl('review'));
        allReviews = await res.json();
        renderReviews();
        if (Array.isArray(allReviews) && allReviews.length > reviewsShown) {
            showMoreBtn.classList.remove('hidden');
        } else {
            showMoreBtn.classList.add('hidden');
        }
    } catch {
        testimonialsSection.innerHTML = '<div class="text-center text-red-500 py-8">تعذر تحميل التقييمات.</div>';
        showMoreBtn.classList.add('hidden');
    }
}

function renderReviews() {
    const testimonialsSection = document.getElementById('testimonials-list');
    if (!Array.isArray(allReviews) || allReviews.length === 0) {
        testimonialsSection.innerHTML = '<div class="text-center text-gray-500 py-8">لا توجد تقييمات بعد.</div>';
        return;
    }
    testimonialsSection.innerHTML = allReviews.slice(0, reviewsShown).map(r => `
        <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-2">
          <div class="text-yellow-400 text-2xl mb-4">
            ${'⭐'.repeat(r.rating)}
          </div>
          <p class="text-gray-700 mb-4">${r.comment ? r.comment.replace(/</g, '&lt;') : 'بدون تعليق'}</p>
          <div class="font-semibold text-gray-800">- ${r.user?.name || 'مستخدم'}</div>
        </div>
      `).join('');
}

document.getElementById('show-more-reviews').onclick = function() {
    reviewsShown += 3;
    renderReviews();
    if (allReviews.length <= reviewsShown) {
        this.classList.add('hidden');
    }
};

loadReviews();
