import * as THREE from 'three';
// bentuk cone biasa dengan rotasi pada sumbu x dan y
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.ConeGeometry(5, 20, 32);
const material = new THREE.MeshBasicMaterial({ color: 0xffff00 });
const cone = new THREE.Mesh(geometry, material);
scene.add(cone);

camera.position.z = 20; 

function animate() {
    requestAnimationFrame(animate);

    cone.rotation.x += 0.001;
    cone.rotation.y += 0.01;

    renderer.render(scene, camera);
}

animate();
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});