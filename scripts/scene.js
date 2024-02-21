import * as THREE from '../three.js-master/build/three.module.js';
import { OrbitControls } from '../three.js-master/examples/jsm/controls/OrbitControls.js';
import { ParametricGeometry } from '../three.js-master/examples/jsm/geometries/ParametricGeometry.js';
import { AmmoPhysics } from '../three.js-master/examples/jsm/physics/AmmoPhysics.js'
//TODO IMPORT FROM IMPORT MAP 
import { Bridge, Trolley, Grab, TextDraw } from './LoadObjects.js';
import { getColor, randomIntFromInterval, createCameraPresetButtons, createToggleAutomaticLocationBtn } from './Extender.js';
import { createGameControls } from './gamepad.js';
export default async function Start() {
    var renderer, scene, camera, controls, clock, grab, bridge, trolley, originalColor, physics,
     physicsWorld, rigidBodies = [], pos = new THREE.Vector3(), tmpTrans = null;
    const STATE = { DISABLE_DEACTIVATION : 4 };
    var boxArray = [];
    var nextLocation = null;
    var speed = 0.05;
    var goingUp = false;
    var automActive = false;
    var gp = { gamepad: null };
    //const boxW = 2;
    //const boxPos = 3;
    const cylindePos = 3;
    const cylinderW = 1;
    const xAmount = 50;//50
    const yAmount = 16;//16

    //Physics
    Ammo().then(function (AmmoLib) {
        Ammo = AmmoLib;
        AmmoPhysics(Ammo).then((a)=>{
            physics = a;
        }).then(()=>{
         init().then(()=>{
            animate();
         })});
    });

    async function init() {
        setupPhysicsWorld();
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

        //Cylinders
        let offsetX = (xAmount * cylindePos + cylinderW) / 2;
        let offsetY = (yAmount * cylindePos + cylinderW) / 2;
        for (let i = 0; i < xAmount; i++) {
            for (let k = 0; k < yAmount; k++) {
                let x = (cylinderW + cylindePos * i) - offsetX;
                let y = (cylinderW + cylindePos * k) - offsetY;
                let min = 1;
                let max = randomIntFromInterval(min, 6);     
                for (let l = min; l < max; l++) {     
                    let d = cylinderW*2;           
                    let z = d*l-5;//surfaceHeight / 2 - 4;
                    let surfaceColor = getColor(min, max, l);
                    createNamedCylinder(i, k, cylinderW, cylinderW, d, surfaceColor, x, z, y);
                }
            }
        }
        //Boxes
        // let offsetX = (xAmount * boxPos + boxW) / 2;
        // let offsetY = (yAmount * boxPos + boxW) / 2;
        // for (let i = 0; i < xAmount; i++) {
        //     for (let k = 0; k < yAmount; k++) {
        //         let x = (boxW + boxPos * i) - offsetX;
        //         let y = (boxW + boxPos * k) - offsetY;
        //         let min = 1;
        //         let max = 6;
        //         let surfaceHeight = randomIntFromInterval(min, max);
        //         let surfaceColor = getColor(min, max, surfaceHeight);
        //         let z = surfaceHeight / 2 - 4;
        //         createNamedBox(i, k, boxW, surfaceHeight, boxW, surfaceColor, x, z, y); //'grey'
        //         //.userData.physics = { mass: 1 };
        //     }
        // }
        let outerWallWidth = 150;
        let outerWallHeight = 10;
        let outerWallDepth = 80;
        createOuterWalls(outerWallWidth, outerWallHeight, outerWallDepth);  //call functions
        trolley = new Trolley(scene, 3, 1, 2, "lightblue", 0, 6, 0);
        bridge = new Bridge(scene, 0.5, 1, outerWallDepth, "#f9b418", -2, 6, 0);
        console.log(physics);
        grab = new Grab(scene,physics);
        

        //Text object
        let font = "three.js-master/examples/fonts/helvetiker_regular.typeface.json";
        let textTest = new TextDraw(scene, font);
        textTest.drawText("Storage", 0, 30, 0);
        createCameraPresetButtons("Default", camera, controls, 0, 70, 170);
        createCameraPresetButtons("UpLeft", camera, controls, 150, 200, 200);
        createCameraPresetButtons("UpBird", camera, controls, 0, 200, 0);
        createCameraPresetButtons("Behind", camera, controls, 0, 70, -170);
        //createToggleAutomaticLocationBtn(automActive);
        
        createGameControls(gp, grab, trolley, bridge);
        console.log(physics);
        physics.addScene(scene); //Add scene to physics engine
    }

    function animate() {
        requestAnimationFrame(animate);
        var delta = clock.getDelta();
        updatePhysics( delta );
        if (grab.mixer) grab.mixer.update(delta);
        if (grab.mesh != undefined && boxArray.length > 0) {

            if (gp.gamepad)
                gp.gamepad.update();
            else  //if (automActive)    
                moveToNextLocation();
        }
        renderer.render(scene, camera);
        // console.log(physics);
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
        mesh.userData.physics = { mass: 1 };
        scene.add(mesh);
        return mesh;
    }
    function createNamedCylinder(xid, yid, width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let m = createCylinder(width, width, depth, color, x, y, z);
        boxArray.push({ x: xid, y: yid, m: m });
    }
    function createCylinder(width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        let geometry = new THREE.CylinderGeometry( width, height, depth, 32 ); 
        let material = new THREE.MeshPhongMaterial({
            color: color,
           // wireframe: true,
        });
        let mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.userData.physics = { mass: 1 };
        mesh.userData.physicsBody = getPhysicsBody(mesh,0.8, {x: 0, y: 0, z: 0, w: 1},  100,mesh.position);
        scene.add(mesh); //add mesh to scene


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
        //mesh.userData.physics = { mass: 0 }; //
        scene.add(mesh);
        let floorGeom = new THREE.BoxGeometry(width, 1, depth);
        let floorMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: false,
        });
        mesh = new THREE.Mesh(floorGeom, floorMat);
        mesh.userData.physics = { mass: 0 }; //Floor or smth
        mesh.position.set(0, -height / 2, 0);
        scene.add(mesh);
    }

    //physics-----------------------------------------------------------------------------------------

    function setupPhysicsWorld(){
        tmpTrans = new Ammo.btTransform();
        let collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
            dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
            overlappingPairCache    = new Ammo.btDbvtBroadphase(),
            solver                  = new Ammo.btSequentialImpulseConstraintSolver();

        physicsWorld           = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
        physicsWorld.setGravity(new Ammo.btVector3(0, 0, 0));

    }


    function getPhysicsBody(mesh, radius = 0.8, quat = {x: 0, y: 0, z: 0, w: 1},  mass = 100,pos=new THREE.Vector3()) //TODO
    {
        let transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) ); //this bugs it out
        transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
        let motionState = new Ammo.btDefaultMotionState( transform );
        let colShape = new Ammo.btSphereShape( radius );
        colShape.setMargin( 0.05 );
        let localInertia = new Ammo.btVector3( 0, 0, 0 );
        colShape.calculateLocalInertia( mass, localInertia );
        let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
        let body = new Ammo.btRigidBody( rbInfo );

        body.setFriction(4);
        body.setRollingFriction(10);

        body.setActivationState( STATE.DISABLE_DEACTIVATION );
        physicsWorld.addRigidBody( body );
        rigidBodies.push(mesh);
        return body;

    }
    function updatePhysics( deltaTime ){

        // Step world
        physicsWorld.stepSimulation( deltaTime, 10 );

        // Update rigid bodies
        for ( let i = 0; i < rigidBodies.length; i++ ) {
            let objThree = rigidBodies[ i ];
            let objAmmo = objThree.userData.physicsBody;
            let ms = objAmmo.getMotionState();
            if ( ms ) {

                ms.getWorldTransform( tmpTrans );
                let p = tmpTrans.getOrigin();
                let q = tmpTrans.getRotation();
                objThree.position.set( p.x(), p.y(), p.z() );
                objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

            }
        }

    }

   

}
