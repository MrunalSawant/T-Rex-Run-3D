import * as THREE from './build/three.module.js';
import Stats from './code/jsm/libs/stats.module.js';

var sceneWidth;
var sceneHeight;
var camera;
var scene;
var renderer;
var dom;
var sun;
var dino;

//Constants Initialization
const DINO_SCALE = 0.15;
const WORLD_RADIUS = 26;
const TREE_RELEASE_INTERVAL = 0.5;
const GRAVITY = 0.005;
const ROLLING_SPEED = 0.005; // This won't be constant after First Phase
const HERO_BASE_Y = 1.75;
const LEFT_LANE = -1;
const RIGHT_LANE = 1;
const MIDDLE_LANE = 0;
const PARTICLE_COUNT = 20;

var rollingGroundSphere;
var sphericalHelper;
var pathAngleValues;
var bounceValue = 0.1;
var currentLane = MIDDLE_LANE;
var clock;
var jumping;
var treesInPath;
var treesPool;
var particleGeometry;
var explosionPower = 1.06;
var particles;
var stats;
var scoreText;
var score;
var hasCollided;
var running = true;
init();

function init() {
	// set up the scene
	createScene();

	//call game loop
	update();
}


function createScene() {
	hasCollided = false;
	score = 0;
	
	clock = new THREE.Clock();
	clock.start();

	sphericalHelper = new THREE.Spherical();
	pathAngleValues = [1.52, 1.57, 1.62];
	sceneWidth = window.innerWidth;
	sceneHeight = window.innerHeight;
	scene = new THREE.Scene();//the 3d scene
	scene.fog = new THREE.FogExp2(0xf0fff0, 0.14);
	camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.1, 1000);//perspective camera
	renderer = new THREE.WebGLRenderer({ alpha: true });//renderer with transparent backdrop
	renderer.setClearColor(0xfffafa, 1);
	renderer.shadowMap.enabled = true;//enable shadow
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(sceneWidth, sceneHeight);
	dom = document.getElementById('container');
	dom.appendChild(renderer.domElement);
	scoreText = document.getElementById('scoreValue');
	stats = new Stats();
	dom.appendChild(stats.dom);
	createTreesPool();
	addWorld();
	addHero();
	addLight();
	createTree();
	//addExplosion();

	camera.position.z = 6.5;
	camera.position.y = 2.5;
	window.addEventListener('resize', onWindowResize, false);//resize callback
	document.onkeydown = handleKeyDown;
}

function addExplosion() {
	particleGeometry = new THREE.Geometry();
	for (var i = 0; i < PARTICLE_COUNT; i++) {
		var vertex = new THREE.Vector3();
		particleGeometry.vertices.push(vertex);
	}
	var pMaterial = new THREE.PointsMaterial({
		color: 0xfffafa,
		size: 0.2
	});

	//const bufferParticleGeometry = new THREE.BufferGeometry().fromDirectGeometry(particleGeometry);
	particles = new THREE.Points(particleGeometry, pMaterial);
	//scene.add(particles);
	particles.visible = false;
}
function createTreesPool() {

	treesInPath = [];
	treesPool = [];
	var maxTreesInPool = 10;
	var newTree;
	for (var i = 0; i < maxTreesInPool; i++) {
		newTree = createTree();
		treesPool.push(newTree);
	}
}

//Key Event Handler
function handleKeyDown(keyEvent) {
	if (jumping) return;
	var validMove = true;

	switch(keyEvent.keyCode)
	{
		case 32:{
			//Space Button
			//Pause a game
			console.log('in pause game event');
			
			running = !running;
			update();
			break;
		}
		case 37:{
			if (currentLane == MIDDLE_LANE) {
				currentLane = LEFT_LANE;
			} else if (currentLane == RIGHT_LANE) {
				currentLane = MIDDLE_LANE;
			} else {
				validMove = false;
			}
			break;
		}
		case 39:{
			if (currentLane == MIDDLE_LANE) {
				currentLane = RIGHT_LANE;
			} else if (currentLane == LEFT_LANE) {
				currentLane = MIDDLE_LANE;
			} else {
				validMove = false;
			}
			break;
		}
		case 38:{
			bounceValue = 0.1;
			jumping = true;
			break;
		}
		default: validMove = false;
	}
	
	if (validMove) {
		jumping = true;
		bounceValue = 0.08;
	}
}

//Function to add SnowBall
function addHero() {
	
	jumping = false;
	const loader = new THREE.ObjectLoader()
	loader.load('./models/dino.json', function (dinoObject) {

		// Scale the size of the dino
        dinoObject.scale.set(DINO_SCALE, DINO_SCALE, DINO_SCALE);
        dinoObject.rotation.y = Math.PI;
		scene.add(dinoObject);
		dino = dinoObject;
		
		dino.receiveShadow = true;
		dino.castShadow = true;
		
		dino.position.y = HERO_BASE_Y;
		dino.position.z = 4.8;
		dino.position.x = currentLane;
	
	});

}

