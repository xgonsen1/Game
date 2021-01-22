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
			//TODO animation
 
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
