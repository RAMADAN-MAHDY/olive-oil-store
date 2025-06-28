import { apiUrl } from './apiConfig.js';

// عرض التقييمات الحقيقية بدلاً من الثابتة
async function loadReviews() {
    const testimonialsSection = document.getElementById('testimonials-list');
    if (!testimonialsSection) return;
    testimonialsSection.innerHTML = '<div class="text-center text-gray-500 py-8">جاري تحميل التقييمات...</div>';
    try {
        const res = await fetch(apiUrl('review'));
        const reviews = await res.json();
        if (Array.isArray(reviews) && reviews.length > 0) {
            testimonialsSection.innerHTML = reviews.map(r => `
        <div class="bg-white p-6 rounded-lg shadow-lg transition-transform transform hover:-translate-y-2">
          <div class="text-yellow-400 text-2xl mb-4">
            ${'⭐'.repeat(r.rating)}
          </div>
          <p class="text-gray-700 mb-4">${r.comment ? r.comment.replace(/</g, '&lt;') : 'بدون تعليق'}</p>
          <div class="font-semibold text-gray-800">- ${r.user?.name || 'مستخدم'}</div>
        </div>
      `).join('');
        } else {
            testimonialsSection.innerHTML = '<div class="text-center text-gray-500 py-8">لا توجد تقييمات بعد.</div>';
        }
    } catch {
        testimonialsSection.innerHTML = '<div class="text-center text-red-500 py-8">تعذر تحميل التقييمات.</div>';
    }
}
loadReviews();
