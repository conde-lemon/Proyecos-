// load-components.js
document.addEventListener('DOMContentLoaded', function () {
  // --- 1. Determinar la ubicación de la página actual ---
  const currentPagePath = window.location.pathname;
  // La página raíz (index.html) es la única que NO está en la carpeta /public_html/Paginas/
  const isIndexPage = !currentPagePath.includes('/public_html/Paginas/');

  // --- 2. Definir rutas base dinámicamente ---
  const componentsPath = isIndexPage ? 'public_html/Paginas/components/' : 'components/';

  // --- 3. Función genérica para cargar y corregir componentes ---
  const loadComponent = (componentFile, insertLocation, isHeader = false) => {
    fetch(`${componentsPath}${componentFile}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status} for ${componentFile}`);
        return response.text();
      })
      .then(html => {
        let correctedHtml = html;

        // Si estamos en la página de inicio, debemos corregir las rutas relativas.
        if (isIndexPage) {
          // Corregir rutas de imágenes: de '../imagenes/' a 'public_html/imagenes/'
          correctedHtml = correctedHtml.replace(/src="\.\.\/imagenes\//g, 'src="public_html/imagenes/');
          
          // Corregir enlace a la página de inicio: de '../../index.html' a 'index.html'
          correctedHtml = correctedHtml.replace(/href="\.\.\/\.\.\/index\.html"/g, 'href="index.html"');

          // Corregir enlaces a otras páginas: de 'pagina.html' a 'public_html/Paginas/pagina.html'
          // Ignora anclas (#), enlaces externos (http), email (mailto) y el enlace a index.html.
          correctedHtml = correctedHtml.replace(/href="(?!#|http|index\.html|mailto:)([^"]*)"/g, 'href="public_html/Paginas/$1"');
        }
        
        document.body.insertAdjacentHTML(insertLocation, correctedHtml);

        if (isHeader) {
          setupHeader(); // Ejecutar la lógica de interactividad del header
        }
      })
      .catch(e => console.error(`Fallo al cargar el componente ${componentFile}:`, e));
  };

  // --- 4. Cargar Header y Footer ---
  loadComponent('header.html', 'afterbegin', true);
  loadComponent('footer.html', 'beforeend');
});

function setupHeader() {
  // ====================================================================
  //  CONFIGURACIÓN CENTRALIZADA DEL HEADER
  //  Esta función se ejecuta DESPUÉS de que header.html se ha cargado.
  // ====================================================================

  // --- 1. Selección de todos los elementos del Header ---
  const menuToggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  
  // Elementos del nuevo buscador
  const header = document.querySelector('.header');
  const searchToggleBtn = document.getElementById('search-toggle-btn');
  const searchContainer = document.getElementById('search-container');
  const closeSearch = document.getElementById('close-search');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('searchInput');

  // --- 2. Lógica para el menú hamburguesa ---
  if (menuToggle && menu) {
    menuToggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      menuToggle.classList.toggle('active');
      document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : 'auto';
    });
  }

  // --- 3. Lógica para el buscador overlay ---
  if (searchToggleBtn && searchContainer && closeSearch && header) {
    searchToggleBtn.addEventListener('click', () => {
      searchContainer.classList.add('active');
      header.classList.add('search-active');
      searchInput.focus();
    });

    closeSearch.addEventListener('click', () => {
      searchContainer.classList.remove('active');
      header.classList.remove('search-active');
    });
  }

  // --- 4. Lógica del formulario de búsqueda ---
  if(searchForm && searchInput) {
    searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const valor = searchInput.value.toLowerCase().trim();
        const rutas = {
            "inicio": "index.html",
            "academias": "academias.html",
            "artículos": "articulos.html",
            "articulos": "articulos.html",
            "defensa personal": "defensa-personal.html",
            "contacto": "contactos.html",
            "nosotros": "nosotros.html",
            "politicas y privacidad": "politica-privacidad.html",
            "calculadora imc": "imc.html"
        };
        const url = rutas[valor];
        if (url) {
            window.location.href = url;
        } else {
            alert("Página no encontrada. Intenta con un nombre válido del menú.");
        }
    });
  }

  // --- 5. Efecto de scroll para encoger el header ---
  const handleScroll = () => {
    if (header) {
      header.classList.toggle('scrolled', window.scrollY > 50);
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // --- 6. Cerrar menús al hacer clic fuera de ellos ---
  document.addEventListener('click', (event) => {
    // Cierra el menú hamburguesa
    if (menu && menu.classList.contains('active') && !menu.contains(event.target) && !menuToggle.contains(event.target)) {
        menu.classList.remove('active');
        menuToggle.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
  });
}
