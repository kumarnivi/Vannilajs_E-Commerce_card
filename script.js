let products = JSON.parse(localStorage.getItem('products')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

const productsContainer = document.getElementById('products');
const cartItemsContainer = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const productForm = document.getElementById('product-form');

function renderProducts() {
  productsContainer.innerHTML = '';
  products.forEach((product, index) => {
    const isOutOfStock = product.stock <= 0;
    productsContainer.innerHTML += `
      <div class="bg-white p-4 rounded shadow">
        <img src="${product.image}" class="h-40 w-full object-cover rounded mb-2" alt="${product.name}" />
        <h3 class="text-xl font-semibold">${product.name}</h3>
        <p class="text-gray-700 mb-1">$${product.price}</p>
        <p class="text-sm text-gray-600 mb-2">Stock: ${product.stock}</p>
        <button onclick="addToCart(${index})"
          class="mt-2 bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-50"
          ${isOutOfStock ? 'disabled' : ''}>
          ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    `;
  });
}

function renderCart() {
  cartItemsContainer.innerHTML = '';
  let total = 0;
  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    cartItemsContainer.innerHTML += `
      <li class="flex justify-between items-center bg-gray-100 p-2 rounded">
        <div>
          <strong>${item.name}</strong> ($${item.price}) × 
          <input type="number" min="1" value="${item.quantity}" onchange="updateQuantity(${index}, this.value)"
                 class="w-16 ml-1 border rounded px-1" />
        </div>
        <button onclick="removeFromCart(${index})" class="text-red-500 hover:underline">Remove</button>
      </li>
    `;
  });
  cartTotal.textContent = total;
}

function addToCart(productIndex) {
  const product = products[productIndex];

  if (product.stock <= 0) {
    alert("Out of stock!");
    return;
  }

  const existing = cart.find(item => item.name === product.name);
  if (existing) {
    if (existing.quantity < product.stock) {
      existing.quantity += 1;
      products[productIndex].stock -= 1;
    } else {
      alert("Not enough stock available.");
      return;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
    products[productIndex].stock -= 1;
  }

  saveCart();
  saveProducts();
  renderProducts();
  renderCart();
}

function removeFromCart(index) {
  const item = cart[index];
  const productIndex = products.findIndex(p => p.name === item.name);
  if (productIndex !== -1) {
    products[productIndex].stock += item.quantity;
  }

  cart.splice(index, 1);
  saveCart();
  saveProducts();
  renderProducts();
  renderCart();
}

function updateQuantity(index, quantity) {
  const qty = parseInt(quantity);
  const cartItem = cart[index];
  const productIndex = products.findIndex(p => p.name === cartItem.name);
  const product = products[productIndex];

  if (qty <= 0) return;

  const stockAvailable = product.stock + cartItem.quantity;

  if (qty > stockAvailable) {
    alert("Not enough stock!");
    return;
  }

  const difference = qty - cartItem.quantity;
  cartItem.quantity = qty;
  products[productIndex].stock -= difference;

  saveCart();
  saveProducts();
  renderProducts();
  renderCart();
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function saveProducts() {
  localStorage.setItem('products', JSON.stringify(products));
}

function purchase() {
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }
  alert('Thank you for your purchase!');
  cart = [];
  saveCart();
  renderCart();
}

productForm.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('product-name').value;
  const price = parseFloat(document.getElementById('product-price').value);
  const stock = parseInt(document.getElementById('product-stock').value);
  const imageInput = document.getElementById('product-image');
  const reader = new FileReader();

  reader.onload = function () {
    const image = reader.result;
    products.push({ name, price, stock, image });
    saveProducts();
    renderProducts();
    productForm.reset();
  };

  if (imageInput.files[0]) {
    reader.readAsDataURL(imageInput.files[0]);
  } else {
    alert("Please select an image.");
  }
});

// Initial Render
renderProducts();
renderCart();
