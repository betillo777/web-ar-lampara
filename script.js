// script.js - Versión optimizada
// Configuración global
const CONFIG = window.APP_CONFIG || {
    DEBUG_PREFIX: '[Lámparas 3D]',
    DEBOUNCE_DELAY: 100,
    AR_BUTTON_TEXT: {
        start: 'Ver en RA',
        stop: 'Salir de RA'
    },
    POWER_BUTTON_TEXT: {
        on: 'Apagar',
        off: 'Encender'
    }
};
// Depuración
if (CONFIG.DEBUG) {
    console.log(`${CONFIG.DEBUG_PREFIX} Configuración cargada:`, CONFIG);
}



// Lista de modelos con ajustes específicos para cada uno
const modelos = [
    {
        id: 'bayuda',
        nombre: 'Lámpara Bayuda',
        preview: '/assets/previews/bayuda.png',
        modelo: '/modelos/bayudaRA.glb',
        modeloEncendido: '/modelos/bayudaRA-LED.glb',
        tipo: 'Pared',
        escala: '1 1 1',
        posicion: '0 0 0',
        cameraOrbit: '0deg 70deg 1.8m',
        cameraTarget: '0m 0.3m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3m',
        fieldOfView: '50deg'
    },
    {
        id: 'cairo',
        nombre: 'Lámpara Cairo',
        preview: '/assets/previews/cairo.png',
        modelo: '/modelos/cairoRA.glb',
        modeloEncendido: '/modelos/cairoRA-LED.glb',
        tipo: 'Pared',
        escala: '1 1 1',
        posicion: '0 0 0',
        cameraOrbit: '0deg 75deg 1.8m',
        cameraTarget: '0m 0.35m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3m',
        fieldOfView: '50deg'
    },
    {
        id: 'clastra',
        nombre: 'Lámpara Clastra',
        preview: '/assets/previews/clastra.png',
        modelo: '/modelos/clastraRA.glb',
        modeloEncendido: '/modelos/clastraRA-LED.glb',
        tipo: 'Pared',
        escala: '0.9 0.9 0.9',
        posicion: '0 0 0',
        cameraOrbit: '0deg 68deg 1.7m',
        cameraTarget: '0m 0.3m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3m',
        fieldOfView: '50deg'
    },
    {
        id: 'drum',
        nombre: 'Lámpara Drum',
        preview: '/assets/previews/drum.png',
        modelo: '/modelos/drumRA.glb',
        modeloEncendido: '/modelos/drumRA-LED.glb',
        tipo: 'Techo',
        escala: '1.1 1.1 1.1',
        posicion: '0 0.5 0',
        cameraOrbit: '0deg 30deg 2.5m',
        cameraTarget: '0m 0.8m 0m',
        minCameraOrbit: 'auto 5deg 1m',
        maxCameraOrbit: 'auto 179deg 10m',
        fieldOfView: '55deg'
    },
    {
        id: 'ep1w',
        nombre: 'Lámpara EP1W',
        preview: '/assets/previews/ep1w.png',
        modelo: '/modelos/ep1wRA.glb',
        modeloEncendido: '/modelos/ep1wRA-LED.glb',
        tipo: 'Piso',
        escala: '1 1 1',
        posicion: '0 -0.3 0',
        cameraOrbit: '0deg 60deg 1.5m',
        cameraTarget: '0m 0.6m 0m',
        minCameraOrbit: 'auto 20deg 0.5m',
        maxCameraOrbit: 'auto 80deg 3m',
        fieldOfView: '50deg'
    },
    {
        id: 'lcp5w',
        nombre: 'Lámpara LCP5W',
        preview: '/assets/previews/lcp5w.png',
        modelo: '/modelos/lcp5wRA.glb',
        modeloEncendido: '/modelos/lcp5wRA-LED.glb',
        tipo: 'Pared',
        escala: '0.9 0.9 0.9',
        posicion: '0 0 0',
        cameraOrbit: '0deg 70deg 1.8m',
        cameraTarget: '0m 0.35m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3m',
        fieldOfView: '50deg'
    },
    {
        id: 'milan',
        nombre: 'Lámpara Milán',
        preview: '/assets/previews/milan.png',
        modelo: '/modelos/milanRA.glb',
        modeloEncendido: '/modelos/milanRA-LED.glb',
        tipo: 'Pared',
        escala: '1 1 1',
        posicion: '0 0 0',
        cameraOrbit: '0deg 70deg 1.8m',
        cameraTarget: '0m 0.3m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3m',
        fieldOfView: '50deg'
    },
    {
        id: 'miranda',
        nombre: 'Lámpara Miranda',
        preview: '/assets/previews/miranda.png',
        modelo: '/modelos/mirandaRA.glb',
        modeloEncendido: '/modelos/mirandaRA-LED.glb',
        tipo: 'Techo',
        escala: '1.1 1.1 1.1',
        posicion: '0 0.5 0',
        cameraOrbit: '0deg 20deg 2.2m',
        cameraTarget: '0m 1.4m 0m',
        minCameraOrbit: 'auto 5deg 0.5m',
        maxCameraOrbit: 'auto 70deg 3.5m',
        fieldOfView: '55deg'
    },
    {
        id: 'monaco',
        nombre: 'Lámpara Mónaco',
        preview: '/assets/previews/monaco.png',
        modelo: '/modelos/monacoRA.glb',
        modeloEncendido: '/modelos/monacoRA-LED.glb',
        tipo: 'Pared',
        escala: '0.95 0.95 0.95',
        posicion: '0 0 0',
        cameraOrbit: '0deg 68deg 1.8m',
        cameraTarget: '0m 0.32m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3.1m',
        fieldOfView: '50deg'
    },
    {
        id: 'olimpo',
        nombre: 'Lámpara Olimpo',
        preview: '/assets/previews/olimpo.png',
        modelo: '/modelos/olimpoRA.glb',
        modeloEncendido: '/modelos/olimpoRA-LED.glb',
        tipo: 'Techo',
        escala: '1.2 1.2 1.2',
        posicion: '0 0.6 0',
        cameraOrbit: '0deg 15deg 2.5m',
        cameraTarget: '0m 1.5m 0m',
        minCameraOrbit: 'auto 5deg 0.5m',
        maxCameraOrbit: 'auto 70deg 4m',
        fieldOfView: '55deg'
    },
    {
        id: 'riley',
        nombre: 'Lámpara Riley',
        preview: '/assets/previews/riley.png',
        modelo: '/modelos/rileyRA.glb',
        modeloEncendido: '/modelos/rileyRA-LED.glb',
        tipo: 'Techo',
        escala: '0.9 0.9 0.9',
        posicion: '0 0.5 0',
        cameraOrbit: '0deg 15deg 2m',
        cameraTarget: '0m 1.3m 0m',
        minCameraOrbit: 'auto 5deg 0.5m',
        maxCameraOrbit: 'auto 60deg 3.2m',
        fieldOfView: '55deg'
    },
    {
        id: 'tiko',
        nombre: 'Lámpara Tiko',
        preview: '/assets/previews/tiko.png',
        modelo: '/modelos/tikoRA.glb',
        modeloEncendido: '/modelos/tikoRA-LED.glb',
        tipo: 'Techo',
        escala: '1 1 1',
        posicion: '0 0.5 0',
        cameraOrbit: '0deg 18deg 1.8m',
        cameraTarget: '0m 1.2m 0m',
        minCameraOrbit: 'auto 5deg 0.5m',
        maxCameraOrbit: 'auto 60deg 3m',
        fieldOfView: '55deg'
    },
    {
        id: 'viena',
        nombre: 'Lámpara Viena',
        preview: '/assets/previews/viena.png',
        modelo: '/modelos/vienaRA.glb',
        modeloEncendido: '/modelos/vienaRA-LED.glb',
        tipo: 'Pared',
        escala: '0.9 0.9 0.9',
        posicion: '0 -0.1 0',
        cameraOrbit: '0deg 68deg 1.8m',
        cameraTarget: '0m 0.25m 0m',
        minCameraOrbit: 'auto 30deg 0.5m',
        maxCameraOrbit: 'auto 90deg 3.2m',
        fieldOfView: '50deg'
    },
    {
        id: 'viena2',
        nombre: 'Lámpara Viena 2',
        preview: '/assets/previews/viena2.png',
        modelo: '/modelos/viena2RA.glb',
        modeloEncendido: '/modelos/viena2RA-LED.glb',
        tipo: 'Techo',
        escala: '1 1 1',
        posicion: '0 0.6 0',
        cameraOrbit: '0deg 18deg 2m',
        cameraTarget: '0m 1.4m 0m',
        minCameraOrbit: 'auto 5deg 0.5m',
        maxCameraOrbit: 'auto 60deg 3.5m',
        fieldOfView: '55deg'
    }
];






















