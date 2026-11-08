// منطق المودال الخاص بالتسجيل وتسجيل الدخول
import { apiUrl } from './apiConfig.js';

(function() {
    const authModal = document.getElementById('auth-modal');
    const closeAuth = document.getElementById('close-auth');
    const openAuth = document.getElementById('open-auth');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');

    // تنسيق النافذة مع الحفاظ على إخفاء النموذج غير النشط.
    const authStyles = document.createElement('style');
    authStyles.textContent = `
        #auth-modal { padding: 1rem; backdrop-filter: blur(5px); }
        #auth-modal > div {
            box-sizing: border-box;
            width: min(100%, 28rem);
            max-height: min(90vh, 680px);
            max-height: min(90dvh, 680px);
            overflow-y: auto;
            padding: 2rem;
            border: 1px solid rgba(107, 124, 50, .16);
            box-shadow: 0 24px 70px rgba(20, 32, 12, .28);
        }
        #auth-modal .auth-heading { margin: 0 2.5rem 1.5rem; text-align: center; }
        #auth-modal .auth-heading h2 { margin: 0; color: #2c3e30; font-size: 1.5rem; font-weight: 800; }
        #auth-modal .auth-heading p { margin: .4rem 0 0; color: #6b7280; font-size: .9rem; }
        #auth-modal .auth-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: .35rem;
            margin-bottom: 1.5rem;
            padding: .35rem;
            border-radius: .9rem;
            background: #f3f5ef;
        }
        #auth-modal .auth-tabs button {
            border: 0;
            border-radius: .65rem;
            padding: .7rem .5rem;
            color: #687064;
            font-weight: 700;
            transition: background-color .2s, color .2s, box-shadow .2s;
        }
        #auth-modal .auth-tabs button.is-active {
            color: #42501f;
            background: white;
            box-shadow: 0 2px 8px rgba(44, 62, 48, .12);
        }
        #auth-modal form:not(.hidden) { display: grid; gap: 1rem; }
        #auth-modal form.hidden { display: none !important; }
        #auth-modal form > div:not([id$="Msg"]) { min-width: 0; }
        #auth-modal form label { display: block; margin-bottom: .45rem; color: #374151; font-size: .92rem; font-weight: 700; }
        #auth-modal form input {
            box-sizing: border-box;
            width: 100%;
            min-height: 46px;
            border: 1px solid #d1d5db;
            border-radius: .7rem;
            padding: .7rem .85rem;
            background: #fff;
            color: #1f2937;
            transition: border-color .2s, box-shadow .2s;
        }
        #auth-modal form input:focus {
            border-color: #6b7c32;
            outline: none;
            box-shadow: 0 0 0 3px rgba(107, 124, 50, .16);
        }
        #auth-modal form button[type="submit"] { min-height: 48px; margin-top: .25rem; }
        #auth-modal #close-auth { z-index: 1; }
        @media (max-width: 480px) {
            #auth-modal { padding: .75rem; }
            #auth-modal > div { padding: 1.5rem 1.1rem; border-radius: 1rem; }
            #auth-modal .auth-heading { margin: 0 2rem 1.2rem; }
        }
    `;
    document.head.appendChild(authStyles);

    // إضافة عنوان واضح للمودال مرة واحدة.
    const authPanel = authModal?.firstElementChild;
    if (authPanel && !authPanel.querySelector('.auth-heading')) {
        const heading = document.createElement('div');
        heading.className = 'auth-heading';
        heading.innerHTML = '<h2>أهلًا بك</h2><p>سجّل الدخول أو أنشئ حسابًا للمتابعة</p>';
        const tabs = authPanel.querySelector('#show-login')?.parentElement;
        if (tabs) {
            tabs.classList.add('auth-tabs');
            tabs.before(heading);
        }
    }

    authModal?.setAttribute('role', 'dialog');
    authModal?.setAttribute('aria-modal', 'true');

    // فتح وغلق المودال
    if (openAuth) openAuth.onclick = () => authModal.classList.remove('hidden');
    if (closeAuth) closeAuth.onclick = () => authModal.classList.add('hidden');

    function setActiveTab(activeTab) {
        const isRegister = activeTab === 'register';
        showRegister?.classList.toggle('is-active', isRegister);
        showLogin?.classList.toggle('is-active', !isRegister);
        showRegister?.setAttribute('aria-selected', String(isRegister));
        showLogin?.setAttribute('aria-selected', String(!isRegister));
        registerForm?.classList.toggle('hidden', !isRegister);
        loginForm?.classList.toggle('hidden', isRegister);
    }

    // التبديل بين تسجيل الدخول وإنشاء الحساب
    showRegister?.addEventListener('click', () => setActiveTab('register'));
    showLogin?.addEventListener('click', () => setActiveTab('login'));
    setActiveTab('login');

    // إرسال نموذج إنشاء الحساب
    if (registerForm) registerForm.onsubmit = async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('registerMsg');
        msg.textContent = 'جاري التسجيل...';
        msg.className = 'text-center text-sm text-gray-600';
        try {
            const res = await fetch(apiUrl('user/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    password: data.password
                })
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.';
                msg.className = 'text-green-600 text-center text-sm mt-2';
                this.reset();
                setActiveTab('login');
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.className = 'text-red-600 text-center text-sm mt-2';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.className = 'text-red-600 text-center text-sm mt-2';
        }
    };

    // إرسال نموذج تسجيل الدخول
    if (loginForm) loginForm.onsubmit = async function (e) {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('loginMsg');
        msg.textContent = 'جاري تسجيل الدخول...';
        msg.className = 'text-center text-sm text-gray-600';
        try {
            const res = await fetch(apiUrl('user/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                }),
                credentials: 'include'
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم تسجيل الدخول بنجاح!';
                msg.className = 'text-green-600 text-center text-sm mt-2';
                this.reset();
                setTimeout(() => authModal.classList.add('hidden'), 1000);
                if (typeof checkAuthAndToggleUI === 'function') checkAuthAndToggleUI();
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.className = 'text-red-600 text-center text-sm mt-2';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.className = 'text-red-600 text-center text-sm mt-2';
        }
    };

    // إخفاء زر الدخول إذا كان المستخدم مسجلًا
    async function checkAuthAndToggleUI() {
        const authBtn = document.getElementById('open-auth');
        try {
            const res = await fetch(apiUrl('user/check'), { credentials: 'include' });
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
        orderForm.addEventListener('submit', function (e) {
            if (!window.isUserAuthenticated) {
                e.preventDefault();
                authModal.classList.remove('hidden');
            }
        }, true);
    }
})();