function addWorld() {
	var sides = 40;
	var tiers = 40;
	var sphereGeometry = new THREE.SphereGeometry(WORLD_RADIUS, sides, tiers);
	var sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x696969, flatShading: true });
	var vertexIndex;
	var vertexVector = new THREE.Vector3();
	var nextVertexVector = new THREE.Vector3();
	var firstVertexVector = new THREE.Vector3();
	var offset = new THREE.Vector3();
	var currentTier = 1;
	var lerpValue = 0.5;
	var heightValue;
	var maxHeight = 0.07;
	for (var j = 1; j < tiers - 2; j++) {
		currentTier = j;
		for (var i = 0; i < sides; i++) {
			vertexIndex = (currentTier * sides) + 1;
			vertexVector = sphereGeometry.vertices[i + vertexIndex].clone();
			if (j % 2 !== 0) {
				if (i == 0) {
					firstVertexVector = vertexVector.clone();
				}
				nextVertexVector = sphereGeometry.vertices[i + vertexIndex + 1].clone();
				if (i == sides - 1) {
					nextVertexVector = firstVertexVector;
				}
				lerpValue = (Math.random() * (0.75 - 0.25)) + 0.25;
				vertexVector.lerp(nextVertexVector, lerpValue);
			}
			heightValue = (Math.random() * maxHeight) - (maxHeight / 2);
			offset = vertexVector.clone().normalize().multiplyScalar(heightValue);
			sphereGeometry.vertices[i + vertexIndex] = (vertexVector.add(offset));
		}
	}
	rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
	rollingGroundSphere.receiveShadow = true;
	rollingGroundSphere.castShadow = false;
	rollingGroundSphere.rotation.z = -Math.PI / 2;
	scene.add(rollingGroundSphere);
	rollingGroundSphere.position.y = -24;
	rollingGroundSphere.position.z = 2;
	addWorldTrees();
}
function addLight() {
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, .9)
	scene.add(hemisphereLight);
	sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
	sun.position.set(12, 6, -7);
	sun.castShadow = true;
	scene.add(sun);
	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50;
}
function addPathTree() {
	var options = [0, 1, 2];
	var lane = Math.floor(Math.random() * 3);
	addTree(true, lane);
	options.splice(lane, 1);
	if (Math.random() > 0.5) {
		lane = Math.floor(Math.random() * 2);
		addTree(true, options[lane]);
	}
}
function addWorldTrees() {
	// var numTrees = 36;
	// var gap = 6.28 / 36;
	// for (var i = 0; i < numTrees; i++) {
	// 	addTree(false, i * gap, true);
	// 	addTree(false, i * gap, false);
	// }
}
function addTree(inPath, row, isLeft) {
	var newTree;
	if (inPath) {
		if (treesPool.length == 0) return;
		newTree = treesPool.pop();
		newTree.visible = true;
		//console.log("add tree");
		treesInPath.push(newTree);
		sphericalHelper.set(WORLD_RADIUS - 0.3, pathAngleValues[row], -rollingGroundSphere.rotation.x + 4);
	} else {
		newTree = createTree();
		var forestAreaAngle = 0;//[1.52,1.57,1.62];
		if (isLeft) {
			forestAreaAngle = 1.68 + Math.random() * 0.1;
		} else {
			forestAreaAngle = 1.46 - Math.random() * 0.1;
		}
		sphericalHelper.set(WORLD_RADIUS - 0.3, forestAreaAngle, row);
	}
	newTree.position.setFromSpherical(sphericalHelper);
	var rollingGroundVector = rollingGroundSphere.position.clone().normalize();
	var treeVector = newTree.position.clone().normalize();
	newTree.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
	newTree.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;

	rollingGroundSphere.add(newTree);
}
function createTree() {
	var sides = 8;
	var tiers = 6;
	var scalarMultiplier = (Math.random() * (0.25 - 0.1)) + 0.05;
	var treeGeometry = new THREE.ConeGeometry(0.5, 1, sides, tiers);
	var treeMaterial = new THREE.MeshStandardMaterial({ color: 0x33ff33, flatShading: true });
	//var midPointVector = treeGeometry.vertices[0].clone();
	blowUpTree(treeGeometry.vertices, sides, 0, scalarMultiplier);
	tightenTree(treeGeometry.vertices, sides, 1);
	blowUpTree(treeGeometry.vertices, sides, 2, scalarMultiplier * 1.1, true);
	tightenTree(treeGeometry.vertices, sides, 3);
	blowUpTree(treeGeometry.vertices, sides, 4, scalarMultiplier * 1.2);
	tightenTree(treeGeometry.vertices, sides, 5);
	var treeTop = new THREE.Mesh(treeGeometry, treeMaterial);
	treeTop.castShadow = true;
	treeTop.receiveShadow = false;
	treeTop.position.y = 0.9;
	treeTop.rotation.y = (Math.random() * (Math.PI));
	var treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5);
	var trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x886633, flatShading: true });
	var treeTrunk = new THREE.Mesh(treeTrunkGeometry, trunkMaterial);
	treeTrunk.position.y = 0.25;
	var tree = new THREE.Object3D();
	tree.add(treeTrunk);
	tree.add(treeTop);
	return tree;
}
function blowUpTree(vertices, sides, currentTier, scalarMultiplier, odd) {
	var vertexIndex;
	var vertexVector = new THREE.Vector3();
	var midPointVector = vertices[0].clone();
	var offset;
	for (var i = 0; i < sides; i++) {
		vertexIndex = (currentTier * sides) + 1;
		vertexVector = vertices[i + vertexIndex].clone();
		midPointVector.y = vertexVector.y;
		offset = vertexVector.sub(midPointVector);
		if (odd) {
			if (i % 2 === 0) {
				offset.normalize().multiplyScalar(scalarMultiplier / 6);
				vertices[i + vertexIndex].add(offset);
			} else {
				offset.normalize().multiplyScalar(scalarMultiplier);
				vertices[i + vertexIndex].add(offset);
				vertices[i + vertexIndex].y = vertices[i + vertexIndex + sides].y + 0.05;
			}
		} else {
			if (i % 2 !== 0) {
				offset.normalize().multiplyScalar(scalarMultiplier / 6);
				vertices[i + vertexIndex].add(offset);
			} else {
				offset.normalize().multiplyScalar(scalarMultiplier);
				vertices[i + vertexIndex].add(offset);
				vertices[i + vertexIndex].y = vertices[i + vertexIndex + sides].y + 0.05;
			}
		}
	}
}
function tightenTree(vertices, sides, currentTier) {
	var vertexIndex;
	var vertexVector = new THREE.Vector3();
	var midPointVector = vertices[0].clone();
	var offset;
	for (var i = 0; i < sides; i++) {
		vertexIndex = (currentTier * sides) + 1;
		vertexVector = vertices[i + vertexIndex].clone();
		midPointVector.y = vertexVector.y;
		offset = vertexVector.sub(midPointVector);
		offset.normalize().multiplyScalar(0.06);
		vertices[i + vertexIndex].sub(offset);
	}
}