<<<<<<< HEAD
=======

>>>>>>> 03f1c4d79cd8011848294e5599b82049bf330c47
// Elementos del DOM
const DOM = {
    modelViewer: null,
    powerButton: null,
    arButton: null,
    thumbnailsContainer: null,
    
    init() {
        this.modelViewer = document.getElementById('model-viewer');
        this.powerButton = document.getElementById('power-button');
        this.arButton = document.getElementById('ar-button');
        this.thumbnailsContainer = document.getElementById('thumbnails-container');
        return this;
    }
};




// Estado de la aplicación
const AppState = {
    currentModel: null,
    isPowerOn: false,
    isInitialized: false,
    isARSessionActive: false,
    
    reset() {
        this.currentModel = null;
        this.isPowerOn = false;
        this.isARSessionActive = false;
    }
};
// Utilidades mejoradas
const Utils = {
    debug(...args) {
        if (typeof process === 'undefined' || process.env.NODE_ENV !== 'production') {
            console.debug(CONFIG.DEBUG_PREFIX, ...args);
        }
    },
    error(message, error = null) {
        console.error(CONFIG.DEBUG_PREFIX, message, error || '');
        const errorEl = document.getElementById('error-message');
        if (errorEl) {
            errorEl.textContent = typeof message === 'string' ? message : 'Ocurrió un error';
            errorEl.classList.add('visible');
            setTimeout(() => errorEl.classList.remove('visible'), 5000);
        }
    },
    setLoading(isLoading) {
        const loadingEl = document.getElementById('loading-overlay');
        if (loadingEl) {
            loadingEl.classList.toggle('visible', isLoading);
        }
    },
    debounce(func, delay = CONFIG.DEBUG_DELAY) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    },
    async waitForModelLoad(viewer) {
        if (!viewer) {
            throw new Error('El visor de modelo no está disponible');
        }
        return new Promise((resolve) => {
            if (viewer.modelIsVisible) {
                return resolve();
            }
            const onLoad = () => {
                viewer.removeEventListener('load', onLoad);
                clearTimeout(timeout);
                resolve();
            };
            const timeout = setTimeout(() => {
                viewer.removeEventListener('load', onLoad);
                resolve(); // Resolvemos en lugar de rechazar para evitar errores
            }, 30000);
            viewer.addEventListener('load', onLoad);
        });
    },
    isMobile() {
        return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }
};
// Controlador de la cámara
const CameraController = {
    adjust(viewer, modelConfig) {
        if (!viewer || !modelConfig) return;
        
        const settings = {
            cameraOrbit: modelConfig.cameraOrbit,
            cameraTarget: modelConfig.cameraTarget,
            fieldOfView: modelConfig.fieldOfView,
            minCameraOrbit: modelConfig.minCameraOrbit,
            maxCameraOrbit: modelConfig.maxCameraOrbit
        };
        Object.entries(settings).forEach(([key, value]) => {
            if (value !== undefined) {
                viewer[key] = value;
            }
        });
    }
};
// Controlador de modelos
const ModelController = {
    isSwitching: false,
    currentLoadId: 0,
    
    async loadModel(modelId) {
        if (this.isSwitching) {
            Utils.debug('Ya hay una operación de carga en curso');
            return;
        }
        
        const modelConfig = modelos.find(m => m.id === modelId);
        if (!modelConfig) {
            throw new Error(`Modelo con ID ${modelId} no encontrado`);
        }
        
        this.isSwitching = true;
        const loadId = ++this.currentLoadId;
        
        try {
            Utils.setLoading(true);
            const modelPath = AppState.isPowerOn ? modelConfig.modeloEncendido : modelConfig.modelo;
            
            await this._loadModelWithRetry(modelPath, loadId);
            if (loadId !== this.currentLoadId) return;
            
            CameraController.adjust(DOM.modelViewer, modelConfig);
            AppState.currentModel = modelConfig;
            this._updateThumbnails(modelId);
            
        } catch (error) {
            Utils.error('Error al cargar el modelo', error);
            throw error;
        } finally {
            if (loadId === this.currentLoadId) {
                this.isSwitching = false;
                Utils.setLoading(false);
            }
        }
    },
    
    async _loadModelWithRetry(modelPath, loadId, retryCount = 0) {
        const MAX_RETRIES = 2;
        
        try {
            DOM.modelViewer.src = modelPath;
            await Utils.waitForModelLoad(DOM.modelViewer);
        } catch (error) {
            if (retryCount < MAX_RETRIES) {
                Utils.debug(`Reintentando carga del modelo (${retryCount + 1}/${MAX_RETRIES})`);
                return this._loadModelWithRetry(modelPath, loadId, retryCount + 1);
            }
            throw new Error(`No se pudo cargar el modelo después de ${MAX_RETRIES} intentos: ${error.message}`);
        }
    },
    
    _updateThumbnails(selectedModelId) {
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach(thumb => {
            const isSelected = thumb.dataset.modelId === selectedModelId;
            thumb.classList.toggle('selected', isSelected);
            thumb.setAttribute('aria-current', isSelected);
        });
    },
    
    async togglePower() {
        if (!AppState.currentModel || this.isSwitching) {
            return;
        }
        
        this.isSwitching = true;
        AppState.isPowerOn = !AppState.isPowerOn;
        Utils.setLoading(true);
        
        try {
            const modelToLoad = AppState.isPowerOn 
                ? AppState.currentModel.modeloEncendido 
                : AppState.currentModel.modelo;
            
            // Guardar la posición y rotación actual
            const currentOrbit = DOM.modelViewer.getCameraOrbit();
            const target = DOM.modelViewer.getCameraTarget();
            
            // Configurar parámetros de renderizado
            DOM.modelViewer.toneMapping = 'pbr';
            DOM.modelViewer.exposure = 1.0;
            
            // Función para aplicar emisión
            const applyEmission = () => {
                try {
                    const model = DOM.modelViewer.model;
                    if (!model || !model.materials) return;
                    
                       model.materials.forEach(material => {
            if (material.emissiveFactor) {
                // Aumentar intensidad de emisión al máximo
                material.emissiveFactor = [1.0, 1.0, 1.0]; // Valores máximos
                material.emissiveStrength = 10.0; // Aumentado de 5.0 a 10.0
                material.roughnessFactor = 0.2;   // Reducido para reflejos más intensos
                material.metallicFactor = 0.7;    // Aumentado para más brillo metálico
            }
        });
                } catch (err) {
                    console.error('Error al aplicar emisión:', err);
                }
            };
            
            // Configurar el manejador de carga
            const onModelLoad = () => {
                if (AppState.isPowerOn) {
                    applyEmission();
                }
                DOM.modelViewer.removeEventListener('load', onModelLoad);
            };
            
            // Configurar el manejador ANTES de cambiar el modelo
            DOM.modelViewer.addEventListener('load', onModelLoad, { once: true });
            
            // Cambiar el modelo
            DOM.modelViewer.src = modelToLoad;
            await Utils.waitForModelLoad(DOM.modelViewer);
            
            // Restaurar la cámara
            DOM.modelViewer.cameraOrbit = `${currentOrbit.theta}deg ${currentOrbit.phi}deg ${currentOrbit.radius}m`;
            DOM.modelViewer.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;

            // Aplicar ajustes de renderizado
        DOM.modelViewer.toneMapping = 'pbr';
        DOM.modelViewer.exposure = 2.0;  // Aumentado de 1.3 a 2.0
        DOM.modelViewer.shadowIntensity = 0.8;  // Aumentar intensidad de sombras
            
        } catch (error) {
            AppState.isPowerOn = !AppState.isPowerOn; // Revertir el cambio
            Utils.error('Error al cambiar el estado de la lámpara', error);
            throw error;
        } finally {
            this.isSwitching = false;
            Utils.setLoading(false);
            updatePowerButton();
        }
    }
};
// Controlador de AR
const ARController = {
    init() {
        if (!DOM.arButton || !DOM.modelViewer || !Utils.isMobile()) {
            return;
        }
        this._setupARButton();
        this._setupARListeners();
    },
    
    _setupARButton() {
        const arButtonText = DOM.arButton.querySelector('.button-text');
        if (arButtonText) {
            arButtonText.textContent = CONFIG.AR_BUTTON_TEXT.start;
        }
        DOM.arButton.style.display = 'flex';
        DOM.arButton.disabled = false;
        DOM.arButton.addEventListener('click', this._handleARButtonClick.bind(this));
    },
    
    _setupARListeners() {
        DOM.modelViewer.addEventListener('ar-status', (event) => {
            AppState.isARSessionActive = event.detail.status === 'session-started';
            this._updateARButtonText();
        });
    },
    
    _updateARButtonText() {
        const arButtonText = DOM.arButton?.querySelector('.button-text');
        if (arButtonText) {
            arButtonText.textContent = AppState.isARSessionActive 
                ? CONFIG.AR_BUTTON_TEXT.stop 
                : CONFIG.AR_BUTTON_TEXT.start;
        }
    },
    
    async _handleARButtonClick() {
        try {
            if (AppState.isARSessionActive) {
                await DOM.modelViewer.exitPresent();
            } else {
                await DOM.modelViewer.activateAR();
            }
        } catch (error) {
            Utils.error('Error en la sesión de Realidad Aumentada', error);
            DOM.arButton.style.display = 'none';
        }
    }
};
// Funciones de actualización de UI
function updatePowerButton() {
    if (!DOM.powerButton) return;
    
    const powerIcon = DOM.powerButton.querySelector('svg');
    const powerText = DOM.powerButton.querySelector('.button-text');
    
    if (!powerIcon || !powerText) {
        Utils.error('Elementos del botón de encendido no encontrados');
        return;
    }
    
    const { on, off } = CONFIG.POWER_BUTTON_TEXT;
    const isOn = AppState.isPowerOn;
    
    // Actualizar icono
    powerIcon.innerHTML = isOn 
        ? '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z"/>'
        : '<path d="M13 3h-2v10h2V3zm4.83 2.17l-1.42 1.42C17.99 7.86 19 9.81 19 12c0 3.87-3.13 7-7 7s-7-3.13-7-7c0-2.19 1.01-4.14 2.58-5.42L6.17 5.17C4.23 6.82 3 9.26 3 12c0 4.97 4.03 9 9 9s9-4.03 9-9c0-2.74-1.23-5.18-3.17-6.83z"/>';
    
    // Actualizar texto
    powerText.textContent = isOn ? on : off;
    
    // Actualizar accesibilidad
    DOM.powerButton.setAttribute('aria-label', isOn ? 'Apagar lámpara' : 'Encender lámpara');
    DOM.powerButton.setAttribute('aria-pressed', isOn);
    DOM.powerButton.disabled = false;
}
// Funciones auxiliares de inicialización
function _setupPowerButton() {
    if (!DOM.powerButton) return;
    
    DOM.powerButton.disabled = false;
    DOM.powerButton.addEventListener('click', () => {
        if (!ModelController.isSwitching) {
            ModelController.togglePower().catch(error => {
                Utils.error('Error al cambiar el estado de la lámpara', error);
            });
        }
    });
}
function _loadThumbnails() {
    if (!DOM.thumbnailsContainer || !modelos.length) return;
    
    modelos.forEach(model => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'thumbnail';
        thumbnail.dataset.modelId = model.id;
        thumbnail.setAttribute('role', 'button');
        thumbnail.setAttribute('aria-label', `Cargar modelo ${model.nombre}`);
        thumbnail.tabIndex = 0;
        
        thumbnail.innerHTML = `
            <img src="${model.preview}" alt="${model.nombre}" loading="lazy">
            <div class="thumbnail-overlay">${model.nombre}</div>
        `;
        
        // Manejar clic
        thumbnail.addEventListener('click', () => {
            ModelController.loadModel(model.id).catch(error => {
                Utils.error('Error al cargar el modelo', error);
            });
        });
        
        // Manejar teclado para accesibilidad
        thumbnail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                ModelController.loadModel(model.id).catch(error => {
                    Utils.error('Error al cargar el modelo', error);
                });
            }
        });
        
        DOM.thumbnailsContainer.appendChild(thumbnail);
    });
}
function _setupModelViewerEvents() {
    if (!DOM.modelViewer) return;
    
    DOM.modelViewer.addEventListener('load', () => {
        Utils.debug('Modelo cargado en el visor');
        updatePowerButton();
    });
    
    DOM.modelViewer.addEventListener('error', (event) => {
        Utils.error('Error al cargar el modelo:', event.detail?.message || 'Error desconocido');
    });
    
    // Mejorar accesibilidad
    DOM.modelViewer.setAttribute('aria-label', 'Vista previa 3D de la lámpara');
    DOM.modelViewer.setAttribute('role', 'img');
}
// Inicialización mejorada
async function init() {
    if (AppState.isInitialized) return;
    
    try {
        // Inicializar referencias del DOM
        DOM.init();
        
        if (!DOM.modelViewer) {
            throw new Error('No se encontró el elemento model-viewer');
        }
        
        // Configurar botones
        _setupPowerButton();
        ARController.init();
        
        // Cargar el primer modelo
        if (modelos.length > 0) {
            await ModelController.loadModel(modelos[0].id);
        }
        
        // Cargar miniaturas
        _loadThumbnails();
        
        // Configurar eventos del visor
        _setupModelViewerEvents();
        
        // Marcar como inicializado
        AppState.isInitialized = true;
        Utils.debug('Aplicación inicializada correctamente');
        
    } catch (error) {
        Utils.error('Error al inicializar la aplicación', error);
    }
}
// Iniciar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}