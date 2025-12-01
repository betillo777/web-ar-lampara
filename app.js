// Importaciones de Three.js y Addons usando el importmap en index.html
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Variables globales para 3D
let camera, scene, renderer, composer;
let lightSource, spotLight;
let isLampOn = true;
let lampOnModel = null;
let lampOffModel = null;
let placedLampModel = null; // El modelo que se coloca en el mundo AR

// Variables específicas de AR (WebXR)
let controller;
let reticle;
let hitTestSource = null;
let hitTestSourceRequested = false;

// Archivos de modelos 3D
const MODEL_PATH_OFF = 'assets/lampara-apagada.glb';
const MODEL_PATH_ON = 'assets/lampara-encendida.glb';

// --- Funciones de Utilidad para manejo de modelos ---

/**
 * Clona el modelo 3D y lo prepara para la colocación.
 */
function getLampModel(turnOn) {
    let model;
    if (turnOn) {
        model = lampOnModel.clone();
    } else {
        model = lampOffModel.clone();
    }

    // Aseguramos que la luz se apaga/enciende con el modelo
    spotLight.intensity = turnOn ? 1.0 : 0.0;
    composer.passes[1].enabled = turnOn;
    
    // El modelo se escala para que esté cerca de las dimensiones reales de Three.js
    // Si la lámpara es de tamaño real, 0.2 es una escala de 20cm, si es muy grande, ajústala
    model.scale.set(0.2, 0.2, 0.2); 
    
    // Aplicamos la rotación de corrección de eje inmediatamente
    // Esto debería corregir el problema de ver el interior (giro de -90 grados en X)
    model.rotation.x = -Math.PI / 2;
    
    return model;
}

function toggleLight() {
    isLampOn = !isLampOn;
    
    // Si la lámpara ya ha sido colocada en el modo AR, la reemplazamos (simulando encendido/apagado)
    if (placedLampModel && placedLampModel.parent) {
        const parent = placedLampModel.parent;
        parent.remove(placedLampModel);
        
        placedLampModel = getLampModel(isLampOn);
        parent.add(placedLampModel);
    }
    
    document.getElementById('switch-button').textContent = isLampOn ? "Apagar Lámpara" : "Encender Lámpara";
}

// --- Inicialización y Configuración ---

function init() {
    // 1. Configuración de la Escena y Renderizador
    scene = new THREE.Scene();
    
    // Cámara para el modo 3D normal (sin AR)
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);
    camera.position.set(0, 0, 5); 

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Habilita XR (Realidad Aumentada/Virtual)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    document.body.appendChild(renderer.domElement);
    
    // El fondo debe ser transparente para que se vea la cámara en AR
    renderer.setClearColor(0x000000, 0); 
    
    // 2. Iluminación (SpotLight)
    spotLight = new THREE.SpotLight(0xfff5cc, 1.0); 
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 200;
    spotLight.position.set(0, 5, 0);

    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Luz ambiental (importante para que la geometría sea visible)
    lightSource = new THREE.AmbientLight(0xffffff, 2.0); 
    scene.add(lightSource);

    // 3. Post-procesamiento para Bloom (Efecto de Brillo)
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    
    const bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5, // Fuerza del brillo
        0.4, // Radio
        0.85 // Umbral (Threshold)
    );
    composer.addPass(bloomPass);
    composer.passes[1].enabled = isLampOn; // Habilitar/Deshabilitar según el estado inicial

    // 4. Configuración WebXR (Realidad Aumentada)
    // El botón AR se crea en el contenedor predefinido para evitar conflictos de seguridad
    const arButton = ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] });
    document.getElementById('ar-button-container').appendChild(arButton);
    
    // Controlador de la sesión AR (para detectar taps y rotación/movimiento futuros)
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    // Retículo (el anillo guía que se mueve sobre la superficie)
    reticle = new THREE.Mesh(
        new THREE.RingGeometry(0.15, 0.2, 32).rotateX(-Math.PI / 2),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // 5. Cargar Modelos 3D
    loadModels();

    // 6. Configurar Botones y Controles
    document.getElementById('switch-button').addEventListener('click', toggleLight);
    
    // Inicialización del modelo 3D normal
    renderer.xr.addEventListener('sessionend', function() {
        // Al salir de AR, mostramos la lámpara en modo 3D normal
        if (!placedLampModel) {
            placedLampModel = getLampModel(isLampOn);
        }
        placedLampModel.position.set(0, -0.5, -3);
        scene.add(placedLampModel);
    });
    
    renderer.xr.addEventListener('sessionstart', function() {
        // Al entrar en AR, removemos el modelo del modo 3D normal
        if (placedLampModel) {
            scene.remove(placedLampModel);
            placedLampModel = null;
        }
    });


    window.addEventListener('resize', onWindowResize);
}


