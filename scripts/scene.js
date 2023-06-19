import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
export default function init() {
    var renderer, scene, camera, controls;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x889988);
    const container = document.querySelector('#threejs-container');
    container.append(renderer.domElement);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(20, 20, 20);
    scene.add(camera); // required, since adding light as child of camera

    // controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.maxPolarAngle = Math.PI / 2; //limit y-xis (can't roll to below scene)

    // ambient
    scene.add(new THREE.AmbientLight(0x444444));

    // light
    var light = new THREE.PointLight(0xffffff, 0.8);
    camera.add(light);


    let boxW = 2;
    let boxPos = 6;
    let xAmount = 10;
    let yAmount = 10;
    let offsetX = (xAmount*boxPos+boxW)/2;
    let offsetY = (yAmount*boxPos+boxW)/2;
    for (let i = 0; i < xAmount; i++) {
        for (let k = 0; k < yAmount; k++) {
         
            let x = (boxW + boxPos * i)-offsetX;
            let y = (boxW + boxPos * k)-offsetY;
          
            let z = -4;
            createBox(boxW, boxW, boxW,'grey',x, z, y);
        }
    }

    createBox(4, 2, 2,'sandybrown',2,-4, 6); //brown box
    //createBox(); //grey box

    createOuterWalls(100, 10, 100);  //call functions
    loadGrab();
    animate(); //anim always last


    function loadGrab() {
        // Load a glTF resource
        const loader = new GLTFLoader();
        var scale = 1;
        // change to url (github) for pages version (?)
        loader.load('../models/grab1.glb', function (gltf) {
            var object = gltf.scene;
            object.scale.set(scale, scale, scale);
            scene.add(object);
            console.log(gltf); 
            // var action = mixer.clipAction( gltf.animations[ 0 ] );
            // action.play();
            // gltf.animations; // Array<THREE.AnimationClip>
            // gltf.scene; // THREE.Group
            // gltf.scenes; // Array<THREE.Group>
            // gltf.cameras; // Array<THREE.Camera>
            // gltf.asset; // Object

            //if everything okay draw extra stuff
            //Line 
            const lineMat = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const points = [];
            points.push(new THREE.Vector3(0, 2, 0));
            points.push(new THREE.Vector3(0, 7, 0));
            // points.push(new THREE.Vector3(1, 0, 0));
            // points.push(new THREE.Vector3(0, 7, 0));
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            const line = new THREE.Line(lineGeo, lineMat);
            scene.add(line);
            console.log(scene); 
        },
            function (xhr) {  // called while loading is progressing
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.log('An error happened',error);
            }
        );
    }
    function animate() {
        requestAnimationFrame(animate);
        //controls.update();
        //const rndInt = randomIntFromInterval(1, 6)
        //line.rotation.x += 0.01;
        //line.rotation.y += 0.01;
        renderer.render(scene, camera);

    }
    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
      }
      
     
    function createBox(width=2,height=2,depth=2,color='gray',x=-2,y=-4,z=-6) {
        let geometry = new THREE.BoxGeometry(width, height, depth);
        let material1 = new THREE.MeshPhongMaterial({
            color: color
        });
        let mesh = new THREE.Mesh(geometry, material1);
        mesh.position.set(x, y, z);
        scene.add(mesh);
    }
    function createOuterWalls(width=20,height=10,depth=20){
        var wallGeometry = new THREE.BoxGeometry(width, height, depth);
        var innerWallMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1
        });
        let mesh = new THREE.Mesh(wallGeometry, innerWallMat);
        scene.add(mesh);
        var outerWallMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: false,
            side: THREE.BackSide
        });
        mesh = new THREE.Mesh(wallGeometry, outerWallMat);
        scene.add(mesh);
    }

}
