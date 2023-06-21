import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
export default function init() {
    window.addEventListener('click', playGrabAnim);
    var renderer, scene, camera, controls, mixer, clock, model, action, grabLine;
    var endOfAnim = false;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x889988);
    const container = document.querySelector('#threejs-container');
    container.append(renderer.domElement);
    clock = new THREE.Clock(); //clock for anims
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(20, 20, 20);
    scene.add(camera); // required, since adding light as child of camera
    controls = new OrbitControls(camera, renderer.domElement);    // controls
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
    let offsetX = (xAmount * boxPos + boxW) / 2;
    let offsetY = (yAmount * boxPos + boxW) / 2;
    for (let i = 0; i < xAmount; i++) {
        for (let k = 0; k < yAmount; k++) {

            let x = (boxW + boxPos * i) - offsetX;
            let y = (boxW + boxPos * k) - offsetY;

            let z = -4;
            createBox(boxW, boxW, boxW, 'grey', x, z, y);
        }
    }

    createBox(4, 2, 2, 'sandybrown', 2, -4, 6); //brown box

    createOuterWalls(100, 10, 100);  //call functions
    loadGrab();
    animate(); //anim always last


    function loadGrab(url = '../models/grab.gltf') {
        // Load a glTF resource
        const loader = new GLTFLoader();
        console.log(url);
        loader.load(url, function (gltf) {
            model = gltf;
            mixer = new THREE.AnimationMixer(model.scene);
            action = mixer.clipAction(gltf.animations[0]);
            action.setLoop(THREE.LoopOnce); // Do only once
            action.clampWhenFinished = true; //Finishing pos
            scene.add(model.scene);

            //if everything okay draw extra stuff
            //Line 
            const lineMat = new THREE.LineBasicMaterial({ color: 0x0000ff });
            const points = [];
            points.push(new THREE.Vector3(0, 2, 0));
            points.push(new THREE.Vector3(0, 7, 0));
            // points.push(new THREE.Vector3(1, 0, 0));
            // points.push(new THREE.Vector3(0, 7, 0));
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            grabLine = new THREE.Line(lineGeo, lineMat);
            scene.add(grabLine);
        },
            function (xhr) {  // called while loading is progressing
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                loadGrab('https://raw.githubusercontent.com/ossi1801/ThreeJs-Test/main/models/grab.gltf')
                console.log('An error happened', error);
            }
        );
    }
    function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        if (mixer) mixer.update(delta);
        //const rndInt = randomIntFromInterval(1, 6)
        if (grabLine != undefined) {
            grabLine.position.x += 0.01;
            model.scene.position.setX(grabLine.position.x);
        }
        renderer.render(scene, camera);

    }
    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    function playGrabAnim() {
        action = mixer.clipAction(model.animations[0]);
        action.paused = false;
        action.setLoop(THREE.LoopOnce);
        if (endOfAnim) {
            if (action.time === 0) {
                action.time = action.getClip().duration;
            }
            action.timeScale = -1;
            //action.play();
        } else {
            action.timeScale = 1;
        }
        endOfAnim = !endOfAnim;
        if (action !== null) {
            //action.stop();
            action.play();

        }
    }
    function createBox(width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let geometry = new THREE.BoxGeometry(width, height, depth);
        let material1 = new THREE.MeshPhongMaterial({
            color: color
        });
        let mesh = new THREE.Mesh(geometry, material1);
        mesh.position.set(x, y, z);
        scene.add(mesh);
    }
    function createOuterWalls(width = 20, height = 10, depth = 20) {
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
