/**
 * @fileoverview Controlador principal: inicializa OBR, SafetyService y SafetyPanel.
 */

import { setOBRReference, getUserRole, log, logError } from '../utils/logger.js';
import { SafetyService } from '../services/safety/SafetyService.js';
import { SafetyPanel } from '../ui/SafetyPanel.js';

export class ExtensionController {
  constructor() {
    this.OBR = null;
    this.safetyService = null;
    this.safetyPanel = null;
    this.isGM = false;
  }

  /**
   * @param {Object} OBR - SDK de Owlbear Rodeo
   * @param {Object} options - { appRoot: string } selector del contenedor
   */
  async init(OBR, options = {}) {
    this.OBR = OBR;
    setOBRReference(OBR);
    this.isGM = await getUserRole();

    this.safetyService = new SafetyService();
    this.safetyService.setOBR(OBR);

    const appRoot = document.querySelector(options.appRoot || '#safety-app');
    if (!appRoot) {
      logError('Safety Overlay: #safety-app no encontrado');
      return;
    }

    this.safetyPanel = new SafetyPanel(appRoot, {
      safetyService: this.safetyService,
      isGM: this.isGM
    });
    await this.safetyPanel.init();
    log('Safety Overlay inicializado');
  }

  cleanup() {
    this.safetyPanel?.destroy();
    this.safetyService?.cleanup();
    this.safetyPanel = null;
    this.safetyService = null;
  }
}
