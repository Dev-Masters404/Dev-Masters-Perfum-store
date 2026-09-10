const DEFAULT_PRODUCTS = [
  { id: 1, nameAr: "ديور سوفاج", nameEn: "Dior Sauvage", price: 1200, category: "men", image: "images/perfume1.jpg", trending: true },
  { id: 2, nameAr: "شانيل بلو", nameEn: "Chanel Bleu", price: 1500, category: "men", image: "images/perfume2.jpg", trending: true },
  { id: 3, nameAr: "توم فورد", nameEn: "Tom Ford", price: 1800, category: "unisex", image: "images/perfume3.jpg", trending: false },
  { id: 4, nameAr: "فيرساتشي", nameEn: "Versace", price: 1000, category: "women", image: "images/perfume4.jpg", trending: false },
  { id: 5, nameAr: "لانكوم لافي", nameEn: "Lancôme La Vie", price: 1400, category: "women", image: "images/perfume5.jpg", trending: true },
  { id: 6, nameAr: "جوتشي بلوم", nameEn: "Gucci Bloom", price: 1300, category: "unisex", image: "images/perfume6.jpg", trending: false }
];

function getProducts() {
  const stored = localStorage.getItem('products');
  if (!stored) {
    localStorage.setItem('products', JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(stored);
}

function saveProducts(products) {
  localStorage.setItem('products', JSON.stringify(products));
}

function getOrders() {
  const stored = localStorage.getItem('orders');
  return stored ? JSON.parse(stored) : [];
}

function saveOrders(orders) {
  localStorage.setItem('orders', JSON.stringify(orders));
}

function addOrder(order) {
  const orders = getOrders();
  orders.unshift(order);
  saveOrders(orders);
}
function updateOrderStatus(orderId, newStatus) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (order) {
    order.status = newStatus;
    saveOrders(orders);
  }
}