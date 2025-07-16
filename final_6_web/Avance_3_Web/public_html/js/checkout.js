// checkout.js - Validación mejorada para campos requeridos y generación de factura
document.addEventListener("DOMContentLoaded", function () {
  // ========== CONFIGURACIÓN INICIAL ==========
  const COSTO_ENVIO = 5.99;
  let pasoActual = 1;
  let carrito = [];
  let pedidoConfirmado = false;

  // Imágenes de productos
  const IMAGENES = {
    ARTICULO_BASQUET: '../imagenes/articulo_basquet.jpg',
    CAMISETA: '../imagenes/camiseta.jpeg',
    ZAPATILLAS1: '../imagenes/zapatillas1.jpeg',
    GUANTES: '../imagenes/guantes.avif',
    PROTECTOR1: '../imagenes/protector1.jpeg',
    VENDAS1: '../imagenes/vendas1.jpg',
    AEROBICS: '../imagenes/aerobics.jpg',
    BANDAS1: '../imagenes/bandas1.jpeg',
    PESAS: '../imagenes/pesas.avif'
  };

  // ========== INICIALIZACIÓN ==========
  function inicializar() {
    carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
    configurarEventos();
    mostrarResumenCarrito();
    mostrarPaso(1);
  }

  // ========== CONFIGURACIÓN DE EVENTOS ==========
  function configurarEventos() {
    // Botones de navegación
    document.getElementById("siguiente-pago")?.addEventListener("click", irAPago);
    document.getElementById("volver-envio")?.addEventListener("click", () => mostrarPaso(1));
    document.getElementById("siguiente-confirmacion")?.addEventListener("click", irAConfirmacion);
    document.getElementById("volver-pago")?.addEventListener("click", () => mostrarPaso(2));
    document.getElementById("confirmar-pedido")?.addEventListener("click", finalizarCompra);
    document.getElementById("descargar-factura")?.addEventListener("click", generarFactura);
    document.getElementById("volver-tienda")?.addEventListener("click", () => {
      window.location.href = 'articulos.html';
    });

    // Métodos de pago
    document.getElementById("tarjeta")?.addEventListener("change", cambiarMetodoPago);
    document.getElementById("paypal")?.addEventListener("change", cambiarMetodoPago);
    document.getElementById("transferencia")?.addEventListener("change", cambiarMetodoPago);

    // Formateo de campos
    document.getElementById("numero-tarjeta")?.addEventListener("input", formatearTarjeta);
    document.getElementById("fecha-expiracion")?.addEventListener("input", formatearFecha);
    document.getElementById("cvv")?.addEventListener("input", formatearCVV);
    document.getElementById("telefono")?.addEventListener("input", formatearTelefono);

    // Limpiar errores al escribir
    const camposEnvio = ["nombre", "email", "telefono", "direccion", "ciudad", "codigo-postal", "departamento", "distrito"];
    camposEnvio.forEach((campo) => {
      const elemento = document.getElementById(campo);
      if (elemento) {
        elemento.addEventListener("input", () => limpiarError(elemento));
        elemento.addEventListener("change", () => limpiarError(elemento));
      }
    });

    // Facturación
    document.getElementById("factura")?.addEventListener("change", toggleFactura);
    document.getElementById("ruc")?.addEventListener("input", formatearRUC);
  }

  // ========== NAVEGACIÓN ENTRE PASOS ==========
  function mostrarPaso(numeroPaso) {
    document.querySelectorAll(".seccion-checkout").forEach((seccion) => {
      seccion.classList.remove("activa");
    });

    let seccionId = "";
    switch (numeroPaso) {
      case 1: seccionId = "datos-envio"; break;
      case 2: seccionId = "metodo-pago"; break;
      case 3: seccionId = "confirmacion-pedido"; break;
      case 4: seccionId = "pedido-completado"; break;
    }

    document.getElementById(seccionId)?.classList.add("activa");
    actualizarBarraProgreso(numeroPaso);
    window.scrollTo({ top: 0, behavior: "smooth" });
    pasoActual = numeroPaso;
  }

  function actualizarBarraProgreso(pasoActual) {
    document.querySelectorAll(".barra-progreso-paso").forEach((paso, index) => {
      paso.classList.remove("activo", "completado");
      if (index + 1 < pasoActual) {
        paso.classList.add("completado");
      } else if (index + 1 === pasoActual) {
        paso.classList.add("activo");
      }
    });
  }

  // ========== VALIDACIONES Y NAVEGACIÓN ==========
  function irAPago() {
    if (validarDatosEnvio()) mostrarPaso(2);
  }

  function irAConfirmacion() {
    if (validarDatosPago()) {
      actualizarConfirmacion();
      mostrarPaso(3);
    }
  }

  function validarDatosEnvio() {
    const campos = [
      { id: "nombre", nombre: "Nombre completo" },
      { id: "email", nombre: "Correo electrónico" },
      { id: "telefono", nombre: "Teléfono" },
      { id: "direccion", nombre: "Dirección" },
      { id: "ciudad", nombre: "Ciudad" },
      { id: "codigo-postal", nombre: "Código postal" },
      { id: "departamento", nombre: "Departamento" },
      { id: "distrito", nombre: "Distrito" },
    ];

    let esValido = true;
    let primerError = null;

    campos.forEach((campo) => {
      const elemento = document.getElementById(campo.id);
      if (elemento) limpiarError(elemento);
    });

    campos.forEach((campo) => {
      const elemento = document.getElementById(campo.id);
      if (elemento && !elemento.value.trim()) {
        mostrarError(elemento, `${campo.nombre} es obligatorio`);
        esValido = false;
        if (!primerError) primerError = elemento;
      }
    });

    if (esValido) {
      const email = document.getElementById("email");
      if (email && email.value.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value.trim())) {
          mostrarError(email, "Por favor, ingresa un email válido");
          esValido = false;
          if (!primerError) primerError = email;
        }
      }

      const telefono = document.getElementById("telefono");
      if (telefono && telefono.value.trim()) {
        const telefonoLimpio = telefono.value.replace(/\D/g, "");
        if (telefonoLimpio.length !== 9) {
          mostrarError(telefono, "El teléfono debe tener 9 dígitos");
          esValido = false;
          if (!primerError) primerError = telefono;
        }
      }

      const codigoPostal = document.getElementById("codigo-postal");
      if (codigoPostal && codigoPostal.value.trim()) {
        const codigoLimpio = codigoPostal.value.replace(/\D/g, "");
        if (codigoLimpio.length !== 5) {
          mostrarError(codigoPostal, "El código postal debe tener 5 dígitos");
          esValido = false;
          if (!primerError) primerError = codigoPostal;
        }
      }

      const departamento = document.getElementById("departamento");
      if (departamento && (!departamento.value || departamento.value === "")) {
        mostrarError(departamento, "Por favor, selecciona un departamento");
        esValido = false;
        if (!primerError) primerError = departamento;
      }
    }

    if (!esValido) {
      mostrarMensaje("Por favor, completa todos los campos obligatorios", "error");
      if (primerError) {
        setTimeout(() => {
          primerError.scrollIntoView({ behavior: "smooth", block: "center" });
          primerError.focus();
        }, 100);
      }
    }

    return esValido;
  }

  function validarDatosPago() {
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked')?.value;
    return metodoPago === "tarjeta" ? validarTarjeta() : true;
  }

  function validarTarjeta() {
    let esValido = true;
    let primerError = null;

    const camposTarjeta = ["titular-tarjeta", "numero-tarjeta", "fecha-expiracion", "cvv"];
    camposTarjeta.forEach((campo) => {
      const elemento = document.getElementById(campo);
      if (elemento) limpiarError(elemento);
    });

    const titular = document.getElementById("titular-tarjeta");
    if (!titular.value.trim()) {
      mostrarError(titular, "El nombre del titular es obligatorio");
      esValido = false;
      if (!primerError) primerError = titular;
    }

    const numero = document.getElementById("numero-tarjeta");
    const numeroLimpio = numero.value.replace(/\s/g, "");
    if (!numeroLimpio) {
      mostrarError(numero, "El número de tarjeta es obligatorio");
      esValido = false;
      if (!primerError) primerError = numero;
    } else if (numeroLimpio.length !== 16) {
      mostrarError(numero, "El número de tarjeta debe tener 16 dígitos");
      esValido = false;
      if (!primerError) primerError = numero;
    }

    const fecha = document.getElementById("fecha-expiracion");
    if (!fecha.value.trim()) {
      mostrarError(fecha, "La fecha de expiración es obligatoria");
      esValido = false;
      if (!primerError) primerError = fecha;
    } else if (!/^\d{2}\/\d{2}$/.test(fecha.value)) {
      mostrarError(fecha, "Formato de fecha inválido (MM/AA)");
      esValido = false;
      if (!primerError) primerError = fecha;
    }

    const cvv = document.getElementById("cvv");
    if (!cvv.value.trim()) {
      mostrarError(cvv, "El CVV es obligatorio");
      esValido = false;
      if (!primerError) primerError = cvv;
    } else if (!/^\d{3,4}$/.test(cvv.value)) {
      mostrarError(cvv, "El CVV debe tener 3 o 4 dígitos");
      esValido = false;
      if (!primerError) primerError = cvv;
    }

    if (!esValido) {
      mostrarMensaje("Por favor, completa correctamente los datos de la tarjeta", "error");
      if (primerError) {
        setTimeout(() => {
          primerError.scrollIntoView({ behavior: "smooth", block: "center" });
          primerError.focus();
        }, 100);
      }
    }

    return esValido;
  }

  // ========== MÉTODOS DE PAGO ==========
  function cambiarMetodoPago() {
    document.querySelectorAll(".form-pago-detalle").forEach((form) => {
      form.classList.add("oculto");
    });

    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked')?.value;
    if (metodoPago) {
      document.getElementById(`form-${metodoPago}`)?.classList.remove("oculto");
    }
  }

  // ========== FORMATEO DE CAMPOS ==========
  function formatearTarjeta(e) {
    let valor = e.target.value.replace(/\D/g, "");
    let valorFormateado = "";
    for (let i = 0; i < valor.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) valorFormateado += " ";
      valorFormateado += valor[i];
    }
    e.target.value = valorFormateado;
  }

  function formatearFecha(e) {
    let valor = e.target.value.replace(/\D/g, "");
    if (valor.length >= 2) {
      valor = valor.substring(0, 2) + "/" + valor.substring(2, 4);
    }
    e.target.value = valor;
  }

  function formatearCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 4);
  }

  function formatearTelefono(e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 9);
  }

  function formatearRUC(e) {
    e.target.value = e.target.value.replace(/\D/g, "").substring(0, 11);
  }

  // ========== FACTURACIÓN ==========
  function toggleFactura() {
    const grupoRuc = document.getElementById("grupo-ruc");
    const rucInput = document.getElementById("ruc");
    if (this.checked) {
      grupoRuc.style.display = "block";
      rucInput.required = true;
    } else {
      grupoRuc.style.display = "none";
      rucInput.required = false;
      rucInput.value = "";
      limpiarError(rucInput);
    }
  }

  // ========== RESUMEN DEL CARRITO ==========
  function mostrarResumenCarrito() {
    const itemsResumen = document.getElementById("items-resumen");
    if (!itemsResumen) return;

    if (carrito.length === 0) {
      itemsResumen.innerHTML = '<p class="carrito-vacio">Tu carrito está vacío</p>';
      actualizarTotales(0);
      return;
    }

    itemsResumen.innerHTML = "";
    carrito.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "item-carrito-resumen";
      itemElement.innerHTML = `
        <img src="${obtenerImagenProducto(item.id)}" alt="${item.nombre}">
        <div class="item-info-resumen">
          <div class="item-nombre-resumen">${item.nombre}</div>
          <div class="item-precio-resumen">S/ ${item.precio.toFixed(2)}</div>
          <div class="item-cantidad-resumen">Cantidad: ${item.cantidad}</div>
        </div>
      `;
      itemsResumen.appendChild(itemElement);
    });

    const subtotal = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    actualizarTotales(subtotal);
  }

  function obtenerImagenProducto(id) {
    const idNum = Number(id);
    switch(idNum) {
      case 1: return IMAGENES.ARTICULO_BASQUET;
      case 2: return IMAGENES.CAMISETA;
      case 3: return IMAGENES.ZAPATILLAS1;
      case 4: return IMAGENES.GUANTES;
      case 5: return IMAGENES.PROTECTOR1;
      case 6: return IMAGENES.VENDAS1;
      case 7: return IMAGENES.AEROBICS;
      case 8: return IMAGENES.BANDAS1;
      default: return IMAGENES.PESAS;
    }
  }

  function actualizarTotales(subtotal) {
    const total = subtotal + COSTO_ENVIO;
    document.getElementById("subtotal-carrito").textContent = `S/${subtotal.toFixed(2)}`;
    document.getElementById("envio-carrito").textContent = `S/${COSTO_ENVIO.toFixed(2)}`;
    document.getElementById("total-carrito").textContent = `S/${total.toFixed(2)}`;
  }

  // ========== CONFIRMACIÓN ==========
  function actualizarConfirmacion() {
    // Actualizar dirección
    const direccion = `
      <p><strong>${document.getElementById("nombre").value}</strong></p>
      <p>${document.getElementById("direccion").value}</p>
      <p>${document.getElementById("distrito").value}, ${
      document.getElementById("departamento").options[
        document.getElementById("departamento").selectedIndex
      ].text
    }</p>
      <p>Teléfono: ${document.getElementById("telefono").value}</p>
      <p>Email: ${document.getElementById("email").value}</p>
    `;
    document.getElementById("confirmacion-direccion").innerHTML = direccion;

    // Actualizar método de pago
    const metodoPago = document.querySelector('input[name="metodo-pago"]:checked')?.value;
    let textoPago = "";
    switch (metodoPago) {
      case "tarjeta":
        const numeroTarjeta = document.getElementById("numero-tarjeta").value;
        textoPago = `Tarjeta terminada en ${numeroTarjeta.replace(/\s/g, "").slice(-4)}`;
        break;
      case "paypal":
        textoPago = "PayPal";
        break;
      case "transferencia":
        textoPago = "Transferencia bancaria";
        break;
    }
    document.getElementById("confirmacion-pago").innerHTML = `<p>${textoPago}</p>`;

    // Actualizar resumen de productos
    const resumenProductos = document.getElementById("resumen-productos");
    resumenProductos.innerHTML = "";

    const subtotal = carrito.reduce((total, item) => total + item.precio * item.cantidad, 0);
    const total = subtotal + COSTO_ENVIO;

    carrito.forEach((item) => {
      const itemElement = document.createElement("div");
      itemElement.className = "item-resumen";
      itemElement.innerHTML = `
        <span>${item.nombre} x${item.cantidad}</span>
        <span>S/ ${(item.precio * item.cantidad).toFixed(2)}</span>
      `;
      resumenProductos.appendChild(itemElement);
    });

    document.getElementById("resumen-subtotal").textContent = `S/${subtotal.toFixed(2)}`;
    document.getElementById("resumen-envio").textContent = `S/${COSTO_ENVIO.toFixed(2)}`;
    document.getElementById("resumen-total").textContent = `S/${total.toFixed(2)}`;
  }

  // ========== FINALIZAR COMPRA ==========
  function finalizarCompra() {
    const terminosCheckbox = document.getElementById("acepto-terminos");
    if (!terminosCheckbox.checked) {
      mostrarMensaje("Debes aceptar los términos y condiciones", "error");
      terminosCheckbox.scrollIntoView({ behavior: "smooth" });
      return;
    }

    // Guardar datos del pedido antes de limpiar
    const numeroPedido = "PED-" + Date.now().toString().slice(-6);
    document.getElementById("id-pedido").textContent = numeroPedido;
    document.getElementById("email-confirmacion").textContent = document.getElementById("email").value;

    // Marcar como pedido confirmado pero no limpiar el carrito aún
    pedidoConfirmado = true;

    // Mostrar página de confirmación
    mostrarPaso(4);
    mostrarMensaje(`¡Compra completada! Pedido: ${numeroPedido}`, "exito");

    // Disparar evento de carrito actualizado (opcional, si es necesario para otros componentes)
    document.dispatchEvent(new CustomEvent("carritoActualizado", { detail: { carrito: [] } }));
  }

  // ========== GENERACIÓN DE FACTURA ==========
  function generarFactura() {
    if (!pedidoConfirmado) {
      mostrarMensaje("Debes completar el pedido antes de generar la factura", "error");
      return;
    }

    if (carrito.length === 0) {
      mostrarMensaje("No hay productos en el carrito para generar factura", "error");
      return;
    }

    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF();

      // Configuración inicial
      doc.setFontSize(18);
      doc.setTextColor(40);
      doc.setFont("helvetica", "bold");
      doc.text("FACTURA", 105, 20, { align: 'center' });

      // Información de la empresa
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("SPORTS & DEFENSE S.A.C.", 14, 30);
      doc.text("RUC: 20567890123", 14, 35);
      doc.text("Av. Javier Prado Este 1234, San Isidro, Lima", 14, 40);
      doc.text("Teléfono: (01) 123-4567", 14, 45);
      doc.text("Email: ventas@sportsdefense.com", 14, 50);

      // Información del cliente
      const nombreCliente = document.getElementById("nombre").value;
      const emailCliente = document.getElementById("email").value;
      const telefonoCliente = document.getElementById("telefono").value;
      const direccionCliente = document.getElementById("direccion").value;
      const departamento = document.getElementById("departamento").options[document.getElementById("departamento").selectedIndex].text;
      const distrito = document.getElementById("distrito").value;

      doc.text("Cliente:", 140, 30);
      doc.text(nombreCliente, 140, 35);
      doc.text(emailCliente, 140, 40);
      doc.text(telefonoCliente, 140, 45);
      doc.text(`${direccionCliente}, ${distrito}, ${departamento}`, 140, 50);

      // Detalles de la factura
      doc.text(`Número de pedido: ${document.getElementById("id-pedido").textContent}`, 14, 60);
      doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 65);

      // Método de pago
      const metodoPago = document.querySelector('input[name="metodo-pago"]:checked').value;
      let textoPago = "";
      switch(metodoPago) {
        case "tarjeta":
          const numeroTarjeta = document.getElementById("numero-tarjeta").value;
          textoPago = `Tarjeta terminada en ${numeroTarjeta.replace(/\s/g, "").slice(-4)}`;
          break;
        case "paypal":
          textoPago = "PayPal";
          break;
        case "transferencia":
          textoPago = "Transferencia bancaria";
          break;
      }
      doc.text(`Método de pago: ${textoPago}`, 14, 70);

      // Tabla de productos
      const headers = [["Producto", "Cantidad", "Precio Unit.", "Total"]];
      const data = carrito.map(item => [
        item.nombre,
        item.cantidad,
        `S/ ${item.precio.toFixed(2)}`,
        `S/ ${(item.precio * item.cantidad).toFixed(2)}`
      ]);

      // Calcular totales
      const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
      const envio = COSTO_ENVIO;
      const total = subtotal + envio;

      // Agregar fila de totales
      data.push(["", "", "Subtotal:", `S/ ${subtotal.toFixed(2)}`]);
      data.push(["", "", "Envío:", `S/ ${envio.toFixed(2)}`]);
      data.push(["", "", "TOTAL:", `S/ ${total.toFixed(2)}`]);

      // Generar tabla
      doc.autoTable({
        startY: 80,
        head: headers,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 30 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 } },
        styles: { fontSize: 10, cellPadding: 3 },
        didDrawPage: function (data) {
          doc.setFontSize(8);
          doc.setTextColor(100);
          doc.text("Gracias por su compra - Sports & Defense", 105, 285, { align: 'center' });
        }
      });

      // Guardar el PDF
      doc.save(`factura-${document.getElementById("id-pedido").textContent}.pdf`);

      // Limpiar el carrito solo después de generar la factura
      sessionStorage.removeItem("carrito");
      carrito = [];
      pedidoConfirmado = false;

      mostrarMensaje("Factura generada correctamente", "exito");
    } catch (error) {
      console.error("Error al generar factura:", error);
      mostrarMensaje("Error al generar la factura", "error");
    }
  }

  // ========== UTILIDADES ==========
  function mostrarError(elemento, mensaje) {
    elemento.classList.add("error");
    const mensajeAnterior = elemento.parentNode.querySelector(".mensaje-error");
    if (mensajeAnterior) mensajeAnterior.remove();

    const mensajeError = document.createElement("div");
    mensajeError.className = "mensaje-error";
    mensajeError.textContent = mensaje;
    elemento.parentNode.appendChild(mensajeError);
  }

  function limpiarError(elemento) {
    elemento.classList.remove("error");
    const mensajeError = elemento.parentNode.querySelector(".mensaje-error");
    if (mensajeError) mensajeError.remove();
  }

  function mostrarMensaje(texto, tipo = "info") {
    const mensaje = document.createElement("div");
    mensaje.className = `mensaje-flotante ${tipo}`;
    mensaje.textContent = texto;

    mensaje.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 4px;
      z-index: 1000;
      color: white;
      font-weight: bold;
      transform: translateY(-20px);
      opacity: 0;
      transition: all 0.3s ease;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;

    switch (tipo) {
      case "exito": mensaje.style.backgroundColor = "#28a745"; break;
      case "error": mensaje.style.backgroundColor = "#dc3545"; break;
      default: mensaje.style.backgroundColor = "#007bff";
    }

    document.body.appendChild(mensaje);

    setTimeout(() => {
      mensaje.style.opacity = "1";
      mensaje.style.transform = "translateY(0)";
    }, 10);

    setTimeout(() => {
      mensaje.style.opacity = "0";
      mensaje.style.transform = "translateY(-20px)";
      setTimeout(() => mensaje.remove(), 300);
    }, 4000);
  }

  // ========== INICIALIZAR ==========
  inicializar();
});