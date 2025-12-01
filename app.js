// =========================================================
// 1. IMPORTACIONES DE ES MODULES (AÑADIDAS PARA FUNCIONAR CON Import Map)
// =========================================================
import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CopyShader } from 'three/addons/shaders/CopyShader.js'; 
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';


// =========================================================
// 2. VARIABLES GLOBALES
// =========================================================
let container;
let camera, scene, renderer;
let controller; // Usado para interactuar con la RA
let modelApagada, modelEncendida; 

// Para Post-Procesado (Bloom)
let composer;
let bloomPass;

// Variables de RA
let hitTestSource = null;
let hitTestSourceInitialized = false;
let arSession = null;
let reticle; // El círculo/retícula que ayuda a colocar el modelo

let isLightOn = false;
const switchButton = document.getElementById('switch-button');


// =========================================================
// 3. INICIALIZACIÓN DE LA ESCENA Y RA
// =========================================================


// =========================================================
// INICIAR EL PROYECTO
// =========================================================

// Usamos DOMContentLoaded para asegurar que el DOM esté listo antes de inicializar
document.addEventListener('DOMContentLoaded', (event) => {
    init();
});


function init() {
    container = document.createElement( 'div' );
    document.body.appendChild( container );

    // --- ESCENA y CÁMARA ---
    scene = new THREE.Scene();

    // La cámara de Three.js. WebXR se encarga de posicionarla en RA.
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 20 );
    
    // --- RENDERER ---
    renderer = new THREE.WebGLRenderer( { antialias: true, alpha: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    

    // CRUCIAL: Habilitar WebXR
    renderer.xr.enabled = true; 
    
    container.appendChild( renderer.domElement );

    // --- LUCES ---
    // Añadimos una luz ambiental simple. La luz real vendrá del modelo encendido.
    scene.add( new THREE.HemisphereLight( 0x606060, 0x404040, 1 ) );

    // --- POST-PROCESADO (BLOOM) ---
    setupPostProcessing();

    // --- MODELOS ---
    loadModels();
    
    // --- RETÍCULA (Guía de Colocación) ---
    // Creamos una retícula simple (un anillo) para mostrar dónde se colocará el modelo.
    reticle = new THREE.Mesh(
        new THREE.RingGeometry( 0.15, 0.2, 32 ).rotateX( - Math.PI / 2 ),
        new THREE.MeshBasicMaterial()
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false; // Ocultamos hasta que se detecte una superficie
    scene.add( reticle );

    // --- BOTÓN DE RA ---
    // Usamos el ARButton importado.
    document.body.appendChild( 
        ARButton.createButton( renderer, { 
            requiredFeatures: [ 'hit-test', 'local' ], // Necesitamos hit-test para colocar la lámpara
            optionalFeatures: [ 'dom-overlay' ] // Para que el botón de HTML (switch-button) se vea bien
        } ) 
    );
    
    // --- LISTENERS ---
    window.addEventListener( 'resize', onWindowResize );
    // Listener para el botón de Encendido/Apagado
    if (switchButton) {
        switchButton.addEventListener('click', toggleLight);
    }
    
    // Listener para la interacción con la RA (tocar la pantalla)
    renderer.domElement.addEventListener( 'touchstart', onTouch, false );

    // Iniciar el bucle de animación
    renderer.setAnimationLoop( animate );
}


// =========================================================
// 4. FUNCIONES DE UTILIDAD
// =========================================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    // Verificamos si composer existe antes de redimensionar
    if (composer) { 
        composer.setSize( window.innerWidth, window.innerHeight ); // Redimensionar el compositor
    }
}


function loadModels() {
    // Usamos el GLTFLoader importado
    const loader = new GLTFLoader();
    const modelScale = 0.3; // Escala inicial, puedes ajustarla
    
    // Cargar la versión apagada
    loader.load( 'assets/lampara-apagada.glb', function ( gltf ) {
        modelApagada = gltf.scene;
        modelApagada.scale.set( modelScale, modelScale, modelScale );
        modelApagada.visible = true;
        scene.add( modelApagada );
        
        // Colocar el modelo apagado a 3 metros en Z para que sea visible en modo 3D estándar
        modelApagada.position.set( 0, -0.5, -3 ); 
        
    }, undefined, function ( error ) {
        console.error( 'Error cargando lampara-apagada.glb:', error );
    } );

    // Cargar la versión encendida
    loader.load( 'assets/lampara-encendida.glb', function ( gltf ) {
        modelEncendida = gltf.scene;
        modelEncendida.scale.set( modelScale, modelScale, modelScale );
        modelEncendida.visible = false; // Empieza oculta
        scene.add( modelEncendida );

        // Colocar el modelo encendido a 3 metros en Z para que sea visible (pero oculto)
        modelEncendida.position.set( 0, -0.5, -3 );
    }, undefined, function ( error ) {
        console.error( 'Error cargando lampara-encendida.glb:', error );
    } );
}


function setupPostProcessing() {
    // Usamos EffectComposer importado
    composer = new EffectComposer( renderer );
    
    // Usamos RenderPass importado
    const renderPass = new RenderPass( scene, camera );
    composer.addPass( renderPass );

    // Usamos UnrealBloomPass importado
    bloomPass = new UnrealBloomPass( 
        new THREE.Vector2( window.innerWidth, window.innerHeight ), 
        1.5, // strength (Intensidad del brillo)
        0.4, // radius (Tamaño del brillo)
        0.8 // threshold (Qué tan brillantes deben ser los píxeles para brillar)
    );
    composer.addPass( bloomPass );
    bloomPass.enabled = false; // La lámpara comienza apagada, sin Bloom.

    // Usamos ShaderPass y CopyShader importados
    const outputPass = new ShaderPass( CopyShader );
    composer.addPass( outputPass );
}

function toggleLight() {
    if (modelApagada && modelEncendida && bloomPass && switchButton) {
        isLightOn = !isLightOn;

        if (isLightOn) {
            // ENCENDER
            modelApagada.visible = false;
            modelEncendida.visible = true;
            bloomPass.enabled = true; // Activa el efecto Bloom
            switchButton.textContent = 'APAGAR LÁMPARA';
            switchButton.style.backgroundColor = '#FFD700'; // Estilo de encendido
            switchButton.style.color = '#333';
        } else {
            // APAGAR
            modelApagada.visible = true;
            modelEncendida.visible = false;
            bloomPass.enabled = false; // Desactiva el efecto Bloom
            switchButton.textContent = 'ENCENDER LÁMPARA';
            switchButton.style.backgroundColor = '#333'; // Estilo de apagado
            switchButton.style.color = 'white';
        }
    }
}


// =========================================================
// 5. BUCLE DE ANIMACIÓN Y RENDERIZADO (El "motor" principal)
// =========================================================

function animate( timestamp, frame ) {
    
    // Lógica para el modo RA (dentro de un frame válido de WebXR)
    if ( frame ) {
        
        // 1. Obtener la sesión de RA
        const session = renderer.xr.getSession();

        // 2. Inicializar la prueba de detección de superficie (Hit-Test)
        if ( hitTestSourceInitialized === false ) {
            if ( session ) {
                // Solicitamos el espacio de referencia para el visor
                session.requestReferenceSpace( 'viewer' ).then( ( referenceSpace ) => {
                    // Solicitamos el Hit Test
                    session.requestHitTestSource( { space: referenceSpace } ).then( ( source ) => {
                        hitTestSource = source;
                        hitTestSourceInitialized = true;
                    } );
                } );
            }
        }
        
        // 3. Realizar la prueba de superficie y mover la retícula
        if ( hitTestSource ) {
            const referenceSpace = renderer.xr.getReferenceSpace();
            const hitTestResults = frame.getHitTestResults( hitTestSource );

            if ( hitTestResults.length > 0 ) {
                const hit = hitTestResults[ 0 ];
                
                // Mover la retícula al punto detectado en el mundo real
                reticle.visible = true;
                reticle.matrix.fromArray( hit.getPose( referenceSpace ).transform.matrix );

            } else {
                reticle.visible = false;
            }
        }
    }
    
    // 4. Renderizar (Usamos el compositor para aplicar el Bloom)
    if (composer) {
        composer.render();
    } else {
        renderer.render( scene, camera ); // Renderizado de respaldo si composer no está listo
    }
}


// =========================================================
// 6. LÓGICA DE COLOCACIÓN (Al tocar la pantalla)
// =========================================================

function onTouch( event ) {
    // Si la retícula es visible, significa que hemos detectado una superficie válida.
    if ( event.touches.length > 0 && reticle.visible ) {
        
        // Obtenemos la sesión de RA
        const session = renderer.xr.getSession();
        
        if ( session ) {
            
            // 1. Colocamos el modelo (el que esté visible) en la posición de la retícula
            // Mueve ambos modelos al mismo lugar (solo uno es visible)
            if ( modelApagada && modelEncendida ) {
                 modelApagada.position.setFromMatrixPosition( reticle.matrix );
                 modelEncendida.position.setFromMatrixPosition( reticle.matrix );
            }
            
            // 2. Ocultamos la retícula
            reticle.visible = false;
        }
    }
}