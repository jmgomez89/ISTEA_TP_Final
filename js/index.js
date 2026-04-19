
document.addEventListener('DOMContentLoaded', async () => {
    
    // Inicialización
    updateCartBadge();
    await fetchProducts();

    // Solo renderizamos si estamos en el index
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        renderProducts();

        if (searchInput) {
            searchInput.addEventListener('input', (e) => { 
                if(prop && prop[0]) prop[0].style.display = 'none';
                filterAndRenderProducts(e.target.value);
            });
        }
    }


    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.product-card-addbtn');
        
        if (btn) {
            const product = {
                id: btn.dataset.id,
                name: btn.dataset.name,
                price: parseFloat(btn.dataset.price),
                image: btn.dataset.image,
                stock: parseInt(btn.dataset.stock)
            };


            addToCart(product);

           
            if (typeof renderCart === 'function') {
                renderCart();
                
                
                const cartSidebarEl = document.getElementById('cartSidebar');
                const bsOffcanvas = bootstrap.Offcanvas.getInstance(cartSidebarEl) || new bootstrap.Offcanvas(cartSidebarEl);
                bsOffcanvas.show();
            }
        }
    });
});


function cardProducts(product) {
    return `
        <div class="col">
            <div class="card h-100 border-0 shadow-sm product-card">
                <img src="${product.image}" class="card-img-top p-3" alt="${product.name}" style="height: 200px; object-fit: contain;">
                <div class="card-body d-flex flex-column text-center">
                    <h5 class="card-title fw-bold">${product.name}</h5>
                    <p class="card-text text-primary fs-5 fw-bold">${formatPrice(product.price)}.-</p>
                    
                    <div class="mt-auto d-grid gap-2">
                        <button class="btn btn-primary product-card-addbtn rounded-pill" 
                            data-id="${product.recordId}"
                            data-name="${product.name}"
                            data-price="${product.price}"
                            data-image="${product.image}"
                            data-stock="${product.stock}"
                            ${product.stock <= 0 ? 'disabled' : ''}>
                            ${product.stock <= 0 ? '❌ Sin stock' : '🛒 Agregar al Carrito'}
                        </button>
                        
                        <button class="btn btn-link text-decoration-none text-secondary btn-sm" 
                                onclick="openProductModal('${product.recordId}')">
                            🔍 Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderProducts() {
    if (productsContainer) {
        productsContainer.innerHTML = products.map(cardProducts).join('');
    }
} 

function filterAndRenderProducts(searchTerm) {
    const term = searchTerm.toLowerCase();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(term) || p.details.toLowerCase().includes(term)
    );
    
    if (productsContainer) {
        productsContainer.innerHTML = filtered.length > 0 
            ? filtered.map(cardProducts).join('') 
            : '<p class="text-center w-100 py-5">No se encontraron productos.</p>';
    }
}


function openProductModal(id) {
    const product = products.find(p => p.recordId === id);
    const modalContent = document.getElementById('product-detail');
    
    if (!product || !modalContent) return;

    modalContent.innerHTML = `
        <div class="modal-header border-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
            <div class="row align-items-center">
                <div class="col-md-5 text-center">
                    <img src="${product.image}" class="img-fluid rounded shadow-sm mb-3" alt="${product.name}">
                </div>
                <div class="col-md-7">
                    <h2 class="fw-bold">${product.name}</h2>
                    <p class="text-primary fs-3 fw-bold mb-3">${formatPrice(product.price)}.-</p>
                    <hr>
                    <p class="text-muted">${product.details}</p>
                    <p class="small text-secondary">Stock disponible: ${product.stock} unidades</p>
                    <div class="d-grid mt-4">
                        <button class="btn btn-primary btn-lg product-card-addbtn" 
                                data-id="${product.recordId}"
                                data-name="${product.name}"
                                data-price="${product.price}"
                                data-image="${product.image}"
                                data-stock="${product.stock}"
                                data-bs-dismiss="modal"
                                ${product.stock <= 0 ? 'disabled' : ''}>
                            ${product.stock <= 0 ? 'Sin Stock' : '🛒 Agregar al Carrito'}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    
    const modalEl = document.getElementById('productModal');
    const myModal = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    myModal.show();
}