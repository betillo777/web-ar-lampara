// config.js
const isLocal = window.location.hostname === 'localhost' || 
                window.location.hostname === '127..0.1' || 
                window.location.protocol === 'file:';

const CONFIG = {
    // Usar ruta base vacía para desarrollo local
    // En producción, usar la ruta base completa
    BASE_URL: isLocal ? '' : 'https://raw.githubusercontent.com/betillo777/web-ar-lampara/main',
    
    // Rutas relativas a los recursos
    PATHS: {
        models: 'models',
        images: 'images'
    }
};



