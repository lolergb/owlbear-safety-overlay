/**
 * @fileoverview Punto de entrada de Safety Overlay para Owlbear Rodeo
 */

import OBR from 'https://esm.sh/@owlbear-rodeo/sdk@3.1.0';
import { ExtensionController } from './controllers/ExtensionController.js';

let extensionController = null;

OBR.onReady(async () => {
  try {
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
  extensionController?.cleanup();
});

window.safetyOverlay = {
  getController: () => extensionController
};
