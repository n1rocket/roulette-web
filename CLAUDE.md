# Proyecto: Ruleta Web para Streaming

## Descripción
Crear una ruleta en HTML y JS con animaciones y personalizable para usar en OBS durante streaming de Twitch.

## Requisitos Principales
- **Interfaz**: HTML5 con animaciones fluidas
- **Funcionalidad**: JavaScript vanilla o con librerías ligeras
- **Personalización**: Lista de textos configurable
- **Probabilidades**: Asignar peso/probabilidad a cada opción
- **Simplicidad**: Código limpio y fácil de mantener
- **Testing**: Incluir tests unitarios
- **Integración**: Compatible con OBS Browser Source

## Características a Implementar
- **Múltiples temas y modos**: Oscuro/claro con paletas de colores personalizables
- **Sistema de probabilidades configurable**: Peso individual para cada opción
- **Efectos visuales y sonoros**: Animaciones al girar, sonidos configurables
- **Modo torneo**: Eliminar opciones ya seleccionadas automáticamente
- **Integración con StreamElements/Streamlabs**: Triggers por eventos de stream
- **Estadísticas y historial**: Registro de últimos resultados y análisis
- **Import/export de configuraciones**: Guardar y compartir presets

## Ideas Adicionales

### Características Visuales
- **Temas personalizables**: Colores, fuentes, tamaños ajustables
- **Efectos de sonido**: Sonidos al girar y al parar
- **Animaciones especiales**: Confeti, fuegos artificiales al ganar
- **Modo oscuro/claro**: Para diferentes fondos de stream
- **Indicador de velocidad**: Mostrar visualmente la desaceleración

### Funcionalidades Interactivas
- **Control por chat**: Integración con Twitch API para que viewers activen la ruleta
- **Historial de resultados**: Mostrar últimos X resultados
- **Modo torneo**: Eliminar opciones ya seleccionadas
- **Múltiples ruletas**: Poder tener varias ruletas predefinidas
- **Hotkeys**: Atajos de teclado para girar/resetear

### Características Técnicas
- **Guardado de configuración**: Local storage para persistir settings
- **Import/Export**: Poder compartir configuraciones
- **API REST**: Endpoints para control remoto
- **WebSocket**: Para sincronización en tiempo real
- **Responsive**: Adaptable a diferentes tamaños en OBS

### Gamificación
- **Sistema de puntos**: Acumular puntos según resultados
- **Achievements**: Logros desbloqueables
- **Estadísticas**: Mostrar probabilidades reales vs teóricas
- **Modo predicción**: Viewers pueden apostar al resultado

### Integraciones
- **StreamElements/Streamlabs**: Triggers por donaciones/subs
- **Discord webhook**: Notificar resultados
- **Google Sheets**: Logging de resultados
- **OBS WebSocket**: Control desde OBS

## Estructura de Archivos Sugerida
```
roulette-web/
├── index.html
├── css/
│   ├── styles.css
│   └── themes/
├── js/
│   ├── roulette.js
│   ├── config.js
│   └── utils.js
├── assets/
│   ├── sounds/
│   └── images/
├── tests/
│   └── roulette.test.js
└── config/
    └── presets.json
```

## Comandos de Desarrollo
- `npm test` - Ejecutar tests
- `npm run lint` - Verificar código
- `npm run build` - Generar versión de producción