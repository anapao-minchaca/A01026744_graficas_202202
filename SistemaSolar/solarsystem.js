import * as THREE from '../libs/three.js/three.module.js'
import { OrbitControls } from '../libs/three.js/controls/OrbitControls.js';
import { OBJLoader } from '../libs/three.js/loaders/OBJLoader.js';
import { MTLLoader } from '../libs/three.js/loaders/MTLLoader.js';

let renderer = null, scene = null, camera = null, orbitControls=null, sun=null, planets=[], materials={}, moons=[],  moonGroups= [], asteroid, asteroids=[], asteroidGroups= new THREE.Object3D;

// modelo de asteroide
let objMtlModelUrl = {obj:'../images/planets/10464_Asteroid_v1_Iterations-2.obj', mtl:'../images/planets/10464_Asteroid_v1_Iterations-2.mtl'};

let currentTime = Date.now();

function main()
{
    const canvas = document.getElementById("webglcanvas");
    createScene(canvas);
    update();
}

async function loadObjMtl(objModelUrl)
{
    try
    {
        const mtlLoader = new MTLLoader();
        const materials = await mtlLoader.loadAsync(objModelUrl.mtl);
        materials.preload();

        const objLoader = new OBJLoader();
        objLoader.setMaterials(materials);
        const object = await objLoader.loadAsync(objModelUrl.obj);
        
        object.position.y += 1;
        object.scale.set(0.0005, 0.0005, 0.0005);

        asteroid = object;

    }
    catch(err)
    {
        console.log(err);
    }
}

function animate() 
{
    let now = Date.now();
    currentTime = now;

    let timestamp = currentTime * 0.0003

    // posicion y rotacion de planetas
    planets.forEach(planet => {
        let speed = planet.userData.speed;
        let orbit = planet.userData.orbit;

        planet.position.x = Math.cos(timestamp * speed) * orbit;
        planet.position.z = Math.sin(timestamp * speed) * orbit;
        

        planet.rotation.y += 0.01;
    });

    // rotacion de las lunas
    moons.forEach(moon => {
        moon.rotation.y += 0.005;
    });

    moonGroups.forEach(moons => {
        moons.rotation.y += 0.005;
    });

    // rotacion de asteroides
    asteroids.forEach(asteroid => {
        asteroid.rotation.y += 0.005;
    });

    // movimient alrededor del sol
    asteroidGroups.rotation.y += 0.005;
}

function update() 
{
    requestAnimationFrame(function() { update(); });
    renderer.render(scene, camera);
    animate();
    orbitControls.update();
}

// funcion para la creacion de los materiales para los planetas y la luna
function createMaterials(mapUrl, bumpMapUrl, planet_name)
{
    let textureMap = new THREE.TextureLoader().load(mapUrl);
    let bumpMap = new THREE.TextureLoader().load(bumpMapUrl);

    materials[planet_name] = new THREE.MeshPhongMaterial({ map: textureMap, bumpMap: bumpMap, bumpScale: 0.06 });
}

// funcion para crear el sol con su luz y su material
function createSun()
{
    const point_light = new THREE.PointLight(0xffffff, 1, 0);
    const map = new THREE.TextureLoader().load("../images/planets/2k_sun.jpg");
    sun = new THREE.Mesh(new THREE.SphereGeometry(3, 28, 14), new THREE.MeshBasicMaterial({ map }));
    sun.add(point_light);
    scene.add(sun);
}

// funcion para la creacion de los planetas y sus respectivas orbitas
function createPlanet(name, radius, orbit, speed)
{
    var planet = new THREE.Mesh(new THREE.SphereGeometry(radius, 28, 14), materials[name]);

    planet.userData.name = name;
    planet.userData.orbit = orbit;
    planet.userData.speed = speed;

    planets.push(planet);
    scene.add(planet);

    var shape = new THREE.Shape();
    shape.moveTo(orbit, 0);
    shape.absarc(0, 0, orbit, 0, 2 * Math.PI, false);
    var spaced_points = shape.getSpacedPoints(128);
    var orbit_geometry = new THREE.BufferGeometry().setFromPoints(spaced_points); 
    orbit_geometry.rotateX(THREE.Math.degToRad(-90));
    var orbit = new THREE.Line(orbit_geometry, new THREE.LineBasicMaterial({color: "white"}));
    scene.add(orbit);
}

