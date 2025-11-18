import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// Canvas seçimi
const canvas = document.getElementById('three-canvas') as HTMLCanvasElement | null;
if (!canvas) {
    throw new Error("Canvas element with id 'three-canvas' not found.");
}

// Scene, camera, renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f5f5);

const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
camera.position.set(0, 3, 12);

const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas as HTMLCanvasElement, 
    antialias: true, 
    alpha: true 
});
renderer.setSize(800, 800);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lights
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 8, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xffffff, 0.3);
spotLight.position.set(-5, 5, 0);
scene.add(spotLight);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 20;
controls.maxPolarAngle = Math.PI / 2;
controls.autoRotate = false;
controls.autoRotateSpeed = 1;

let model: THREE.Object3D | null = null;
let modelLoaded: boolean = false;

// Load 3D model
const loader = new GLTFLoader();
loader.load(
    './src/assets/clothes.glb', 
    (gltf) => {
        model = gltf.scene;

        model.scale.set(8, 8, 8);
        model.position.set(0, 0, 0);
        
        model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        
        scene.add(model);
        modelLoaded = true;

        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.sub(center);
        
        console.log('Model başarıyla yüklendi');
    }, 
    (progress) => {
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Yükleniyor: ${percent.toFixed(2)}%`);
    },
    (error: unknown) => {
        console.error('Model yükleme hatası:', error);
    }
);

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    if (model) {
        model.rotation.y += 0.008;
    }
    controls.update();
    renderer.render(scene, camera);
}
animate();

// Responsive
function handleResize() {
    if (!canvas) return;
    const container = canvas.parentElement;
    if (container) {
        const size = Math.min(container.clientWidth, 800);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
        renderer.setSize(size, size);
    }
}

window.addEventListener('resize', handleResize);
handleResize();

window.addEventListener('beforeunload', () => {
    renderer.dispose();
    controls.dispose();
});

const container = document.querySelector(".container");
const card = document.querySelector(".card") as HTMLElement | null;

if (container && card) {
    container.addEventListener("mousemove", function (event) {
    const e = event as MouseEvent;
    const x = (e.clientX / window.innerWidth - 0.5) * 20;
    const y = -(e.clientY / window.innerHeight - 0.5) * 20;
    card.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
});


    container.addEventListener("mouseleave", () => {
        card.style.transform = `rotateY(0deg) rotateX(0deg)`;
    });
}
