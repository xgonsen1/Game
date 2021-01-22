import TWEEN from "@tweenjs/tween.js";
import * as THREE from "three";

export default class Scene
{
	
	constructor()
	{
		// container
		
		this.container = document.getElementById('game');
		
		// renderer
		
		this.renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});
		
		
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setClearColor( 0xffffff, 0);
		this.container.appendChild( this.renderer.domElement );
		
		// scene

		this.scene = new THREE.Scene();

		// camera

		let aspect = window.innerWidth / window.innerHeight;
		let d = 20;
		this.camera = new THREE.OrthographicCamera( - d * aspect, d * aspect, d, - d, -100, 1000);
		this.camera.position.x = 2;
		this.camera.position.y = 2; 
		this.camera.position.z = 2; 
		this.camera.lookAt(new THREE.Vector3(0, 0, 0));
		
		//light

		this.light = new THREE.DirectionalLight(0xffffff, 0.7);
		this.light.position.set(0, 399, 0);
		this.light.castShadow = true;
		this.scene.add(this.light);

		this.softLight = new THREE.AmbientLight( 0xffffff, 0.3 );
		this.scene.add(this.softLight)
		
		window.addEventListener('resize', () => this.onResize());
		this.onResize();

	}
	
	setCamera(y, speed = 100)
	{
		let animationCamera = new TWEEN.Tween(this.camera.position)
		.to({y: y+4}, speed)
		.easing(TWEEN.Easing.Cubic.InOut)
		.onUpdate(()=>{

		})
		.start();

		let animationLookat = new TWEEN.Tween(this.camera.lookAt)
		.to({y:y}, speed)
		.easing(TWEEN.Easing.Cubic.InOut)
		.start();
	}
	
	onResize()
	{
		let viewSize = 30;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.camera.left = window.innerWidth / - viewSize;
		this.camera.right = window.innerWidth / viewSize;
		this.camera.top = window.innerHeight / viewSize;
		this.camera.bottom = window.innerHeight / - viewSize;
		this.camera.updateProjectionMatrix();
	}
	
	render()
	{
		this.renderer.render(this.scene, this.camera);
	}

	addElement(elem)
	{
		//console.log(elem);
		this.scene.add(elem);
	}

	removeElement(elem)
	{
		this.scene.remove(elem);
	}

}
