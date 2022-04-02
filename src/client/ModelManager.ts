import * as THREE from 'three'
import * as CONSTANTS from '../constant/constants'
import SceneManager from './SceneManager'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'

export default class ModelManager {
    private _world: THREE.Mesh
    private _hero: THREE.Mesh

    private _sphericalHelper : THREE.Spherical;
    private treesInPath: THREE.Object3D[]
    private treesPool: THREE.Object3D[]

    constructor() {
        const geometry = new THREE.BoxGeometry(1, 1, 1)
        const material = new THREE.MeshBasicMaterial({ color: 0xffff00, opacity: 0.5 })
        this._hero = new THREE.Mesh(geometry, material)
        this._hero.position.setY(2.5)

        this._world = this.createWorld()

        this.treesPool = []
        this.treesInPath = []

        this._sphericalHelper = new THREE.Spherical();

    }

    public getHero(): THREE.Mesh {
        return this._hero
    }

    public getWorld(): THREE.Mesh {
        return this._world
    }

    private createWorld(): THREE.Mesh {
        const sides = 160
        const tiers = 160

        const sphereGeometry = new THREE.SphereGeometry(CONSTANTS.WORLD_RADIUS, sides, tiers)
        const sphereMaterial = new THREE.MeshStandardMaterial({
            color: CONSTANTS.color.sphereColor,
            flatShading: true,
        })

        let vertexIndex
        let vertexVector = new THREE.Vector3()
        let nextVertexVector = new THREE.Vector3()
        let firstVertexVector = new THREE.Vector3()
        let offset = new THREE.Vector3()
        let currentTier = 1
        let lerpValue = 0.5
        let heightValue
        const maxHeight = 0.07

        for (var j = 1; j < tiers - 2; j++) {
            currentTier = j
            for (var i = 0; i < sides; i++) {
                vertexIndex = currentTier * sides + 1

                if (j % 2 !== 0) {
                    if (i == 0) {
                        firstVertexVector = vertexVector.clone()
                    }

                    if (i == sides - 1) {
                        nextVertexVector = firstVertexVector
                    }
                    lerpValue = Math.random() * (0.75 - 0.25) + 0.25
                    vertexVector.lerp(nextVertexVector, lerpValue)
                }
                heightValue = Math.random() * maxHeight - maxHeight / 2
                offset = vertexVector.clone().normalize().multiplyScalar(heightValue)
            }
        }
        const rollingGroundSphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
        rollingGroundSphere.receiveShadow = true
        rollingGroundSphere.castShadow = false
        rollingGroundSphere.rotation.z = -Math.PI / 2

        rollingGroundSphere.position.y = -24
        rollingGroundSphere.position.z = 2

        return rollingGroundSphere
    }

    public createTreePool() {
        this.treesInPath = []
        this.treesPool = []

        var newTree

        for (var i = 0; i < CONSTANTS.MAX_TREES_IN_POOL; i++) {
            newTree = this.createTree()
            this.treesPool.push(newTree)
        }
    }

    private createTree(): THREE.Object3D {
        var sides = 8
        var tiers = 4

        var treeGeometry = new THREE.ConeGeometry(0.5, 1, sides, tiers)
        var treeMaterial = new THREE.MeshStandardMaterial({
            color: CONSTANTS.color.treeColor,
            flatShading: true,
        })

        const treeTop = new THREE.Mesh(treeGeometry, treeMaterial)
        treeTop.castShadow = true
        treeTop.receiveShadow = false
        treeTop.position.y = 0.9
        treeTop.rotation.y = Math.random() * Math.PI

        const treeTrunkGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.5)
        const trunkMaterial = new THREE.MeshStandardMaterial({
            color: CONSTANTS.color.trunkColor,
            flatShading: true,
        })
        var treeTrunk = new THREE.Mesh(treeTrunkGeometry, trunkMaterial)
        treeTrunk.position.y = 0.25
        var tree = new THREE.Object3D()
        tree.add(treeTrunk)
        tree.add(treeTop)
        return tree
    }

    public addTree(inPath: boolean, row: number, isLeft: boolean) {
        var newTree;
        if (inPath) {
            if (this.treesPool.length == 0) return;
            newTree = this.treesPool.pop();
            if(newTree !== undefined) {
                newTree.visible = true;
            //console.log("add tree");
            this.treesInPath.push(newTree);
            this._sphericalHelper.set(CONSTANTS.WORLD_RADIUS - 0.3, CONSTANTS.PATH_ANGLE_VALUES[row], -this._world.rotation.x + 4);
            }
            
        } else {
            newTree = this.createTree();
            var forestAreaAngle = 0; //[1.52,1.57,1.62];
            if (isLeft) {
                forestAreaAngle = 1.68 + Math.random() * 0.1;
            } else {
                forestAreaAngle = 1.46 - Math.random() * 0.1;
            }
            this._sphericalHelper.set(CONSTANTS.WORLD_RADIUS - 0.3, forestAreaAngle, row);
        }

        if(newTree === undefined) return;
    
        newTree.position.setFromSpherical(this._sphericalHelper);
        var rollingGroundVector = this._world.position.clone().normalize();
        var treeVector = newTree.position.clone().normalize();
        newTree.quaternion.setFromUnitVectors(treeVector, rollingGroundVector);
        newTree.rotation.x += (Math.random() * (2 * Math.PI / 10)) + -Math.PI / 10;
        newTree.updateMatrixWorld();
        this._world.add(newTree);
    }

    public addPathTree() {

        var options = [CONSTANTS.LEFT_LANE, CONSTANTS.MIDDLE_LANE, CONSTANTS.RIGHT_LANE];
        var lane = Math.floor(Math.random() * 3);
        this.addTree(true, lane, false);
        options.splice(lane, 1);
        if (Math.random() > 0.5) {
            lane = Math.floor(Math.random() * 2);
            this.addTree(true, options[lane], false);
        }
    }

    public doTreeLogic() {

        var treePos = new THREE.Vector3();
        var treesToRemove: any[] = [];
        this.treesInPath.forEach(function (tree) {
            // oneTree = treesInPath[index];
            treePos.setFromMatrixPosition(tree.matrixWorld);
            if (treePos.z > 6 && tree.visible) { //gone out of our view zone
                treesToRemove.push(tree);
            } else { //check collision
                
            }
        });
        var fromWhere;
        treesToRemove.forEach( (tree, index) => {
            fromWhere = index;
            this.treesInPath.splice(fromWhere, 1);
            this.treesPool.push(tree);
            tree.visible = false;
        });

    }
    
    public updateWorldRotation(x: number){
        this._world.rotation.x += CONSTANTS.ROLLING_SPEED;
    }
}
