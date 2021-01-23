import TWEEN from '@tweenjs/tween.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { removeLights, setUpShadows} from "./utils"

export default class Unicorn {
    constructor(parent, y, onLoad = () => {}) {
        this.parent = parent;
        this.object = null;
        this.positionY = y;

        this.onLoad = onLoad;
        this.loadObject();
    }

    loadObject() {
        const loader = new GLTFLoader();

        loader.load('models/unicorn/Unicorn_01.gltf', gltf =>{
            removeLights(gltf.scene);
            setUpShadows(gltf.scene);

            this.object = gltf.scene;

            this.object.scale.set(0.09, 0.09, 0.09);
            this.object.position.set(0, this.positionY + 5, 0);
            
            //console.log(this.object.rotation.y);
            //this.object.rotation.y = -Math.PI;

            this.parent.add(this.object);
            this.onLoad();

        }, undefined, error => {
            console.error(error);
        });
    }

    move(bonusNumber) {
        /*this.object.scale.set(1, 1, 1);
        this.object.position.set(0, this.positionY, 0);*/

        const data = {
            x: this.object.position.x,
            y: this.object.position.y,
            z: this.object.position.z,
            scaleX: this.object.scale.x,
            scaleY: this.object.scale.y,
            scaleZ: this.object.scale.z,
        };

        const target = {
           x: [data.x, 100],
           y: [data.y, window.innerHeight ],
           z: [data.z, -1*window.innerWidth],
           scaleX:[0.5, 0.2],
           scaleY:[0.5, 0.2],
           scaleZ:[0.5, 0.2]
        };
        

        this.movingAnimation = new TWEEN.Tween(data)
            .onStart(()=>{

            })
            .to(target, 2000)
            .onUpdate(() => {
                this.object.position.x = data.x;
                this.object.position.y = data.y;
                this.object.position.z = data.z;
                this.object.scale.x = data.scaleX;
                this.object.scale.y = data.scaleY;
                this.object.scale.z = data.scaleZ;
            })
            .onComplete(()=>this.setUnicornBonus(bonusNumber))
            .start();
    }
    setUnicornBonus(bonus){
		const index = bonus;
		document.getElementById('unicorn' + index.toString()).classList.remove('hidden');
	}

}