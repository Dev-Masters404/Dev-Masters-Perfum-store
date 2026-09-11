const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbxF-aEbSIG21EaagnSy4brtihMUMc9Xdxri_GxtMQyj0CXWrCrKjkqKEVCt0z1MWTzt/exec";

function jsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonpCallback_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
    const script = document.createElement('script');

    window[callbackName] = (data) => {
      resolve(data);
      document.body.removeChild(script);
      delete window[callbackName];
    };

    script.onerror = () => reject(new Error('JSONP request failed'));
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function getCachedProducts() {
  const cached = localStorage.getItem('cachedProducts');
  return cached ? JSON.parse(cached) : null;
}

function setCachedProducts(products) {
  localStorage.setItem('cachedProducts', JSON.stringify(products));
}

async function getProducts() {
  const data = await jsonp(`${WEBHOOK_URL}?action=getProducts`);
  const products = data.map(p => ({
    ...p,
    id: String(p.id),
    price: Number(p.price),
    trending: p.trending === true || p.trending === 'TRUE' || p.trending === 'true'
  }));
  setCachedProducts(products);
  return products;
}

async function saveProduct(product) {
  const id = product.id || String(Date.now());
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'addProduct', ...product, id })
  });
  return id;
}

async function deleteProduct(id) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'deleteProduct', id })
  });
}

async function getOrders() {
  const data = await jsonp(`${WEBHOOK_URL}?action=getOrders`);
  return data.reverse();
}

async function addOrder(order) {
  const id = String(Date.now());
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'addOrder', ...order, id })
  });
  return id;
}

async function updateOrderStatus(id, status) {
  await fetch(WEBHOOK_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ action: 'updateOrderStatus', id, status })
  });
}