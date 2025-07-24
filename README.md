# CS2 Roulette - Harley Quinn Edition 🎰

Una ruleta web interactiva con temática de Counter-Strike 2 y estilo Harley Quinn, optimizada para streaming en OBS.

![Version](https://img.shields.io/badge/version-1.0.0-ff1493.svg)
![License](https://img.shields.io/badge/license-MIT-dc143c.svg)
![OBS Compatible](https://img.shields.io/badge/OBS-Compatible-9400d3.svg)

## 🎮 Características

### Funcionalidades Principales
- **Sistema de probabilidades configurable**: Asigna pesos individuales a cada opción
- **Animaciones fluidas**: Física realista con aceleración y desaceleración
- **Modo torneo**: Elimina opciones ya seleccionadas automáticamente
- **Efectos visuales**: Partículas, confeti y fuegos artificiales al ganar
- **Sonidos personalizables**: Efectos de sonido para girar y ganar
- **Temas**: Modo oscuro/claro con paleta de colores Harley Quinn
- **Import/Export**: Guarda y comparte configuraciones

### Interfaz
- Diseño centrado en la ruleta
- Panel de configuración colapsable
- Modal de resultado con animaciones
- Totalmente responsive
- Optimizado para OBS Browser Source

## 🚀 Inicio Rápido

### Instalación Local

1. Clona el repositorio:
```bash
git clone https://github.com/tuusuario/roulette-web.git
cd roulette-web
```

2. Instala las dependencias (para desarrollo):
```bash
npm install
```

3. Abre `index.html` en tu navegador

### Uso Básico

1. **Configurar opciones**: Haz clic en ⚙️ CONFIGURACIÓN
2. **Añadir/editar opciones**: Modifica el texto y peso de cada opción
3. **Girar la ruleta**: Pulsa el botón SPIN IT!
4. **Ver resultado**: Aparecerá un modal con efectos especiales

## 🎥 Integración con OBS

### Configuración Básica

1. En OBS, añade una nueva fuente "Browser"
2. URL: `file:///ruta/completa/a/index.html?obs`
3. Ancho: 1920, Alto: 1080 (o tu resolución preferida)
4. FPS: 60

### Parámetros URL para OBS

La ruleta soporta múltiples parámetros para personalizar la experiencia en OBS:

```
index.html?obs&compact&no-header&bg=00ff00
```

#### Parámetros Disponibles

| Parámetro | Descripción |
|-----------|-------------|
| `obs` | Activa el modo OBS (optimizaciones de rendimiento) |
| `compact` | Modo compacto (80% del tamaño) |
| `ultra-compact` | Modo ultra compacto (60% del tamaño) |
| `chroma` | Fondo verde para chroma key |
| `high-contrast` | Modo de alto contraste |
| `performance` | Desactiva animaciones no esenciales |
| `alert` | Modo alerta (resultados más grandes) |
| `transparent` | Paneles con transparencia |
| `no-header` | Oculta el título |
| `config` | Muestra el panel de configuración |
| `bg=RRGGBB` | Color de fondo personalizado (hex) |
| `zoom=0.8` | Nivel de zoom personalizado |
| `auto-spin=30` | Auto-gira cada X segundos |
| `hide=title,button` | Oculta elementos específicos |

### Ejemplos de Configuración OBS

**Ruleta minimalista transparente:**
```
index.html?obs&no-header&transparent
```

**Modo alerta para notificaciones:**
```
index.html?obs&alert&hide=button,title
```

**Fondo chroma key compacto:**
```
index.html?obs&chroma&compact
```

### Control Remoto vía JavaScript

Puedes controlar la ruleta desde OBS usando JavaScript:

```javascript
// En OBS Browser Source - Interact
obsBrowserSourceInteract('spin'); // Girar
obsBrowserSourceInteract('reset'); // Resetear
obsBrowserSourceInteract('setMode', {mode: 'alert'}); // Cambiar modo
obsBrowserSourceInteract('setOptions', [ // Cambiar opciones
    {text: 'Opción 1', weight: 50, color: '#ff0000'},
    {text: 'Opción 2', weight: 30, color: '#00ff00'}
]);
```

## ⚙️ Configuración Avanzada

### Estructura de Opciones

```json
{
    "options": [
        {
            "text": "Headshot!",
            "weight": 10,
            "color": "#ff0000"
        }
    ],
    "theme": "dark",
    "soundEnabled": true,
    "soundVolume": 0.5,
    "tournamentMode": false
}
```

### Personalización de Estilos

Los colores principales se pueden modificar en `css/styles.css`:

```css
:root {
    --accent-red: #dc143c;
    --accent-pink: #ff1493;
    --accent-purple: #9400d3;
    --accent-cs-orange: #ff7b00;
    --accent-cs-blue: #1e90ff;
}
```

### Añadir Sonidos

Coloca archivos de audio en `assets/sounds/`:
- `spin.mp3`: Sonido al girar
- `win.mp3`: Sonido al ganar

## 🧪 Testing

Ejecutar los tests:
```bash
npm test
```

Con coverage:
```bash
npm run test:coverage
```

## 📝 Atajos de Teclado

| Tecla | Acción |
|-------|--------|
| `Space` | Girar la ruleta |
| `C` | Abrir/cerrar configuración |
| `T` | Cambiar tema |
| `M` | Silenciar/activar sonido |
| `R` | Resetear estadísticas |

## 🎨 Temas Disponibles

- **Dark Mode** (predeterminado): Tema oscuro estilo Harley Quinn
- **Light Mode**: Tema claro con colores vibrantes
- **High Contrast**: Para mejor visibilidad
- **Chroma Mode**: Fondo verde para chroma key

## 🔧 Desarrollo

### Estructura del Proyecto

```
roulette-web/
├── index.html
├── css/
│   ├── styles.css
│   └── obs-optimized.css
├── js/
│   ├── config.js
│   ├── roulette.js
│   ├── particles.js
│   ├── app.js
│   └── obs-helper.js
├── assets/
│   └── sounds/
├── tests/
│   ├── config.test.js
│   └── roulette.test.js
└── README.md
```

### Comandos

```bash
npm test          # Ejecutar tests
npm run lint      # Verificar código
npm run lint:fix  # Arreglar problemas de estilo
```

## 🐛 Solución de Problemas

### La ruleta no gira
- Verifica que haya opciones configuradas
- Comprueba la consola del navegador para errores
- Asegúrate de que el botón no esté deshabilitado

### No se escuchan los sonidos
- Verifica que los archivos de audio estén en `assets/sounds/`
- Comprueba que el sonido esté activado (icono 🔊)
- Algunos navegadores requieren interacción antes de reproducir audio

### Problemas en OBS
- Usa el parámetro `?obs` en la URL
- Prueba el modo `performance` si hay lag
- Ajusta el FPS en OBS a 60

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE)

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea tu rama de características (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📞 Soporte

- Crear un [Issue](https://github.com/tuusuario/roulette-web/issues)
- Discord: [Tu servidor]
- Email: tuemail@ejemplo.com

---

Hecho con ❤️ para la comunidad de streaming