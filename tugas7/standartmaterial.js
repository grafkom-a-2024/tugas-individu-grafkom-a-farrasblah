import * as THREE from 'three';
// lignting dan kamera sesuai mouse
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const material = new THREE.MeshStandardMaterial({
    color: 0xffff00,   // warna kuning
    metalness: 0.2,    // semakin tinggi, semakin berkilau seperti logam
    roughness: 0.7     // semakin rendah, semakin halus dan mengkilap permukaannya
});
const geometry = new THREE.TorusGeometry(10, 3, 16, 100);
const torus = new THREE.Mesh(geometry, material);
scene.add(torus);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 10, 10);
directionalLight.target = torus;
scene.add(directionalLight);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(ambientLight);

camera.position.z = 40;

let isDragging = false;
let previousMousePosition = {
    x: 0,
    y: 0
};

// Tambahkan variabel untuk menyimpan rotasi objek
let torusRotation = {
    x: 0,
    y: 0
};

// Satu event listener mousemove
document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const deltaMove = {
            x: event.clientX - previousMousePosition.x,
            y: event.clientY - previousMousePosition.y
        };

        // Rotasi objek (bukan kamera) berdasarkan pergerakan mouse
        torusRotation.y += deltaMove.x * 0.005;
        torusRotation.x += deltaMove.y * 0.005;

        torus.rotation.x = torusRotation.x;
        torus.rotation.y = torusRotation.y;
    }
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

document.addEventListener('mousedown', (event) => {
    isDragging = true;
    previousMousePosition = {
        x: event.clientX,
        y: event.clientY
    };
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

// Tambahkan event untuk mouse keluar dari window
document.addEventListener('mouseout', () => {
    isDragging = false;
});

function animate() {
    requestAnimationFrame(animate);

        torus.rotation.x += 0.001;
        torus.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});