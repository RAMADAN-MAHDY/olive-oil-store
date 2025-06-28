import { apiUrl } from './apiConfig.js';

// عرض التقييمات مع حد أقصى وزر عرض المزيد/أقل
let allReviews = [];
let reviewsShown = 3;

async function loadReviews() {
    const testimonialsSection = document.getElementById('testimonials-list');
    const showMoreBtn = document.getElementById('show-more-reviews');
    const showLessBtn = document.getElementById('show-less-reviews');
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
        showLessBtn.classList.add('hidden');
    } catch {
        testimonialsSection.innerHTML = '<div class="text-center text-red-500 py-8">تعذر تحميل التقييمات.</div>';
        showMoreBtn.classList.add('hidden');
        showLessBtn.classList.add('hidden');
    }
}

function renderReviews() {
    const testimonialsSection = document.getElementById('testimonials-list');
    const showMoreBtn = document.getElementById('show-more-reviews');
    const showLessBtn = document.getElementById('show-less-reviews');
    if (!Array.isArray(allReviews) || allReviews.length === 0) {
        testimonialsSection.innerHTML = '<div class="text-center text-gray-500 py-8">لا توجد تقييمات بعد.</div>';
        showMoreBtn.classList.add('hidden');
        showLessBtn.classList.add('hidden');
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
    // إظهار/إخفاء الأزرار حسب الحالة
    if (allReviews.length > reviewsShown) {
        showMoreBtn.classList.remove('hidden');
    } else {
        showMoreBtn.classList.add('hidden');
    }
    if (reviewsShown > 3) {
        showLessBtn.classList.remove('hidden');
    } else {
        showLessBtn.classList.add('hidden');
    }
}

document.getElementById('show-more-reviews').onclick = function() {
    reviewsShown += 3;
    renderReviews();
};
document.getElementById('show-less-reviews').onclick = function() {
    reviewsShown = 3;
    renderReviews();
};

loadReviews();
