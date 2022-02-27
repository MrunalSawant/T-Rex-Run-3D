import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as CONSTANTS from './../constant/constants'
import SceneManager from './SceneManager'

var pathAngleValues: number[];
var bounceValue = 0.1;
var currentLane = CONSTANTS.MIDDLE_LANE;
var clock: THREE.Clock;
var jumping;
var treesInPath: any[];
var treesPool: THREE.Object3D<THREE.Event>[];
var particleGeometry;
var explosionPower = 1.06;
var particles;

var scoreText;
var score: string | number;
var hasCollided;
var running = true;
var gameOverFlag = false;
var frameSkip = 0;

var camera: THREE.PerspectiveCamera;
var renderer: THREE.WebGLRenderer;

var dom;
var pauseDom;
var gameOverDom;

init();

function init(){
    initUI();
    createScene();
    //createTreesPool();
    
    //update();

}

function createScene() {

    SceneManager.initScene(window.innerWidth,window.innerHeight);
    SceneManager.update();
    //@ts-ignore
    window.scene = SceneManager;
}




// function blowUpTree(vertices, sides, currentTier, scalarMultiplier, odd) {
// 	var vertexIndex;
// 	var vertexVector = new THREE.Vector3();
// 	var midPointVector = vertices[0].clone();
// 	var offset;
// 	for (var i = 0; i < sides; i++) {
// 		vertexIndex = (currentTier * sides) + 1;
// 		vertexVector = vertices[i + vertexIndex].clone();
// 		midPointVector.y = vertexVector.y;
// 		offset = vertexVector.sub(midPointVector);
// 		if (odd) {
// 			if (i % 2 === 0) {
// 				offset.normalize().multiplyScalar(scalarMultiplier / 6);
// 				vertices[i + vertexIndex].add(offset);
// 			} else {
// 				offset.normalize().multiplyScalar(scalarMultiplier);
// 				vertices[i + vertexIndex].add(offset);
// 				vertices[i + vertexIndex].y = vertices[i + vertexIndex + sides].y + 0.05;
// 			}
// 		} else {
// 			if (i % 2 !== 0) {
// 				offset.normalize().multiplyScalar(scalarMultiplier / 6);
// 				vertices[i + vertexIndex].add(offset);
// 			} else {
// 				offset.normalize().multiplyScalar(scalarMultiplier);
// 				vertices[i + vertexIndex].add(offset);
// 				vertices[i + vertexIndex].y = vertices[i + vertexIndex + sides].y + 0.05;
// 			}
// 		}
// 	}
// }

// function tightenTree(vertices, sides, currentTier) {
// 	var vertexIndex;
// 	var vertexVector = new THREE.Vector3();
// 	var midPointVector = vertices[0].clone();
// 	var offset;
// 	for (var i = 0; i < sides; i++) {
// 		vertexIndex = (currentTier * sides) + 1;
// 		vertexVector = vertices[i + vertexIndex].clone();
// 		midPointVector.y = vertexVector.y;
// 		offset = vertexVector.sub(midPointVector);
// 		offset.normalize().multiplyScalar(0.06);
// 		vertices[i + vertexIndex].sub(offset);
// 	}
// }





function initUI() {
    var dom = document.getElementById('container');
    var gameOverDom = document.getElementById('gameover');
    var scoreText = document.getElementById('scoreValue');
    var pauseDom = document.getElementById('pause');
   
    
    
}







// function explode() {
// 	particles.position.y = 2;
// 	particles.position.z = 4.8;
// 	if (dino !== undefined)
// 		particles.position.x = dino.position.x;

// 	for (var i = 0; i < CONSTANTS.PARTICLE_COUNT; i++) {
// 		var vertex = new THREE.Vector3();
// 		vertex.x = -0.2 + Math.random() * 0.4;
// 		vertex.y = -0.2 + Math.random() * 0.4;
// 		vertex.z = -0.2 + Math.random() * 0.4;
// 		particleGeometry.vertices[i] = vertex;
// 	}
// 	// explosionPower = 1.07;
// 	explosionPower = 1.07;
// 	particles.visible = true;
// 	gameOverFlag = true;
// }

function render() {
    SceneManager.render();
}





