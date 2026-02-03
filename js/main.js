/**
 * @fileoverview Punto de entrada de Safety Overlay para Owlbear Rodeo
 */

import OBR from 'https://esm.sh/@owlbear-rodeo/sdk@3.1.0';
import { ExtensionController } from './controllers/ExtensionController.js';
import { initCardModalView } from './ui/CardModalView.js';

let extensionController = null;

function isCardModalMode() {
  const params = new URLSearchParams(window.location.search);
  return params.get('modal') === 'card' && params.get('actionId');
}

OBR.onReady(async () => {
  try {
    const appRoot = document.getElementById('safety-app');
    if (!appRoot) {
      console.error('[Safety Overlay] #safety-app no encontrado');
      return;
    }

    if (isCardModalMode()) {
      initCardModalView(OBR, appRoot);
      return;
    }

    extensionController = new ExtensionController();
    await extensionController.init(OBR, { appRoot: '#safety-app' });
  } catch (e) {
    console.error('[Safety Overlay] Error al iniciar:', e);
    const app = document.getElementById('safety-app');
    if (app) {
      app.innerHTML = `
        <div class="safety-error">
          <p>Error loading extension</p>
          <p class="safety-error__msg">${e.message || String(e)}</p>
          <button type="button" class="safety-btn" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }
});

window.addEventListener('beforeunload', () => {
  if (window._safetyCardModalTimer) clearTimeout(window._safetyCardModalTimer);
  extensionController?.cleanup();
});

window.safetyOverlay = {
  getController: () => extensionController
};
