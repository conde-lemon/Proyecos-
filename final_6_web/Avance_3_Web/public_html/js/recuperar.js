document.addEventListener("DOMContentLoaded", function () {
    const recoveryForm = document.getElementById("recoveryForm");

    if (recoveryForm) {
        recoveryForm.addEventListener("submit", async function (e) {
            e.preventDefault();
            const email = document.getElementById("email").value.trim().toLowerCase();

            if (!email) {
                showMessage("Por favor, ingresa tu correo electrónico.", "error");
                return;
            }

            try {
                // Deshabilitar el botón para evitar envíos múltiples
                const submitButton = this.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = "Enviando...";

                // Buscar el usuario en el JSON
                const response = await fetch('../data/users.json');
                const users = await response.json();
                const user = users.find(u => u.email.toLowerCase() === email);

                if (user) {
                    // Configurar los campos ocultos para FormSubmit
                    recoveryForm.querySelector('input[name="_subject"]').value = `Recuperación de contraseña para ${user.email}`;
                    recoveryForm.querySelector('input[name="_next"]').value = window.location.href + '?success=true';

                    // Crear un campo oculto con la contraseña
                    const passwordField = document.createElement('input');
                    passwordField.type = 'hidden';
                    passwordField.name = 'password';
                    passwordField.value = `Hola ${user.nombre}, tu contraseña es: ${user.password}`;
                    recoveryForm.appendChild(passwordField);

                    // Enviar el formulario
                    recoveryForm.submit();
                } else {
                    // Mostrar mensaje genérico por seguridad
                    showMessage("Si existe una cuenta asociada a este correo, recibirás un correo con instrucciones.", "success");
                    // Simular el envío para no revelar que el correo no existe
                    recoveryForm.submit();
                }
            } catch (error) {
                console.error("Error:", error);
                showMessage("Ocurrió un error al procesar tu solicitud. Por favor, inténtalo más tarde.", "error");
                this.querySelector('button[type="submit"]').disabled = false;
                this.querySelector('button[type="submit"]').textContent = "Enviar Correo de Recuperación";
            }
        });
    }

    function showMessage(text, type) {
        const oldMessage = document.querySelector(".login-message");
        if (oldMessage) oldMessage.remove();

        const message = document.createElement("div");
        message.className = `login-message ${type}`;

        if (type === 'success') {
            message.classList.add('info');
        }

        message.textContent = text;

        document.querySelector(".login-container").prepend(message);

        setTimeout(() => {
            message.style.opacity = "0";
            setTimeout(() => message.remove(), 300);
        }, 6000);
    }

    // Mostrar mensaje de éxito si viene de una redirección
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        showMessage("Si existe una cuenta asociada a este correo, recibirás un correo con instrucciones.", "success");
    }
});