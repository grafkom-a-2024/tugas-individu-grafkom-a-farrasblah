import * as THREE from 'three';
// cube dengan rotasi pada sb x, y,z ketika ditekan mouse. jump jika j ditekan
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setAnimationLoop(animate);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('texture/wood-texture.jpg'); 
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ 
    map: texture,
    metalness: 0.2,    // semakin tinggi, semakin berkilau seperti logam
    roughness: 0.7     // semakin rendah, semakin halus dan mengkilap permukaannya
});
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 10);
directionalLight.target = cube;  
scene.add(directionalLight);

// Tambahkan ambient light agar sisi yang tidak terkena directional light tetap terlihat
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

camera.position.z = 5;

let isRotating = false;
let isJumping = false;
let jumpVelocity = 0;
const gravity = 0.008;
const jumpPower = 0.2;
const originalY = cube.position.y;

document.addEventListener('mousedown', () => {
    isRotating = true;
});

document.addEventListener('mouseup', () => {
    isRotating = false;
});

// Menambahkan event listener untuk keyboard
document.addEventListener('keydown', (event) => {
    if (event.key.toLowerCase() === 'j' && !isJumping) {
        isJumping = true;
        jumpVelocity = jumpPower; // Memberikan kecepatan awal untuk melompat
    }
});

function animate() {
    if (isRotating) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
        cube.rotation.z += 0.01;
    }

    // Logika untuk jumping dengan physics sederhana
    if (isJumping) {
        jumpVelocity -= gravity;
        
        // Update posisi berdasarkan velocity
        cube.position.y += jumpVelocity;
        
        if (cube.position.y <= originalY) {
            cube.position.y = originalY;
            jumpVelocity = 0;
            isJumping = false;
        }
    }

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});