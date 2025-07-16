
/**
 * Variables globales
 */
let carrito = [];
const panelCarrito = document.getElementById('panel-carrito');
const overlay = document.getElementById('overlay');
const itemsCarritoElement = document.getElementById('items-carrito');
const contadorCarrito = document.getElementById('contador-carrito');
const totalPrecioElement = document.getElementById('total-precio');
const botonesFiltroCategorias = document.querySelectorAll('.boton-filtro');
const gridProductos = document.getElementById('productos');

/**
 * Inicialización cuando el DOM está cargado
 */
document.addEventListener('DOMContentLoaded', () => {
    initCarrito();
    setupEventListeners();
    
    // Escuchar eventos de actualización desde otras pestañas
    window.addEventListener('storage', syncCarritoFromStorage);
});

/**
 * Inicializa el carrito desde sessionStorage
 */
function initCarrito() {
    const carritoGuardado = sessionStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
    }
    actualizarCarritoUI();
    
    // Disparar evento inicial para otras páginas
    dispatchCarritoEvent();
}

/**
 * Configura los event listeners
 */
function setupEventListeners() {
    // Botones "Agregar al carrito"
    const botonesAgregar = document.querySelectorAll('.agregar-carrito');
    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', agregarAlCarrito);
    });
    
    // Carrito
    if (document.getElementById('carrito-btn')) {
        document.getElementById('carrito-btn').addEventListener('click', abrirCarrito);
    }
    if (document.getElementById('cerrar-carrito')) {
        document.getElementById('cerrar-carrito').addEventListener('click', cerrarCarrito);
    }
    if (overlay) {
        overlay.addEventListener('click', cerrarCarrito);
    }
    
    // Filtros
    if (botonesFiltroCategorias) {
        botonesFiltroCategorias.forEach(boton => {
            boton.addEventListener('click', filtrarProductos);
        });
    }
    
    // Acciones del carrito
    if (document.getElementById('vaciar-carrito')) {
        document.getElementById('vaciar-carrito').addEventListener('click', vaciarCarrito);
    }
    if (document.getElementById('finalizar-compra')) {
        document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);
    }
    if (document.getElementById('continuar-checkout')) {
        document.getElementById('continuar-checkout').addEventListener('click', redirigirACheckout);
    }
}

/**
 * Agrega un producto al carrito
 */
function agregarAlCarrito(evento) {
    const boton = evento.currentTarget;
    const id = boton.dataset.id;
    const nombre = boton.dataset.nombre;
    const precio = parseFloat(boton.dataset.precio);
    
    // Verificar si el producto ya está en el carrito
    const productoExistente = carrito.find(item => item.id === id);
    
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({
            id: id,
            nombre: nombre,
            precio: precio,
            cantidad: 1
        });
    }
    
    guardarCarrito();
    actualizarCarritoUI();
    mostrarMensaje(`${nombre} agregado al carrito`);
}

/**
 * Guarda el carrito en sessionStorage y sincroniza
 */
function guardarCarrito() {
    sessionStorage.setItem('carrito', JSON.stringify(carrito));
    dispatchCarritoEvent();
}

/**
 * Dispara evento personalizado para sincronizar el carrito
 */
function dispatchCarritoEvent() {
    const evento = new CustomEvent('carritoActualizado', {
        detail: { carrito: carrito }
    });
    document.dispatchEvent(evento);
}

/**
 * Sincroniza el carrito desde sessionStorage (para otras pestañas)
 */
function syncCarritoFromStorage(event) {
    if (event.key === 'carrito') {
        carrito = JSON.parse(event.newValue) || [];
        actualizarCarritoUI();
    }
}

/**
 * Actualiza la interfaz del carrito
 */
function actualizarCarritoUI() {
    // Actualizar contador
    const totalItems = carrito.reduce((total, item) => total + item.cantidad, 0);
    if (contadorCarrito) {
        contadorCarrito.textContent = totalItems;
    }
    
    // Actualizar items del carrito
    if (itemsCarritoElement) {
        itemsCarritoElement.innerHTML = '';
        
        if (carrito.length === 0) {
            itemsCarritoElement.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
            if (totalPrecioElement) {
                totalPrecioElement.textContent = 'S/0.00';
            }
            return;
        }
        
        carrito.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-carrito';
            itemElement.innerHTML = `
                <img src="${obtenerImagenProducto(item.id)}" alt="${item.nombre}">
                <div class="item-info">
                    <div class="item-nombre">${item.nombre}</div>
                    <div class="item-precio">S/ ${item.precio.toFixed(2)}</div>
                </div>
                <div class="item-cantidad">
                    <button class="cantidad-btn restar" data-id="${item.id}">-</button>
                    <span class="cantidad-valor">${item.cantidad}</span>
                    <button class="cantidad-btn sumar" data-id="${item.id}">+</button>
                </div>
                <button class="eliminar-item" data-id="${item.id}">🗑️</button>
            `;
            
            if (itemsCarritoElement) {
                itemsCarritoElement.appendChild(itemElement);
            }
            
            // Event listeners para los botones de cantidad
            const restarBtn = itemElement.querySelector('.restar');
            const sumarBtn = itemElement.querySelector('.sumar');
            const eliminarBtn = itemElement.querySelector('.eliminar-item');
            
            if (restarBtn) restarBtn.addEventListener('click', () => modificarCantidad(item.id, -1));
            if (sumarBtn) sumarBtn.addEventListener('click', () => modificarCantidad(item.id, 1));
            if (eliminarBtn) eliminarBtn.addEventListener('click', () => eliminarItem(item.id));
        });
    }
    
    // Actualizar precio total
    if (totalPrecioElement) {
        const total = carrito.reduce((suma, item) => suma + (item.precio * item.cantidad), 0);
        totalPrecioElement.textContent = `S/ ${total.toFixed(2)}`;
    }
}

