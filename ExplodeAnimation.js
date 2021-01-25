import * as THREE from "three";

export default class ExplodeAnimation {
    constructor(x,y, color, scene){
        var movementSpeed = 80;
        this.totalObjects = 1000;
        var objectSize = 10;
        this.color = color;
        this.dirs = [];

        var geometry = new THREE.Geometry();

        for (let i = 0; i < this.totalObjects; i ++) 
        { 
            var vertex = new THREE.Vector3();
            vertex.x = x;
            vertex.y = y;
            vertex.z = 0;
        
            geometry.vertices.push( vertex );
            this.dirs.push({x:(Math.random() * movementSpeed)-(movementSpeed/2),y:(Math.random() * movementSpeed)-(movementSpeed/2),z:(Math.random() * movementSpeed)-(movementSpeed/2)});
        }
        var material = new THREE.PointsMaterial({
            size: objectSize,
            color: this.color
        });
        var particles = new THREE.Points( geometry, material );
        
        this.object = particles;
        this.status = true;
        
        this.xDir = (Math.random() * movementSpeed)-(movementSpeed/2);
        this.yDir = (Math.random() * movementSpeed)-(movementSpeed/2);
        this.zDir = (Math.random() * movementSpeed)-(movementSpeed/2);
        console.log(scene);
        this.scene = scene;
        
        this.scene.add( this.object  );
    }
    
    
    update(){
        if (this.status == true){
        var pCount = this.totalObjects;
        while(pCount--) {
            var particle =  this.object.geometry.vertices[pCount]
            particle.y += this.dirs[pCount].y;
            particle.x += this.dirs[pCount].x;
            particle.z += this.dirs[pCount].z;
        }
        this.object.geometry.verticesNeedUpdate = true;
        }
    }
}