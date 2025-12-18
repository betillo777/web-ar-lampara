// config.js
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.protocol === 'file:';

window.APP_CONFIG = {
    // Configuración base
    DEBUG_PREFIX: '[Lámparas 3D]',
    DEBOUNCE_DELAY: 100,
    
    // Rutas base
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
    }
};