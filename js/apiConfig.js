// ملف إعداد رابط الـ API الرئيسي
// export const API_BASE_URL = 'http://localhost:5000/api';
export const API_BASE_URL = 'https://olive-oil-store-api.vercel.app/api';


// دالة مساعدة لبناء الروابط بسهولة
export function apiUrl(path) {
    if (path.startsWith('/')) path = path.slice(1);
    return `${API_BASE_URL}/${path}`;
}
