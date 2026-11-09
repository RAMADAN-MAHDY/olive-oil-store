// ملف إعداد رابط الـ API الرئيسي
// استخدام مسار نسبي يجعل الطلبات تمر عبر نطاق الواجهة نفسه، فتُحفظ Cookie الجلسة كـ first-party cookie.
export const API_BASE_URL = '/api';

// دالة مساعدة لبناء الروابط بسهولة
export function apiUrl(path) {
    if (path.startsWith('/')) path = path.slice(1);
    return `${API_BASE_URL}/${path}`;
}
