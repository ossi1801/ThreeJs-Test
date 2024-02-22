import * as THREE from '../three.js-master/build/three.module.js';
import { GLTFLoader } from '../three.js-master/examples/jsm/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from '../three.js-master/examples/jsm/utils/BufferGeometryUtils.js';
import { TextGeometry } from '../three.js-master/examples/jsm/geometries/TextGeometry.js';
import { FontLoader } from '../three.js-master/examples/jsm/loaders/FontLoader.js';
import { getUrlContent } from './Extender.js';
class AnimatedObject {
    constructor(scene) {
        this.scene = scene;
        this.mesh = null;
    }
    moveX(Direction = "+", speed = 0.05) {
        if (Direction == "+")
            this.mesh.position.x += speed;
        else
            this.mesh.position.x -= speed;
    }
    moveZ(Direction = "+", speed = 0.05) {
        if (Direction == "+")
            this.mesh.position.z += speed;
        else
            this.mesh.position.z -= speed;
    }
    moveY(Direction = "+", speed = 0.05) {
        if (Direction == "+")
            this.mesh.position.y += speed;
        else
            this.mesh.position.y -= speed;
    }
}

export class Bridge extends AnimatedObject {
    constructor(scene, width, height, depth, color, x, y, z) {
        super(scene);
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
        this.mesh = new THREE.Mesh(mergedBoxes, material);
        this.scene.add(this.mesh); //Add merged bridge mesh to scene only
    }
}
export class Trolley extends AnimatedObject {
    constructor(scene, width = 2, height = 2, depth = 2, color = 'gray', x = -2, y = -4, z = -6) {
        super(scene);
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
}

export class Grab extends AnimatedObject {
    constructor(scene,physics,colliderMesh) {
        super(scene);
        this.physics = physics;
        this.colliderMesh =colliderMesh;
        this.scene = scene;
        this.mixer = null;
        this.action = null;
        this.model = null;
        this.grabAnimSpeed = 1.5;
        this.endOfAnim = false;    
        (async () => { this.loadGrab(await getUrlContent("models/grab.gltf"));  })();      
    }
    loadGrab(url = '../models/grab.gltf') {
        // Load a glTF resource
        //console.log(url);
        const loader = new GLTFLoader();
        loader.load(url, function (gltf) {
            this.model = gltf;            
            this.mixer = new THREE.AnimationMixer(this.model.scene);
            this.action = this.mixer.clipAction(gltf.animations[0]);
            this.action.setLoop(THREE.LoopOnce); // Do only once
            this.action.clampWhenFinished = true; //Finishing pos
            this.scene.add(this.model.scene);
            //if everything okay draw extra stuff          
            this.loadGrabLine(); 
            this.createCollider();
         
        }.bind(this),
            function (xhr) {  // called while loading is progressing
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                //this.loadGrab('https://raw.githubusercontent.com/ossi1801/ThreeJs-Test/main/models/grab.gltf');
                // This is useless with new code (?)
                console.log('An error happened', error);
            }.bind(this)
        );
    }
    createCollider(){
       this.colliderMesh.position.setX(this.mesh.position.x);
       this.colliderMesh.position.setZ(this.mesh.position.z);
       this.colliderMesh.position.setY(this.mesh.position.y+5);
    }
    loadGrabLine() {
        const lineMat = new THREE.LineBasicMaterial({ color: 0x0000ff });
        const points = [];
        let startheight = 11;
        points.push(new THREE.Vector3(0, startheight-4, 0));
        points.push(new THREE.Vector3(0, startheight, 0));
        const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
        this.mesh = new THREE.Line(lineGeo, lineMat);
        this.scene.add(this.mesh);
    }
    moveX(Direction = "+", speed = 0.05) {
        super.moveX(Direction, speed);
        this.model.scene.position.setX(this.mesh.position.x);
        this.model.scene.position.setZ(this.mesh.position.z);
        this.model.scene.position.setY(this.mesh.position.y+5);
        this.moveCollider(Direction,speed,0,0);
    }
    moveZ(Direction = "+", speed = 0.05) {
        super.moveZ(Direction, speed);
        this.model.scene.position.setX(this.mesh.position.x);
        this.model.scene.position.setZ(this.mesh.position.z);
        this.model.scene.position.setY(this.mesh.position.y+5);
        this.moveCollider(Direction,0,0,speed);     
    }
    moveY(Direction = "+", speed = 0.05) {
        if (Direction == "+") {//down
            this.mesh.position.y += speed / 2;
            this.mesh.scale.y -= speed / 10;
        }
        else { //lift
            this.mesh.position.y -= speed / 2;
            this.mesh.scale.y += speed / 10;
        }
        this.model.scene.position.setX(this.mesh.position.x);
        this.model.scene.position.setZ(this.mesh.position.z);
        this.model.scene.position.setY(this.mesh.position.y+5);       
        this.moveCollider(Direction,0,speed,0);     
    }
    moveCollider(Direction,xs=0,ys=0,ds=0){
        if(Direction=="-"){
            xs=-xs;
            ys=-ys;
            ds=-ds;
        }
        let resultantImpulse = new Ammo.btVector3( xs,ys,ds )
        resultantImpulse.op_mul(50);

        let physicsBody = this.colliderMesh.userData.physicsBody;
        physicsBody.setLinearVelocity( resultantImpulse );
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

export class TextDraw {

    constructor(scene, fontJson = "../three.js-master/examples/fonts/helvetiker_regular.typeface.json") {
        this.scene = scene;
        this.fontJson = fontJson;
        this.geometry = null;
        this.material = null;
        this.mesh = null;
        this.font = null;
        (async () => { this.#loadFont(await getUrlContent(fontJson));  })();      
        //this.#loadFont();
    }
    async drawText(text, x, y, z, size = 10, height = 5, bevelThickness = 1, color = 0xff0000, specular = 0xffffff) {
        this.text = text;
        this.size = size;
        this.height = height;
        this.bevelThickness = bevelThickness;
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.specular = specular;

        if (this.font != null && this.font != undefined) {
            this.#draw();
        }
        else {
            this.font = await this.#ld();
            if (this.font != null && this.font != undefined) {
                this.#draw();
            } else {
                console.error("Font not defined");
            }
        }
    }
    #draw() {
        this.geometry = new TextGeometry(this.text, {
            font: this.font,
            size: this.size,
            height: this.height,
            curveSegments: 12,
            bevelEnabled: true,
            bevelThickness: this.bevelThickness,
            bevelSize: this.bevelThickness,
            bevelOffset: 0,
            bevelSegments: 5
        });
        this.material = new THREE.MeshPhongMaterial({ color: this.color, specular: this.color });
        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);
        this.mesh.position.set(this.x, this.y, this.z);
    }
    async #loadFont() { this.font = await this.#ld(); }
    #ld() {
        const loader = new FontLoader();
        return new Promise((resolve, reject) => {
            loader.load(this.fontJson, resolve, undefined, reject)
        });
    }
}


