import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
import { ParametricGeometry } from '../three.js-master/examples/jsm/geometries/ParametricGeometry.js';
//TODO IMPORT FROM IMPORT MAP 
import { Bridge, Trolley, Grab, TextDraw } from './LoadObjects.js';
import { getColor, randomIntFromInterval, getUrlContent } from './Extender.js';

export default async function init() {
    var renderer, scene, camera, controls, clock, grab, bridge, trolley, originalColor;
    var boxArray = [];
    var nextLocation = null;
    var speed = 0.05;
    var goingUp = false;

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
    let boxPos = 3;
    let xAmount = 50;
    let yAmount = 16;
    let offsetX = (xAmount * boxPos + boxW) / 2;
    let offsetY = (yAmount * boxPos + boxW) / 2;
    for (let i = 0; i < xAmount; i++) {
        for (let k = 0; k < yAmount; k++) {

            let x = (boxW + boxPos * i) - offsetX;
            let y = (boxW + boxPos * k) - offsetY;

            let min = 1;
            let max = 6;
            let surfaceHeight = randomIntFromInterval(min, max);
            let surfaceColor = getColor(min, max, surfaceHeight);
            let z = surfaceHeight / 2 - 4;
            createNamedBox(i, k, boxW, surfaceHeight, boxW, surfaceColor, x, z, y); //'grey'
        }
    }
    let outerWallDepth = 80;
    createOuterWalls(150, 10, outerWallDepth);  //call functions
    trolley = new Trolley(scene, 3, 1, 2, "lightblue", 0, 6, 0);
    grab = new Grab(scene);
    bridge = new Bridge(scene, 0.5, 1, outerWallDepth, "#f9b418", -2, 6, 0);

    //Text object
    let font = await getUrlContent("three.js-master/examples/fonts/helvetiker_regular.typeface.json");;
    let textTest = new TextDraw(scene, font);
    textTest.drawText("Storage", 0, 30, 0);

    animate(); //anim always last



    function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        if (grab.mixer) grab.mixer.update(delta);
        if (grab.mesh != undefined && boxArray.length > 0) {
            moveToNextLocation();
        }
        renderer.render(scene, camera);

    }



    function moveToNextLocation() {
        if (nextLocation == null) {
            const rndIntX = randomIntFromInterval(0, xAmount);
            const rndIntY = randomIntFromInterval(0, yAmount);
            let rndBoxArr = boxArray.filter(o => o.x === rndIntX && o.y === rndIntY);
            if (rndBoxArr == undefined || rndBoxArr[0] == undefined) return;
            nextLocation = rndBoxArr[0].m;
            originalColor = nextLocation.material.color.clone();//TODO MAKE ORIGINAL COLOR PARH OF RNDBOX OBJECTS
            nextLocation.material.color.set("red");
            console.log("Nextpos", rndIntX, rndIntY);

        } else {

            if (closeEnough()) {
                if (goingUp == false && lowerGrabAndReturn() == false) {
                    return;
                } else if (liftGrabAndReturn() == false) {
                    goingUp = true;
                    return;
                }
                goingUp = false;
                //console.log(originalColor); 
                nextLocation.material.color.set(originalColor);
                nextLocation = null;
                return;
            }
            //move to x
            if (nextLocation.position.x > grab.mesh.position.x) {
                grab.moveX("+", speed);
                trolley.moveX("+", speed);
                bridge.moveX("+", speed);
            } else if (nextLocation.position.x < grab.mesh.position.x) {
                grab.moveX("-", speed);
                trolley.moveX("-", speed);
                bridge.moveX("-", speed);
            } else {
                console.log("Achieved x");
            }
            //move to z
            if (nextLocation.position.z > grab.mesh.position.z) {
                grab.moveZ("+", speed);
                trolley.moveZ("+", speed);
            } else if (nextLocation.position.z < grab.mesh.position.z) {
                grab.moveZ("-", speed);
                trolley.moveZ("-", speed);
            } else {
                console.log("Achieved (z)");
            }

        }
    }
    function lowerGrabAndReturn() {
        if (Math.round(Math.abs(nextLocation.position.y - grab.mesh.position.y)) < 2) return true;
        else {
            grab.playGrabAnim();
            grab.moveY("-", speed);
            return false;
        }
    }
    function liftGrabAndReturn() {
        if (1 <= grab.mesh.position.y) return true;
        else {
            grab.moveY("+", speed);
            return false;
        }
    }
    function closeEnough() {
        return Math.round(Math.abs(nextLocation.position.x - grab.mesh.position.x)) < 1 &&
            Math.round(Math.abs(nextLocation.position.z - grab.mesh.position.z)) < 1;
    }


    function createNamedBox(xid, yid, width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let m = createBox(width, height, depth, color, x, y, z);
        boxArray.push({ x: xid, y: yid, m: m });
    }

    function createBox(width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let geometry = new THREE.BoxGeometry(width, height, depth);
        let material = new THREE.MeshPhongMaterial({
            color: color
        });
        let mesh = new THREE.Mesh(geometry, material);
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
