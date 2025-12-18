// config.js
if (!window.APP_CONFIG) {
    (function() {
        // Detectar si estamos en entorno local
        const isLocal = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.protocol === 'file:';
        
        // Configuración base
        window.APP_CONFIG = {
            // Debug
            DEBUG: isLocal, // Solo activar en local
            DEBUG_PREFIX: '[Lámparas 3D]',
            
            // Rendimiento
            DEBOUNCE_DELAY: 100,
            
            // Rutas
            BASE_URL: isLocal ? '' : 'https://raw.githubusercontent.com/betillo777/web-ar-lampara/main',
            PATHS: {
                models: 'modelos',
                images: 'assets/previews'
            },
            
            // Textos
            AR_BUTTON_TEXT: {
                start: 'Ver en RA',
                stop: 'Salir de RA'
            },
            POWER_BUTTON_TEXT: {
                on: 'Apagar',
                off: 'Encender'
            },
            
            // Configuración específica de AR
            AR_CONFIG: {
                placement: 'floor',  // Cambiado de 'wall' para mejor experiencia
                scale: 'auto',      // Permite redimensionamiento
                modes: 'webxr scene-viewer quick-look'
            }
        };

        // Depuración
        if (window.APP_CONFIG.DEBUG) {
            console.log(`${window.APP_CONFIG.DEBUG_PREFIX} Configuración cargada:`, window.APP_CONFIG);
        }
    })();
}
