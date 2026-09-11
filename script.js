const SHOP_WHATSAPP_NUMBER = "201015263209"; // غيّره برقم صاحب المحل لما تتفقوا

// ---------- Language switcher ----------
const langBtn = document.getElementById('langBtn');
const htmlRoot = document.getElementById('htmlRoot');
let currentLang = 'ar';

langBtn.addEventListener('click', () => {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  applyLanguage();
});

async function applyLanguage() {
  const isAr = currentLang === 'ar';
  htmlRoot.setAttribute('lang', isAr ? 'ar' : 'en');
  htmlRoot.setAttribute('dir', isAr ? 'rtl' : 'ltr');
  langBtn.textContent = isAr ? 'EN' : 'AR';

  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = isAr ? el.dataset.ar : el.dataset.en;
  });

  await renderTrending();
  await renderProductsPage(getActiveFilter());
  renderCart();
  updateModalTotal();
}

function getActiveFilter() {
  const active = document.querySelector('.filter-btn.active');
  return active ? active.dataset.filter : 'all';
}

// ---------- Products rendering ----------
function productCardHTML(p) {
  const isAr = currentLang === 'ar';
  return `
    <div class="product-card" data-id="${p.id}" data-category="${p.category}" data-name-ar="${p.nameAr}" data-name-en="${p.nameEn}" data-price="${p.price}">
      <img src="${p.image}" alt="${p.nameEn}">
      <h3>${isAr ? p.nameAr : p.nameEn}</h3>
      <p class="price"><span class="price-num">${p.price}</span> ${isAr ? 'ج.م' : 'EGP'}</p>
      <button class="add-to-cart">${isAr ? 'أضف للسلة' : 'Add to Cart'}</button>
    </div>
  `;
}

async function renderTrending() {
  const grid = document.getElementById('trendingGrid');
  if (!grid) return;

  const cached = getCachedProducts();
  if (cached) {
    grid.innerHTML = cached.filter(p => p.trending).map(productCardHTML).join('');
    attachAddToCartListeners();
  } else {
    grid.innerHTML = `<p class="loading-state">${currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>`;
  }

  const fresh = (await getProducts()).filter(p => p.trending);
  grid.innerHTML = fresh.map(productCardHTML).join('');
  attachAddToCartListeners();
}

async function renderProductsPage(filter = 'all') {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  const cached = getCachedProducts();
  if (cached) {
    const filteredCached = filter === 'all' ? cached : cached.filter(p => p.category === filter);
    grid.innerHTML = filteredCached.map(productCardHTML).join('');
    attachAddToCartListeners();
  } else {
    grid.innerHTML = `<p class="loading-state">${currentLang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>`;
  }

  const all = await getProducts();
  const filtered = filter === 'all' ? all : all.filter(p => p.category === filter);
  grid.innerHTML = filtered.map(productCardHTML).join('');
  attachAddToCartListeners();
}

function attachAddToCartListeners() {
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.product-card');
      const nameAr = card.dataset.nameAr;
      const nameEn = card.dataset.nameEn;
      const price = Number(card.dataset.price);

      const existing = cart.find(item => item.nameAr === nameAr);
      if (existing) {
        existing.qty++;
      } else {
        cart.push({ nameAr, nameEn, price, qty: 1 });
      }

      renderCart();
      openCart();
    });
  });
}

// ---------- Cart ----------
const cartBtn = document.getElementById('cartBtn');
const closeCartBtn = document.getElementById('closeCart');
const cartDrawer = document.getElementById('cartDrawer');
const cartOverlay = document.getElementById('cartOverlay');
const cartItemsEl = document.getElementById('cartItems');
const cartCountEl = document.getElementById('cartCount');
const cartTotalEl = document.getElementById('cartTotal');

let cart = [];

function openCart() {
  cartDrawer.classList.add('active');
  cartOverlay.classList.add('active');
}

function closeCartDrawer() {
  cartDrawer.classList.remove('active');
  cartOverlay.classList.remove('active');
}

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCartDrawer);
cartOverlay.addEventListener('click', closeCartDrawer);

