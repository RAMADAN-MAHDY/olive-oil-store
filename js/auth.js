// منطق المودال الخاص بالتسجيل وتسجيل الدخول
import { apiUrl } from './apiConfig.js';

(function () {
    const authModal = document.getElementById('auth-modal');
    const authPanel = authModal?.firstElementChild;
    const openAuth = document.getElementById('open-auth');
    const closeAuth = document.getElementById('close-auth');
    const showLogin = document.getElementById('show-login');
    const showRegister = document.getElementById('show-register');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (!authModal || !authPanel || !loginForm || !registerForm) return;

    // إعادة بناء نموذج التسجيل بشكل كامل؛ النسخة المنشورة كانت تفتقد كلمة المرور وزر الإرسال.
    registerForm.innerHTML = `
        <div class="auth-field">
            <label for="registerName">الاسم الكامل</label>
            <input type="text" id="registerName" name="name" autocomplete="name" required>
        </div>
        <div class="auth-field">
            <label for="registerEmail">البريد الإلكتروني</label>
            <input type="email" id="registerEmail" name="email" autocomplete="email" required>
        </div>
        <div class="auth-field">
            <label for="registerPassword">كلمة المرور</label>
            <input type="password" id="registerPassword" name="password" autocomplete="new-password" required>
        </div>
        <div id="registerMsg" class="auth-message" aria-live="polite"></div>
        <button type="submit" class="auth-submit">إنشاء الحساب</button>
    `;

    const authStyles = document.createElement('style');
    authStyles.textContent = `
        #auth-modal { box-sizing: border-box; padding: 16px; backdrop-filter: blur(5px); }
        #auth-modal > div {
            box-sizing: border-box;
            position: relative;
            width: min(100%, 440px);
            max-height: calc(100vh - 32px);
            max-height: calc(100dvh - 32px);
            overflow-x: hidden;
            overflow-y: auto;
            padding: 28px;
            border: 1px solid rgba(107, 124, 50, .14);
            border-radius: 18px;
            background: #fff;
            box-shadow: 0 24px 70px rgba(20, 32, 12, .24);
        }
        #auth-modal .auth-heading { margin: 0 42px 22px; text-align: center; }
        #auth-modal .auth-heading h2 { margin: 0; color: #2c3e30; font: 800 24px/1.35 Cairo, sans-serif; }
        #auth-modal .auth-heading p { margin: 5px 0 0; color: #7b8190; font: 14px/1.6 Cairo, sans-serif; }
        #auth-modal .auth-tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 5px;
            margin: 0 0 22px;
            padding: 5px;
            border-radius: 14px;
            background: #f2f4ee;
        }
        #auth-modal .auth-tabs button {
            min-height: 46px;
            border: 0;
            border-radius: 10px;
            padding: 8px;
            color: #687064;
            background: transparent;
            font: 700 14px Cairo, sans-serif;
            cursor: pointer;
            transition: background .2s, color .2s, box-shadow .2s;
        }
        #auth-modal .auth-tabs button.is-active {
            color: #42501f;
            background: #fff;
            box-shadow: 0 2px 8px rgba(44, 62, 48, .12);
        }
        #auth-modal form.auth-form {
            display: grid;
            gap: 16px;
            margin: 0;
        }
        #auth-modal form.auth-form[hidden] { display: none !important; }
        #auth-modal .auth-field { min-width: 0; }
        #auth-modal .auth-field label {
            display: block;
            margin: 0 0 7px;
            color: #374151;
            font: 700 14px/1.5 Cairo, sans-serif;
        }
        #auth-modal .auth-field input {
            box-sizing: border-box;
            display: block;
            width: 100%;
            min-height: 48px;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 10px 13px;
            color: #1f2937;
            background: #fff;
            font: 15px Cairo, sans-serif;
            outline: none;
            transition: border-color .2s, box-shadow .2s;
        }
        #auth-modal .auth-field input:focus {
            border-color: #6b7c32;
            box-shadow: 0 0 0 3px rgba(107, 124, 50, .15);
        }
        #auth-modal .auth-message { min-height: 20px; text-align: center; font: 13px/1.5 Cairo, sans-serif; }
        #auth-modal .auth-submit {
            width: 100%;
            min-height: 49px;
            border: 0;
            border-radius: 999px;
            color: #fff;
            background: linear-gradient(110deg, #6b7c32, #8ba446);
            font: 700 16px Cairo, sans-serif;
            cursor: pointer;
            transition: filter .2s, transform .2s;
        }
        #auth-modal .auth-submit:hover { filter: brightness(1.05); transform: translateY(-1px); }
        #auth-modal #close-auth { z-index: 2; }
        @media (max-width: 480px) {
            #auth-modal { padding: 12px; }
            #auth-modal > div { max-height: calc(100vh - 24px); max-height: calc(100dvh - 24px); padding: 24px 18px; border-radius: 16px; }
            #auth-modal .auth-heading { margin: 0 38px 18px; }
            #auth-modal .auth-tabs { margin-bottom: 18px; }
            #auth-modal form.auth-form { gap: 13px; }
        }
    `;
    document.head.appendChild(authStyles);

    // إضافة عنوان النافذة مرة واحدة.
    if (!authPanel.querySelector('.auth-heading')) {
        const heading = document.createElement('div');
        heading.className = 'auth-heading';
        const title = document.createElement('h2');
        title.textContent = 'أهلًا بك';
        const subtitle = document.createElement('p');
        subtitle.textContent = 'سجّل الدخول أو أنشئ حسابًا للمتابعة';
        heading.append(title, subtitle);
        const tabs = showLogin?.parentElement;
        if (tabs) {
            tabs.classList.add('auth-tabs');
            tabs.before(heading);
        }
    }

    authModal.setAttribute('role', 'dialog');
    authModal.setAttribute('aria-modal', 'true');
    loginForm.classList.add('auth-form');
    registerForm.classList.add('auth-form');

    function setActiveTab(tab) {
        const isLogin = tab === 'login';
        loginForm.hidden = !isLogin;
        registerForm.hidden = isLogin;
        showLogin?.classList.toggle('is-active', isLogin);
        showRegister?.classList.toggle('is-active', !isLogin);
        showLogin?.setAttribute('aria-selected', String(isLogin));
        showRegister?.setAttribute('aria-selected', String(!isLogin));
    }

    openAuth?.addEventListener('click', () => {
        setActiveTab('login');
        authModal.classList.remove('hidden');
    });
    closeAuth?.addEventListener('click', () => authModal.classList.add('hidden'));
    showLogin?.addEventListener('click', () => setActiveTab('login'));
    showRegister?.addEventListener('click', () => setActiveTab('register'));
    setActiveTab('login');

    // إرسال بيانات التسجيل إلى نفس نقطة الـ API الحالية دون تغييرها.
    registerForm.onsubmit = async function (event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('registerMsg');
        msg.textContent = 'جاري التسجيل...';
        msg.style.color = '#6b7280';
        try {
            const res = await fetch(apiUrl('user/register'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: data.name, email: data.email, password: data.password })
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم التسجيل بنجاح! يمكنك تسجيل الدخول الآن.';
                msg.style.color = '#15803d';
                this.reset();
                setActiveTab('login');
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.style.color = '#dc2626';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.style.color = '#dc2626';
        }
    };

    // إرسال بيانات تسجيل الدخول إلى نفس نقطة الـ API الحالية دون تغييرها.
    loginForm.onsubmit = async function (event) {
        event.preventDefault();
        const data = Object.fromEntries(new FormData(this));
        const msg = document.getElementById('loginMsg');
        msg.textContent = 'جاري تسجيل الدخول...';
        msg.className = 'auth-message';
        try {
            const res = await fetch(apiUrl('user/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: data.email, password: data.password }),
                credentials: 'include'
            });
            const result = await res.json();
            if (res.ok) {
                msg.textContent = 'تم تسجيل الدخول بنجاح!';
                msg.style.color = '#15803d';
                this.reset();
                setTimeout(() => authModal.classList.add('hidden'), 900);
                checkAuthAndToggleUI();
            } else {
                msg.textContent = result.message || 'حدث خطأ.';
                msg.style.color = '#dc2626';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.style.color = '#dc2626';
        }
    };

    async function checkAuthAndToggleUI() {
        const authBtn = document.getElementById('open-auth');
        try {
            const res = await fetch(apiUrl('user/check'), { credentials: 'include' });
            window.isUserAuthenticated = res.ok;
            if (authBtn) authBtn.style.display = res.ok ? 'none' : '';
        } catch {
            window.isUserAuthenticated = false;
            if (authBtn) authBtn.style.display = '';
        }
    }
    checkAuthAndToggleUI();

    const orderForm = document.getElementById('orderForm');
    orderForm?.addEventListener('submit', event => {
        if (!window.isUserAuthenticated) {
            event.preventDefault();
            setActiveTab('login');
            authModal.classList.remove('hidden');
        }
    }, true);
})();