// funcion para la creacion de los anillos de saturno y urano
function createRing(planet_index, texture_url)
{
    var geometry = new THREE.RingGeometry(2.5, 3, 64);
    var material = new THREE.MeshBasicMaterial({color: 0xffffff, map: new THREE.TextureLoader().load(texture_url)});
    var ring = new THREE.Mesh(geometry, material);
    ring.rotateX(-Math.PI * 0.4);
    planets[planet_index].add(ring);
}

// funcion para la creacion de las lunas de cada planeta
function createMoon(planet_index, moon_number)
{
    const moonsGroup = new THREE.Object3D
    let moon = new THREE.Mesh(new THREE.SphereGeometry(0.5, 28, 14), materials["moon"]);
    let moon_clone;

    if(moon_number === 1){
        moon_clone = moon.clone();
        moon_clone.position.x = 3 * Math.sin(moon_number);
        moon_clone.position.z = 3 * Math.cos(moon_number);
        moonsGroup.add(moon_clone);
        moons.push(moon_clone);
    }
    else {
        for (let i = 0; i < moon_number; i++){   
            moon_clone = moon.clone();
            moon_clone.position.x = 3 * Math.sin(moon_number * i);
            moon_clone.position.z = 3 * Math.cos(moon_number * i);
            moonsGroup.add(moon_clone);
            moons.push(moon_clone);
        }
    }
    planets[planet_index].add(moonsGroup);
    moonGroups.push(moonsGroup);
}

// funcion para la creacion de los asteroides
function createAsteroidBelt(asteroid_number)
{
    loadObjMtl(objMtlModelUrl);
    setTimeout(() => {
        let asteroid_clone;

        for(let i = 0; i < asteroid_number; i++){
            asteroid_clone = asteroid.clone();
            asteroid_clone.position.z =  Math.cos(i * asteroid_number) * (Math.random()*3 +32);
            asteroid_clone.position.x =  Math.sin(i * asteroid_number) * (Math.random()*3 +32);
            asteroids.push(asteroid_clone);
            asteroidGroups.add(asteroid_clone);
        }
        scene.add(asteroidGroups);
    }, 2000);  
}

function createScene(canvas) 
{
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );
    // Set the viewport size
    renderer.setSize(canvas.width, canvas.height);
    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.BasicShadowMap;

    // Create a new Three.js scene
    scene = new THREE.Scene();
    
    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera(45, canvas.width / canvas.height, 1, 4000);
    camera.position.set(-2, 6, 12);
    scene.add(camera);

    orbitControls = new OrbitControls(camera, renderer.domElement);

    // background
    const milky_way = new THREE.TextureLoader().load("../images/planets/2k_stars_milky_way.jpg");
    scene.background = milky_way;

    // Create the sun
    createSun();

    // Create the moons
    createMaterials("../images/planets/moon_1024.jpg", "../images/planets/moon_bump.jpg", "moon");

    // Create the planets
    createMaterials("../images/planets/mercurymap.jpg", "../images/planets/mercurybump.jpg", "mercury")
    createPlanet("mercury", 1, 10, 5);
    // mercurio y venus no tienen lunas asi que no se crean

    createMaterials("../images/planets/venusmap.jpg", "../images/planets/venusbump.jpg", "venus")
    createPlanet("venus", 1.5, 15, 3);

    createMaterials("../images/planets/earthmap1k.jpg", "../images/planets/earthbump1k.jpg", "earth");
    createPlanet("earth", 1.5, 20, 2);
    createMoon(2, 1);

    createMaterials("../images/planets/marsmap1k.jpg", "../images/planets/marsbump1k.jpg", "mars");
    createPlanet("mars", 1.5, 25, 1.5);
    createMoon(3, 2);

    createMaterials("../images/planets/jupiter2_1k.jpg", "", "jupiter");
    createPlanet("jupiter", 2, 30, 1);
    createMoon(4, 5);

    createMaterials("../images/planets/saturnmap.jpg", "", "saturn");
    createPlanet("saturn", 2, 38, 0.8);
    createRing(5, "../images/planets/saturnringcolor.jpg");
    createMoon(5, 5);

    createMaterials("../images/planets/uranusmap.jpg", "", "uranus");
    createPlanet("uranus", 2, 43, 0.6);
    createRing(6, "../images/planets/uranusringcolour.jpg");
    createMoon(6, 5);

    createMaterials("../images/planets/neptunemap.jpg", "", "neptune");
    createPlanet("neptune", 2, 48, 0.5);
    createMoon(7, 5);

    createMaterials("../images/planets/plutomap1k.jpg", "../images/planets/plutobump1k.jpg", "pluto");
    createPlanet("pluto", 1.5, 53, 0.4);
    createMoon(8, 5);

    createAsteroidBelt(700);
}

main();

