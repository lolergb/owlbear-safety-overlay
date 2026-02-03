# Safety Overlay – Extensión para Owlbear Rodeo

Extensión de seguridad para partidas: **X-Card**, **Pause** y **Rewind**. Anónimo por defecto; el GM puede ver un log de eventos y opcionalmente mostrar identidad.

**Repositorio:** `git@github.com:lolergb/owlbear-safety-overlay.git`

## Funcionalidad (MVP)

- **Botón "Safety"** siempre visible (icono de la extensión en Owlbear; al pulsar se abre el panel).
- **Panel** con 3 acciones: X-Card, Pause, Rewind.
- Al disparar una acción se muestra a **todos** (usando `OBR.modal`):
  - Un **banner de texto** arriba-centro dentro del popover durante 4 segundos.
  - Una **carta visual** (imagen) en el centro del tablero: modal de OBR con backdrop semitransparente, auto-hide 4 s, cierre manual (click o botón "Close"). Si llegan varias activaciones seguidas, se encolan y se muestran en orden (sincronización vía broadcast: cuando el modal se cierra, avisa al popover y se abre el siguiente).
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
- **Cola de cartas**: CardOverlay muestra las cartas en orden cuando se encolan varias.
- **Mapping actionId → asset**: `getCardImagePath` devuelve la ruta correcta para x-card, pause, rewind; actionId desconocido no rompe (fallback a x-card).
- **Beta features**: BetaService cachea features, detecta Netlify, maneja errores, incluye token en request.

## Features Beta

Safety Overlay incluye un sistema de **features beta** para probar nuevas funcionalidades antes de lanzarlas a todos. Ver documentación completa en [`docs/BETA_FEATURES.md`](docs/BETA_FEATURES.md).

**Resumen rápido:**
- Configura `BETA_FEATURES_ENABLED=true` y `OWNER_TOKEN` en Netlify.
- Solo el owner (con token correcto) verá features experimentales.
- Badge "🧪 BETA" visible cuando está activo.

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
    CardOverlay.js         # Carta visual centrada (modal, cola, auto-close, Close)
    GmLogPanel.js          # Lista de eventos solo GM
  services/
    obr/
      MetadataService.js   # get/set/subscribe room metadata (namespace)
    safety/
      SafetyTypes.js
      SafetyEventBus.js    # createEvent, appendAndTrim
      SafetyService.js     # triggerAction, getConfig, setConfig, clearLog
    BetaService.js         # gestión de features beta desde Netlify
  utils/
    constants.js
    logger.js              # getUserRole() con caché (patrón gm-vault)
    helpers.js
    cardAssets.js          # actionId -> ruta imagen carta
    modalUrl.js            # getCardModalUrl para OBR.modal.open
public/
  cards/                   # Imágenes de cartas (x-card.svg, pause.svg, rewind.svg)
netlify/
  functions/
    get-beta-features.js   # Netlify Function para features beta
css/
  app.css
index.html
manifest.json
netlify.toml
docs/
  BETA_FEATURES.md         # Documentación del sistema beta
```

## Notas técnicas

### Gestión de roles (patrón gm-vault)

- `logger.js` provee `getUserRole()` con **caché** y promesa compartida para evitar múltiples llamadas simultáneas a `OBR.player.getRole()`.
- `setOBRReference(OBR)` se llama desde `ExtensionController` al inicializar, inyectando OBR al logger para evitar dependencias circulares.
- `resetRoleCache()` limpia el caché (usado en tests para aislar cada test).

### Sincronización de modales (broadcast)

- Cuando un modal de carta se cierra (auto-hide o manual), envía un broadcast `BROADCAST_CARD_CLOSED` con `{ senderId }`.
- Cada cliente solo procesa el broadcast de **su propio** cierre (compara `senderId` con `playerId`), abriendo el siguiente modal de su cola inmediatamente.
- Esto asegura que los modales fluyan sin lag cuando el usuario cierra antes del auto-hide.

## Licencia

MIT.
