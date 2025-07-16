document.addEventListener("DOMContentLoaded", function() {
    // Redirigir si ya está logueado
    if(localStorage.getItem("isLoggedIn") === "true") {
        window.location.href = "../../index.html"; // Ruta correcta al index en la raíz del proyecto
        return;
    }

    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        loginForm.addEventListener("submit", async function(e) { // La función ahora es asíncrona
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim().toLowerCase();
            const password = document.getElementById("password").value;
            
            // Validación básica
            if (!email || !password) {
                showMessage("Por favor completa todos los campos", "error");
                return;
            }
            
            // Verificar credenciales
            try {
                // 1. Obtener usuarios del archivo JSON base
                const response = await fetch('../data/users.json');
                const baseUsers = response.ok ? await response.json() : [];

                // 2. Obtener usuarios registrados en localStorage
                const registeredUsers = JSON.parse(localStorage.getItem("users")) || [];

                // 3. Combinar ambas fuentes
                const allUsers = [...baseUsers, ...registeredUsers];
                const user = allUsers.find(u => u.email === email && u.password === password);
                
                if (user) {
                    localStorage.setItem("isLoggedIn", "true");
                    localStorage.setItem("currentUser", JSON.stringify(user));
                    showMessage("¡Inicio de sesión exitoso!", "success");
                    
                    // Redirige a la página guardada o a la de inicio por defecto
                    setTimeout(() => {
                        const redirectUrl = localStorage.getItem("redirectAfterLogin") || "../../index.html";
                        localStorage.removeItem("redirectAfterLogin"); // Limpia la redirección guardada
                        window.location.href = redirectUrl;
                    }, 1500);
                } else {
                    showMessage("Correo o contraseña incorrectos", "error");
                }
            } catch (error) {
                console.error("Error:", error);
                showMessage("Error al iniciar sesión", "error");
            }
        });
    }
    
    function showMessage(text, type) {
        const oldMessage = document.querySelector(".login-message");
        if (oldMessage) oldMessage.remove();
        
        const message = document.createElement("div");
        message.className = `login-message ${type}`;
        message.textContent = text;
        
        document.querySelector(".login-container").prepend(message);
        
        setTimeout(() => {
            message.style.opacity = "0";
            setTimeout(() => message.remove(), 300);
        }, 3000);
    }
});