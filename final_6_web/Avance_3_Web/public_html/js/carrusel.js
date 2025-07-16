// Variables globales del carrusel
let currentSlide = 0;
const slides = document.querySelectorAll(".carrusel-simplificado-item");
const dots = document.querySelectorAll(".carrusel-pagination-dot");
const infos = document.querySelectorAll(".carrusel-info");
const carrusel = document.querySelector(".carrusel-simplificado");
const totalSlides = slides.length;

// Función para mostrar slide específico
function showSlide(index) {
  // Asegurar que el índice esté en rango
  if (index >= totalSlides) currentSlide = 0;
  else if (index < 0) currentSlide = totalSlides - 1;
  else currentSlide = index;

  // Mover el carrusel
  const translateX = -currentSlide * 100;
  carrusel.style.transform = `translateX(${translateX}%)`;

  // Actualizar puntos de paginación
  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentSlide);
  });

  // Actualizar información mostrada
  infos.forEach((info, i) => {
    info.classList.toggle("active", i === currentSlide);
  });

  // Actualizar el aria-hidden para accesibilidad
  infos.forEach((info, i) => {
    info.setAttribute("aria-hidden", i !== currentSlide);
  });
}

// Función para ir al siguiente slide
function nextSlide() {
  showSlide(currentSlide + 1);
}

// Función para ir al slide anterior
function prevSlide() {
  showSlide(currentSlide - 1);
}

// Event listeners para los controles del carrusel
document
  .querySelector(".carrusel-simplificado-next")
  .addEventListener("click", nextSlide);
document
  .querySelector(".carrusel-simplificado-prev")
  .addEventListener("click", prevSlide);

// Event listeners para los puntos de paginación
dots.forEach((dot, index) => {
  dot.addEventListener("click", () => showSlide(index));
});

// Auto-play del carrusel (opcional)
let autoPlayInterval = setInterval(nextSlide, 5000);

// Pausar auto-play al hacer hover
const carruselContainer = document.querySelector(
  ".carrusel-simplificado-container"
);
carruselContainer.addEventListener("mouseenter", () => {
  clearInterval(autoPlayInterval);
});

carruselContainer.addEventListener("mouseleave", () => {
  autoPlayInterval = setInterval(nextSlide, 5000);
});

// Efecto de movimiento para botones (si existe la clase destacado-cta)
const destacadoCta = document.querySelector(".destacado-cta");
if (destacadoCta) {
  destacadoCta.addEventListener("pointermove", (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--x", x);
    e.currentTarget.style.setProperty("--y", y);

    const xp = x / rect.width - 0.5;
    const yp = y / rect.height - 0.5;
    e.currentTarget.style.setProperty("--xp", xp);
    e.currentTarget.style.setProperty("--yp", yp);

    const button = e.currentTarget.querySelector(".boton");
    if (button) {
      button.style.setProperty("--x", x);
      button.style.setProperty("--y", y);
      button.style.setProperty("--xp", xp);
      button.style.setProperty("--yp", yp);
    }
  });
}

// Inicializar el carrusel
showSlide(0);
