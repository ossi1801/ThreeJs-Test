//import * as THREE from './three.js-master/build/three.js';

export default function init() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    // scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
    
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    const container = document.querySelector('#threejs-container');
    container.append(renderer.domElement);
    

    const geometry = new THREE.SphereGeometry( 1, 1, 1 );
    const wireframe = new THREE.WireframeGeometry( geometry );
    const line = new THREE.LineSegments( wireframe );
    line.material.depthTest = false;
    line.material.opacity = 0.25;
    line.material.transparent = true;
    
    scene.add( line ); 
    camera.position.z = 5;
    

 
 

    function animate() {
        requestAnimationFrame( animate );
    
        line.rotation.x += 0.01;
        line.rotation.y += 0.01;
    
        renderer.render( scene, camera );
    }
    
    animate();


   // renderer.render(scene, camera)
    
    
    
}