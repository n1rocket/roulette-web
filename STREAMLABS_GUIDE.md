# Guía de Integración con Streamlabs

## 🎯 Funcionalidades

La ruleta web ahora se integra con Streamlabs para activarse automáticamente con eventos del stream:

### Eventos Soportados:
- **💰 Donaciones**: Gira automáticamente cuando alguien dona (mínimo configurable)
- **🎉 Suscripciones**: Gira 1-3 veces según el tier de la suscripción
- **💎 Bits**: Activa la ruleta con cheers (mínimo configurable)
- **⚔️ Raids**: Múltiples giros según el tamaño del raid
- **📺 Hosts**: Gira cuando te hostean con cierto número de viewers
- **👤 Follows**: Opción para activar con nuevos seguidores

### Características Especiales:
- **Notificaciones en pantalla** con animaciones
- **Modo predicción**: Los viewers pueden predecir el resultado
- **Sistema de puntos** (próximamente)
- **Comandos de chat** personalizables

## 🔧 Configuración

### 1. Obtener Socket API Token

1. Ve a [Streamlabs Dashboard](https://streamlabs.com/dashboard)
2. Navega a **Settings** → **API Settings** → **API Tokens**
3. Copia tu **Socket API Token**

### 2. Conectar la Ruleta

1. Abre el panel de configuración de la ruleta
2. En la sección **STREAMLABS**, haz clic en "🔴 Conectar"
3. Pega tu Socket API Token
4. Presiona Enter para conectar

### 3. Configurar Triggers

Personaliza qué eventos activan la ruleta:

- **Donaciones**: Establece el monto mínimo
- **Bits**: Define cantidad mínima de bits
- **Raids**: Configura viewers mínimos

## 🎮 Uso

### Durante el Stream:

1. **Conexión activa**: El botón mostrará "🟢 Conectado"
2. **Eventos automáticos**: La ruleta girará sola con los eventos configurados
3. **Notificaciones**: Aparecerán en pantalla mostrando quién activó la ruleta

### Comandos de Chat (próximamente):
- `!spin` - Gira la ruleta (con puntos)
- `!predict [opción]` - Predice el resultado
- `!stats` - Muestra estadísticas
- `!opciones` - Lista las opciones disponibles

## 🧪 Modo de Prueba

Usa los botones de prueba para simular eventos:
- **Probar Donación**: Simula una donación de $10
- **Probar Sub**: Simula una suscripción Tier 1

## 📊 Análisis

Los eventos de Streamlabs se registran para análisis:
- Historial de eventos en localStorage
- Estadísticas de qué eventos generan más interacción
- Patrones de actividad durante el stream

## 🔒 Seguridad

- El token se usa solo para conectar con Streamlabs
- No se almacena en ningún lugar
- La conexión es segura vía WebSocket SSL
- Puedes desconectar en cualquier momento

## 🚀 Ideas Avanzadas

### Modos Especiales por Evento:
- **Donation Mode**: Opciones premium para donaciones grandes
- **Sub Mode**: Ruleta especial solo para subs
- **Raid Mode**: Opciones caóticas para raids grandes

### Integración con OBS:
1. Agrega la ruleta como Browser Source
2. Usa los parámetros URL para modo OBS
3. Los eventos aparecerán automáticamente

## ⚠️ Solución de Problemas

### No se conecta:
- Verifica que el token sea correcto
- Asegúrate de tener conexión a internet
- Revisa la consola del navegador (F12)

### No se activa con eventos:
- Confirma que los triggers estén habilitados
- Verifica los montos mínimos
- Asegúrate de que Streamlabs esté recibiendo los eventos

### Problemas de rendimiento:
- Activa el "Modo Rendimiento" en configuración OBS
- Reduce la cantidad de partículas
- Usa el modo compacto

## 📝 Notas

- La integración requiere que mantengas la página abierta
- Los eventos se procesan en tiempo real
- Puedes combinar con auto-spin para más automatización
- Compatible con todos los temas y modos de la ruleta