# Ejemplo: Implementar una Feature Beta

Este documento muestra cómo añadir una nueva feature beta paso a paso.

## Ejemplo: Botón "Export Log" (exportar log como JSON)

Queremos añadir un botón que permite exportar el GM Event Log como archivo JSON, pero solo para el owner en modo beta.

### 1. Definir la feature en Netlify

En Netlify → Site settings → Environment variables:

```
BETA_FEATURES = {"exportLog":true}
```

### 2. Actualizar la UI para mostrar la feature

**Archivo**: `js/ui/GmLogPanel.js`

```javascript
// ... imports existentes ...

export class GmLogPanel {
  constructor(root, deps) {
    this.root = root;
    this.onClearLog = deps.onClearLog;
    this.betaService = deps.betaService; // AÑADIR
    this.config = null;
    this.events = [];
  }

  render(events) {
    // ... renderizado normal ...

    // AÑADIR: Botón export si beta habilitado
    if (this.betaService?.isFeatureEnabled('exportLog')) {
      const exportBtn = document.createElement('button');
      exportBtn.type = 'button';
      exportBtn.className = 'safety-btn safety-btn--secondary';
      exportBtn.textContent = '📥 Export JSON';
      exportBtn.title = 'Exportar log como JSON (beta)';
      exportBtn.addEventListener('click', () => this._exportLog());
      actionsDiv.appendChild(exportBtn);
    }

    // ... resto del render ...
  }

  _exportLog() {
    const data = {
      timestamp: new Date().toISOString(),
      events: this.events,
      config: this.config
    };
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `safety-log-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
```

### 3. Pasar betaService al componente

**Archivo**: `js/ui/SafetyPanel.js`

```javascript
async init() {
  // ... código existente ...

  this.gmLogPanel = new GmLogPanel(this._gmLogContainer, {
    onClearLog: () => this.safetyService.clearLog(),
    betaService: this.betaService // AÑADIR
  });

  // ... resto del init ...
}
```

### 4. (Opcional) Añadir estilos específicos

**Archivo**: `css/app.css`

```css
.safety-btn--secondary {
  background-color: var(--color-secondary);
  color: white;
}

.safety-btn--secondary:hover {
  background-color: var(--color-secondary-dark);
}
```

### 5. Testear

1. Configura las env vars en Netlify.
2. Redeploy el sitio.
3. Abre la extensión en Owlbear con tu cuenta (la del OWNER_TOKEN).
4. Deberías ver:
   - Badge "🧪 BETA" arriba a la derecha.
   - Botón "📥 Export JSON" en el GM Log panel.
5. Haz clic → descarga un JSON con los eventos.

### 6. Desactivar la feature

Para ocultar la feature (pero mantener el código):

```
BETA_FEATURES = {"exportLog":false}
```

O para desactivar todo el sistema beta:

```
BETA_FEATURES_ENABLED = false
```

## Otro ejemplo: Custom Actions

Feature que permite añadir acciones personalizadas.

### 1. Definir en Netlify

```
BETA_FEATURES = {"customActions":true}
```

### 2. Añadir UI en SafetyPanel

```javascript
_renderActions() {
  this._actionsContainer.innerHTML = '';
  
  // Acciones por defecto
  for (const action of this.actions) {
    // ... renderizar botón ...
  }

  // AÑADIR: Botón "Add action" si beta
  if (this.betaService?.isFeatureEnabled('customActions')) {
    const addBtn = document.createElement('button');
    addBtn.className = 'safety-btn safety-btn--add';
    addBtn.textContent = '➕ Add Action';
    addBtn.title = 'Añadir acción personalizada (beta)';
    addBtn.addEventListener('click', () => this._showAddActionModal());
    this._actionsContainer.appendChild(addBtn);
  }
}

_showAddActionModal() {
  // Abrir modal con input para nueva acción
  const label = prompt('Nombre de la acción:');
  if (label) {
    // Guardar en metadata y actualizar UI
    this.actions.push({ id: `custom-${Date.now()}`, label });
    this._renderActions();
  }
}
```

## Checklist para nuevas features beta

- [ ] Definir nombre de feature (camelCase, ej: `myFeature`)
- [ ] Añadir a `BETA_FEATURES` en Netlify
- [ ] Usar `betaService.isFeatureEnabled('myFeature')` en el código
- [ ] Pasar `betaService` a componentes que lo necesiten
- [ ] Testear con `BETA_FEATURES_ENABLED=true` y token correcto
- [ ] Documentar la feature en `docs/BETA_FEATURES.md`
- [ ] (Opcional) Añadir tests unitarios para la lógica beta

## Buenas prácticas

1. **Nombrado**: Usar camelCase para features (`customActions`, no `custom_actions` ni `custom-actions`).
2. **Degradación elegante**: Si beta no está habilitado, la UI debe seguir funcionando sin la feature.
3. **Feedback visual**: Añadir tooltip o badge indicando que es beta.
4. **Logging**: Usar `log('🧪 Beta feature activa: myFeature')` para debugging.
5. **Rollout gradual**: Empezar con `false`, probar con owner, luego cambiar a `true`.
6. **Promoción a stable**: Cuando la feature esté lista:
   - Quitar la comprobación `isFeatureEnabled()`.
   - Dejarla siempre visible.
   - Quitar de `BETA_FEATURES`.

## Debugging

Si la feature beta no aparece:

1. **Consola del navegador**: Busca logs tipo `🧪 Beta features habilitadas: [...]`.
2. **Verifica env vars**: Netlify → Site settings → Environment variables.
3. **Redeploy**: Clear cache and redeploy.
4. **Token correcto**: `OBR.player.getId().then(console.log)` → comparar con `OWNER_TOKEN`.
5. **Fetch exitoso**: En Network tab, busca request a `get-beta-features` → ver response.

---

**Última actualización**: 2026-02-03
