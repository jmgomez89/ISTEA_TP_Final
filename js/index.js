document.addEventListener('DOMContentLoaded', async () => {
    
    updateCartBadge();

    await fetchProducts();

    if (window.location.pathname === '/' || window.location.pathname.endsWith('/index.html')) {

      renderProducts();

      searchInput.addEventListener('input', (e) => { 
          prop[0].style.display = 'none';
          const searchTerm = e.target.value;
          filterAndRenderProducts(searchTerm);
      });

    }


    //Menú Hamburguesa 
    hamburger.addEventListener('click', () => {
      hamburgerMenu.classList.add('active');
    });

    closeHamburgerMenu.addEventListener('click', () => {
      hamburgerMenu.classList.remove('active');
    });

    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('product-card-addbtn')) {
        const btn = e.target;
        
        const product = {
          id: btn.dataset.id,
          name: btn.dataset.name,
          price: parseFloat(btn.dataset.price),
          image: btn.dataset.image,
          stock: parseInt(btn.dataset.stock)
        };

        addToCart(product);
      }
    });



});



// Renderizado de productos


function cardProducts(products) {
    return `
        <div class="col">
            <div class="card h-100 border-0 shadow-sm product-card">
                <img src="${products.image}" class="card-img-top p-3" alt="${products.name}" style="height: 200px; object-fit: contain;">
                <div class="card-body d-flex flex-column text-center">
                    <h5 class="card-title fw-bold">${products.name}</h5>
                    <p class="card-text text-primary fs-5 fw-bold">${formatPrice(products.price)}.-</p>
                    
                    <div class="mt-auto d-grid gap-2">
                        <button class="btn btn-primary product-card-addbtn rounded-pill" 
                            data-id="${products.recordId}"
                            data-name="${products.name}"
                            data-price="${products.price}"
                            data-image="${products.image}"
                            data-stock="${products.stock}"
                            ${products.stock <= 0 ? 'disabled' : ''}>
                            ${products.stock <= 0 ? '❌ Sin stock' : '🛒 Agregar al Carrito'}
                        </button>
                        
                        <button class="btn btn-link text-decoration-none text-secondary btn-sm" 
                                onclick="openProductModal('${products.recordId}')">
                            🔍 Ver Detalles
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
}

function renderProducts() {

  productsContainer.innerHTML = products.map(cardProducts).join('');
} 

//Filtro de productos

function filterAndRenderProducts(searchTerm) {

  if (!searchTerm.trim()) {
    prop[0].style.display = 'block';
    renderProducts();
    return;
  };

  const term = searchTerm.toLowerCase();
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(term) || product.details.toLowerCase().includes(term)
  );

  if (filteredProducts.length === 0) {
    productsContainer.innerHTML = '<p class="no-results">No se encontraron productos.</p>';
  } else {
    productsContainer.innerHTML = filteredProducts.map(cardProducts).join('');
  }
}

function openProductModal(id) {
    const product = products.find(p => p.recordId === id);
    const modalContent = document.getElementById('product-detail');
    
    if (!product) return;

    modalContent.innerHTML = `
        <div class="modal-header border-0">
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body p-4">
            <div class="row align-items-center">
                <div class="col-md-6 text-center">
                    <img src="${product.image}" class="img-fluid rounded mb-3 mb-md-0" style="max-height: 300px;" alt="${product.name}">
                </div>
                <div class="col-md-6">
                    <h2 class="fw-bold">${product.name}</h2>
                    <p class="text-primary fs-3 fw-bold mb-3">${formatPrice(product.price)}.-</p>
                    <p class="text-muted mb-4">${product.details}</p>
                    <div class="d-grid">
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
    
    const myModal = new bootstrap.Modal(document.getElementById('productModal'));
    myModal.show();
}