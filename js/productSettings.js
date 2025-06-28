import { apiUrl } from './apiConfig.js';

// جلب إعدادات المنتج من الباك اند وتحديث الأسعار والخصم وخيارات الكمية ديناميكياً في كل الصفحة
async function loadProductSettings() {
    try {
        const res = await fetch(apiUrl('product/settings'));
        if (!res.ok) throw new Error('تعذر جلب إعدادات المنتج');
        const settings = await res.json();
        // تحديث قسم المنتج
        if (settings) {
            // تحديث السعر الأصلي والسعر بعد الخصم
            const originalPrice = document.getElementById('originalPrice');
            const priceAfterDiscount = document.getElementById('discountPrice');
            const discountBadge = document.getElementById('discountBadge');
            const Discount_rate = document.getElementById('Discount_rate');
            if (originalPrice) originalPrice.textContent = settings.originalPrice + ' جنيه';
            if (priceAfterDiscount) priceAfterDiscount.textContent = settings.discountedPrice + ' جنيه فقط';
            if (discountBadge) discountBadge.textContent = `توفر ${settings.discountPercent}%`;
            if (Discount_rate) Discount_rate.textContent = `${settings.discountPercent}`;

            // تحديث عنوان الخصم في فورم الطلب
            const orderTitle = document.querySelector('#order h2');
            if (orderTitle) orderTitle.innerHTML = `اطلب الآن واحصل على خصم ${settings.discountPercent}%`;

            // تحديث خيارات الكمية والسعر في فورم الطلب باستخدام المعرفات الفريدة
            if (Array.isArray(settings.quantities)) {
                settings.quantities.forEach((q, i) => {
                    const opt = document.getElementById(`quantity-option-${i+1}`);
                    if (opt && q) {
                        opt.setAttribute('data-quantity', q.quantity);
                        opt.setAttribute('data-price', q.price);
                        opt.querySelector('.text-lg').textContent = q.label;
                        opt.querySelector('.text-gray-700').textContent = q.price + ' جنيه';
                        const saveDiv = opt.querySelector('.text-red-500');
                        if (saveDiv) {
                            if (q.save && q.save > 0) {
                                saveDiv.textContent = `وفر ${q.save} جنيه`;
                                saveDiv.style.display = '';
                            } else {
                                saveDiv.textContent = '';
                                saveDiv.style.display = 'none';
                            }
                        }
                    }
                });
            }
        }
    } catch (err) {
        // يمكن عرض رسالة خطأ أو إبقاء القيم الافتراضية
    }
}
loadProductSettings();
