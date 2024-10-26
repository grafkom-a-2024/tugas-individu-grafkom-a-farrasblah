import * as THREE from 'three';
// rotasi cylinder sb x, y, z
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.CylinderGeometry( 5, 5, 10, 32 ); 
const material = new THREE.MeshBasicMaterial( {color: 0xffff00} ); 
const cylinder = new THREE.Mesh( geometry, material ); scene.add( cylinder );

camera.position.z = 20; 

let isRotating = true;

document.addEventListener('mousedown', () => {
    isRotating = false;
});

document.addEventListener('mouseup', () => {
    isRotating = true;
});

function animate() {
    requestAnimationFrame(animate);

    if(isRotating){
    cylinder.rotation.x += 0.01;
    cylinder.rotation.y += 0.01;
    cylinder.rotation.z += 0.01;
    }

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
