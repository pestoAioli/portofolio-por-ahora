import * as THREE from 'three'
import gsap from 'gsap';
import { TeapotGeometry } from 'three/examples/jsm/geometries/TeapotGeometry';
/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Objekts
 */

const material = new THREE.MeshStandardMaterial({
  color: '#9285cc'
});


const objectsDistance = 4;

const mesh4 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.4, 16, 60),
  material
);
const mesh2 = new THREE.Mesh(
  new THREE.CapsuleGeometry(0.69, 0.69, 32, 32),
  material
);
const mesh1 = new THREE.Mesh(
  new THREE.DodecahedronGeometry(0.69, 0),
  material
);
const mesh3 = new THREE.Mesh(
  new TeapotGeometry(0.69, 8),
  material
);

mesh1.position.y = - objectsDistance * 0;
mesh2.position.y = - objectsDistance;
mesh3.position.y = - objectsDistance * 2;
mesh4.position.y = - objectsDistance * 3;

mesh1.position.x = 2;
mesh2.position.x = -2;
mesh3.position.x = 2;
mesh4.position.x = -2;

scene.add(mesh1, mesh2, mesh3, mesh4);


/**
* Particles
**/
const particlesCount = 400;
const positions = new Float32Array(particlesCount * 3);
for (let i = 0; i < particlesCount; i++) {
  positions[i * 3 + 0] = (Math.random() - 0.5) * 10;
  positions[i * 3 + 1] = objectsDistance * 0.5 - Math.random() * objectsDistance * 6;
  positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
};

const particlesGeometry = new THREE.BufferGeometry();
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particlesMaterial = new THREE.PointsMaterial({
  color: '#9285cc',
  sizeAttenuation: true,
  size: 0.03
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

const sectionMeshes = [mesh1, mesh2, mesh3, mesh4];
/**
* Lights
**/
const ambientLight = new THREE.AmbientLight('#ffffff', 0.25);
const directionalLight = new THREE.DirectionalLight('#ffffff', 1);
directionalLight.position.set(1, 1, 0);
scene.add(directionalLight, ambientLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  if (sizes.width < 400) {
    mesh1.position.x = 0;
    mesh2.position.x = 0;
    mesh3.position.x = 0;
    mesh4.position.x = 0;

  }
  if (sizes.width < 1200) {
    mesh1.position.x = 0.8;
    mesh2.position.x = -0.5;
    mesh3.position.x = 0.8;
    mesh4.position.x = -0.5;
  }
  if (sizes.width > 1200) {
    mesh1.position.x = 2;
    mesh2.position.x = -2;
    mesh3.position.x = 2;
    mesh4.position.x = -2;
  }
});


/**
 * Camera
 */
//group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100)
camera.position.z = 6
cameraGroup.add(camera);



console.log(sizes.width);
/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true
})
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Mouse/Cursor 
 */

const raycaster = new THREE.Raycaster();
let deviceCheck = false;

const mouse = new THREE.Vector2();

let spheres = [];

const sphereGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

for (let i = 0; i < 40; i++) {
  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  if (sizes.width > 400) {
    scene.add(sphere);
    spheres.push(sphere);
  }
}

window.addEventListener('mousemove', (e) => {
  mouse.x = e.clientX / sizes.width * 2 - 1;
  mouse.y = - (e.clientY / sizes.height) * 2 + 1;
});
/**
* Scroll
**/
let scrollY = window.scrollY;
let currentSection = 0;
window.addEventListener('scroll', () => {
  scrollY = window.scrollY;
  const newSection = Math.round(scrollY / sizes.height)
  if (newSection != currentSection) {
    currentSection = newSection
    gsap.to(
      sectionMeshes[currentSection].rotation,
      {
        duration: 1.5,
        ease: 'power2.inOut',
        x: '+=6',
        y: '+=3'
      }
    )
  }
})

/**
* Cursor
**/
const cursor = {};
cursor.x = 0;
cursor.y = 0;

window.addEventListener('mousemove', (event) => {
  cursor.x = event.clientX / sizes.width - 0.5;
  cursor.y = event.clientY / sizes.height - 0.5;
});

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;
let spheresIndex = 0;
const animate = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;
  //animate camera
  camera.position.y = - scrollY / sizes.height * objectsDistance;
  const parallaxX = cursor.x;
  const parallaxY = - cursor.y;
  cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 5 * deltaTime;
  cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 5 * deltaTime;
  //animate mesh
  for (const mesh of sectionMeshes) {
    mesh.rotation.x += deltaTime * 0.1
    mesh.rotation.y += deltaTime * 0.2
  }
  if (sizes.width > 500) {
    deviceCheck = true;
  }
  if (sizes.width < 500) {
    deviceCheck = false;
  }
  if (deviceCheck) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    if (intersects.length) {
      spheres[spheresIndex].position.copy(intersects[0]?.point);
      spheres[spheresIndex].scale.set(1, 1, 1);
      spheresIndex = (spheresIndex + 1) % spheres.length;
    }
    for (let i = 0; i < spheres.length; i++) {
      const sphere = spheres[i];
      sphere.scale.multiplyScalar(-0.69);
      sphere.scale.clampScalar(0.1, 0.15);
    }
  }

  // Render
  renderer.render(scene, camera)

  // Call animate again on the next frame
  window.requestAnimationFrame(animate)
}

animate()

const modeloTime = document.getElementById('projekt');
const dosEquis = document.getElementById('buh-bye');
const drunk = document.getElementById('modal');

modeloTime.addEventListener("click", () => {
  console.log('poo');
  drunk.style.visibility = 'visible';
});

dosEquis.addEventListener("click", (e) => {
  e.preventDefault();
  drunk.style.visibility = 'hidden';
});
