import {GAME_STATES, CUBE_STATES } from './utils';
import Cube  from "./Cube";
import Scene from "./Scene";
import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";


export default class Game
{	
	constructor()
	{
		this.stage = new Scene();
		this.blocks = [];
		this.counterBonus = 0;
		
		this.mainContainer = document.getElementById('container');
		this.scoreContainer = document.getElementById('score');
		this.startButton = document.getElementById('start-button');
		this.instructions = document.getElementById('instructions');
		this.bonusContainer = document.getElementById('bonus');
		this.scoreContainer.innerHTML = '0';
		
		this.newBlocks = new THREE.Group();
		this.placedBlocks = new THREE.Group();
		this.choppedBlocks = new THREE.Group();
		

		this.stage.addElement(this.newBlocks);
		this.stage.addElement(this.placedBlocks);
		this.stage.addElement(this.choppedBlocks);
		
		this.addBlock();
		this.tick();
		
		this.updateState(GAME_STATES.READY);
		
		
		document.addEventListener('keydown', e =>
		{
			if(e.keyCode == 32) this.onAction()
		});
		
		document.addEventListener('keyup', e=>{
			if(e.key == "t"){
					this.rebuildBlocks();
				
			} 
		});
		document.addEventListener('click', e =>
		{
			if(this.bomb == null)
				this.onAction();
		});		
		
	}

	updateState(newState)
	{
		for(let key in GAME_STATES) this.mainContainer.classList.remove(GAME_STATES[key]);
		this.mainContainer.classList.add(newState);
        this.state = newState;
	}

	onAction()
	{

		switch(this.state)
		{
			case GAME_STATES.READY:
				this.startGame();
				break;
			case GAME_STATES.PLAYING:{
				this.placeBlock();
				break;
			}
			case GAME_STATES.ENDED:
				this.restartGame();
				break;	
		}
	}
	
	startGame()
	{
		if(this.state != GAME_STATES.PLAYING)
		{
			this.scoreContainer.innerHTML = '0';
			this.counterBonus = 0;
			this.unicornBonus = 0;
			this.updateState(GAME_STATES.PLAYING);
			this.addBlock();
		}
	}

	restartGame()
	{
		this.updateState(GAME_STATES.RESETTING);	
		let oldBlocks = this.placedBlocks.children;
		let removeSpeed = 0.2;
		let delayAmount = 0.02;
		
		for(let i = oldBlocks.length; i >= 0; i--)
		{
			this.placedBlocks.remove(oldBlocks[i]);
		}

		let cameraMoveSpeed = removeSpeed * 2 + (oldBlocks.length * delayAmount);
		this.stage.setCamera(2, cameraMoveSpeed);
		
		this.blocks = this.blocks.slice(0, 1);
		//console.log(this.blocks);
		setTimeout(() => {
			this.startGame(); 
		}, cameraMoveSpeed * 1000);
		
	}
	
