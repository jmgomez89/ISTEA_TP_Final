
document.addEventListener('DOMContentLoaded', () => {
    
    document.addEventListener('click', (e) => {
        const cart = getCart();

        // Lógica de botón (+)
        if (e.target.classList.contains('btn-cart-add-qty')) {
            const index = e.target.dataset.index;
            const item = cart[index];
            
            // Validar stock al aumentar
            if (item.quantity + 1 > item.stock) {
                showMessage(`Límite de stock alcanzado (${item.stock} unid.)`, 'warning');
                return;
            }
            item.quantity++;
            updateAndRefresh(cart);
        }

        // Lógica de botón (-)
        if (e.target.classList.contains('btn-cart-sub-qty')) {
            const index = e.target.dataset.index;
            const item = cart[index];
            
            if (item.quantity > 1) {
                item.quantity--;
                updateAndRefresh(cart);
            }
        }

        // Lógica de botón Eliminar 
        if (e.target.classList.contains('btn-cart-remove-item')) {
            const index = e.target.dataset.index;
            cart.splice(index, 1);
            updateAndRefresh(cart);
        }

        // Vaciar Carrito
        if (e.target.id === 'btn-empty-cart') {
            if(confirm('¿Estás seguro de que querés vaciar el carrito?')) {
                saveCart([]);
                renderCart();
                updateCartBadge();
            }
        }

        // Checkout
        if (e.target.id === 'btn-checkout') {
            showMessage('¡Gracias por tu compra! Procesando pedido...', 'success');
            saveCart([]); // Limpia localStorage
            setTimeout(() => {
                location.reload(); // Recarga 
            }, 2000);
        }
    });

    renderCart(); // Carga inicial
});

function updateAndRefresh(cart) {
    saveCart(cart);
    renderCart();
    updateCartBadge();
}

/**
 * Renderizado del carrito dentro del Sidebar 
 */
function renderCart() {
    const cart = getCart();
    const cartContainer = document.getElementById('cart');
    const cartInfo = document.getElementById('cart-info');
    const totalCartContainer = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-center text-muted py-5">Tu carrito está vacío.</p>';
        if(cartInfo) cartInfo.style.display = 'none';
        return;
    }

    if(cartInfo) cartInfo.style.display = 'block';
    
    let total = 0;
    let html = '';

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        
        html += `
        <div class="card mb-3 border-0 border-bottom pb-3">
            <div class="row g-0 align-items-center">
                <div class="col-3">
                    <img src="${item.image}" class="img-fluid rounded" alt="${item.name}">
                </div>
                <div class="col-9 ps-3">
                    <div class="d-flex justify-content-between">
                        <h6 class="fw-bold mb-1">${item.name}</h6>
                        <button class="btn btn-sm text-danger btn-cart-remove-item" data-index="${index}">🗑️</button>
                    </div>
                    <p class="small text-muted mb-2">Precio unit: ${formatPrice(item.price)}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-secondary btn-cart-sub-qty" data-index="${index}" ${item.quantity <= 1 ? 'disabled' : ''}>-</button>
                            <span class="btn btn-light disabled fw-bold">${item.quantity}</span>
                            <button class="btn btn-outline-secondary btn-cart-add-qty" data-index="${index}" ${item.quantity >= item.stock ? 'disabled' : ''}>+</button>
                        </div>
                        <span class="fw-bold text-dark">${formatPrice(itemTotal)}</span>
                    </div>
                </div>
            </div>
        </div>`;
    });

    cartContainer.innerHTML = html;
    if (totalCartContainer) {
        totalCartContainer.innerHTML = `
            <div class="d-flex justify-content-between fs-5 fw-bold">
                <span>Total:</span>
                <span class="text-primary">${formatPrice(total)}</span>
            </div>
        `;
    }
}