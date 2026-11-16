
/* =====================================
   PRISON ESCAPE
   BRICK 1 - 3D WORLD FOUNDATION
===================================== */

const container = document.getElementById("game-container");

if (!window.THREE) {
    document.querySelector(".loading-text").textContent =
        "3D ENGINE FAILED TO LOAD. CHECK INTERNET.";
    throw new Error("Three.js failed to load.");
}

// SCENE
const scene = new THREE.Scene();

scene.background = new THREE.Color(0x91a1ad);

scene.fog = new THREE.Fog(
    0x91a1ad,
    55,
    130
);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    300
);

camera.position.set(0, 11, 24);
camera.lookAt(0, 2, 0);

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 1.5)
);

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

// MATERIALS
const concrete = new THREE.MeshStandardMaterial({
    color: 0x777773,
    roughness: 0.95
});

const darkConcrete = new THREE.MeshStandardMaterial({
    color: 0x494b4b,
    roughness: 1
});

const groundMaterial = new THREE.MeshStandardMaterial({
    color: 0x77745f,
    roughness: 1
});

const metal = new THREE.MeshStandardMaterial({
    color: 0x303438,
    metalness: 0.75,
    roughness: 0.5
});

// LIGHTING
const ambientLight = new THREE.HemisphereLight(
    0xdce8ff,
    0x565044,
    2
);

scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(
    0xffe4bc,
    3
);

sunlight.position.set(-25, 40, 20);
sunlight.castShadow = true;

sunlight.shadow.mapSize.set(2048, 2048);

sunlight.shadow.camera.left = -50;
sunlight.shadow.camera.right = 50;
sunlight.shadow.camera.top = 50;
sunlight.shadow.camera.bottom = -50;

scene.add(sunlight);

// GROUND
function createBox(
    width,
    height,
    depth,
    x,
    y,
    z,
    material
) {
    const geometry = new THREE.BoxGeometry(
        width,
        height,
        depth
    );

    const mesh = new THREE.Mesh(
        geometry,
        material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    return mesh;
}

const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    groundMaterial
);

ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;

scene.add(ground);

// PRISON WALLS
const wallHeight = 13;

// BACK WALL
createBox(
    60, wallHeight, 2,
    0, wallHeight / 2, -30,
    concrete
);

// LEFT WALL
createBox(
    2, wallHeight, 60,
    -30, wallHeight / 2, 0,
    concrete
);

// RIGHT WALL
createBox(
    2, wallHeight, 60,
    30, wallHeight / 2, 0,
    concrete
);

// FRONT WALL - GATE OPENING
createBox(
    22, wallHeight, 2,
    -19, wallHeight / 2, 30,
    concrete
);

createBox(
    22, wallHeight, 2,
    19, wallHeight / 2, 30,
    concrete
);

// GATE STRUCTURE
createBox(
    16, 3, 3,
    0, 13.5, 30,
    darkConcrete
);

// METAL GATE
const gate = createBox(
    12, 10, 0.5,
    0, 5, 30,
    metal
);

// GATE BARS
for (let x = -5.5; x <= 5.5; x += 1.1) {
    createBox(
        0.12, 10, 0.15,
        x, 5, 29.65,
        metal
    );
}

// GATE CROSSBARS
for (let y = 1; y <= 9; y += 2) {
    createBox(
        12, 0.12, 0.15,
        0, y, 29.65,
        metal
    );
}

// WALL TOP DETAILS
for (let x = -28; x <= 28; x += 3) {
    createBox(
        0.3, 1.2, 0.3,
        x, 13.6, -30,
        darkConcrete
    );

    createBox(
        0.3, 1.2, 0.3,
        x, 13.6, 30,
        darkConcrete
    );
}

// WATCHTOWERS
function createTower(x, z) {

    createBox(
        5, 1, 5,
        x, 14, z,
        darkConcrete
    );

    createBox(
        4, 6, 4,
        x, 17.5, z,
        concrete
    );

    createBox(
        6, 0.5, 6,
        x, 21, z,
        darkConcrete
    );

    createBox(
        6, 1, 6,
        x, 24, z,
        darkConcrete
    );

    // Tower support
    createBox(
        0.7, 8, 0.7,
        x - 1.8, 10, z - 1.8,
        darkConcrete
    );

    createBox(
        0.7, 8, 0.7,
        x + 1.8, 10, z - 1.8,
        darkConcrete
    );

    createBox(
        0.7, 8, 0.7,
        x - 1.8, 10, z + 1.8,
        darkConcrete
    );

    createBox(
        0.7, 8, 0.7,
        x + 1.8, 10, z + 1.8,
        darkConcrete
    );
}

createTower(-25, -25);
createTower(25, -25);
createTower(-25, 25);
createTower(25, 25);

// COURTYARD DETAILS
const benchMaterial = new THREE.MeshStandardMaterial({
    color: 0x514235,
    roughness: 0.9
});

// Wooden benches
function createBench(x, z) {

    createBox(
        4, 0.25, 1,
        x, 0.8, z,
        benchMaterial
    );

    createBox(
        0.25, 0.8, 0.25,
        x - 1.5, 0.4, z,
        metal
    );

    createBox(
        0.25, 0.8, 0.25,
        x + 1.5, 0.4, z,
        metal
    );
}

createBench(-12, -5);
createBench(12, -5);

// Small concrete blocks
createBox(
    3, 0.6, 2,
    -13, 0.3, 12,
    darkConcrete
);

createBox(
    3, 0.6, 2,
    13, 0.3, 12,
    darkConcrete
);

// PRISONER PLACEHOLDER
const prisonerMaterial = new THREE.MeshStandardMaterial({
    color: 0xe47725,
    roughness: 0.85
});

const skinMaterial = new THREE.MeshStandardMaterial({
    color: 0xb77b56,
    roughness: 0.9
});

const prisoner = new THREE.Group();

// Body
const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.55, 1.1, 4, 8),
    prisonerMaterial
);

body.position.y = 1.5;
body.castShadow = true;

prisoner.add(body);

// Head
const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.38, 16, 16),
    skinMaterial
);

head.position.y = 2.65;
head.castShadow = true;

prisoner.add(head);

// Legs
for (const x of [-0.25, 0.25]) {

    const leg = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.8, 0.35),
        prisonerMaterial
    );

    leg.position.set(x, 0.4, 0);
    leg.castShadow = true;

    prisoner.add(leg);
}

prisoner.position.set(0, 0, 12);

scene.add(prisoner);

// CAMERA TARGET
camera.lookAt(
    prisoner.position.x,
    2,
    prisoner.position.z
);

// RESIZE
window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );
});

// GAME LOOP
function animate() {

    requestAnimationFrame(animate);

    renderer.render(scene, camera);
}

animate();

// LOADING SCREEN
window.addEventListener("load", () => {

    const loading = document.getElementById(
        "loading-screen"
    );

    setTimeout(() => {

        loading.style.opacity = "0";

        setTimeout(() => {
            loading.style.display = "none";
        }, 500);

    }, 700);
});
  
