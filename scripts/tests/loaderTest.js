import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'//'three/addons/loaders/GLTFLoader.js';
import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
export default function init() {
    // Instantiate a loader

    const width = window.innerWidth;
    const height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(155, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const container = document.querySelector('#threejs-container');
    container.append(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);

    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set( 1, 1, 20 );
    controls.update();

    const loader = new GLTFLoader();

    // Load Light
    var ambientLight = new THREE.AmbientLight(0xcccccc);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    function animate() {
        requestAnimationFrame(animate);

        // line.rotation.x += 0.01;
        // line.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    animate();
    // Load a glTF resource
    var scale = 1;
    loader.load('../models/grab1.glb',function (gltf) {
            var object = gltf.scene;
            object.scale.set(scale, scale, scale);
            scene.add(object);
            // var action = mixer.clipAction( gltf.animations[ 0 ] );
            // action.play();
            // gltf.animations; // Array<THREE.AnimationClip>
            // gltf.scene; // THREE.Group
            // gltf.scenes; // Array<THREE.Group>
            // gltf.cameras; // Array<THREE.Camera>
            // gltf.asset; // Object
        },
        // called while loading is progressing
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.log('An error happened');
        }
    );

}