function update() {
	
	stats.update();
	rollingGroundSphere.rotation.x += ROLLING_SPEED;
	if(dino !== undefined)
	{
		if (dino.position.y <= HERO_BASE_Y) {
			jumping = false;
			bounceValue = (Math.random() * 0.04) + 0.005;
		}
		dino.position.y += bounceValue;
		dino.position.x = THREE.Math.lerp(dino.position.x, currentLane, 2 * clock.getDelta());
	}

	bounceValue -= GRAVITY;
	if (clock.getElapsedTime() > TREE_RELEASE_INTERVAL) {
		clock.start();
		addPathTree();
		// if (!hasCollided) {
		// 	score += 2 * TREE_RELEASE_INTERVAL;
		// 	scoreText.innerHTML = score.toString();
		// }
		score += 2 * TREE_RELEASE_INTERVAL;
		scoreText.innerHTML = score.toString();
	}
	doTreeLogic();
	doExplosionLogic();
	render();
	if(running)
		requestAnimationFrame(update);//request next update
}

function doTreeLogic() {
	var oneTree;
	var treePos = new THREE.Vector3();
	var treesToRemove = [];
	treesInPath.forEach(function (element, index) {
		oneTree = treesInPath[index];
		treePos.setFromMatrixPosition(oneTree.matrixWorld);
		if (treePos.z > 6 && oneTree.visible) {//gone out of our view zone
			treesToRemove.push(oneTree);
		} else {//check collision
			if (dino !== undefined && treePos.distanceTo(dino.position) <= 0.6) {
				console.log("hit");
				hasCollided = true;
				//explode();
				//gameOver();
			}
		}
	});
	var fromWhere;
	treesToRemove.forEach(function (element, index) {
		oneTree = treesToRemove[index];
		fromWhere = treesInPath.indexOf(oneTree);
		treesInPath.splice(fromWhere, 1);
		treesPool.push(oneTree);
		oneTree.visible = false;
		console.log("remove tree");
	});
}

//Logic of explosion
function doExplosionLogic() {
	if (particles === undefined || !particles.visible) return;
	for (var i = 0; i < PARTICLE_COUNT; i++) {
		particleGeometry.vertices[i].multiplyScalar(explosionPower);
	}
	if (explosionPower > 1.005) {
		explosionPower -= 0.001;
	} else {
		particles.visible = false;
	}
	particleGeometry.verticesNeedUpdate = true;
}
function explode() {
	particles.position.y = 2;
	particles.position.z = 4.8;
	if(dino !== undefined)
		particles.position.x = dino.position.x;
	
	for (var i = 0; i < PARTICLE_COUNT; i++) {
		var vertex = new THREE.Vector3();
		vertex.x = -0.2 + Math.random() * 0.4;
		vertex.y = -0.2 + Math.random() * 0.4;
		vertex.z = -0.2 + Math.random() * 0.4;
		particleGeometry.vertices[i] = vertex;
	}
	// explosionPower = 1.07;
	explosionPower = 1.07;
	particles.visible = true;
}
function render() {
	renderer.render(scene, camera);//draw
}
function gameOver() {

	cancelAnimationFrame(globalRenderID);

	window.clearInterval(powerupSpawnIntervalID);
}
function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth / sceneHeight;
	camera.updateProjectionMatrix();
}