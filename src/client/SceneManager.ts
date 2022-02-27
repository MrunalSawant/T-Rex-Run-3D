
import * as THREE from 'three'
import * as CONSTANTS from './../constant/constants'
import ModelManager from './ModelManager'

class SceneHandler {

    private _scene: THREE.Scene
    private _camera: THREE.PerspectiveCamera
    private _renderer!: THREE.WebGLRenderer
    public _modelManager: ModelManager;

    private clock : THREE.Clock;

    public constructor() {
        this._scene = new THREE.Scene();
        this._modelManager = new ModelManager();
        this._camera = new THREE.PerspectiveCamera();
        this.clock = new THREE.Clock();
	    this.clock.start();

    }

    public setCamera(fov: number, aspect: number, near: number, far: number) {
        this._camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
    }

    public render() {
        this._renderer.render(this._scene, this._camera)
    }

    public initScene(sceneWidth: number, sceneHeight: number): void {

        this._camera = new THREE.PerspectiveCamera(60, sceneWidth / sceneHeight, 0.001, 100000)

        this._camera.position.z = 3
        this._camera.position.y = 2.5

        this._renderer = new THREE.WebGLRenderer({
            alpha: true,
        }) //_renderer with transparent backdrop

        this._renderer.setClearColor(CONSTANTS.color.renderderBackground, 1)
        this._renderer.shadowMap.enabled = true //enable shadow
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this._renderer.setSize(sceneWidth, sceneHeight)
        this._renderer.setPixelRatio(window.devicePixelRatio)

        document.body.appendChild(this._renderer.domElement)
        window.addEventListener('resize', this.onWindowResize, false)
        
        this.addLight()

        this.addObject( this._modelManager.getHero() );

        this.addObject( this._modelManager.getWorld() );

        this._modelManager.createTreePool();

        this.update()
    }

    public addObject(object3D: THREE.Object3D): void {
        this._scene.add(object3D)
    }

    private addLight() {

        const hemisphereLight = new THREE.HemisphereLight(CONSTANTS.color.hemisphereLightColor, 0.9)
        this.addObject(hemisphereLight)
        const sun = new THREE.DirectionalLight(CONSTANTS.color.directionalLightColor, 0.9)
        sun.position.set(12, 6, -7)
        
        sun.castShadow = true
        this.addObject(sun)
        //Set up shadow properties for the sun light
        sun.shadow.mapSize.width = 256
        sun.shadow.mapSize.height = 256
        sun.shadow.camera.near = 0.5
        sun.shadow.camera.far = 50
    }

    public onWindowResize() : void {
    if(this._camera === undefined) return ;
    this._camera.aspect = window.innerWidth / window.innerHeight
    this._camera.updateProjectionMatrix()
    this._renderer.setSize(window.innerWidth, window.innerHeight)
    this.render()
    }

    public update() {

        if (this.clock.getElapsedTime() > CONSTANTS.TREE_RELEASE_INTERVAL) {
            this.clock.start();
            this._modelManager.addPathTree();
            
        }
    
        this._modelManager.doTreeLogic();
        
        this.render();
        console.log('update')
        requestAnimationFrame(this.update); //request next update
    
    }
}

var SceneManager = new SceneHandler()
export default SceneManager
