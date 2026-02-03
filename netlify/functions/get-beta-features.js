/**
 * Netlify Function para obtener features beta habilitadas
 * Controlado por variables de entorno (solo el owner puede configurarlas)
 * 
 * Variables de entorno en Netlify:
 * - BETA_FEATURES_ENABLED: "true" o "false" (activa/desactiva sistema beta)
 * - OWNER_TOKEN: token del owner (para verificar identidad)
 * - BETA_FEATURES: JSON string con features habilitadas, ej: {"newActions":true,"advancedSettings":true}
 */

exports.handler = async (event, context) => {
  // Manejar CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  // Solo permitir métodos GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Obtener configuración de entorno
    const BETA_ENABLED = process.env.BETA_FEATURES_ENABLED === 'true' || process.env.BETA_FEATURES_ENABLED === '1';
    const OWNER_TOKEN = process.env.OWNER_TOKEN;
    const userToken = event.queryStringParameters?.token;
    
    // Si el sistema beta no está habilitado, devolver vacío
    if (!BETA_ENABLED) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          betaEnabled: false,
          features: {}
        })
      };
    }
    
    // Si hay OWNER_TOKEN, verificar que el usuario sea el owner
    let isOwner = false;
    if (OWNER_TOKEN) {
      isOwner = userToken === OWNER_TOKEN;
    } else {
      // Si no hay OWNER_TOKEN, cualquier usuario con beta habilitado puede acceder
      isOwner = BETA_ENABLED;
    }
    
    // Si no es owner, no dar acceso a features beta
    if (!isOwner) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ 
          betaEnabled: false,
          features: {}
        })
      };
    }
    
    // Parsear features beta desde variable de entorno
    let betaFeatures = {};
    try {
      const BETA_FEATURES_JSON = process.env.BETA_FEATURES || '{}';
      betaFeatures = JSON.parse(BETA_FEATURES_JSON);
    } catch (e) {
      console.error('Error parsing BETA_FEATURES:', e);
      betaFeatures = {};
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: JSON.stringify({ 
        betaEnabled: true,
        features: betaFeatures
      })
    };
  } catch (error) {
    console.error('Error getting beta features:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error',
        betaEnabled: false,
        features: {}
      })
    };
  }
};
