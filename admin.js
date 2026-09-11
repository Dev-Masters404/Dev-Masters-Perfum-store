const ADMIN_PASSWORD = "admin123";

const loginScreen = document.getElementById('loginScreen');
const dashboard = document.getElementById('dashboard');
const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const pass = document.getElementById('adminPassword').value;
  if (pass === ADMIN_PASSWORD) {
    sessionStorage.setItem('adminAuth', 'true');
    showDashboard();
  } else {
    loginError.textContent = 'كلمة السر غلط';
  }
});

if (sessionStorage.getItem('adminAuth') === 'true') {
  showDashboard();
}

function showDashboard() {
  loginScreen.classList.add('hidden');
  dashboard.classList.remove('hidden');
  renderOrders();
  renderAdminProducts();
}

document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.toggle('hidden', sec.id !== target);
    });
  });
});

// ---------- Orders ----------
let orderStatusFilter = 'all';

async function renderOrders() {
  const container = document.getElementById('ordersList');
  container.innerHTML = '<p class="empty-state">جاري التحميل...</p>';

  const allOrders = await getOrders();
  const orders = orderStatusFilter === 'all'
    ? allOrders
    : allOrders.filter(o => o.status === orderStatusFilter);

  if (orders.length === 0) {
    container.innerHTML = '<p class="empty-state">لا يوجد طلبات حتى الآن</p>';
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="order-card ${order.status === 'completed' ? 'order-completed' : ''}">
      <div class="order-header">
        <strong>${order.name}</strong>
        <span>${new Date(order.date).toLocaleString('ar-EG')}</span>
      </div>
      <span class="status-badge ${order.status === 'completed' ? 'status-completed' : 'status-pending'}">
        ${order.status === 'completed' ? '✅ تم التنفيذ' : '⏳ قيد التنفيذ'}
      </span>
      <p>📞 ${order.phone}</p>
      ${order.address ? `<p>📍 ${order.address}</p>` : ''}
      <p>${order.delivery} | ${order.payment}</p>
      <p class="order-items-raw">${order.items}</p>
      <div class="order-total">الإجمالي: ${order.total} ج.م</div>
      <button class="toggle-status-btn" data-id="${order.id}" data-status="${order.status}">
        ${order.status === 'completed' ? 'رجّع قيد التنفيذ' : 'تأكيد التنفيذ'}
      </button>
    </div>
  `).join('');

  document.querySelectorAll('.toggle-status-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const current = btn.dataset.status;
      const newStatus = current === 'completed' ? 'pending' : 'completed';
      btn.disabled = true;
      await updateOrderStatus(id, newStatus);
      renderOrders();
    });
  });
}

document.querySelectorAll('.order-filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.order-filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    orderStatusFilter = btn.dataset.status;
    renderOrders();
  });
});

// ---------- Products ----------
async function renderAdminProducts() {
  const container = document.getElementById('adminProductsList');
  container.innerHTML = '<p class="empty-state">جاري التحميل...</p>';

  const products = await getProducts();
  container.innerHTML = products.map(p => `
    <div class="admin-product-row">
      <img src="${p.image}" alt="${p.nameAr}">
      <div class="admin-product-info">
        <strong>${p.nameAr}</strong>
        <span>${p.price} ج.م - ${categoryLabel(p.category)}${p.trending ? ' ⭐ رائج' : ''}</span>
      </div>
      <button class="delete-btn" data-id="${p.id}">حذف</button>
    </div>
  `).join('');

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      btn.disabled = true;
      await deleteProduct(btn.dataset.id);
      renderAdminProducts();
    });
  });
}

function categoryLabel(cat) {
  return { men: 'رجالي', women: 'حريمي', unisex: 'يونيسكس' }[cat] || cat;
}

document.getElementById('addProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;

  const newProduct = {
    nameAr: document.getElementById('newNameAr').value,
    nameEn: document.getElementById('newNameEn').value,
    price: Number(document.getElementById('newPrice').value),
    category: document.getElementById('newCategory').value,
    image: document.getElementById('newImage').value || 'images/perfume1.jpg',
    trending: document.getElementById('newTrending').checked
  };

  await saveProduct(newProduct);
  await renderAdminProducts();
  e.target.reset();
  submitBtn.disabled = false;
});