/**
 * Obtiene la imagen del producto según su ID
 */
function obtenerImagenProducto(id) {
        switch(Number(id)) {
            case 1: return '../imagenes/articulo_basquet.jpg';
            case 2: return '../imagenes/camiseta.jpeg';
            case 3: return '../imagenes/zapatillas1.jpeg';
            case 4: return '../imagenes/guantes.avif';
            case 5: return '../imagenes/protector1.jpeg';
            case 6: return '../imagenes/vendas1.jpg';
            case 7: return '../imagenes/aerobics.jpg';
            case 8: return '../imagenes/bandas1.jpeg';
            default: return '../imagenes/pesas.avif';
        }
    }

/**
 * Modifica la cantidad de un producto en el carrito
 */
function modificarCantidad(id, cambio) {
    const index = carrito.findIndex(item => item.id === id);
    
    if (index !== -1) {
        carrito[index].cantidad += cambio;
        
        if (carrito[index].cantidad <= 0) {
            eliminarItem(id);
            return;
        }
        
        guardarCarrito();
        actualizarCarritoUI();
    }
}

/**
 * Elimina un producto del carrito
 */
function eliminarItem(id) {
    carrito = carrito.filter(item => item.id !== id);
    guardarCarrito();
    actualizarCarritoUI();
    mostrarMensaje('Producto eliminado del carrito');
}

/**
 * Abre el panel del carrito
 */
function abrirCarrito() {
    if (panelCarrito) panelCarrito.classList.add('activo');
    if (overlay) overlay.classList.add('activo');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el panel del carrito
 */
function cerrarCarrito() {
    if (panelCarrito) panelCarrito.classList.remove('activo');
    if (overlay) overlay.classList.remove('activo');
    document.body.style.overflow = '';
}

/**
 * Vacía el carrito
 */
function vaciarCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
        carrito = [];
        guardarCarrito();
        actualizarCarritoUI();
        mostrarMensaje('Carrito vaciado con éxito');
    }
}

/**
 * Finaliza la compra
 */
function finalizarCompra() {
    if (carrito.length === 0) {
        mostrarMensaje('Tu carrito está vacío', 'error');
        return;
    }
    
    // Redirigir a la página de checkout
    window.location.href = 'metodo-de-pago.html';
}

/**
 * Redirige a la página de checkout
 */
function redirigirACheckout() {
    if (carrito.length === 0) {
        mostrarMensaje('Tu carrito está vacío', 'error');
        return;
    }
    window.location.href = 'metodo-de-pago.html';
}

/**
 * Filtra los productos por categoría
 */
function filtrarProductos(evento) {
    const boton = evento.currentTarget;
    const categoria = boton.dataset.categoria;
    
    if (botonesFiltroCategorias && gridProductos) {
        botonesFiltroCategorias.forEach(btn => {
            btn.classList.remove('activo');
        });
        boton.classList.add('activo');
        
        const productos = gridProductos.querySelectorAll('.producto');
        
        productos.forEach(producto => {
            if (categoria === 'todos' || producto.dataset.categoria === categoria) {
                producto.style.display = 'block';
            } else {
                producto.style.display = 'none';
            }
        });
    }
}

/**
 * Muestra un mensaje temporal
 */
function mostrarMensaje(texto, tipo = 'exito') {
    const mensaje = document.createElement('div');
    mensaje.className = `mensaje-confirmacion ${tipo}`;
    mensaje.textContent = texto;
    
    // Estilos del mensaje
    mensaje.style.position = 'fixed';
    mensaje.style.top = '20px';
    mensaje.style.right = '20px';
    mensaje.style.padding = '12px 20px';
    mensaje.style.borderRadius = 'var(--borde-radio-pequeno)';
    mensaje.style.zIndex = '1100';
    mensaje.style.opacity = '0';
    mensaje.style.transform = 'translateY(-20px)';
    mensaje.style.transition = 'opacity 0.3s, transform 0.3s';
    mensaje.style.boxShadow = 'var(--sombra-media)';
    
    // Color según tipo
    if (tipo === 'exito') {
        mensaje.style.backgroundColor = 'var(--color-exito)';
        mensaje.style.color = 'white';
    } else if (tipo === 'error') {
        mensaje.style.backgroundColor = 'var(--color-alerta)';
        mensaje.style.color = 'white';
    } else {
        mensaje.style.backgroundColor = 'var(--color-primario)';
        mensaje.style.color = 'white';
    }
    
    document.body.appendChild(mensaje);
    
    // Mostrar animación
    setTimeout(() => {
        mensaje.style.opacity = '1';
        mensaje.style.transform = 'translateY(0)';
    }, 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        mensaje.style.opacity = '0';
        mensaje.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(mensaje);
        }, 300);
    }, 3000);
}