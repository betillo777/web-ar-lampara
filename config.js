const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127.0.0.1' || 
                window.location.protocol === 'file:';

window.APP_CONFIG = {
    DEBUG_PREFIX: '[Lámparas 3D]',
    DEBOUNCE_DELAY: 100,
    BASE_URL: isLocal ? '' : '', // Deja vacío para rutas relativas en hosting
    PATHS: {
        models: 'modelos',       // Ruta a la carpeta de modelos
        images: 'assets/previews' // Ruta a las miniaturas
    },
    AR_BUTTON_TEXT: {
        start: 'Ver en RA',
        stop: 'Salir de RA'
    },
    POWER_BUTTON_TEXT: {
        on: 'Apagar',
        off: 'Encender'
    }
};
