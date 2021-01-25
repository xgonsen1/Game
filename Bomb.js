import TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { removeLights, setUpShadows} from "./utils"

export default class Bomb {
    constructor(parent, y, onLoad = () => {}) {
        this.parent = parent;
        this.object = null;
        this.positionY = y;
        this.onLoad = onLoad;
        this.loadObject();
    }

    loadObject() {
        const loader = new GLTFLoader();

        loader.load('models/bomb/bomb.gltf', gltf =>{
            removeLights(gltf.scene);
            setUpShadows(gltf.scene);

            this.object = gltf.scene;

            this.object.scale.set(1, 1, 1);
            this.object.position.set(10, this.positionY + 12, 10);
            
            //console.log(this.object.rotation.y);
            //this.object.rotation.y = -Math.PI;

            this.parent.add(this.object);
            this.onLoad();

        }, undefined, error => {
            console.error(error);
        });
    }

    move() {
        const data = {
            y: this.object.position.y,
        };

        const target = {
           y: [data.y, data.y + 10, data.y, data.y + 5, data.y, data.y + 5, data.y]
        };
        

        this.movingAnimation = new TWEEN.Tween(data)
            .onStart(()=>this.scaleAnimation())
            .to(target, 1500)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(() => {
                this.object.position.y = data.y;
            })
            .repeat(Infinity)
            .start();
    }

    scaleAnimation(){
        const data = {
            scaleX: this.object.scale.x,
            scaleY: this.object.scale.y,
            scaleZ: this.object.scale.z,
        };
        const scaleAnimation = new TWEEN.Tween(data)
        .to({scaleX: 4, scaleY:4, scaleZ: 4}, 1000)
        .onUpdate(()=>{
            this.object.scale.x = data.scaleX;
            this.object.scale.y = data.scaleY;
            this.object.scale.z = data.scaleZ;
        })
        .start();

    }

    moveLeft(){
        const data = {x: this.object.position.x, z: this.object.position.z};
        const target = {x: this.object.position.x -1,  z: this.object.position.z+1 }

        this.moveXAnimation = new TWEEN.Tween(data)
            .to(target, 100)
            .onUpdate(() => {
                this.object.position.x = data.x;
                this.object.position.z = data.z;
            })
            .start();
    }

    moveRight(){ 
        const data = {x: this.object.position.x, z: this.object.position.z};
        const target = {x: this.object.position.x +1,  z: this.object.position.z-1 }

        this.moveXAnimation = new TWEEN.Tween(data)
            .to(target, 10)
            .onUpdate(() => {
                this.object.position.x = data.x;
                this.object.position.z = data.z;
            })
            .start();
    }
}

