# 🚀 Deployment en GitHub Pages

## ✅ Compatibilidad

Esta ruleta web es **100% compatible con GitHub Pages** porque:
- Es una aplicación web estática (HTML, CSS, JS)
- No requiere servidor backend
- No usa bases de datos
- Todos los datos se guardan en localStorage del navegador

## 📋 Pasos para Deploy

### 1. Subir a GitHub

```bash
# Inicializar git si no lo has hecho
git init

# Agregar todos los archivos
git add .

# Commit inicial
git commit -m "Initial commit - Ruleta Web para Streaming"

# Agregar tu repositorio remoto
git remote add origin https://github.com/TU_USUARIO/roulette-web.git

# Push al repositorio
git push -u origin main
```

### 2. Activar GitHub Pages

1. Ve a tu repositorio en GitHub
2. Click en **Settings** (⚙️)
3. Scroll hasta **Pages** en el menú lateral
4. En **Source**, selecciona:
   - **Deploy from a branch**
   - Branch: **main** (o master)
   - Folder: **/ (root)**
5. Click en **Save**

### 3. Esperar el Deploy

- GitHub tardará 1-2 minutos en construir tu sitio
- Aparecerá un mensaje verde con la URL cuando esté listo
- Tu sitio estará en: `https://TU_USUARIO.github.io/roulette-web/`

## 🎯 URLs Importantes

### URL Base:
```
https://TU_USUARIO.github.io/roulette-web/
```

### Para OBS Browser Source:
```
https://TU_USUARIO.github.io/roulette-web/?obs
```

### Modos especiales:
```
# Modo compacto
https://TU_USUARIO.github.io/roulette-web/?obs&compact

# Chroma key
https://TU_USUARIO.github.io/roulette-web/?obs&chroma

# Sin configuración visible
https://TU_USUARIO.github.io/roulette-web/?obs&config
```

## 🔧 Configuración Adicional

### Custom Domain (Opcional)

1. Crea un archivo `CNAME` en la raíz con tu dominio:
   ```
   ruleta.tudominio.com
   ```

2. Configura DNS en tu proveedor:
   - Tipo: CNAME
   - Host: ruleta (o www)
   - Points to: TU_USUARIO.github.io

### Forzar HTTPS

GitHub Pages usa HTTPS automáticamente. En Settings > Pages, marca:
- ✅ Enforce HTTPS

## 📱 Características que Funcionan en GitHub Pages

✅ **Todo funciona perfectamente**:
- Animaciones y gráficos
- Efectos de sonido (necesitas subir los archivos MP3)
- Guardado de configuración (localStorage)
- Presets personalizados
- Estadísticas y historial
- Temas visuales
- Modo torneo
- Auto-spin
- Integración con Streamlabs

## ⚠️ Limitaciones

### Sonidos:
- Debes agregar los archivos `spin.mp3` y `win.mp3` en `assets/sounds/`
- O usar el generador de sonidos incluido

### CORS:
- La integración con Streamlabs funcionará sin problemas
- Las conexiones WebSocket no tienen restricciones CORS

### Almacenamiento:
- Los datos se guardan en el navegador del usuario
- Cada navegador/dispositivo tiene su propio almacenamiento

## 🎨 Personalización Post-Deploy

Puedes seguir actualizando tu ruleta:

1. Haz cambios localmente
2. Commit y push:
   ```bash
   git add .
   git commit -m "Descripción del cambio"
   git push
   ```
3. GitHub Pages se actualizará automáticamente en 1-2 minutos

## 🔗 Compartir con tu Audiencia

### Para que los viewers la usen:
```
¡Prueba la ruleta en: https://TU_USUARIO.github.io/roulette-web/
```

### Para otros streamers:
Pueden hacer fork de tu repositorio y tener su propia versión

## 💡 Tips

1. **Caché del navegador**: Si no ves cambios, fuerza recarga con Ctrl+F5
2. **Testing local**: Usa `python -m http.server 8000` para probar localmente
3. **Analytics**: Puedes agregar Google Analytics si quieres estadísticas
4. **Backup**: GitHub mantiene historial de todos los cambios

## 🆘 Solución de Problemas

### 404 Error:
- Verifica que GitHub Pages esté activado
- Espera 5 minutos después de activarlo
- Asegúrate de que el archivo se llame `index.html`

### No se ven los cambios:
- Limpia caché del navegador
- Espera 2-3 minutos después del push
- Verifica en modo incógnito

### Problemas con rutas:
- Todos los paths en el código son relativos
- No debería haber problemas, pero si los hay, revisa las rutas en el HTML

---

¡Tu ruleta estará disponible mundialmente de forma gratuita! 🎉