//Data


const productsContainer = document.getElementById('products-cards-grid');
const searchInput = document.getElementById('search-input');
const prop = document.getElementsByClassName('prop');
const hamburger = document.getElementById('hamburger');
const hamburgerMenu = document.getElementById('header-content-nav-hamburger');
const closeHamburgerMenu = document.getElementById('close-btn');
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));
const productDetailContainer = document.getElementById('product-detail');
const form = document.getElementById('contact-form');
const messageDiv = document.getElementById('form-message');
const buttonNew = document.getElementById('btn-product-create');
const buttonBack = document.getElementById('btn-product-cancel');
const sectionProducts = document.getElementById('products');
const crudForm = document.getElementById('crud-form');
const cartContainer = document.getElementById('cart');
const totalCart = document.getElementById('cart-total');
const cartInfo = document.getElementById('cart-info');


let editingRecordId = null;
let products = [];

const AIRTABLE_API_KEY = "pat3c8FaWrNy5AZoF.6b0864f4af38bf8285fe1e5deb9c73317dfcd1d33904e3388e7f266831a5e533";
const BASE_ID = "appnDqVrWQ7c1go0B";
const TABLE_NAME = "Products";
const CONTACT_TABLE_NAME = "Contact";
const BASE_ID_CONTACT = "appnDqVrWQ7c1go0B";
const IMGBB_API_KEY = "23f93f2bc52f0f1585aaff7f1efeccd0";

//Fetch de productos desde Airtable

async function fetchProducts() {
  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    products = data.records.map(record => {
      const fields = record.fields;
      return {
        recordId: record.id,
        stock: fields.Stock, 
        name: fields.Name || 'Sin nombre',
        price: fields.Price || 0,
        image: fields.Image && fields.Image[0] ? fields.Image[0].url : './img/placeholder.jpg',
        details: fields.Details || 'Sin descripción'
      };
    });


    return products;
  } catch (error) {
    console.error('Error al cargar productos desde Airtable:', error);
    products = []; 
  }
};



// Enviar mensaje de contacto a Airtable

async function submitContactForm(contactData) {
  try {
      const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID_CONTACT}/${CONTACT_TABLE_NAME}`, // ← nombre de tu tabla
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Name: contactData.name,
              LastName: contactData.lastName,
              Email: contactData.email,
              Phone: contactData.phone,
              Matter: contactData.matter,
              Message: contactData.message,
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Desconocido'}`);
      }

      return await response.json(); 
    }
    catch (error) {
      console.error('Error al enviar el formulario:', error);
      throw error;
    }

}

// Cargar productos en Airtable

async function submitCrudForm(productData) {
  let imageUrl = null;
  if (productData.image) {
    try {
      imageUrl = await uploadImageToImgBB(productData.image);
    } catch (uploadError) {
      console.error('Falló la subida de la imagen:', uploadError);
      throw new Error('No se pudo subir la imagen. Verifica el archivo e inténtalo de nuevo.');
    }
  }

  try {
      const response = await fetch(
        `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`, 
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            fields: {
              Name: productData.name,
              Price: Number(productData.price),
              Stock: Number(productData.stock),
              Image: imageUrl ? [{ url: imageUrl }] : [],
              Details: productData.details
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error ${response.status}: ${errorData.error?.message || 'Desconocido'}`);
      }

      return await response.json(); 
    }
    catch (error) {
      console.error('Error al enviar el formulario:', error);
      throw error;
    }

};


//Subir imagen a imgbb

async function uploadImageToImgBB(file) {
  if (!file) return null;

  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al subir imagen: ${errorData.error?.message || 'Desconocido'}`);
  }
  const result = await response.json();
  return result.data.url; 
};

//Eliminar producto de Airtable

async function deleteProductFromAirtable(recordId) {
  if (!recordId) {
    throw new Error('ID de registro no proporcionado');
  }

  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `Error ${response.status}`;
    throw new Error(`No se pudo eliminar el producto: ${message}`);
  }

  return;

};

//Traer info de Airtable para renderizar formulario


async function fetchProductFromAirtable(recordId) {
    if (!recordId) {
      throw new Error('ID de registro no proporcionado');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `Error ${response.status}`;
      throw new Error(`No se pudo cargar el producto: ${message}`);
    }

    const data = await response.json();
    return data.fields; 

};

//Actualizar producto en Airtable

async function updateProductInAirtable(recordId, fields) {
    if (!recordId) {
      throw new Error('ID de registro no proporcionado');
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}/${recordId}`,
      {
        method: 'PATCH', 
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fields })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `Error ${response.status}`;
      throw new Error(`No se pudo actualizar el producto: ${message}`);
    }

    return; 

};

//Mostrar mensaje


function showMessage(message, type) {
  const messageEl = document.getElementById('global-message');
  const types = ['success', 'warning', 'error'];
  if (!types.includes(type)) type = 'success';

  messageEl.classList.remove('hiding');
  messageEl.textContent = message;
  messageEl.className = `global-message ${type} show`;

  setTimeout(() => {
    messageEl.classList.add('hiding');
    setTimeout(() => {
      messageEl.classList.remove('show', 'hiding');
      messageEl.classList.add('hidden');
    }, 300); 
  }, 4000);
}

//Carrito de compras (localStorage)

  function getCart() {
    const data = localStorage.getItem('cart');
    return data ? JSON.parse(data) : [];
  };

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  };

  function updateCartBadge() {
    const cart = getCart();
    const total = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-badge').textContent = `🛒 (${total})`;
  };

  function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    if (existing.quantity + 1 > product.stock) {
      showMessage(`Solo hay ${product.stock} unidades disponibles de "${product.name}".`, 'warning');
      return;
    }
    existing.quantity += 1;
  } else {
    if (product.stock <= 0) {
      showMessage('Producto sin stock.', 'warning');
      return;
    }
    cart.push({ ...product, quantity: 1 });
  };

  saveCart(cart);
  updateCartBadge();
  showMessage(`${product.name} agregado al carrito.`, 'success');
};


//Formato de Precio

function formatPrice(price) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0
  }).format(price);
}