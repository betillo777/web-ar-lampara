// =========================================================
// 1. VARIABLES GLOBALES
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
// 2. INICIALIZACIÓN DE LA ESCENA Y RA
// =========================================================

init();

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
    renderer.outputEncoding = THREE.sRGBEncoding;
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
    // El ARButton se encarga de solicitar la sesión de RA al navegador.
    document.body.appendChild( 
        THREE.ARButton.createButton( renderer, { 
            requiredFeatures: [ 'hit-test', 'local' ], // Necesitamos hit-test para colocar la lámpara
            optionalFeatures: [ 'dom-overlay' ] // Para que el botón de HTML (switch-button) se vea bien
        } ) 
    );
    
    // --- LISTENERS ---
    window.addEventListener( 'resize', onWindowResize );
    // Listener para el botón de Encendido/Apagado
    switchButton.addEventListener('click', toggleLight);
    
    // Listener para la interacción con la RA (tocar la pantalla)
    renderer.domElement.addEventListener( 'touchstart', onTouch, false );

    // Iniciar el bucle de animación
    renderer.setAnimationLoop( animate );
}


// =========================================================
// 3. FUNCIONES DE UTILIDAD
// =========================================================

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    composer.setSize( window.innerWidth, window.innerHeight ); // Redimensionar el compositor
}

function loadModels() {
    const loader = new THREE.GLTFLoader();
    const modelScale = 0.3; // Escala inicial, puedes ajustarla
    
    // Cargar la versión apagada
    loader.load( 'assets/lampara-apagada.glb', function ( gltf ) {
        modelApagada = gltf.scene;
        modelApagada.scale.set( modelScale, modelScale, modelScale );
        modelApagada.visible = true; // Empieza visible (pero no colocada)
        scene.add( modelApagada );
        
        // Inicialmente, colocamos el modelo apagado y lo movemos fuera de vista
        modelApagada.position.set( 1000, 1000, 1000 ); 
    }, undefined, function ( error ) {
        console.error( 'Error cargando lampara-apagada.glb:', error );
    } );

    // Cargar la versión encendida
    loader.load( 'assets/lampara-encendida.glb', function ( gltf ) {
        modelEncendida = gltf.scene;
        modelEncendida.scale.set( modelScale, modelScale, modelScale );
        modelEncendida.visible = false; // Empieza oculta
        scene.add( modelEncendida );

        // Inicialmente, movemos el modelo encendido fuera de vista
        modelEncendida.position.set( 1000, 1000, 1000 );
    }, undefined, function ( error ) {
        console.error( 'Error cargando lampara-encendida.glb:', error );
    } );
}

function setupPostProcessing() {
    // 1. Crear el Compositor (para aplicar efectos)
    composer = new THREE.EffectComposer( renderer );
    
    // 2. RenderPass: Dibuja la escena normalmente
    const renderPass = new THREE.RenderPass( scene, camera );
    composer.addPass( renderPass );

    // 3. UnrealBloomPass: Aplica el efecto Bloom (brillo)
    // Tweak estos valores para el look que deseas:
    bloomPass = new THREE.UnrealBloomPass( 
        new THREE.Vector2( window.innerWidth, window.innerHeight ), 
        1.5, // strength (Intensidad del brillo)
        0.4, // radius (Tamaño del brillo)
        0.8 // threshold (Qué tan brillantes deben ser los píxeles para brillar)
    );
    composer.addPass( bloomPass );
    bloomPass.enabled = false; // La lámpara comienza apagada, sin Bloom.

    // 4. OutputPass: Asegura que el resultado final se dibuje en la pantalla
    const outputPass = new THREE.ShaderPass( THREE.CopyShader );
    composer.addPass( outputPass );
}

function toggleLight() {
    if (modelApagada && modelEncendida && bloomPass) {
        isLightOn = !isLightOn;

        if (isLightOn) {
            // ENCENDER
            modelApagada.visible = false;
            modelEncendida.visible = true;
            bloomPass.enabled = true; // Activa el efecto Bloom
            switchButton.textContent = 'APAGAR LÁMPARA';
        } else {
            // APAGAR
            modelApagada.visible = true;
            modelEncendida.visible = false;
            bloomPass.enabled = false; // Desactiva el efecto Bloom
            switchButton.textContent = 'ENCENDER LÁMPARA';
        }
    }
}


// =========================================================
// 4. BUCLE DE ANIMACIÓN Y RENDERIZADO (El "motor" principal)
// =========================================================

function animate( timestamp, frame ) {
    
    // Solo renderizamos si Three.js está manejando el bucle (que es el caso con setAnimationLoop)

    // Lógica para el modo RA (dentro de un frame válido de WebXR)
    if ( frame ) {
        
        // 1. Obtener la sesión de RA
        const session = renderer.xr.getSession();

        // 2. Inicializar la prueba de detección de superficie (Hit-Test)
        if ( hitTestSourceInitialized === false ) {
            if ( session ) {
                session.requestReferenceSpace( 'viewer' ).then( ( referenceSpace ) => {
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
    // El Compositor siempre usa la cámara y escena.
    // En modo RA, el renderer usa la vista de la cámara de RA.
    // Aunque estemos en RA, usamos el compositor para aplicar el Bloom si la luz está encendida.
    composer.render();
}


// =========================================================
// 5. LÓGICA DE COLOCACIÓN (Al tocar la pantalla)
// =========================================================

function onTouch( event ) {
    if ( event.touches.length > 0 && reticle.visible ) {
        // Obtenemos la sesión de RA
        const session = renderer.xr.getSession();
        
        if ( session ) {
            // 1. Creamos el punto de colocación basado en la posición de la retícula
            const pose = reticle.matrix.elements;

            // 2. Colocamos el modelo (el que esté visible) en esa posición
            // Mueve ambos modelos al mismo lugar (solo uno es visible)
            if ( modelApagada ) {
                 modelApagada.position.setFromMatrixPosition( reticle.matrix );
                 modelEncendida.position.setFromMatrixPosition( reticle.matrix );
            }
            
            // 3. Ocultamos la retícula (opcional, pero ayuda a la experiencia)
            reticle.visible = false;

            // Una vez colocado, podemos deshabilitar el hit test para ahorrar recursos (opcional)
            // if ( hitTestSource ) {
            //     hitTestSource.stop();
            //     hitTestSource = null;
            // }

        }
    }
}