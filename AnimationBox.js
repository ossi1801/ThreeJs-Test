//<script src="https://cdn.jsdelivr.net/npm/three@0.130.1/build/three.min.js"></script>

var camera, scene, renderer, geometry, material, mesh;
var backgroundArea,movingObjectMesh;

init();
animate();

function init() {

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z =300;
    camera.position.y = 250;
    camera.position.x = 600;
    
   // camera.rotation.x = 50;  
    camera.rotation.y = -250;  
    
    scene.add(camera);

    const bgGeometry = new THREE.BoxGeometry( 100.2, 100.2, 250.2 );
    const bgEdgesGeometry = new THREE.EdgesGeometry( bgGeometry );
    const  bgMaterial = new THREE.LineBasicMaterial();

    backgroundArea = new THREE.LineSegments( bgEdgesGeometry, bgMaterial );
   // backgroundArea.rotation.x += 10.01;
   // backgroundArea.rotation.y += 20.02;
    scene.add( backgroundArea );
		
    const movingObjectGeometry = new THREE.BoxGeometry( 50, 50, 50 );
		const movingObjectMaterial = new THREE.MeshBasicMaterial( { color: 0xe60000 } );
		movingObjectMesh = new THREE.Mesh( movingObjectGeometry, movingObjectMaterial );
		scene.add( movingObjectMesh );
    let geo = new THREE.EdgesGeometry( movingObjectMesh.geometry );
		let mat = new THREE.LineBasicMaterial( { color: 0x000000, linewidth: 4 } );
		let wireframe = new THREE.LineSegments( geo, mat );
		wireframe.renderOrder = 1; // make sure wireframes are rendered 2nd
		movingObjectMesh.add( wireframe );
    
//movingObjectMesh.rotation.x += 10.00;
//movingObjectMesh.rotation.y += 20.00;
//movingObjectMesh.position.y += 10.00;
    
    
    
   //mesh = new THREE.Mesh(geometry, material);
   //scene.add(mesh);
   	renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );


}

function animate() {

    requestAnimationFrame(animate);
    render();

}

function render() {
	movingObjectMesh.position.z += 1.00;
   camera.rotation.y += 0.001;  
 // movingObjectMesh.position.y += 2.00;

    renderer.render(scene, camera);

}