
let crudModal;

document.addEventListener('DOMContentLoaded', async () => {
    crudModal = new bootstrap.Modal(document.getElementById('crudModal'));
    
    await fetchProducts();
    renderAdminProducts();

    // Abrir modal para nuevo producto
    document.getElementById('btn-product-create').addEventListener('click', () => {
        document.getElementById('crudModalTitle').textContent = "Nuevo Producto";
        document.getElementById('crud-form').reset();
        document.getElementById('image-preview-container').classList.add('hidden');
        delete document.getElementById('crud-form').dataset.recordId;
        crudModal.show();
    });

    // Manejo del formulario 
    document.getElementById('crud-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const form = e.target;
        const recordId = form.dataset.recordId;

        const productData = {
            name: document.getElementById('product-name').value.trim(),
            price: Number(document.getElementById('product-price').value),
            stock: Number(document.getElementById('product-stock').value),
            details: document.getElementById('product-details').value.trim(),
            image: document.getElementById('product-image').files[0]
        };

        try {
            showMessage('Procesando solicitud...', 'info');
            
            if (recordId) {
                
                const fields = {
                    Name: productData.name,
                    Price: productData.price,
                    Stock: productData.stock,
                    Details: productData.details
                };
                await updateProductInAirtable(recordId, fields);
                showMessage('Producto actualizado con éxito', 'success');
            } else {
                await submitCrudForm(productData);
                showMessage('Producto creado con éxito', 'success');
            }

            crudModal.hide();
            await fetchProducts();
            renderAdminProducts();
        } catch (error) {
            showMessage('Error en la operación: ' + error.message, 'error');
        }
    });
});

/**
 * Renderiza la tabla de administración
 */
function renderAdminProducts() {
    const tableBody = document.getElementById('admin-products-table');
    if (!tableBody) return;

    tableBody.innerHTML = products.map(p => `
        <tr>
            <td data-label="Imagen">
                <img src="${p.image}" class="rounded border shadow-sm" style="width: 50px; height: 50px; object-fit: cover;">
            </td>
            <td data-label="Producto">
                <div class="fw-bold text-dark text-md-start">${p.name}</div>
            </td>
            <td data-label="Precio" class="fw-bold">${formatPrice(p.price)}</td>
            <td data-label="Stock">
                <span class="badge ${p.stock < 5 ? 'bg-danger' : 'bg-secondary'}">${p.stock} unid.</span>
            </td>
            <td data-label="Acciones">
                <div class="d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-primary" onclick="handleEdit('${p.recordId}')">✏️</button>
                    <button class="btn btn-sm btn-danger" onclick="handleDelete('${p.recordId}')">🗑️</button>
                </div>
            </td>
        </tr>
    `).join('');
}

async function handleEdit(id) {
    const product = products.find(p => p.recordId === id);
    if (!product) return;

    const form = document.getElementById('crud-form');
    form.dataset.recordId = id;
    
    document.getElementById('crudModalTitle').textContent = "Editar Producto";
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-details').value = product.details;
    
    // Previsualización de imagen actual
    document.getElementById('image-preview').src = product.image;
    document.getElementById('image-preview-container').classList.remove('hidden');

    crudModal.show();
}

async function handleDelete(id) {
    if (confirm('¿Estás seguro de que deseas eliminar este producto? Esta acción no se puede deshacer.')) {
        try {
            await deleteProductFromAirtable(id);
            showMessage('Producto eliminado', 'success');
            await fetchProducts();
            renderAdminProducts();
        } catch (error) {
            showMessage('No se pudo eliminar: ' + error.message, 'error');
        }
    }
}