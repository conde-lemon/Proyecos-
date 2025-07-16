document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchDropdown = document.getElementById('search-dropdown');
  const header = document.querySelector('.header');

  // 1. Lógica para el menú hamburguesa en móviles
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      menuToggle.classList.toggle('active');
      // Evita el scroll del body cuando el menú está abierto
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : 'auto';
    });
  }

  // 2. Lógica para el buscador desplegable
  if (searchToggleBtn && searchDropdown) {
    searchToggleBtn.addEventListener('click', (event) => {
      event.stopPropagation(); // Evita que el clic se propague y cierre el menú inmediatamente
      searchDropdown.classList.toggle('active');
    });
  }

  // 3. Efecto de scroll para encoger el header
  const handleScroll = () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Ejecutar al cargar por si la página no está en el top

  // 4. Cerrar menús desplegables al hacer clic fuera de ellos
  document.addEventListener('click', (event) => {
    // Cierra el menú hamburguesa si está abierto
    if (menu && menu.classList.contains('active') && !menu.contains(event.target) && !menuToggle.contains(event.target)) {
      menu.classList.remove('active');
      menuToggle.classList.remove('active');
      document.body.style.overflow = 'auto';
    }

    // Cierra el buscador si está abierto
    if (searchDropdown && searchDropdown.classList.contains('active') && !searchDropdown.contains(event.target) && !searchToggleBtn.contains(event.target)) {
      searchDropdown.classList.remove('active');
    }
  });
});