// Order form logic and order status modal
import { apiUrl } from './apiConfig.js';

(function() {
    // اختيار الكمية
    document.querySelectorAll('.quantity-option').forEach(option => {
        option.addEventListener('click', function () {
            document.querySelectorAll('.quantity-option').forEach(opt => {
                opt.classList.remove('border-[#6b7c32]', 'bg-[#6b7c32]', 'text-white');
                opt.classList.add('bg-[#f8f9fa]');
            });
            this.classList.remove('bg-[#f8f9fa]');
            this.classList.add('border-[#6b7c32]', 'bg-[#6b7c32]', 'text-white');
            document.getElementById('selectedQuantity').value = this.getAttribute('data-quantity');
            document.getElementById('selectedPrice').value = this.getAttribute('data-price');
        });
    });

    // إرسال بيانات الفورم للـ API عند الإرسال
    document.getElementById('orderForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        const form = e.target;
        const data = Object.fromEntries(new FormData(this));
        function showOrderMsg(text, success = true) {
            let orderMsg = document.getElementById('orderMsg');
            if (!orderMsg) {
                orderMsg = document.createElement('div');
                orderMsg.id = 'orderMsg';
                document.body.appendChild(orderMsg);
            }
            orderMsg.textContent = text;
            orderMsg.className = 'fixed top-8 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-lg shadow-lg text-lg font-bold ' + (success ? 'bg-green-600 text-white' : 'bg-red-600 text-white');
            orderMsg.style.display = 'block';
            setTimeout(() => { orderMsg.style.display = 'none'; }, 2000);
        }
        try {
            const res = await fetch(apiUrl('order'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });
            if (res.ok) {
                showOrderMsg('تم إرسال طلبك بنجاح! سنقوم بالتواصل معك قريباً.', true);
                form.reset();
            } else {
                const errorText = await res.text();
                showOrderMsg('حدث خطأ أثناء إرسال الطلب: ' + errorText, false);
            }
        } catch (err) {
            showOrderMsg('تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.', false);
        }
    });

    // مودال متابعة الطلبات
    const ordersModal = document.getElementById('orders-modal');
    document.getElementById('close-orders').onclick = () => ordersModal.classList.add('hidden');
    // زر فتح المودال بعد فورم الطلب
    const orderSection = document.getElementById('order');
    if (orderSection) {
        const btn = document.createElement('button');
        btn.id = 'open-orders';
        btn.innerHTML = '<span class="mr-2">📦</span>متابعة حالة الطلبات';
        btn.className = 'mt-8 mb-4 bg-gradient-to-r from-[#6b7c32] to-[#8ba446] text-white py-3 px-8 rounded-full text-lg font-bold transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105 flex items-center gap-2 mx-auto';
        btn.style.display = 'block';
        orderSection.querySelector('.max-w-xl').appendChild(btn);
        btn.onclick = async function () {
            try {
                const res = await fetch(apiUrl('user/check'), { credentials: 'include' });
                if (res.ok) {
                    ordersModal.classList.remove('hidden');
                    loadOrders();
                } else {
                    document.getElementById('auth-modal').classList.remove('hidden');
                }
            } catch {
                document.getElementById('auth-modal').classList.remove('hidden');
            }
        };
    }
    // جلب الطلبات وعرضها في مودال مع شريط جانبي
    async function loadOrders() {
        const ordersList = document.getElementById('orders-list');
        ordersList.innerHTML = '<div class="text-center text-gray-500 py-8">جاري تحميل الطلبات...</div>';
        try {
            const res = await fetch(apiUrl('order/myorders'), { credentials: 'include' });
            const orders = await res.json();
            if (Array.isArray(orders) && orders.length > 0) {
                let sidebar = `<div id="orders-sidebar" class="w-full md:w-1/3 max-h-[400px] overflow-y-auto border-l md:border-l-0 md:border-r border-gray-200 pr-2 md:pr-0 md:pl-2 flex-shrink-0 bg-[#f8f9fa] rounded-lg mb-4 md:mb-0">`;
                sidebar += orders.map((o, i) => `
        <div class="order-item cursor-pointer p-3 rounded-lg mb-2 flex items-center gap-2 transition hover:bg-[#e9ecef] ${i === 0 ? 'bg-[#e9ecef]' : ''}" data-index="${i}">
          <span class="text-[#6b7c32] font-bold">${o._id.slice(-6).toUpperCase()}</span>
          <span class="text-xs px-2 py-1 rounded-full ${getStatusColor(o.status)}">${o.status || 'قيد التنفيذ'}</span>
        </div>
      `).join('') + '</div>';
                let details = `<div id="order-details" class="flex-1">${renderOrderTimeline(orders[0])}</div>`;
                ordersList.innerHTML = `<div class="flex flex-col md:flex-row gap-4">${sidebar}${details}</div>`;
                document.querySelectorAll('.order-item').forEach(item => {
                    item.onclick = function () {
                        document.querySelectorAll('.order-item').forEach(i => i.classList.remove('bg-[#e9ecef]'));
                        this.classList.add('bg-[#e9ecef]');
                        const idx = +this.getAttribute('data-index');
                        document.getElementById('order-details').innerHTML = renderOrderTimeline(orders[idx]);
                    };
                });
            } else {
                ordersList.innerHTML = '<div class="text-center text-gray-500 py-8">لا توجد طلبات بعد.</div>';
            }
        } catch {
            ordersList.innerHTML = '<div class="text-center text-red-500 py-8">تعذر تحميل الطلبات.</div>';
        }
    }
    function getStatusColor(status) {
        if (status === 'تم التسليم' || status === 'تم التوصيل') return 'bg-green-100 text-green-700';
        if (status === 'جاري التوصيل') return 'bg-yellow-100 text-yellow-700';
        if (status === 'جاري التجهيز') return 'bg-blue-100 text-blue-700';
        return 'bg-gray-200 text-gray-700';
    }
    function renderOrderTimeline(order) {
        const steps = [
            { label: 'تم القبول', icon: '✅' },
            { label: 'جاري التجهيز', icon: '🛒' },
            { label: 'جاري التوصيل', icon: '🚚' },
            { label: 'تم التسليم', icon: '📦' }
        ];
        let currentStep = 0;
        if (order.status === 'جاري التجهيز') currentStep = 1;
        else if (order.status === 'جاري التوصيل') currentStep = 2;
        else if (order.status === 'تم التسليم' || order.status === 'تم التوصيل') currentStep = 3;
        const timeline = `
    <div class="flex flex-col md:flex-row items-center gap-4 md:gap-8 py-2">
      ${steps.map((step, i) => `
        <div class="flex flex-col items-center flex-1">
          <div class="w-10 h-10 flex items-center justify-center rounded-full text-2xl font-bold ${i < currentStep ? 'bg-green-200 text-green-700' : i === currentStep ? 'bg-yellow-300 text-yellow-900 border-2 border-yellow-500' : 'bg-gray-200 text-gray-400'}">
            ${step.icon}
          </div>
          <div class="mt-2 text-xs md:text-sm font-bold ${i === currentStep ? 'text-yellow-700' : i < currentStep ? 'text-green-700' : 'text-gray-400'}">${step.label}</div>
        </div>
        ${i < steps.length - 1 ? `<div class="flex-1 h-1 ${i < currentStep ? 'bg-green-400' : 'bg-gray-200'}"></div>` : ''}
      `).join('')}
    </div>
  `;
        return `
    <div class="bg-[#f8f9fa] rounded-lg p-4 shadow border-r-4 ${currentStep === 3 ? 'border-green-500' : currentStep === 2 ? 'border-yellow-400' : 'border-gray-400'} mb-2">
      <div class="font-bold text-lg text-[#6b7c32] flex items-center gap-2">طلب رقم: <span class="text-[#f4d03f]">${order._id.slice(-6).toUpperCase()}</span>
        </div>
      <div class="text-gray-700 mt-1">${order.address} - ${order.city}</div>
      <div class="text-gray-500 text-sm mt-1">بتاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG')}</div>
        <div class="text-gray-600 text-sm mt-1">السعر: <span class="text-[#f4d03f]">${order.price} جنيه</span></div>
      <div class="text-gray-600 text-sm">الكمية: ${order.quantity}</div>
      ${timeline}
    </div>
  `;
    }
    // Close modal when clicking outside of it
    window.addEventListener('click', function (event) {
        if (event.target === ordersModal) {
            ordersModal.classList.add('hidden');
        }
    });
})();