	placeBlock()
	{
		let currentBlock = this.blocks[this.blocks.length - 1];
		let newBlocks = currentBlock.place();
		
		this.newBlocks.remove(currentBlock.mesh);
		if(newBlocks.placed) this.placedBlocks.add(newBlocks.placed);
		if(newBlocks.chopped)
		{
			const object = {
				x: newBlocks.chopped.position.x,
				y: newBlocks.chopped.position.y,
				z: newBlocks.chopped.position.z,
				rotationX: newBlocks.chopped.rotation.x,
				rotationY: newBlocks.chopped.rotation.y,
				rotationZ: newBlocks.chopped.rotation.z
			};
			this.choppedBlocks.add(newBlocks.chopped);
			
			let rotateRandomness = 20;
			const target = {
				y: -30,
				rotationX: newBlocks.plane == 'z' ? ((Math.random() * rotateRandomness) - (rotateRandomness/2)) : 0.1,
				rotationZ: newBlocks.plane == 'x' ? ((Math.random() * rotateRandomness) - (rotateRandomness/2)) : 0.1,
				rotationY: Math.random() * 0.5,
				
			};
			
			if(newBlocks.chopped.position[newBlocks.plane] > newBlocks.placed.position[newBlocks.plane])
			{
				target[newBlocks.plane] = 60 * Math.abs(newBlocks.direction);
			}
			else
			{
				target[newBlocks.plane] = -1*(60 * Math.abs(newBlocks.direction));
			}
			//console.log(object, target);
			const animation = new TWEEN.Tween (object)
			.to(target, (20*(0,5*newBlocks.chopped.position.y)))
			.onUpdate(()=>{ 
                newBlocks.chopped.position.x = object.x,
				newBlocks.chopped.position.y = object.y,
				newBlocks.chopped.position.z = object.z,
				newBlocks.chopped.rotation.x = object.rotationX,
				newBlocks.chopped.rotation.y = object.rotationY,
				newBlocks.chopped.rotation.z = object.rotationZ
            })
			.onComplete(()=>this.choppedBlocks.remove(newBlocks.chopped))
			.start();
 
		}
		
		this.addBlock();
	}
	
	addBlock()
	{
		let lastBlock = this.blocks[this.blocks.length - 1];
		const blocks = this.placedBlocks.children;

		if(lastBlock && lastBlock.state == CUBE_STATES.MISSED)
		{
			return this.endGame();
		}
		
		const score = blocks.length ? blocks.length : 0;
		this.updateScore();
		this.getMovingCube();
	
		if(this.blocks.length >= 5) this.instructions.classList.add('hide');

	}

	getMovingCube(cube){
		let lastBlock = cube ? cube : this.blocks[this.blocks.length - 1];
		let newKidOnTheBlock = new Cube(lastBlock);
		this.newBlocks.add(newKidOnTheBlock.mesh);
		this.blocks.push(newKidOnTheBlock);
		const cameraSet = this.placedBlocks.children.length ? this.placedBlocks.children.length : 1;
		this.stage.setCamera(cameraSet * 2);
	}


	updateScore(){
		const score = this.placedBlocks.children.length ? this.placedBlocks.children.length : 0;
		this.scoreContainer.innerHTML = String(score);
	}
	

	rebuildBlocks(){
		let blockPositions=this.placedBlocks.children;
		const lastIndex = blockPositions.length -1;
		
		for (let i=0; i<blockPositions.length; i++){
			const positionY = blockPositions[lastIndex - i].position.y;
			const object = {
				x:blockPositions[i].position.x,
				y:blockPositions[i].position.y,
				z:blockPositions[i].position.z
			};

			const target = {
				y: positionY
			};
			//console.log(object,target, i);
			const animation2 = new TWEEN.Tween(object)
			.to(target, 100)
			//.delay(lastIndex-i * 100)
			.onUpdate(()=>{
				blockPositions[i].position.x = object.x,
				blockPositions[i].position.y = object.y,
				blockPositions[i].position.z = object.z
			})
			.onComplete(()=>{
				
			})
			.start()
		}
		
		const pom= this.blocks.slice(0, this.blocks.length - 1);
		this.blocks = pom;

		const lastCube = this.blocks[this.blocks.length-1];
		const lastBlock = this.blocks[0];
		 
		lastCube.position.x = 0;
		lastCube.position.z = 0;
		lastCube.dimension = lastBlock.dimension;
		
		console.log(this.blocks);

		//odstranim hornu kocku
		this.newBlocks.remove(this.newBlocks.children[1]);
		
		let newKidOnTheBlock = new Cube(lastCube);
		this.newBlocks.add(newKidOnTheBlock.mesh);
		this.blocks.push(newKidOnTheBlock);
	}
	
	endGame()
	{
		this.updateState(GAME_STATES.ENDED);
	}

	tick()
	{
		this.blocks[this.blocks.length - 1].tick();
		this.stage.render();
		requestAnimationFrame(() => {this.tick()});
		TWEEN.update();
	}
}
