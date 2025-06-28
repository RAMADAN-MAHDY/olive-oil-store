// منطق مودال التقييم
import { apiUrl } from './apiConfig.js';

(function() {
    const reviewModal = document.getElementById('review-modal');
    // دعم أكثر من زر لفتح مودال التقييم (حتى لو تكرر الزر بنفس الـ id)
    function bindOpenReviewButtons() {
        // استخدم [id="open-review"] بدلاً من #open-review لدعم تكرار نفس الـ id
        document.querySelectorAll('[id="open-review"]').forEach(btn => {
            btn.onclick = async function () {
                try {
                    const res = await fetch(apiUrl('user/check'), { credentials: 'include' });
                    if (res.ok) {
                        reviewModal.classList.remove('hidden');
                    } else {
                        document.getElementById('auth-modal').classList.remove('hidden');
                    }
                } catch {
                    document.getElementById('auth-modal').classList.remove('hidden');
                }
            };
        });
    }
    bindOpenReviewButtons();
    document.getElementById('close-review').onclick = () => reviewModal.classList.add('hidden');
    document.getElementById('reviewForm').onsubmit = async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('reviewMsg');
        msg.textContent = 'جاري إرسال التقييم...';
        try {
            const res = await fetch(apiUrl('review'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم إرسال تقييمك بنجاح! شكراً لمشاركتك.';
                msg.className = 'text-green-600 text-center mt-2';
                this.reset();
                // إعادة تحميل التعليقات مباشرة بعد الإضافة
                if (typeof loadReviews === 'function') loadReviews();
                setTimeout(() => reviewModal.classList.add('hidden'), 1200);
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.className = 'text-red-600 text-center mt-2';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.className = 'text-red-600 text-center mt-2';
        }
    };
})();
