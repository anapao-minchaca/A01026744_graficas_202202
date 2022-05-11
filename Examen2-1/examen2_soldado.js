import * as THREE from './libs/three.module.js'
import { OrbitControls } from './libs/controls/OrbitControls.js';
import { GLTFLoader } from './libs/loaders/GLTFLoader.js';

let renderer = null, scene = null, camera = null, orbitControls = null, object = null;

let spotLight = null, ambientLight = null;

let idleAction = {};
let animation = "Run";
let currentTime = Date.now();

const mapUrl = "./images/checker_large.gif";

const SHADOW_MAP_WIDTH = 2048, SHADOW_MAP_HEIGHT = 2048;

function onError ( err ){ console.error( err ); };

function onProgress( xhr ) {

    if ( xhr.lengthComputable ) {

        const percentComplete = xhr.loaded / xhr.total * 100;
        console.log( xhr.target.responseURL, Math.round( percentComplete, 2 ) + '% downloaded' );
    }
}

async function loadGLTF(gltfModelUrl)
{
    try
    {
        const gltfLoader = new GLTFLoader();

        const result = await gltfLoader.loadAsync(gltfModelUrl, onProgress, onError);
        console.log(result)

        object = result.scene.children[0];

        object.traverse(model =>{
            if(model.isMesh)
                model.castShadow = true;
                model.receiveShadow = true;            
        });

        object.scale.set(0.1, 0.1, 0.1);
        object.position.y = -4;
        object.rotation.z = -3;

        scene.add(object);

        result.animations.forEach(element => {
            idleAction[element.name] = new THREE.AnimationMixer( scene ).clipAction(element, object);
        });

        idleAction['Run'].play();

    }
    catch(err)
    {
        console.error(err);
    }
}

function animate()
{
    const now = Date.now();
    const deltat = now - currentTime;
    currentTime = now;

    if(object && idleAction[animation])
    {
        idleAction[animation].getMixer().update(deltat * 0.001);
    }
}

function update() 
{
    requestAnimationFrame(function() { update(); });
    
    renderer.render( scene, camera );

    animate();

    orbitControls.update();
}

function createScene(canvas) 
{
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    renderer.setSize(canvas.width, canvas.height);
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.enabled = true;

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(-30, 15, 40);
    scene.add(camera);

    orbitControls = new OrbitControls(camera, renderer.domElement);
        
    spotLight = new THREE.SpotLight (0xffffff, 1.5);
    spotLight.shadow.mapSize.width = SHADOW_MAP_WIDTH;
    spotLight.shadow.mapSize.height = SHADOW_MAP_HEIGHT;
    spotLight.castShadow = true;
    spotLight.position.set(0, 40, 50);
    scene.add(spotLight);

    ambientLight = new THREE.AmbientLight ( 0xffffff, 0.3);
    scene.add(ambientLight);

    let map = new THREE.TextureLoader().load(mapUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(8, 8);

    const geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    const floor = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({map:map, side:THREE.DoubleSide}));

    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -4.02;

    floor.receiveShadow = true;

    scene.add( floor );
}


function main()
{
    const canvas = document.getElementById("webglcanvas");

    createScene(canvas);

    loadGLTF('./models/Soldier.glb');

    update();
}

function resize()
{
    const canvas = document.getElementById("webglcanvas");

    canvas.width = document.body.clientWidth;
    canvas.height = document.body.clientHeight;

    camera.aspect = canvas.width / canvas.height;

    camera.updateProjectionMatrix();
    renderer.setSize(canvas.width, canvas.height);
}

window.onload = () => {
    main();
    resize(); 
};

window.addEventListener('resize', resize, false);
