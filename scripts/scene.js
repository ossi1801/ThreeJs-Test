import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js'
import * as BufferGeometryUtils from '../three.js-master/examples/jsm/utils/BufferGeometryUtils.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';

export default function init() {
    class Bridge {
        constructor(width, height, depth, color, x, y, z) {
            let tpWidth = width * 2;
            let tpHeight = width * 0.2;
            let tY = y + height / 2;
            let bY = y - height / 2;
            this.color = color;
            this.left1 = this.createGeom(tpWidth, tpHeight, depth, -x, tY, z); //left top
            this.left2 = this.createGeom(width, height, depth, -x, y, z); //left mid
            this.left3 = this.createGeom(tpWidth, tpHeight, depth, -x, bY, z); //left bot
            this.right1 = this.createGeom(tpWidth, tpHeight, depth, x, tY, z); //right top
            this.right2 = this.createGeom(width, height, depth, x, y, z); //right mid
            this.right3 = this.createGeom(tpWidth, tpHeight, depth, x, bY, z); //right bot         
            this.arr = [this.left1, this.left2, this.left3, this.right1, this.right2, this.right3]; //TODO MERGE TO ONE MESH INSTEAD OF ARRAY?
            this.merge();
        }
        createGeom(width = 2, height = 2, depth = 2, x = -2, y = -4, z = -6) {
            let newGeom = new THREE.BoxGeometry(width, height, depth); // buffer geometry
            newGeom.translate(x, y, z); // set position 
            return newGeom;
        }
        merge() {
            let mergedBoxes = BufferGeometryUtils.mergeGeometries(this.arr); // merged geometries 
            mergedBoxes.computeBoundingBox();
            let material = new THREE.MeshPhongMaterial({
                color: this.color
            });
            let mesh = new THREE.Mesh(mergedBoxes, material);
            scene.add(mesh); //Add merged bridge mesh to scene only
            this.merged = mesh;
        }
        moveX(Direction = "+", speed = 0.05) {
            if (Direction == "+") {
                this.merged.position.x += speed;
            }
            else {
                this.merged.position.x -= speed;
            }
        }
    }

    var renderer, scene, camera, controls, mixer, clock, model, action, grabLine,bridge,tr;
    var endOfAnim = false;
    var boxArray = [];
    var nextLocation = null;
    var speed = 0.05;
    var goingUp = false;
    var grabAnimSpeed = 1.5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x889988);
    const container = document.querySelector('#threejs-container');
    container.append(renderer.domElement);
    clock = new THREE.Clock(); //clock for anims
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.set(120, 50, 20);
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
            createNamedBox(i, k, boxW, boxW, boxW, 'grey', x, z, y);
        }
    }

    createOuterWalls(100, 10, 100);  //call functions
    loadGrab();
    tr = createBox(3,1,2,"lightblue",0,6,0); //Trolley
    bridge =new Bridge(0.5,1,100,"#f9b418",-2,6,0);
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
            points.push(new THREE.Vector3(0, 6, 0));         
            const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
            grabLine = new THREE.Line(lineGeo, lineMat);
            scene.add(grabLine);
            model.scene.position.setZ(grabLine.position.z);

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
        if (grabLine != undefined && boxArray.length > 0) {
            moveToNextLocation();
        }
        renderer.render(scene, camera);

    }
    function randomIntFromInterval(min, max) { // min and max included 
        return Math.floor(Math.random() * (max - min + 1) + min)
    }
    function moveToNextLocation() {
        if (nextLocation == null) {
            const rndIntX = randomIntFromInterval(0, xAmount);
            const rndIntY = randomIntFromInterval(0, yAmount);
            let rndBoxArr = boxArray.filter(o => o.x === rndIntX && o.y === rndIntY);
            if(rndBoxArr==undefined || rndBoxArr[0]==undefined) return;
            nextLocation = rndBoxArr[0].m;
            nextLocation.material.color.set("red");
            //console.log(nextLocation);
            //console.log(grabLine.position.y); 
            console.log("Nextpos", rndIntX, rndIntY);
             
        } else {

            if (closeEnough()) {
                if(goingUp==false && lowerGrabAndReturn()==false ) {                         
                    return;
                }else if(liftGrabAndReturn()==false){              
                    goingUp = true;
                    return;
                }
                goingUp=false
                nextLocation.material.color.set("gray");
                nextLocation = null;
                return;
            }


            //move to x
            if (nextLocation.position.x > grabLine.position.x) {
                grabLine.position.x += speed;
                tr.position.x += speed;
                bridge.moveX("+",speed);
            } else if (nextLocation.position.x < grabLine.position.x) {
                grabLine.position.x -= speed;
                tr.position.x -= speed;
                bridge.moveX("-",speed);
            } else {
                console.log("Achieved x");
            }
            model.scene.position.setX(grabLine.position.x);

           //move to z
            if (nextLocation.position.z > grabLine.position.z) {
                grabLine.position.z += speed;
                tr.position.z += speed;
                
            } else if (nextLocation.position.z < grabLine.position.z) {
                grabLine.position.z -= speed;
                tr.position.z -= speed;
                
            } else {
                console.log("Achieved (z)");
            }           
            model.scene.position.setZ(grabLine.position.z);

        }
    }
    function lowerGrabAndReturn(){
        if(Math.round(Math.abs(nextLocation.position.y - grabLine.position.y)) < 2)return true;
        else{
            playGrabAnim();
            grabLine.position.y -= speed/2;
            grabLine.scale.y += speed/10;
            model.scene.position.setY(grabLine.position.y);
            return false;
        }       
    }
    function liftGrabAndReturn(){
        if(1<= grabLine.position.y)return true;
        else{    
            grabLine.position.y += speed/2;
            grabLine.scale.y -= speed/10;
            model.scene.position.setY(grabLine.position.y);
            return false;
        }       
    }
    function closeEnough() {
        return Math.round(Math.abs(nextLocation.position.x - grabLine.position.x)) < 1 &&
            Math.round(Math.abs(nextLocation.position.z - grabLine.position.z)) < 1;
    }
    function playGrabAnim() {
        action = mixer.clipAction(model.animations[0]);
        action.paused = false;
        action.setLoop(THREE.LoopOnce);
        if (endOfAnim) {
            if (action.time === 0) {
                action.time = action.getClip().duration;
            }
            action.timeScale = -grabAnimSpeed;
        } else {
            action.timeScale = grabAnimSpeed;
        }
        endOfAnim = !endOfAnim;
        if (action !== null) {
            action.play();
        }
    }

    function createNamedBox(xid, yid, width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let m = createBox(width, height, depth, color, x, y, z);
        boxArray.push({ x: xid, y: yid, m: m });
    }

    function createBox(width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let geometry = new THREE.BoxGeometry(width, height, depth);
        let material1 = new THREE.MeshPhongMaterial({
            color: color
        });
        let mesh = new THREE.Mesh(geometry, material1);
        mesh.position.set(x, y, z);
        scene.add(mesh);
        return mesh;
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
