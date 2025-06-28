// منطق المودال الخاص بالتسجيل وتسجيل الدخول
import { apiUrl } from './apiConfig.js';
(function() {
    // فتح وغلق المودال
    const authModal = document.getElementById('auth-modal');
    document.getElementById('open-auth').onclick = () => authModal.classList.remove('hidden');
    document.getElementById('close-auth').onclick = () => authModal.classList.add('hidden');
    // التبديل بين التبويبات
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    showRegister.onclick = () => {
        showRegister.classList.add('border-b-2', 'border-[#6b7c32]', 'text-[#6b7c32]');
        showLogin.classList.remove('border-b-2', 'border-[#6b7c32]', 'text-[#6b7c32]');
        showLogin.classList.add('text-gray-500');
        registerForm.classList.remove('hidden');
        loginForm.classList.add('hidden');
    };
    showLogin.onclick = () => {
        showLogin.classList.add('border-b-2', 'border-[#6b7c32]', 'text-[#6b7c32]');
        showRegister.classList.remove('border-b-2', 'border-[#6b7c32]', 'text-[#6b7c32]');
        showRegister.classList.add('text-gray-500');
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
    };
    // إرسال فورم التسجيل
    registerForm.onsubmit = async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('registerMsg');
        msg.textContent = 'جاري التسجيل...';
        try {
            const res = await fetch(apiUrl('user/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.';
                msg.className = 'text-green-600 text-center mt-2';
                this.reset();
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.className = 'text-red-600 text-center mt-2';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.className = 'text-red-600 text-center mt-2';
        }
    };
    // إرسال فورم تسجيل الدخول
    loginForm.onsubmit = async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('loginMsg');
        msg.textContent = 'جاري تسجيل الدخول...';
        try {
            const res = await fetch(apiUrl('user/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
                credentials: 'include'
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم تسجيل الدخول بنجاح!';
                msg.className = 'text-green-600 text-center mt-2';
                this.reset();
                setTimeout(() => authModal.classList.add('hidden'), 1000);
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.className = 'text-red-600 text-center mt-2';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.className = 'text-red-600 text-center mt-2';
        }
    };
    // إخفاء زر تسجيل / دخول إذا كان المستخدم مسجل الدخول
    async function checkAuthAndToggleUI() {
        const authBtn = document.getElementById('open-auth');
        try {
            const res = await fetch(apiUrl('user/check'), {
                credentials: 'include'
            });
            if (res.ok) {
                if (authBtn) authBtn.style.display = 'none';
                window.isUserAuthenticated = true;
            } else {
                if (authBtn) authBtn.style.display = '';
                window.isUserAuthenticated = false;
            }
        } catch {
            if (authBtn) authBtn.style.display = '';
            window.isUserAuthenticated = false;
        }
    }
    checkAuthAndToggleUI();
    // منع إرسال الطلب إذا لم يكن المستخدم مسجل الدخول
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', async function (e) {
            if (!window.isUserAuthenticated) {
                e.preventDefault();
                document.getElementById('auth-modal').classList.remove('hidden');
                return;
            }
        }, true);
    }
})();
