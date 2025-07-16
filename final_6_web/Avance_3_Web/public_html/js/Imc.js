    document.addEventListener('DOMContentLoaded', function() {
      // Elementos del DOM
      const alturaInput = document.getElementById('altura');
      const pesoInput = document.getElementById('peso');
      const edadInput = document.getElementById('edad');
      const sexoSelect = document.getElementById('sexo');
      const calcularBtn = document.getElementById('calcular-btn');
      const imcValor = document.getElementById('imc-valor');
      const imcCategoria = document.getElementById('imc-categoria');
      const imcDescripcion = document.getElementById('imc-descripcion');
      const recomendacionesList = document.getElementById('recomendaciones-list');
      const porcentajeGrasa = document.getElementById('porcentaje-grasa');
      const masaMuscular = document.getElementById('masa-muscular');
      const aguaCorporal = document.getElementById('agua-corporal');

      // Configuración del gráfico
      const ctx = document.getElementById('imcChart').getContext('2d');
      const imcChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Grasa', 'Músculo', 'Agua', 'Otros'],
          datasets: [{
            data: [25, 35, 15, 25],
            backgroundColor: [
              '#e63946',
              '#2a9d8f',
              '#457b9d',
              '#f8f9fa'
            ],
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 12,
                padding: 20,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  return `${context.label}: ${context.raw}%`;
                }
              }
            }
          }
        }
      });

      // Función para calcular IMC
      function calcularIMC() {
        const altura = parseFloat(alturaInput.value) / 100; // Convertir cm a m
        const peso = parseFloat(pesoInput.value);
        const edad = parseInt(edadInput.value);
        const sexo = sexoSelect.value;

        if (!altura || !peso || !edad) {
          alert('Por favor completa todos los campos');
          return;
        }

        const imc = peso / (altura * altura);
        const imcRedondeado = imc.toFixed(1);

        // Actualizar resultado
        imcValor.textContent = imcRedondeado;
        
        // Determinar categoría
        let categoria = '';
        let descripcion = '';
        let recomendaciones = [];
        let color = '';

        if (imc < 18.5) {
          categoria = 'Bajo peso';
          descripcion = 'Tu peso está por debajo de lo considerado saludable para tu altura.';
          recomendaciones = [
            'Consulta con un nutricionista para un plan de aumento de peso saludable',
            'Incorpora ejercicios de fuerza para ganar masa muscular',
            'Asegúrate de consumir suficientes calorías y nutrientes'
          ];
          color = '#ffd166';
        } else if (imc >= 18.5 && imc < 25) {
          categoria = 'Peso normal';
          descripcion = '¡Felicidades! Tu peso está dentro del rango considerado saludable.';
          recomendaciones = [
            'Mantén una dieta balanceada y variada',
            'Continúa con tu rutina de ejercicio regular',
            'Realiza chequeos médicos periódicos'
          ];
          color = '#2a9d8f';
        } else if (imc >= 25 && imc < 30) {
          categoria = 'Sobrepeso';
          descripcion = 'Tu peso está por encima del rango considerado saludable para tu altura.';
          recomendaciones = [
            'Considera aumentar tu actividad física diaria',
            'Reduce el consumo de alimentos procesados y azúcares',
            'Consulta con un profesional para un plan personalizado'
          ];
          color = '#e9c46a';
        } else if (imc >= 30 && imc < 35) {
          categoria = 'Obesidad grado I';
          descripcion = 'Tu peso indica obesidad grado I, lo que puede aumentar el riesgo de problemas de salud.';
          recomendaciones = [
            'Consulta con un médico para evaluar tu salud',
            'Inicia un plan de alimentación saludable supervisado',
            'Comienza con actividad física moderada y aumenta gradualmente'
          ];
          color = '#f4a261';
        } else if (imc >= 35 && imc < 40) {
          categoria = 'Obesidad grado II';
          descripcion = 'Tu peso indica obesidad grado II, con riesgo alto de problemas de salud.';
          recomendaciones = [
            'Busca atención médica profesional',
            'Considera un programa de pérdida de peso supervisado',
            'Incorpora actividad física adaptada a tus capacidades'
          ];
          color = '#e76f51';
        } else {
          categoria = 'Obesidad grado III';
          descripcion = 'Tu peso indica obesidad grado III, con riesgo muy alto de problemas de salud.';
          recomendaciones = [
            'Consulta urgentemente con un médico especialista',
            'Sigue un tratamiento médico supervisado',
            'Considera apoyo psicológico y nutricional integral'
          ];
          color = '#e63946';
        }

        imcCategoria.textContent = categoria;
        imcCategoria.style.color = color;
        imcDescripcion.textContent = descripcion;

        // Actualizar recomendaciones
        recomendacionesList.innerHTML = '';
        recomendaciones.forEach(item => {
          const li = document.createElement('li');
          li.textContent = item;
          recomendacionesList.appendChild(li);
        });

        // Calcular composición corporal estimada (simulación)
        let grasa, musculo, agua;
        
        if (sexo === 'hombre') {
          grasa = 1.20 * imc + 0.23 * edad - 16.2;
          musculo = 0.45 * imc + 0.15 * edad + 30;
          agua = 0.35 * imc + 0.12 * edad + 40;
        } else {
          grasa = 1.20 * imc + 0.23 * edad - 5.4;
          musculo = 0.35 * imc + 0.10 * edad + 25;
          agua = 0.30 * imc + 0.10 * edad + 45;
        }

        // Ajustar valores para que sumen ~100%
        const total = grasa + musculo + agua;
        grasa = (grasa / total * 70).toFixed(1);
        musculo = (musculo / total * 70).toFixed(1);
        agua = (agua / total * 70).toFixed(1);
        const otros = (100 - grasa - musculo - agua).toFixed(1);

        // Actualizar estadísticas
        porcentajeGrasa.textContent = `${grasa}%`;
        masaMuscular.textContent = `${musculo}%`;
        aguaCorporal.textContent = `${agua}%`;

        // Actualizar gráfico
        imcChart.data.datasets[0].data = [grasa, musculo, agua, otros];
        imcChart.update();
      }

      // Event listener para el botón de cálculo
      calcularBtn.addEventListener('click', calcularIMC);

      // También calcular al presionar Enter en cualquier campo
      [alturaInput, pesoInput, edadInput, sexoSelect].forEach(input => {
        input.addEventListener('keypress', function(e) {
          if (e.key === 'Enter') {
            calcularIMC();
          }
        });
      });
    });
