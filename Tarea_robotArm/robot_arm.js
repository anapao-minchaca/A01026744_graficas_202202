"use strict"; 

import * as THREE from "../libs/three.js/three.module.js"

let renderer = null, scene = null, camera = null, shoulder = null, arm = null, elbow = null, forearm = null, wrist = null, hand = null, shoulderGroup = null, elbowGroup = null, forearmGroup = null, wristGroup = null, handGroup = null;

function main() 
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

function update()
{
    requestAnimationFrame(function() { update(); });
    
    // Render the scene
    renderer.render( scene, camera );
}

function createScene(canvas)
{   
    
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    
    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Set the background color 
    scene.background = new THREE.Color(0.2, 0.2, 0.2 );

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000);
    camera.position.z = 13;
    scene.add(camera);

    const light = new THREE.DirectionalLight(0xffffff, 1.0);

    // Position the light out from the scene, pointing at the origin
    light.position.set(-.5, .2, 1);
    light.target.position.set(0, -2, 0);
    scene.add(light);

    // This light globally illuminates all objects in the scene equally.
    // Cannot cast shadows
    const ambientLight = new THREE.AmbientLight(0xffccaa, 0.2);
    scene.add(ambientLight);

    // Texturas y/o materiales
    const material = new THREE.MeshPhongMaterial({color: 0xB4A7D6});

    // Geometria
    let geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // hombros, codos y muñecas
    let geometry_rec = new THREE.BoxGeometry(0.8, 2, 0.8); // brazo y antebrazo
    let geometry_hand = new THREE.BoxGeometry(0.7, 0.7, 0.9); // mano

    // Grupos
    shoulderGroup = new THREE.Object3D;
    elbowGroup = new THREE.Object3D;
    forearmGroup = new THREE.Object3D;
    wristGroup = new THREE.Object3D;
    handGroup = new THREE.Object3D;

    // And put the geometry and material together into a mesh
    // Creamos las partes del brazo y les damos una geometria y un material
    shoulder = new THREE.Mesh(geometry, material);
    arm = new THREE.Mesh(geometry_rec, material);
    elbow = new THREE.Mesh(geometry, material);
    forearm = new THREE.Mesh(geometry_rec, material);
    wrist = new THREE.Mesh(geometry, material);
    hand = new THREE.Mesh(geometry_hand, material);

    // Agregamos cada componente a su respectivo grupo y le damos posición
    // El hombro controla todo el brazo
    shoulderGroup.add(shoulder);
    shoulderGroup.add(arm);
    shoulderGroup.add(elbowGroup);
    shoulderGroup.position.set(0, 2.4, 0);
    arm.position.set(0, -1.2, 0);

    // El codo controla lo que está abajo del codo
    elbowGroup.add(elbow);
    elbowGroup.add(forearmGroup);
    elbowGroup.position.set(0, -2.4, 0);

    // El antebrazo controla lo que está abajo del antebrazo
    forearmGroup.add(forearm);
    forearmGroup.add(wristGroup);
    forearmGroup.position.set(0, -1.2, 0);

    // La muñeca solo controla a la mano
    wristGroup.add(wrist);
    wristGroup.add(handGroup);
    wristGroup.position.set(0, -1.2, 0);

    handGroup.position.set(0, -.6, 0);
    handGroup.add(hand);

    // Agregar el brazo a la escena
    scene.add(shoulderGroup);

    // Controles de dat.gui
    const gui = new dat.GUI();
    // Hacemos un nuevo folder para agregar nuestros controles y controlar al brazo
    const robot_arm = gui.addFolder('Robot Arm');
    robot_arm.add(shoulderGroup.rotation, 'x', -1.5, 1.5).name("shoulder x")
    robot_arm.add(shoulderGroup.rotation, 'z', -1.6, 1.6).name("shoulder z")
    robot_arm.add(elbowGroup.rotation, 'x', -1, 0).name("elbow x")
    robot_arm.add(forearmGroup.rotation, 'y', 0, 1).name("forearm y")
    robot_arm.add(wristGroup.rotation, 'x', -0.45, 0.45).name("wrist x")
    robot_arm.add(handGroup.rotation, 'x', -0.3, 0.3).name("hand x")
    robot_arm.add(handGroup.rotation, 'z', -0.3, 0.3).name("hand z")

    shoulderGroup.updateMatrixWorld();
}

main();