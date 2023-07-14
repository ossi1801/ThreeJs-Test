import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from '../three.js-master/examples/jsm/utils/BufferGeometryUtils.js';

export class Bridge {
    constructor(scene, width, height, depth, color, x, y, z) {
        let tpWidth = width * 2;
        let tpHeight = width * 0.2;
        let tY = y + height / 2;
        let bY = y - height / 2;
        this.scene = scene;
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
        this.mesh = new THREE.Mesh(mergedBoxes, material);
        this.scene.add(this.mesh); //Add merged bridge mesh to scene only
    }
    moveX(Direction = "+", speed = 0.05) {
        if (Direction == "+") {
            this.mesh.position.x += speed;
        }
        else {
            this.mesh.position.x -= speed;
        }
    }
}
export class Trolley {
    constructor(scene, width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        this.scene = scene;
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.color = color;
        this.x = x;
        this.y = y;
        this.z = z;
        this.mesh = null;
        this.loadTrolley();

    }
    loadTrolley() {
        let geometry = new THREE.BoxGeometry(this.width, this.height, this.depth);
        let material = new THREE.MeshPhongMaterial({
            color: this.color
        });
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.set(this.x, this.y, this.z);
        this.scene.add(this.mesh);
    }
    moveX(Direction = "+", speed = 0.05) {
        if (Direction == "+") {
            this.mesh.position.x += speed;
        }
        else {
            this.mesh.position.x -= speed;
        }
    }
    moveZ(Direction = "+", speed = 0.05) {
        if (Direction == "+") {
            this.mesh.position.z += speed;
        }
        else {
            this.mesh.position.z -= speed;
        }
    }
}

export class Grab {
    constructor(scene) {
        this.scene = scene;
        this.mixer = null;
        this.action = null;
        this.model = null;
        this.grabAnimSpeed = 1.5;
        this.endOfAnim = false;
        this.grabLine = null;
        this.loadGrab();
    }
    loadGrab(url = '../models/grab.gltf') {
        // Load a glTF resource
        console.log(url);
        const loader = new GLTFLoader();
        loader.load(url, function (gltf) {
            this.model = gltf;
            this.mixer = new THREE.AnimationMixer(this.model.scene);
            this.action = this.mixer.clipAction(gltf.animations[0]);
            this.action.setLoop(THREE.LoopOnce); // Do only once
            this.action.clampWhenFinished = true; //Finishing pos
            this.scene.add(this.model.scene);
            //if everything okay draw extra stuff
            //Line 
            this.loadGrabLine();

        }.bind(this),
            function (xhr) {  // called while loading is progressing
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                this.loadGrab('https://raw.githubusercontent.com/ossi1801/ThreeJs-Test/main/models/grab.gltf')
                console.log('An error happened', error);
            }.bind(this)
        );
    }
    loadGrabLine() {
        const lineMat = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const points = [];
        points.push(new THREE.Vector3(0, 2, 0));
        points.push(new THREE.Vector3(0, 6, 0));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        this.grabLine = new THREE.Line(lineGeo, lineMat);
        this.scene.add(this.grabLine);
        this.model.scene.position.setZ(this.grabLine.position.z);
    }
    moveX(Direction = "+", speed = 0.05) {
        if (Direction == "+") {
            this.grabLine.position.x += speed;
        }
        else {
            this.grabLine.position.x -= speed;
        }
        this.model.scene.position.setX(this.grabLine.position.x);
    }
    moveZ(Direction = "+", speed = 0.05) {
        if (Direction == "+") {
            this.grabLine.position.z += speed;
        }
        else {
            this.grabLine.position.z -= speed;
        }
        this.model.scene.position.setZ(this.grabLine.position.z);
    }
    moveY(Direction = "+", speed = 0.05) {
        if (Direction == "+") {//down
            this.grabLine.position.y += speed / 2;
            this.grabLine.scale.y -= speed / 10;
        }
        else { //lift
            this.grabLine.position.y -= speed / 2;
            this.grabLine.scale.y += speed / 10;
        }
        this.model.scene.position.setY(this.grabLine.position.y);
    }
    playGrabAnim() {
        this.action = this.mixer.clipAction(this.model.animations[0]);
        this.action.paused = false;
        this.action.setLoop(THREE.LoopOnce);
        if (this.endOfAnim) {
            if (this.action.time === 0) {
                this.action.time = this.action.getClip().duration;
            }
            this.action.timeScale = -this.grabAnimSpeed;
        } else {
            this.action.timeScale = this.grabAnimSpeed;
        }
        this.endOfAnim = !this.endOfAnim;
        if (this.action !== null) {
            this.action.play();
        }
    }
}