function loadModels() {
    const loader = new GLTFLoader();

    // Cargar modelo ENCENDIDO
    loader.load(
        MODEL_PATH_ON, 
        function (gltf) {
            lampOnModel = gltf.scene; 
            // CORRECCIÓN CLAVE: Aplicamos la rotación de -90 grados (-Math.PI / 2) en el eje X
            lampOnModel.rotation.x = -Math.PI / 2;
            
            // Cargar modelo APAGADO después de que el primero termine
            loader.load(
                MODEL_PATH_OFF, 
                function (gltf) {
                    lampOffModel = gltf.scene;
                    // CORRECCIÓN CLAVE: Aplicamos la rotación de -90 grados (-Math.PI / 2) en el eje X.
                    lampOffModel.rotation.x = -Math.PI / 2;

                    // Después de cargar, mostrar el modelo en modo 3D normal (solo al inicio)
                    placedLampModel = getLampModel(isLampOn);
                    placedLampModel.position.set(0, -0.5, -3); // Posición inicial
                    scene.add(placedLampModel);
                }, 
                undefined, 
                function (error) {
                    console.error('Error cargando lampara-apagada.glb:', error);
                }
            );
        }, 
        undefined, 
        function (error) {
            console.error('Error cargando lampara-encendida.glb:', error);
        }
    );
}

// --- Lógica de Colocación en AR ---

function onSelect() {
    // Solo colocamos la lámpara si el retículo es visible (se ha detectado una superficie)
    if (reticle.visible && lampOnModel && lampOffModel) {
        
        // Si ya hay una lámpara colocada, la removemos (para permitir moverla/recolocarla)
        if (placedLampModel) {
            scene.remove(placedLampModel);
        }
        
        // Creamos la nueva lámpara con el estado actual
        placedLampModel = getLampModel(isLampOn);
        
        // La colocamos en la posición del retículo
        placedLampModel.position.setFromMatrixPosition(reticle.matrix);
        
        scene.add(placedLampModel);
    }
}


// --- Bucle de Animación y Renderizado ---

function animate() {
    renderer.setAnimationLoop(render);
}

function render(timestamp, frame) {
    if (frame) {
        const referenceSpace = renderer.xr.getReferenceSpace();
        const session = renderer.xr.getSession();

        if (hitTestSourceRequested === false) {
            session.requestReferenceSpace('viewer').then(function (referenceSpace) {
                session.requestHitTestSource({ space: referenceSpace }).then(function (source) {
                    hitTestSource = source;
                });
            });
            session.addEventListener('end', function () { hitTestSourceRequested = false; hitTestSource = null; });
            hitTestSourceRequested = true;
        }

        if (hitTestSource) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);

            if (hitTestResults.length) {
                const hit = hitTestResults[0];
                const pose = frame.getPose(hit.transform, referenceSpace);

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);

            } else {
                reticle.visible = false;
            }
        }
    }
    
    // Renderizado: El renderizador usa la cámara AR si está en sesión, o la cámara normal si no lo está.
    composer.render();
}


// --- Manejadores de Eventos ---

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

// Inicializa la aplicación cuando la ventana está cargada
window.onload = function() {
    init();
    animate();
};
