# 🎰 Ruleta Web para Streaming

Una ruleta interactiva y personalizable diseñada específicamente para streamers. Compatible con OBS, Streamlabs y lista para GitHub Pages.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características

### 🎯 Núcleo
- **Ruleta animada** con física realista
- **Sistema de probabilidades** configurable por opción
- **Múltiples temas visuales** (6 temas incluidos)
- **Efectos de sonido** personalizables
- **Guardado automático** de configuración

### 🎮 Modos de Juego
- **Modo Normal**: Ruleta estándar
- **Modo Torneo**: Elimina opciones ya seleccionadas
- **Auto-Spin**: Gira automáticamente cada X segundos
- **Predicciones**: Los viewers pueden predecir resultados

### 📊 Estadísticas
- Contador de giros totales y por sesión
- Historial detallado con timestamps
- Gráficos interactivos (circular, barras, líneas)
- Análisis de probabilidades reales vs esperadas
- Detección de patrones y rachas

### 🔧 Personalización
- **Presets incluidos**: CS2, Valorant, Fortnite, Apex, LoL, y más
- **Presets personalizados**: Guarda y comparte configuraciones
- **Import/Export**: Comparte configuraciones con otros streamers
- **Hotkeys**: Control rápido con teclado

### 🎬 Integración Streaming

#### OBS Browser Source
- Modo OBS optimizado
- Múltiples layouts (compacto, ultra-compacto)
- Chroma key para fondos transparentes
- Modo rendimiento para streams pesados

#### Streamlabs
- **Activación automática** por eventos:
  - Donaciones (monto mínimo configurable)
  - Suscripciones (1-3 giros según tier)
  - Bits/Cheers
  - Raids (múltiples giros según tamaño)
  - Hosts
- **Notificaciones animadas** en pantalla
- **Sistema de predicciones** para chat

## 🚀 Demo en Vivo

Próximamente en: `https://tu-usuario.github.io/roulette-web/`

## 💻 Instalación

### Opción 1: GitHub Pages (Recomendado)

1. Fork este repositorio
2. Ve a Settings → Pages
3. Activa GitHub Pages desde la rama `main`
4. Tu ruleta estará en: `https://tu-usuario.github.io/roulette-web/`

### Opción 2: Uso Local

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/roulette-web.git
cd roulette-web

# Abrir en el navegador
# Opción A: Directamente
open index.html

# Opción B: Con servidor local
python -m http.server 8000
# Visitar http://localhost:8000
```

## 🎯 Uso Rápido

### En OBS

1. Agregar **Browser Source**
2. URL: `https://tu-usuario.github.io/roulette-web/?obs`
3. Dimensiones: 800x600 (o ajustar según necesites)
4. ✅ Marcar "Shutdown source when not visible"

### Configuración Básica

1. Click en **⚙️ CONFIGURACIÓN**
2. Selecciona un preset o crea opciones personalizadas
3. Ajusta probabilidades con los pesos (1-100)
4. ¡Listo para girar!

### Hotkeys

- `Space/Enter` - Girar la ruleta
- `C` - Abrir/cerrar configuración
- `T` - Cambiar tema
- `S` - Toggle sonido
- `M` - Toggle modo torneo
- `Ctrl+R` - Resetear estadísticas

## 🔗 URLs Especiales

```bash
# Modo normal
https://tu-usuario.github.io/roulette-web/

# Para OBS (oculta configuración)
https://tu-usuario.github.io/roulette-web/?obs

# Modo compacto
https://tu-usuario.github.io/roulette-web/?obs&compact

# Chroma key (fondo verde)
https://tu-usuario.github.io/roulette-web/?obs&chroma

# Auto-spin cada 30 segundos
https://tu-usuario.github.io/roulette-web/?auto-spin=30
```

## 🎨 Temas Disponibles

1. **Dark** (default) - Tema oscuro elegante
2. **Light** - Tema claro minimalista
3. **Harley** - Rosa y morado vibrante
4. **CS2** - Naranja y azul competitivo
5. **Neon** - Colores neón brillantes
6. **Retro** - Verde terminal clásico

## 📱 Compatibilidad

- ✅ Chrome / Edge (Recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ OBS Browser Source
- ✅ Streamlabs OBS
- ✅ Mobile (responsive)

## 🔧 Configuración Avanzada

### Streamlabs Integration

1. Obtén tu Socket API Token desde Streamlabs
2. Click en "🔴 Conectar" en el panel Streamlabs
3. Configura triggers mínimos
4. ¡Los eventos activarán la ruleta automáticamente!

### Custom Presets

```javascript
// Estructura de un preset
{
  "name": "Mi Preset",
  "options": [
    { "text": "Opción 1", "weight": 30, "color": "#ff0000" },
    { "text": "Opción 2", "weight": 70, "color": "#00ff00" }
  ]
}
```

## 📊 Estructura del Proyecto

```
roulette-web/
├── index.html              # Página principal
├── css/
│   ├── styles.css         # Estilos principales
│   └── obs-optimized.css  # Optimizaciones para OBS
├── js/
│   ├── app.js            # Aplicación principal
│   ├── config.js         # Gestión de configuración
│   ├── roulette.js       # Lógica de la ruleta
│   ├── charts.js         # Gráficos estadísticos
│   ├── particles.js      # Efectos visuales
│   ├── streamlabs.js     # Integración Streamlabs
│   └── presets.js        # Presets predefinidos
└── assets/
    └── sounds/           # Efectos de sonido
```

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT - ver [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Diseñado para la comunidad de streamers
- Inspirado en las necesidades reales de streaming
- Construido con tecnologías web modernas

## 📞 Soporte

- 🐛 [Reportar bugs](https://github.com/tu-usuario/roulette-web/issues)
- 💡 [Solicitar features](https://github.com/tu-usuario/roulette-web/issues)
- 📧 Contacto: tu-email@ejemplo.com

---

Hecho con ❤️ para streamers