import {GAME_STATES, CUBE_STATES } from './utils';
import Bomb  from "./Bomb";
import Cube  from "./Cube";
import ExplodeAnimation  from "./ExplodeAnimation";
import Scene from "./Scene";
import Unicorn from "./Unicorn";


import * as THREE from "three";
import TWEEN from "@tweenjs/tween.js";


export default class Game
{	
	constructor()
	{
		this.stage = new Scene();
		this.blocks = [];
		this.counterBonus = 0;
		this.unicornBonus = 0;

		this.explosionParts = [];
		this.bomb = null;
		this.countDown = 3;
		
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
				if(this.unicornBonus != 0){
					this.rebuildBlocks();
					this.unsetUnicorn();
				}
				
			} 

			if(e.key == "a"){
				if(this.bomb!== null ){
					this.bomb.moveLeft();
				}
			}
			if(e.key == "d"){
				if(this.bomb !== null){
					this.bomb.moveRight();
				}
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
		

		if(newBlocks.bonus){
			this.bonus = true;
			this.counterBonus++;
		}
		if(!newBlocks.bonus){
			this.counterBonus = 0;
			this.bonus = false;
		}

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

		//bonus checking
		if(this.counterBonus > 0){
			this.scoreContainer.classList.add('bonus');
			if(this.counterBonus === 3){
				if(this.unicornBonus < 3){
					this.unicorn = new Unicorn(this.stage.scene, this.getYPosition() + 5, () => {
						this.unicorn.move(this.unicornBonus);
					});
					this.unicornBonus++
					this.counterBonus = 0;
				}
			}
		}
		else this.scoreContainer.classList.remove('bonus');
		
		const score = blocks.length ? blocks.length : 0;
		this.updateScore();

		//nahodne pridana bomba
		const random = Math.floor(Math.random() * Math.floor(10));
		//console.log(random % 7 == 0, random)

		//if(score > 10 && random % 7 == 0 && !this.bonus){
		if(score == 5 || score == 10){
			this.bomb = new Bomb(this.stage.scene, this.getYPosition(), () =>{
				this.bomb.move();
			});
			this.setTime();
		}
		//normalne kocka sa pridava
		else{
			this.getMovingCube();
		}
	
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

	getYPosition(){
		const blocks = this.placedBlocks.children;
		const positionY = blocks.length ? blocks[blocks.length-1].position.y : 2;
		return positionY;
	}

	unsetUnicorn(){
		document.getElementById('unicorn' + this.unicornBonus.toString()).classList.add('hidden');
		this.unicornBonus--;
	}

	updateScore(){
		const score = this.placedBlocks.children.length ? this.placedBlocks.children.length : 0;
		this.scoreContainer.innerHTML = String(score);
	}

	checkBombDistance(){
		const bomb = this.bomb.object.position;
		console.log(this.bomb.object.position.x);
		if(bomb.x > 20 || bomb.x < 0){
			return true;
		}
		return false;
	}

	setTime(){
        var timer = setInterval(()=>{
			if(this.countDown <= 0){
				clearInterval(timer);
				if(this.checkBombDistance()){
					document.getElementById("countdown").innerHTML = "LUCKY YOU!";
					this.explosionParts.push(new ExplodeAnimation(0, this.getYPosition(), 0x21db53, this.stage.scene));
					this.stage.removeElement(this.bomb.object);
					this.bomb = null;
					setTimeout(() => {
						this.getMovingCube();
					
						document.getElementById("countdown").innerHTML = "";
						this.countDown = 3;
					}, 1000);
				}
				else this.explode();
			} else {
				document.getElementById("countdown").innerHTML = this.countDown;
			}
        	this.countDown -= 1;
        }, 500);
	}

	explode(){
		document.getElementById("countdown").innerHTML = "BOOM!";
		this.explosionParts.push(new ExplodeAnimation(0, this.getYPosition(), 0xad0e20, this.stage.scene));
		this.stage.removeElement(this.bomb.object);
		this.bomb = null;

		const blockPositions=this.placedBlocks.children;
		const score = blockPositions.length;
		//pre istotu zoradenie od najnizsieho po najvyssi kvoli rebuildu kociek
		blockPositions.sort((a, b) => (a.position.y > b.position.y) ? 1 : -1);
		//console.log(blockPositions);
		//nahodne cislo 1 0 do 10
		let random = Math.floor(Math.random() * Math.floor(10));
		random = random < score ? random :  Math.floor(Math.random() * Math.floor(5));
		random = random == 0 ? 1 : random;
		//console.log(this.blocks.length - 1, blockPositions.length);

		//animacia
		const lastIndex = score - 1;
		const movementSpeed = 100;
		if(random < score){
			//console.log(random);
			for(let i = lastIndex ; i > lastIndex-random; i--){
				const object = {
					x:blockPositions[i].position.x,
					y:blockPositions[i].position.y,
					z:blockPositions[i].position.z
				};
				const target = {
					x: 	(Math.random() * movementSpeed)-(movementSpeed/2),
					y: 	(Math.random() * movementSpeed)-(movementSpeed/2),
					z:	(Math.random() * movementSpeed)-(movementSpeed/2)
				};
				const animation3 = new TWEEN.Tween(object)
					.to(target, 500)
					//.delay(lastIndex-i * 100)
					.onUpdate(()=>{
						blockPositions[i].position.x = object.x,
						blockPositions[i].position.y = object.y,
						blockPositions[i].position.z = object.z
					})
					.onComplete(()=> {
						this.placedBlocks.remove(this.placedBlocks.children[i]);
						const cameraSet = this.placedBlocks.children.length ? this.placedBlocks.children.length : 1;
						this.stage.setCamera(cameraSet * 2);
						this.updateScore();
					})
					.start();
			}
		}
		//console.log(this.blocks.lenght - 1, blockPositions.length);
		const pom = this.blocks.slice(0, this.blocks.length-random);
		//console.log(this.blocks, this.placedBlocks.children);
		this.blocks = pom;
		//console.log(this.blocks);
		setTimeout(() => {
			this.getMovingCube();
		
			document.getElementById("countdown").innerHTML = "";
			this.countDown = 3;
		}, 1000);
		
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

		this.getMovingCube(lastCube);
		
		/*let newKidOnTheBlock = new Cube(lastCube);
		this.newBlocks.add(newKidOnTheBlock.mesh);
		this.blocks.push(newKidOnTheBlock);*/
	}
	
	endGame()
	{
		this.updateState(GAME_STATES.ENDED);
	}

	tick()
	{
		this.blocks[this.blocks.length - 1].tick();

		var pCount = this.explosionParts.length;
		while(pCount--) {
		  this.explosionParts[pCount].update();
		}

		this.stage.render();
		requestAnimationFrame(() => {this.tick()});
		TWEEN.update();
	}
}
