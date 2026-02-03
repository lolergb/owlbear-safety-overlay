/**
 * @fileoverview Logging y utilidad de rol para Safety Overlay
 */

let OBRRef = null;
let cachedUserRole = null;
let roleCheckPromise = null;

export function setOBRReference(obr) {
  OBRRef = obr;
  cachedUserRole = null;
  roleCheckPromise = null;
}

/**
 * @returns {Promise<boolean>} true si es GM
 */
export async function getUserRole() {
  if (cachedUserRole !== null) return cachedUserRole;
  if (roleCheckPromise) return roleCheckPromise;
  roleCheckPromise = (async () => {
    try {
      if (OBRRef?.player?.getRole) {
        const role = await OBRRef.player.getRole();
        cachedUserRole = role === 'GM';
        return cachedUserRole;
      }
    } catch (_) {}
    cachedUserRole = false;
    return cachedUserRole;
  })();
  return roleCheckPromise;
}

export function log(...args) {
  console.log('[Safety Overlay]', ...args);
}

export function logWarn(...args) {
  console.warn('[Safety Overlay]', ...args);
}

export function logError(...args) {
  console.error('[Safety Overlay]', ...args);
}

export function resetRoleCache() {
  cachedUserRole = null;
  roleCheckPromise = null;
}
