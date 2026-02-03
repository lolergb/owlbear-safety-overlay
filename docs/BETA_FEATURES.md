# Sistema de Features Beta

Este documento explica cómo configurar y usar el sistema de features beta en Safety Overlay.

## ¿Qué es?

El sistema de features beta permite **al owner** habilitar funcionalidades experimentales o en desarrollo sin afectar a todos los usuarios. Solo el owner (o usuarios específicos con token) pueden ver y usar estas features.

## Arquitectura

```
┌─────────────────┐
│  Cliente (JS)   │
│  BetaService    │
└────────┬────────┘
         │ GET /.netlify/functions/get-beta-features?token=XXX
         ▼
┌─────────────────┐
│ Netlify Function│
│get-beta-features│
└────────┬────────┘
         │ Lee env vars: BETA_FEATURES_ENABLED, OWNER_TOKEN, BETA_FEATURES
         ▼
┌─────────────────┐
│   Response      │
│ { betaEnabled,  │
│   features: {}  │
└─────────────────┘
```

## Configuración en Netlify

### 1. Variables de entorno

Ve a tu sitio en Netlify → **Site settings** → **Environment variables** y añade:

#### `BETA_FEATURES_ENABLED`
- **Valor**: `true` o `1` (para habilitar) | `false` o `0` (para deshabilitar)
- **Descripción**: Activa/desactiva el sistema beta globalmente.

#### `OWNER_TOKEN` (opcional pero recomendado)
- **Valor**: Un string único que solo tú conoces (ej: `mi-token-secreto-123`)
- **Descripción**: Si se define, solo usuarios con este token podrán acceder a features beta.
- **Cómo obtenerlo**: Actualmente Safety Overlay usa el player ID de OBR. Puedes:
  1. Abrir la consola del navegador en Owlbear.
  2. Ejecutar: `OBR.player.getId().then(console.log)`
  3. Copiar el ID que aparece y usarlo como `OWNER_TOKEN`.

#### `BETA_FEATURES`
- **Valor**: JSON string con features habilitadas
- **Formato**: `{"featureName": true, "anotherFeature": false}`
- **Ejemplo**:
  ```json
  {"customActions":true,"advancedSettings":true,"exportLog":false}
  ```

### 2. Ejemplo de configuración completa

```
BETA_FEATURES_ENABLED = true
OWNER_TOKEN = player_abc123xyz
BETA_FEATURES = {"customActions":true,"advancedSettings":true}
```

### 3. Redeploy

Después de configurar las variables:
1. Ve a **Deploys** en Netlify.
2. Haz clic en **Trigger deploy** → **Clear cache and deploy site**.

## Uso en el código

### Comprobar si beta está habilitado

```javascript
import { betaService } from './services/BetaService.js';

// En el código (después de init)
if (betaService.isBetaEnabled()) {
  console.log('🧪 Beta mode activo');
}
```

### Comprobar una feature específica

```javascript
if (betaService.isFeatureEnabled('customActions')) {
  // Mostrar botón para añadir acciones personalizadas
  renderCustomActionsButton();
}

if (betaService.isFeatureEnabled('advancedSettings')) {
  // Mostrar settings avanzados solo en beta
  renderAdvancedSettings();
}
```

### Obtener todas las features

```javascript
const features = betaService.getFeatures();
// { customActions: true, advancedSettings: true, ... }
```

## Features beta disponibles

Actualmente el sistema está preparado pero no hay features beta implementadas. Para añadir una:

### 1. Definir la feature en Netlify

```json
BETA_FEATURES = {"myNewFeature":true}
```

### 2. Usar en el código

```javascript
// En SafetyPanel.js, por ejemplo:
_renderActions() {
  // ... acciones normales ...
  
  // Feature beta: botón experimental
  if (this.betaService?.isFeatureEnabled('myNewFeature')) {
    const betaBtn = document.createElement('button');
    betaBtn.className = 'safety-btn safety-btn--beta';
    betaBtn.textContent = '⚡ Experimental';
    betaBtn.title = 'Feature en beta';
    betaBtn.addEventListener('click', () => this._onBetaFeature());
    this._actionsContainer.appendChild(betaBtn);
  }
}
```

## Testing local

En local (sin Netlify), el sistema beta **NO** se activa automáticamente porque la función `get-beta-features` no existe.

Para testear en local:

### Opción 1: Mock manual
```javascript
// En tu código de desarrollo
betaService._betaEnabled = true;
betaService._features = { myFeature: true };
```

### Opción 2: Netlify Dev (recomendado)
```bash
npm install -g netlify-cli
netlify dev
```
Esto levanta un servidor local que simula el entorno de Netlify con las functions.

## Seguridad

- ✅ **OWNER_TOKEN nunca se expone** al cliente (solo se envía en query params para verificación server-side).
- ✅ Las features beta solo se activan si el token coincide.
- ✅ Si no hay `OWNER_TOKEN`, solo con `BETA_FEATURES_ENABLED=true` se activa (menos seguro, usar solo para testing).
- ✅ La Netlify Function valida en el backend, no hay forma de "hackear" el acceso desde el cliente.

## Desactivar beta

Para desactivar el sistema beta:

1. En Netlify → Environment variables:
   - Cambia `BETA_FEATURES_ENABLED` a `false` o borra la variable.
2. Redeploy el sitio.
3. Los usuarios verán la extensión normal sin badge "BETA" ni features experimentales.

## UI: Badge Beta

Cuando el sistema beta está activo, aparece un badge "🧪 BETA" en la esquina superior derecha del panel. Esto indica que:
- El usuario actual tiene acceso a features beta.
- Puede haber botones, opciones o comportamientos experimentales visibles.

El badge es **solo informativo** y no hace nada al hacer clic (puedes añadir un modal explicativo si lo deseas).

## Roadmap de features beta (ejemplos)

Aquí algunas ideas de features que podrían implementarse como beta:

- **`customActions`**: Permitir al GM añadir acciones personalizadas (ej: "Lines & Veils", "Open Door").
- **`advancedSettings`**: Opciones extra como cooldown configurable, colores personalizados de cartas.
- **`exportLog`**: Botón para exportar el GM log como JSON/CSV.
- **`analyticsIntegration`**: Enviar eventos a Mixpanel/analytics (solo para el owner, para ver uso).
- **`cardAnimations`**: Animaciones más elaboradas al mostrar cartas.

Cada una se habilitaría con:
```json
BETA_FEATURES = {"customActions":true,"exportLog":false,...}
```

## Preguntas frecuentes

**P: ¿Los jugadores normales verán las features beta?**  
R: No, solo el usuario con el `OWNER_TOKEN` correcto las verá.

**P: ¿Puedo tener múltiples usuarios beta?**  
R: Actualmente solo un `OWNER_TOKEN`. Para múltiples usuarios, podrías modificar la función para aceptar una lista de tokens.

**P: ¿Cómo sé mi player ID para el OWNER_TOKEN?**  
R: Abre la consola del navegador en Owlbear y ejecuta: `OBR.player.getId().then(console.log)`.

**P: ¿Qué pasa si borro `OWNER_TOKEN`?**  
R: Con `BETA_FEATURES_ENABLED=true` y sin `OWNER_TOKEN`, **todos** los usuarios verán beta. Útil para testing público, pero no recomendado en producción.

**P: ¿Puedo cambiar features sin redeploy?**  
R: Sí, cambiar `BETA_FEATURES` en Netlify env vars es instantáneo (tras un "Clear cache and redeploy" o esperar ~5 min por caché de CDN).

---

**Última actualización**: 2026-02-03
