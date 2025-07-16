document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');

    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) { // La función ahora es asíncrona
            e.preventDefault();

            // Obtener valores del formulario
            const nombre = document.getElementById('nombre').value.trim();
            const apellido = document.getElementById('apellido').value.trim();
            const email = document.getElementById('email').value.trim().toLowerCase();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const telefono = document.getElementById('telefono').value.trim();
            const terms = document.getElementById('terms').checked;

            // Validaciones básicas
            if (!nombre || !apellido || !email || !password || !confirmPassword) {
                showMessage('Por favor completa todos los campos obligatorios', 'error');
                return;
            }

            if (!terms) {
                showMessage('Debes aceptar los términos y condiciones', 'error');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('Las contraseñas no coinciden', 'error');
                return;
            }

            // Validación de contraseña corregida para que coincida con el texto de ayuda del HTML.
            const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(password)) {
                showMessage('La contraseña debe tener al menos 8 caracteres, una mayúscula y un número.', 'error');
                return;
            }

            // --- Lógica de registro robusta ---
            try {
                // 1. Obtener usuarios del archivo JSON base para verificar duplicados
                const response = await fetch('../data/users.json');
                const baseUsers = response.ok ? await response.json() : [];

                // 2. Obtener usuarios ya registrados en localStorage
                const registeredUsers = JSON.parse(localStorage.getItem("users")) || [];

                // 3. Combinar ambas fuentes para la verificación
                const allUsers = [...baseUsers, ...registeredUsers];

                const userExists = allUsers.some(user => user.email === email);

                if (userExists) {
                    showMessage('Este correo electrónico ya está registrado', 'error');
                    return;
                }

                // 4. Crear objeto de usuario nuevo
                const newUser = {
                    nombre,
                    apellido,
                    email,
                    password, // En un proyecto real debería estar encriptada
                    telefono: telefono || 'No proporcionado',
                    fechaRegistro: new Date().toISOString()
                };

                // 5. Guardar el nuevo usuario ÚNICAMENTE en localStorage.
                // No podemos escribir en el archivo .json desde el navegador.
                registeredUsers.push(newUser);
                localStorage.setItem('users', JSON.stringify(registeredUsers));


                // 6. Iniciar sesión automáticamente
                localStorage.setItem('isLoggedIn', 'true');
                localStorage.setItem('currentUser', JSON.stringify(newUser));

                showMessage('¡Registro exitoso! Redireccionando...', 'success');

                // Redireccionar después de 1.5 segundos a la ruta correcta
                setTimeout(() => {
                    window.location.href = '../../index.html';
                }, 1500);

            } catch (storageError) {
                console.error("Error al guardar en localStorage:", storageError);
                showMessage("No se pudo registrar. El almacenamiento del navegador podría estar deshabilitado o lleno.", "error");
            }
        });
    } else {
        console.error("Error Crítico: No se encontró el formulario con ID 'registerForm'.");
    }

    function showMessage(text, type) {
        // Eliminar mensajes anteriores
        const oldMessage = document.querySelector('.login-message');
        if (oldMessage) oldMessage.remove();

        // Crear elemento de mensaje
        const message = document.createElement('div');
        message.className = `login-message ${type}`;
        message.textContent = text;

        // Añadir al formulario
        const container = document.querySelector('.login-container');
        if (container) {
            container.prepend(message);
        }

        // Eliminar después de 3 segundos
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
});