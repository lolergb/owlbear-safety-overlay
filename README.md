# Safety Overlay – Extensión para Owlbear Rodeo

Extensión de seguridad para partidas: **X-Card**, **Pause** y **Rewind**. Anónimo por defecto; el GM puede ver un log de eventos y opcionalmente mostrar identidad.

**Repositorio:** `git@github.com:lolergb/owlbear-safety-overlay.git`

## Funcionalidad (MVP)

- **Botón "Safety"** siempre visible (icono de la extensión en Owlbear; al pulsar se abre el panel).
- **Panel** con 3 acciones: X-Card, Pause, Rewind.
- Al disparar una acción se muestra a **todos** un banner arriba-centro durante 4 segundos. Si llegan varios eventos seguidos, se encolan.
- **Privacidad**: anónimo por defecto (no se guarda ni muestra identidad).
- **Solo GM**:
  - **Notify GM privately** (por defecto activado): el GM ve los eventos en un log solo para GM.
  - **Show identity** (por defecto desactivado): si se activa, se puede mostrar y registrar nombre/usuario en el log.
- **GM Event Log**: últimos 50 eventos (hora + acción + nombre solo si Show identity está activo). Botón "Clear log" (solo GM).

## Cómo correr en local

Mismo patrón que el proyecto base (p. ej. owlbear-gm-vault):

```bash
# Opción 1: servidor Python
npm run dev
# Sirve en http://localhost:8000

# Opción 2: http-server (Node)
npm run serve
# Sirve en http://localhost:8000
```

Luego en Owlbear Rodeo añade la extensión con la URL del manifest (ver más abajo).

## Cómo desplegar (estático)

- **Netlify**: el proyecto está preparado para deploy estático.
  - Conectar el repo a Netlify.
  - Build: sin comando (sitio estático).
  - Publish directory: `.` (raíz).
  - Los headers CORS para `https://www.owlbear.rodeo` ya están en `netlify.toml`.

- **Otra plataforma**: subir la raíz del proyecto como sitio estático y configurar CORS para el origen de Owlbear si hace falta.

## Dónde cambiar APP_ID, namespace y URL del manifest

- **Namespace de metadata** (claves en room):  
  `js/utils/constants.js`  
  - `NS_CONFIG = 'com.lole.safetyOverlay/config'`  
  - `NS_EVENTS = 'com.lole.safetyOverlay/events'`  
  Cambia el prefijo si quieres otro namespace.

- **Manifest y URL pública**:  
  `manifest.json`  
  - `name`, `description`, `homepage_url`, `icon`, `action.icon`: pon la URL base de tu despliegue (ej. `https://owlbear-safety-overlay.netlify.app`).  
  En Owlbear se usa la URL del manifest, por ejemplo:  
  `https://owlbear-safety-overlay.netlify.app/manifest.json`

- **APP_ID**: Owlbear no usa un APP_ID propio de la extensión; la identificación es por la URL del manifest. No hay que configurar APP_ID adicional.

## Tests

```bash
npm test
# Watch
npm run test:watch
# Con cobertura
npm run test:coverage
```

Tests incluidos:

- **Trim a 50**: `appendAndTrim` mantiene como máximo los últimos 50 eventos.
- **Anonimato**: con `showIdentity=false`, los eventos compartidos no incluyen `userId` ni `userName`.
- **Cola de toasts**: lógica de cola del overlay (unit test de la UI de toasts).

## Estructura del proyecto

Misma filosofía que el proyecto base: UI fina y lógica en servicios.

```
js/
  main.js                 # Entrypoint, OBR.onReady
  controllers/
    ExtensionController.js
  ui/
    SafetyPanel.js         # Panel principal (acciones + settings GM + log)
    ToastOverlay.js        # Cola de toasts, 4s
    GmLogPanel.js          # Lista de eventos solo GM
  services/
    obr/
      MetadataService.js   # get/set/subscribe room metadata (namespace)
    safety/
      SafetyTypes.js
      SafetyEventBus.js    # createEvent, appendAndTrim
      SafetyService.js     # triggerAction, getConfig, setConfig, clearLog
  utils/
    constants.js
    logger.js
    helpers.js
css/
  app.css
index.html
manifest.json
netlify.toml
```

## Licencia

MIT.
