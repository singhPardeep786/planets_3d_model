import './style.css';

import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';


import gsap from 'gsap';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('canvas'),
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000, 1);
renderer.setPixelRatio(window.devicePixelRatio); // Added device pixel ratio setup

const radius = 1.3;
const segments = 64;
const orbitRadius = 4.5;
const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00];
const textures = [
  './csilla/color.png',
  './earth/map.jpg',
  './volcanic/color.png',
  './venus/map.jpg',
];
const spheres = new THREE.Group();

const bigSphereGeometry = new THREE.SphereGeometry(50, 64, 64);
const bigSphereTexture = new THREE.TextureLoader().load('./stars.jpg');
bigSphereTexture.colorSpace = THREE.SRGBColorSpace;

const bigSphereMaterial = new THREE.MeshStandardMaterial({
  map: bigSphereTexture,
  transparent: true,
  opacity: 0.8,
  side: THREE.BackSide,
 });
const bigSphere = new THREE.Mesh(bigSphereGeometry, bigSphereMaterial);
scene.add(bigSphere);



const loader = new RGBELoader();
loader.load('https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/moonlit_golf_1k.hdr',
   (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
  scene.environment = texture;
});

const allSpheres = [];

for(let i = 0; i < 4; i++) {
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load(textures[i])
  texture.colorSpace = THREE.SRGBColorSpace;
  
  const sphereGeometry = new THREE.SphereGeometry(radius, segments, segments);
  const sphereMaterial = new THREE.MeshStandardMaterial({ map: texture });
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

  allSpheres.push(sphere);

  const angle = (i / 4) * (Math.PI * 2);
  sphere.position.x = orbitRadius * Math.cos(angle);
  sphere.position.z = orbitRadius * Math.sin(angle);
  spheres.add(sphere);
}
spheres.rotation.x = 0.1;
spheres.position.y = -0.8;
scene.add(spheres);


camera.position.z = 9;

let throttleTimeout = null;
let scrollCount = 0;
window.addEventListener('wheel', (event) => {
  if (throttleTimeout) return;
    throttleTimeout = setTimeout(() => {
    throttleTimeout = null;
  }, 2000);
  
  const direction = event.deltaY > 0 ? 'down' : 'up';

  scrollCount = (scrollCount + 1) % 4;
  
  const headings = document.querySelectorAll('.headings');
  gsap.to(headings, {
    y: `-=${100}%`,
    duration: 1,
    ease: 'power2.out',
  });

  gsap.to(spheres.rotation, {
    y: `-=${Math.PI / 2}`,
    duration: 1,
    ease: 'power2.out',
  })
  
  if(scrollCount === 0) {
    gsap.to(headings, {
      y: `0`,
      duration: 1,
      ease: 'power2.out',
    });
  }
  
});

const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  // Rotate all spheres on their axis
  for(let i = 0; i < allSpheres.length; i++) {
    const sphere = allSpheres[i];
    sphere.rotation.y = clock.getElapsedTime() * 0.02;
  }
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

}

window.addEventListener('resize', onWindowResize);

animate();




