document.getElementById("descargar-factura")?.addEventListener("click", function() {
    try {
        // Validar datos esenciales
        const nombreCliente = document.getElementById("nombre")?.value;
        if (!nombreCliente) {
            alert("No se puede generar factura sin datos del cliente");
            return;
        }

        // Obtener datos del carrito real
        const carrito = JSON.parse(sessionStorage.getItem("carrito")) || [];
        if (carrito.length === 0) {
            alert("No hay productos en el carrito");
            return;
        }

        // Obtener datos necesarios
        const numeroPedido = document.getElementById("id-pedido")?.textContent || "SD-00000";
        const fecha = new Date().toLocaleDateString("es-PE");
        const emailCliente = document.getElementById("email")?.value || "";
        const direccion = document.getElementById("direccion")?.value || "";
        const ciudad = document.getElementById("ciudad")?.value || "";
        const departamento = document.getElementById("departamento")?.options[
            document.getElementById("departamento")?.selectedIndex || 0
        ]?.text || "";

        // Calcular totales
        const subtotal = carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
        const envio = 5.99;
        const total = subtotal + envio;

        // Crear PDF
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Logo y encabezado
        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text("SPORTS & DEFENSE", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text("FACTURA ELECTRÓNICA", 105, 30, { align: "center" });

        // Línea decorativa
        doc.setDrawColor(200, 200, 200);
        doc.line(20, 35, 190, 35);

        // Datos del pedido
        doc.setFontSize(10);
        doc.text(`RUC: 20567890123`, 20, 45);
        doc.text(`Factura: ${numeroPedido}`, 140, 45);
        doc.text(`Fecha: ${fecha}`, 140, 50);

        // Datos del cliente
        doc.text(`Cliente: ${nombreCliente}`, 20, 60);
        if (emailCliente) doc.text(`Email: ${emailCliente}`, 20, 65);
        if (direccion) doc.text(`Dirección: ${direccion}, ${ciudad}, ${departamento}`, 20, 70);

        // Tabla de productos
        doc.autoTable({
            startY: 80,
            head: [["Producto", "Precio Unit.", "Cantidad", "Subtotal"]],
            body: carrito.map(item => [
                item.nombre,
                `S/ ${item.precio.toFixed(2)}`,
                item.cantidad,
                `S/ ${(item.precio * item.cantidad).toFixed(2)}`
            ]),
            styles: { fontSize: 9 },
            headStyles: { fillColor: [40, 40, 40] },
            columnStyles: {
                0: { cellWidth: 'auto' },
                1: { cellWidth: 30 },
                2: { cellWidth: 20 },
                3: { cellWidth: 30 }
            }
        });

        // Totales
        const finalY = doc.lastAutoTable.finalY + 10;
        doc.text(`Subtotal: S/ ${subtotal.toFixed(2)}`, 140, finalY);
        doc.text(`Envío: S/ ${envio.toFixed(2)}`, 140, finalY + 5);
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text(`Total: S/ ${total.toFixed(2)}`, 140, finalY + 10);

        // Pie de página
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text("Representación impresa de la factura electrónica", 105, doc.internal.pageSize.height - 20, { align: "center" });
        doc.text("Autorizado mediante Resolución de Intendencia N° 034-005-0004321", 105, doc.internal.pageSize.height - 15, { align: "center" });
        doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-PE')}`, 105, doc.internal.pageSize.height - 10, { align: "center" });

        // Guardar PDF
        doc.save(`Factura-${numeroPedido}.pdf`);

    } catch (error) {
        console.error("Error al generar factura:", error);
        alert("Ocurrió un error al generar la factura. Por favor intente nuevamente.");
    }
});