function renderCart() {
  const isAr = currentLang === 'ar';
  const currency = isAr ? 'ج.م' : 'EGP';

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="empty-cart">${isAr ? 'السلة فارغة' : 'Cart is empty'}</p>`;
    cartCountEl.textContent = '0';
    cartTotalEl.textContent = `0 ${currency}`;
    return;
  }

  cartItemsEl.innerHTML = cart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-info">
        <h4>${isAr ? item.nameAr : item.nameEn}</h4>
        <span>${item.price} ${currency} × ${item.qty}</span>
      </div>
      <button class="remove-item" data-index="${index}">✕</button>
    </div>
  `).join('');

  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);

  cartCountEl.textContent = totalQty;
  cartTotalEl.textContent = `${totalPrice} ${currency}`;

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      cart.splice(Number(btn.dataset.index), 1);
      renderCart();
      updateModalTotal();
    });
  });
}

// ---------- Checkout modal ----------
const checkoutOverlay = document.getElementById('checkoutOverlay');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutBtn = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const addressField = document.getElementById('addressField');
const custAddress = document.getElementById('custAddress');
const modalTotalEl = document.getElementById('modalTotal');
const checkoutBtn = document.querySelector('.checkout-btn');

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert(currentLang === 'ar' ? 'السلة فارغة، ضيف منتج الأول' : 'Cart is empty, add a product first');
    return;
  }
  openCheckoutModal();
});

function openCheckoutModal() {
  updateModalTotal();
  checkoutModal.classList.add('active');
  checkoutOverlay.classList.add('active');
}

function closeCheckoutModal() {
  checkoutModal.classList.remove('active');
  checkoutOverlay.classList.remove('active');
}

closeCheckoutBtn.addEventListener('click', closeCheckoutModal);
checkoutOverlay.addEventListener('click', closeCheckoutModal);

document.querySelectorAll('input[name="deliveryMethod"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isDelivery = document.querySelector('input[name="deliveryMethod"]:checked').value === 'delivery';
    addressField.classList.toggle('hidden', !isDelivery);
    custAddress.required = isDelivery;
    updateModalTotal();
  });
});

function updateModalTotal() {
  if (!modalTotalEl) return;
  const isAr = currentLang === 'ar';
  const currency = isAr ? 'ج.م' : 'EGP';
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked')?.value || 'delivery';
  const deliveryFee = deliveryMethod === 'delivery' ? 30 : 0;
  modalTotalEl.textContent = `${cartTotal + deliveryFee} ${currency}`;
}

function buildWhatsAppMessage(order) {
  const lines = [
    `📦 طلب جديد`,
    `الاسم: ${order.name}`,
    `التليفون: ${order.phone}`,
    order.address ? `العنوان: ${order.address}` : `الاستلام: من المحل`,
    `التوصيل: ${order.delivery === 'delivery' ? 'توصيل' : 'استلام من المحل'}`,
    `الدفع: ${order.payment === 'cash' ? 'نقدي' : 'محفظة إلكترونية'}`,
    ``,
    `المنتجات:`,
    ...order.items.map(i => `- ${i.nameAr} × ${i.qty}`),
    ``,
    `الإجمالي: ${order.total} ج.م`
  ];
  return lines.join('\n');
}

checkoutForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = checkoutForm.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = currentLang === 'ar' ? 'جاري الإرسال...' : 'Sending...';

  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
  const deliveryFee = deliveryMethod === 'delivery' ? 30 : 0;
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const order = {
    name: document.getElementById('custName').value,
    phone: document.getElementById('custPhone').value,
    address: deliveryMethod === 'delivery' ? custAddress.value : '',
    delivery: deliveryMethod,
    payment: paymentMethod,
    items: [...cart],
    total: cartTotal + deliveryFee,
    date: new Date().toISOString(),
    status: 'pending'
  };

  try {
    await addOrder(order);

    const waLink = `https://wa.me/${SHOP_WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage(order))}`;
    window.open(waLink, '_blank');

    cart = [];
    renderCart();
    closeCheckoutModal();
    closeCartDrawer();
    checkoutForm.reset();
  } catch (err) {
    alert(currentLang === 'ar' ? 'حصل خطأ، حاول تاني' : 'Something went wrong, try again');
    console.error(err);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = currentLang === 'ar' ? 'تأكيد الطلب' : 'Confirm Order';
  }
});

// ---------- Filter (products.html only) ----------
const filterBtns = document.querySelectorAll('.filter-btn');
if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      await renderProductsPage(btn.dataset.filter);
    });
  });
}

// ---------- Init ----------
renderTrending();
renderProductsPage();
renderCart();