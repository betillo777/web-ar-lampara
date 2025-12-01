// Importaciones de Three.js y Addons usando el importmap en index.html
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

// Variables globales
let camera, scene, renderer, composer;
let lightSource, spotLight;
let isLampOn = true;
let currentLampModel = null;
let lampOnModel = null;
let lampOffModel = null;
let arButtonContainer;

// Archivos de modelos 3D
const MODEL_PATH_OFF = 'assets/lampara-apagada.glb';
const MODEL_PATH_ON = 'assets/lampara-encendida.glb';

// --- Funciones de Utilidad para manejo de modelos ---

function switchLampModel(turnOn) {
    if (currentLampModel) {
        scene.remove(currentLampModel);
    }

    if (turnOn) {
        currentLampModel = lampOnModel.clone();
        document.getElementById('switch-button').textContent = "Apagar Lámpara";
        spotLight.intensity = 1.0; // Enciende la luz
        composer.passes[1].enabled = true; // Habilita Bloom
    } else {
        currentLampModel = lampOffModel.clone();
        document.getElementById('switch-button').textContent = "Encender Lámpara";
        spotLight.intensity = 0.0; // Apaga la luz
        composer.passes[1].enabled = false; // Deshabilita Bloom
    }

    // Importante: Añadir el modelo CLONADO a la escena
    if (currentLampModel) {
        currentLampModel.position.set(0, 0, -1); // Posiciona la lámpara
        currentLampModel.scale.set(0.1, 0.1, 0.1); // Ajusta la escala si es necesario
        scene.add(currentLampModel);
    }

    isLampOn = turnOn;
}

function toggleLight() {
    switchLampModel(!isLampOn);
}


// --- Inicialización y Configuración ---

function init() {
    // 1. Configuración de la Escena y Renderizador
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Habilita XR (Realidad Aumentada/Virtual)
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    document.body.appendChild(renderer.domElement);

    // 2. Iluminación (SpotLight)
    spotLight = new THREE.SpotLight(0xfff5cc, 1.0); // Luz suavemente amarilla
    spotLight.angle = Math.PI / 4;
    spotLight.penumbra = 0.5;
    spotLight.decay = 2;
    spotLight.distance = 200;
    spotLight.position.set(0, 5, 0);

    // Light target is important for SpotLight direction
    spotLight.target.position.set(0, 0, 0);
    scene.add(spotLight);
    scene.add(spotLight.target);

    // Luz ambiental para que se vea la silueta
    lightSource = new THREE.AmbientLight(0xffffff, 0.5); 
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

    // Inicialmente, apagamos el Bloom si la lámpara empieza apagada
    if (!isLampOn) {
        spotLight.intensity = 0.0;
        bloomPass.enabled = false;
    }


    // 4. Cargar Modelos 3D
    loadModels();

    // 5. Configurar Botones y Controles
    document.getElementById('switch-button').addEventListener('click', toggleLight);
    
    arButtonContainer = document.getElementById('ar-button-container');
    document.body.appendChild(ARButton.createButton(renderer, { requiredFeatures: ['hit-test'] }));

    window.addEventListener('resize', onWindowResize);
}


function loadModels() {
    const loader = new GLTFLoader();

    // Cargar modelo ENCENDIDO
    loader.load(
        MODEL_PATH_ON, 
        function (gltf) {
            lampOnModel = gltf.scene;
            console.log("Modelo 'Encendida' cargado correctamente.");

            // Cargar modelo APAGADO después de que el primero termine
            loader.load(
                MODEL_PATH_OFF, 
                function (gltf) {
                    lampOffModel = gltf.scene;
                    console.log("Modelo 'Apagada' cargado correctamente.");

                    // Una vez que ambos modelos están cargados, inicializar la escena
                    // con el modelo inicial (encendido por defecto)
                    switchLampModel(isLampOn);

                }, 
                undefined, // Función de progreso (opcional)
                function (error) {
                    console.error('Error cargando lampara-apagada.glb:', error);
                }
            );

        }, 
        undefined, // Función de progreso (opcional)
        function (error) {
            console.error('Error cargando lampara-encendida.glb:', error);
        }
    );
}


// --- Bucle de Animación y Renderizado ---

function animate() {
    renderer.setAnimationLoop(render);
}

function render() {
    // Si la sesión de RA está activa, el renderer.xr maneja el renderizado
    if (renderer.xr.isPresenting) {
        renderer.render(scene, camera);
    } else {
        // Renderizado normal (escritorio)
        composer.render();
    }
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