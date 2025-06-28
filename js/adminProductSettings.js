// إعدادات المنتج في لوحة الأدمن
import { apiUrl } from './apiConfig.js';
(function() {
    // تحقق من صلاحيات الأدمن
    async function checkAdmin() {
        try {
            const res = await fetch(apiUrl('user/check'), { credentials: 'include' });
            if (!res.ok) throw new Error();
            const data = await res.json();
            if (!data.user || !data.user.isAdmin) throw new Error();
        } catch {
            alert('هذه الصفحة مخصصة للأدمن فقط. سيتم تحويلك للصفحة الرئيسية.');
            window.location.href = 'index.html';
        }
    }
    checkAdmin();

    // جلب المستخدمين مع الطلبات
    async function loadAdminUsers() {
        const usersList = document.getElementById('users-list');
        const userOrders = document.getElementById('user-orders');
        usersList.innerHTML = '<div class="text-center text-gray-500 py-8">جاري تحميل المستخدمين...</div>';
        try {
            const res = await fetch(apiUrl('order/admin/users'), { credentials: 'include' });
            const users = await res.json();
            if (Array.isArray(users) && users.length > 0) {
                usersList.innerHTML = users.map((u, i) => `
                    <div class="user-item cursor-pointer p-3 rounded-lg mb-2 flex flex-col gap-1 border hover:bg-[#f8f9fa] ${i===0?'bg-[#e9ecef]':''}" data-index="${i}">
                        <div class="font-bold text-[#6b7c32]">${u.name}</div>
                        <div class="text-xs text-gray-500">${u.email}</div>
                        <div class="text-xs text-gray-700">عدد الطلبات: <span class="font-bold">${u.orders.length}</span></div>
                    </div>
                `).join('');
                renderUserOrders(users[0]);
                document.querySelectorAll('.user-item').forEach(item => {
                    item.onclick = function () {
                        document.querySelectorAll('.user-item').forEach(i => i.classList.remove('bg-[#e9ecef]'));
                        this.classList.add('bg-[#e9ecef]');
                        const idx = +this.getAttribute('data-index');
                        renderUserOrders(users[idx]);
                    };
                });
            } else {
                usersList.innerHTML = '<div class="text-center text-gray-500 py-8">لا يوجد مستخدمون بعد.</div>';
                userOrders.innerHTML = '<div class="text-center text-gray-400 py-8">لا يوجد بيانات</div>';
            }
        } catch {
            usersList.innerHTML = '<div class="text-center text-red-500 py-8">تعذر تحميل المستخدمين.</div>';
            userOrders.innerHTML = '<div class="text-center text-red-400 py-8">تعذر تحميل الطلبات.</div>';
        }
    }
    function renderUserOrders(user) {
        const userOrders = document.getElementById('user-orders');
        if (!user.orders.length) {
            userOrders.innerHTML = `<div class='text-center text-gray-400 py-8'>لا توجد طلبات لهذا المستخدم.</div>`;
            return;
        }
        let table = `<div class='mb-4'><span class='font-bold text-[#6b7c32]'>${user.name}</span> - <span class='text-xs text-gray-500'>${user.email}</span></div>`;
        table += `<table class="min-w-full text-sm text-right rtl:text-right">
            <thead class="bg-[#f4d03f] text-[#2c3e30]">
                <tr>
                    <th class="py-2 px-3">رقم الطلب</th>
                    <th class="py-2 px-3">العنوان</th>
                    <th class="py-2 px-3">المحافظة</th>
                    <th class="py-2 px-3">الهاتف</th>
                    <th class="py-2 px-3">الكمية</th>
                    <th class="py-2 px-3">السعر</th>
                    <th class="py-2 px-3">الحالة</th>
                    <th class="py-2 px-3">تعديل الحالة</th>
                    <th class="py-2 px-3">تاريخ الطلب</th>
                </tr>
            </thead>
            <tbody>`;
        table += user.orders.map(order => `
            <tr class="border-b hover:bg-[#f8f9fa]">
                <td class="py-2 px-3 font-mono">${order._id.slice(-6).toUpperCase()}</td>
                <td class="py-2 px-3">${order.address}</td>
                <td class="py-2 px-3">${order.city}</td>
                <td class="py-2 px-3">${order.phone || '-'}</td>
                <td class="py-2 px-3">${order.quantity}</td>
                <td class="py-2 px-3">${order.price} ج</td>
                <td class="py-2 px-3"><span class="px-2 py-1 rounded-full ${getStatusColor(order.status)}">${order.status || 'قيد التنفيذ'}</span></td>
                <td class="py-2 px-3">
                    <select class="status-select border rounded px-2 py-1" data-id="${order._id}">
                        <option value="تم القبول" ${order.status === 'تم القبول' ? 'selected' : ''}>تم القبول</option>
                        <option value="جاري التجهيز" ${order.status === 'جاري التجهيز' ? 'selected' : ''}>جاري التجهيز</option>
                        <option value="جاري التوصيل" ${order.status === 'جاري التوصيل' ? 'selected' : ''}>جاري التوصيل</option>
                        <option value="تم التسليم" ${order.status === 'تم التسليم' || order.status === 'تم التوصيل' ? 'selected' : ''}>تم التسليم</option>
                    </select>
                </td>
                <td class="py-2 px-3 text-xs">${new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
            </tr>
        `).join('');
        table += '</tbody></table>';
        userOrders.innerHTML = table;
        document.querySelectorAll('.status-select').forEach(sel => {
            sel.addEventListener('change', async function () {
                const orderId = this.getAttribute('data-id');
                const newStatus = this.value;
                this.disabled = true;
                try {
                    const res = await fetch(apiUrl(`order/${orderId}/status`), {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ status: newStatus })
                    });
                    if (res.ok) {
                        this.classList.add('bg-green-100');
                        setTimeout(() => this.classList.remove('bg-green-100'), 1000);
                        loadAdminUsers();
                    } else {
                        alert('تعذر تحديث الحالة.');
                    }
                } catch {
                    alert('تعذر الاتصال بالخادم.');
                } finally {
                    this.disabled = false;
                }
            });
        });
    }
    function getStatusColor(status) {
        if (status === 'تم التسليم' || status === 'تم التوصيل') return 'bg-green-100 text-green-700';
        if (status === 'جاري التوصيل') return 'bg-yellow-100 text-yellow-700';
        if (status === 'جاري التجهيز') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-200 text-gray-700';
    }
    // --- إعدادات المنتج ---
    async function loadProductSettings() {
        const msg = document.getElementById('settingsMsg');
        msg.textContent = '';
        try {
            const res = await fetch(apiUrl('product/settings'), { credentials: 'include' });
            if (!res.ok) throw new Error('تعذر جلب الإعدادات');
            const settings = await res.json();
            document.getElementById('originalPrice').value = settings.originalPrice || '';
            document.getElementById('discountedPrice').value = settings.discountedPrice || '';
            document.getElementById('discountPercent').value = settings.discountPercent || '';
            renderQuantities(settings.quantities || []);
        } catch {
            msg.textContent = 'تعذر جلب إعدادات المنتج.';
            msg.className = 'text-red-600 font-bold';
        }
    }
    function renderQuantities(quantities) {
        const list = document.getElementById('quantities-list');
        list.innerHTML = '';
        (quantities.length ? quantities : [{label:'عبوة واحدة',quantity:1,price:120,save:0}]).forEach((q, i) => {
            const div = document.createElement('div');
            div.className = 'flex gap-2 mb-2 items-center';
            div.innerHTML = `
                <input type="text" placeholder="الوصف" value="${q.label}" class="q-label border rounded p-1 w-32">
                <input type="number" placeholder="الكمية" value="${q.quantity}" class="q-quantity border rounded p-1 w-16">
                <input type="number" placeholder="السعر" value="${q.price}" class="q-price border rounded p-1 w-20">
                <input type="number" placeholder="التوفير" value="${q.save||0}" class="q-save border rounded p-1 w-20">
                <button type="button" class="remove-quantity bg-red-500 text-white rounded px-2">-</button>
            `;
            div.querySelector('.remove-quantity').onclick = () => { div.remove(); };
            list.appendChild(div);
        });
    }
    document.getElementById('add-quantity').onclick = function() {
        renderQuantities([...document.querySelectorAll('#quantities-list > div')].map(div => ({
            label: div.querySelector('.q-label').value,
            quantity: +div.querySelector('.q-quantity').value,
            price: +div.querySelector('.q-price').value,
            save: +div.querySelector('.q-save').value
        })).concat([{label:'',quantity:1,price:0,save:0}]));
    };
    document.getElementById('productSettingsForm').onsubmit = async function(e) {
        e.preventDefault();
        const msg = document.getElementById('settingsMsg');
        msg.textContent = 'جاري الحفظ...';
        msg.className = '';
        const quantities = [...document.querySelectorAll('#quantities-list > div')].map(div => ({
            label: div.querySelector('.q-label').value,
            quantity: +div.querySelector('.q-quantity').value,
            price: +div.querySelector('.q-price').value,
            save: +div.querySelector('.q-save').value
        })).filter(q => q.label && q.quantity && q.price);
        const data = {
            originalPrice: +document.getElementById('originalPrice').value,
            discountedPrice: +document.getElementById('discountedPrice').value,
            discountPercent: +document.getElementById('discountPercent').value,
            quantities
        };
        try {
            const res = await fetch(apiUrl('product/settings'), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            if (res.ok) {
                msg.textContent = 'تم حفظ التعديلات بنجاح';
                msg.className = 'text-green-600 font-bold';
            } else {
                msg.textContent = 'تعذر الحفظ.';
                msg.className = 'text-red-600 font-bold';
            }
        } catch {
            msg.textContent = 'تعذر الاتصال بالخادم.';
            msg.className = 'text-red-600 font-bold';
        }
    };
    // عند تحميل الصفحة
    loadAdminUsers();
    loadProductSettings();
})();
