import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
export default function init() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    // scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const container = document.querySelector('#threejs-container');
    container.append(renderer.domElement);

    const controls = new OrbitControls( camera, renderer.domElement );

    //controls.update() must be called after any manual changes to the camera's transform
    camera.position.set( 5, 5, 5 );
    controls.update();

    // const geometry = new THREE.SphereGeometry(1, 1, 1);
    // const wireframe = new THREE.WireframeGeometry(geometry);
    // const line = new THREE.LineSegments(wireframe);
    // line.material.depthTest = false;
    // line.material.opacity = 0.25;
    // line.material.transparent = true;
    // scene.add(line);
    
    camera.position.z = 5;
    createCubes(2.7,0.4,1.3
        ,5,0.1,3,"rgb(150, 150, 150)"); //Floor
    for (let i = 0; i < 8; i++) {
        for (let k = 0; k < 5; k++) {
            let y = 0.10 + 0.60 * k;
            let x = 0.10 + 0.60 * i + 0.50;
            let z = 0.5;
            createCubes(x, z, y, 0.1, 0.1, 0.1);
        }
    }



    function animate() {
        requestAnimationFrame(animate);

        // line.rotation.x += 0.01;
        // line.rotation.y += 0.01;

        renderer.render(scene, camera);
    }
    function createCubes(x, y, z, width, height, depth,color=0x00ff00) {
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const cube = new THREE.Mesh(geometry, material);
        cube.position.x = x;
        cube.position.y = y;
        cube.position.z = z;
        scene.add(cube);
    }


    animate();


}