import * as THREE from "three";
import { CapsuleGeometry } from "three/addons/geometries/CapsuleGeometry.js";

/* =========================================
   PRISON ESCAPE - PROTOTYPE 01
   PLAYER / CAMERA / COLLISION / CONTROLS
========================================= */

const container = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");

if (!container) {
    throw new Error("Game container was not found.");
}

/* =========================================
   SCENE
========================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x89949a);
scene.fog = new THREE.Fog(0x89949a, 28, 75);

const camera = new THREE.PerspectiveCamera(
    65,
    window.innerWidth / window.innerHeight,
    0.1,
    100
);

const renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: "high-performance"
});

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

container.appendChild(renderer.domElement);

/* =========================================
   LIGHTING AND SHADOWS
========================================= */

scene.add(
    new THREE.HemisphereLight(0xe4eaf0, 0x39352e, 1.5)
);

const sunlight = new THREE.DirectionalLight(0xffe4c2, 2.4);

sunlight.position.set(-12, 22, 12);
sunlight.castShadow = true;

sunlight.shadow.mapSize.set(2048, 2048);
sunlight.shadow.camera.left = -22;
sunlight.shadow.camera.right = 22;
sunlight.shadow.camera.top = 22;
sunlight.shadow.camera.bottom = -22;
sunlight.shadow.camera.near = 0.5;
sunlight.shadow.camera.far = 60;
sunlight.shadow.bias = -0.0002;
sunlight.shadow.normalBias = 0.025;

scene.add(sunlight);

/* =========================================
   MATERIALS
========================================= */

const mat = {
    floor: new THREE.MeshStandardMaterial({
        color: 0x77736a,
        roughness: 0.95
    }),

    wall: new THREE.MeshStandardMaterial({
        color: 0x99948a,
        roughness: 0.95
    }),

    concrete: new THREE.MeshStandardMaterial({
        color: 0x555653,
        roughness: 0.9
    }),

    metal: new THREE.MeshStandardMaterial({
        color: 0x44494b,
        metalness: 0.65,
        roughness: 0.45
    }),

    orange: new THREE.MeshStandardMaterial({
        color: 0xe87819,
        roughness: 0.85
    }),

    orangeDark: new THREE.MeshStandardMaterial({
        color: 0xc75b0c,
        roughness: 0.9
    }),

    skin: new THREE.MeshStandardMaterial({
        color: 0xb98765,
        roughness: 0.85
    }),

    hair: new THREE.MeshStandardMaterial({
        color: 0x29221d,
        roughness: 0.95
    }),

    shoes: new THREE.MeshStandardMaterial({
        color: 0x25282a,
        roughness: 0.8
    }),

    white: new THREE.MeshStandardMaterial({
        color: 0xe8e3d9
    }),

    black: new THREE.MeshStandardMaterial({
        color: 0x171717
    })
};

/* =========================================
   WORLD
========================================= */

const worldSize = 30;

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(worldSize, worldSize),
    mat.floor
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

/* =========================================
   SOLID COLLISION SYSTEM
========================================= */

const obstacles = [];

function addSolidBox(x, y, z, width, height, depth, material) {

    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(width, height, depth),
        material
    );

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    scene.add(mesh);

    obstacles.push({
        minX: x - width / 2,
        maxX: x + width / 2,
        minZ: z - depth / 2,
        maxZ: z + depth / 2,
        mesh
    });

    return mesh;
}

/* =========================================
   OUTER PRISON WALLS
========================================= */

addSolidBox(0, 2.5, -15, 30, 5, 0.7, mat.wall);
addSolidBox(0, 2.5, 15, 30, 5, 0.7, mat.wall);
addSolidBox(-15, 2.5, 0, 0.7, 5, 30, mat.wall);
addSolidBox(15, 2.5, 0, 0.7, 5, 30, mat.wall);

/* =========================================
   TEST BARRIERS
========================================= */

addSolidBox(-5, 0.65, -3, 4, 1.3, 1, mat.concrete);
addSolidBox(5, 0.65, -6, 4, 1.3, 1, mat.concrete);
addSolidBox(-6, 1, 5, 2, 2, 2, mat.wall);
addSolidBox(5, 1, 5, 3, 2, 0.4, mat.metal);

/* =========================================
   METAL BAR FENCE
========================================= */

function createBarFence(centerX, z, count, spacing) {

    for (let i = 0; i < count; i++) {

        const x =
            centerX + (i - (count - 1) / 2) * spacing;

        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 3, 10),
            mat.metal
        );

        bar.position.set(x, 1.5, z);
        bar.castShadow = true;
        bar.receiveShadow = true;

        scene.add(bar);
    }

    // Invisible collision wall behind the visible bars.
    const collider = new THREE.Mesh(
        new THREE.BoxGeometry(count * spacing, 3, 0.22),
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            colorWrite: false,
            depthWrite: false
        })
    );

    collider.position.set(centerX, 1.5, z);
    scene.add(collider);

    obstacles.push({
        minX: centerX - count * spacing / 2,
        maxX: centerX + count * spacing / 2,
        minZ: z - 0.11,
        maxZ: z + 0.11,
        mesh: collider
    });
}

createBarFence(0, -9, 17, 0.55);

/* =========================================
   CHARACTER
   Procedural prototype placeholder.
   Final reference-matched rigged model
   will replace this character.
========================================= */

const player = new THREE.Group();
scene.add(player);

function addPart(parent, geometry, material, x, y, z) {

    const mesh = new THREE.Mesh(geometry, material);

    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    parent.add(mesh);

    return mesh;
}

function createLimb(parent, material, length, radius, x, y) {

    const pivot = new THREE.Group();
    pivot.position.set(x, y, 0);
    parent.add(pivot);

    addPart(
        pivot,
        new THREE.CapsuleGeometry(radius, length, 5, 12),
        material,
        0,
        -length * 0.35,
        0
    );

    return pivot;
}

/* =========================================
   TORSO AND UNIFORM
========================================= */

addPart(
    player,
    new THREE.CapsuleGeometry(0.34, 0.55, 6, 16),
    mat.orange,
    0, 1.35, 0
);

// Uniform collar
addPart(
    player,
    new THREE.BoxGeometry(0.25, 0.08, 0.17),
    mat.orangeDark,
    0, 1.73, 0.12
);

// Front shirt panel
addPart(
    player,
    new THREE.BoxGeometry(0.35, 0.45, 0.025),
    mat.orangeDark,
    0, 1.43, 0.335
);

// Uniform number patch
addPart(
    player,
    new THREE.BoxGeometry(0.18, 0.13, 0.035),
    mat.white,
    0.15, 1.48, 0.35
);

// Neck
addPart(
    player,
    new THREE.CylinderGeometry(0.11, 0.12, 0.18, 16),
    mat.skin,
    0, 1.82, 0
);

/* =========================================
   HEAD AND FACE
========================================= */

addPart(
    player,
    new THREE.SphereGeometry(0.235, 24, 20),
    mat.skin,
    0, 2.02, 0
);

// Ears
addPart(player, new THREE.SphereGeometry(0.065, 12, 10),
    mat.skin, -0.225, 2.02, 0);

addPart(player, new THREE.SphereGeometry(0.065, 12, 10),
    mat.skin, 0.225, 2.02, 0);

// Hair
addPart(
    player,
    new THREE.SphereGeometry(0.225, 20, 14),
    mat.hair,
    0, 2.105, -0.025
);

// Eyes
addPart(player, new THREE.SphereGeometry(0.025, 10, 8),
    mat.black, -0.08, 2.065, 0.211);

addPart(player, new THREE.SphereGeometry(0.025, 10, 8),
    mat.black, 0.08, 2.065, 0.211);

// Nose
addPart(
    player,
    new THREE.SphereGeometry(0.045, 12, 10),
    mat.skin,
    0, 2.00, 0.225
);

// Eyebrows
addPart(
    player,
    new THREE.BoxGeometry(0.075, 0.018, 0.025),
    mat.hair,
    -0.08, 2.105, 0.215
);

addPart(
    player,
    new THREE.BoxGeometry(0.075, 0.018, 0.025),
    mat.hair,
    0.08, 2.105, 0.215
);

// Mouth
addPart(
    player,
    new THREE.BoxGeometry(0.075, 0.012, 0.015),
    mat.hair,
    0, 1.94, 0.23
);

/* =========================================
   ORANGE PRISON CAP
========================================= */

addPart(
    player,
    new THREE.SphereGeometry(0.225, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    mat.orange,
    0, 2.19, -0.005
);

addPart(
    player,
    new THREE.CylinderGeometry(0.25, 0.25, 0.035, 20),
    mat.orange,
    0, 2.18, 0.045
);

// Cap visor
addPart(
    player,
    new THREE.BoxGeometry(0.3, 0.035, 0.19),
    mat.orangeDark,
    0, 2.17, 0.17
);

// Cap badge
addPart(
    player,
    new THREE.BoxGeometry(0.075, 0.045, 0.018),
    mat.white,
    0, 2.27, 0.205
);

/* =========================================
   ARMS
========================================= */

const leftArm = createLimb(
    player, mat.orange, 0.46, 0.105, -0.39, 1.62
);

const rightArm = createLimb(
    player, mat.orange, 0.46, 0.105, 0.39, 1.62
);

// Hands
addPart(
    leftArm,
    new THREE.SphereGeometry(0.095, 12, 10),
    mat.skin,
    0, -0.56, 0
);

addPart(
    rightArm,
    new THREE.SphereGeometry(0.095, 12, 10),
    mat.skin,
    0, -0.56, 0
);

/* =========================================
   LEGS AND SHOES
========================================= */

const leftLeg = createLimb(
    player, mat.orange, 0.55, 0.13, -0.17, 0.88
);

const rightLeg = createLimb(
    player, mat.orange, 0.55, 0.13, 0.17, 0.88
);

addPart(
    leftLeg,
    new THREE.BoxGeometry(0.25, 0.14, 0.38),
    mat.shoes,
    0, -0.66, 0.07
);

addPart(
    rightLeg,
    new THREE.BoxGeometry(0.25, 0.14, 0.38),
    mat.shoes,
    0, -0.66, 0.07
);

player.position.set(0, 0, 10);

/* =========================================
   PLAYER COLLISION
========================================= */

const PLAYER_RADIUS = 0.38;

function isBlocked(x, z) {

    for (const obstacle of obstacles) {

        const closestX = THREE.MathUtils.clamp(
            x, obstacle.minX, obstacle.maxX
        );

        const closestZ = THREE.MathUtils.clamp(
            z, obstacle.minZ, obstacle.maxZ
        );

        const dx = x - closestX;
        const dz = z - closestZ;

        if (
            dx * dx + dz * dz <
            PLAYER_RADIUS * PLAYER_RADIUS
        ) {
            return true;
        }
    }

    return false;
}

function movePlayer(dx, dz) {

    const nextX = player.position.x + dx;

    if (!isBlocked(nextX, player.position.z)) {
        player.position.x = nextX;
    }

    const nextZ = player.position.z + dz;

    if (!isBlocked(player.position.x, nextZ)) {
        player.position.z = nextZ;
    }
}

/* =========================================
   MOBILE CONTROLS
========================================= */

const joystickArea = document.getElementById("joystick-area");
const joystickKnob = document.getElementById("joystick-knob");
const runButton = document.getElementById("run-button");

if (!joystickArea || !joystickKnob || !runButton) {
    throw new Error("Required game controls are missing.");
}

let moveX = 0;
let moveY = 0;
let running = false;

let joystickPointer = null;
let runPointer = null;

const joystickLimit = 36;

/* =========================================
   JOYSTICK
========================================= */

function updateJoystick(event) {

    const rect = joystickArea.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = event.clientX - centerX;
    let dy = event.clientY - centerY;

    const distance = Math.hypot(dx, dy);

    if (distance > joystickLimit) {
        dx = dx / distance * joystickLimit;
        dy = dy / distance * joystickLimit;
    }

    moveX = dx / joystickLimit;
    moveY = -dy / joystickLimit;

    joystickKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}

function releaseJoystick() {

    moveX = 0;
    moveY = 0;
    joystickPointer = null;

    joystickKnob.style.transform =
        "translate(0px, 0px)";
}

joystickArea.addEventListener("pointerdown", event => {

    if (joystickPointer !== null) return;

    event.preventDefault();
    event.stopPropagation();

    joystickPointer = event.pointerId;

    joystickArea.setPointerCapture(event.pointerId);

    updateJoystick(event);
});

joystickArea.addEventListener("pointermove", event => {

    if (event.pointerId !== joystickPointer) return;

    updateJoystick(event);
});

joystickArea.addEventListener("pointerup", event => {

    if (event.pointerId === joystickPointer) {
        releaseJoystick();
    }
});

joystickArea.addEventListener("pointercancel", event => {

    if (event.pointerId === joystickPointer) {
        releaseJoystick();
    }
});

/* =========================================
   RUN BUTTON
   Hold to run, release to walk.
========================================= */

function startRunning(event) {

    event.preventDefault();
    event.stopPropagation();

    if (runPointer !== null) return;

    runPointer = event.pointerId;
    running = true;

    runButton.classList.add("running");
}

function stopRunning(event) {

    if (event.pointerId !== runPointer) return;

    running = false;
    runPointer = null;

    runButton.classList.remove("running");
}

runButton.addEventListener("pointerdown", startRunning);

window.addEventListener("pointerup", stopRunning, true);
window.addEventListener("pointercancel", stopRunning, true);

window.addEventListener("blur", () => {

    running = false;
    runPointer = null;

    releaseJoystick();

    runButton.classList.remove("running");
});

/* =========================================
   THIRD-PERSON CAMERA
========================================= */

let yaw = 0;
let pitch = 0.18;

const cameraDistance = 6.5;

const cameraRaycaster = new THREE.Raycaster();
const cameraTarget = new THREE.Vector3();
const desiredCameraPosition = new THREE.Vector3();
const cameraDirection = new THREE.Vector3();

const cameraObstacles = obstacles.map(item => item.mesh);

const cameraDragSpeed = 0.006;

let cameraPointer = null;
let lastCameraX = 0;
let lastCameraY = 0;

renderer.domElement.addEventListener("pointerdown", event => {

    if (cameraPointer !== null) return;

    cameraPointer = event.pointerId;

    lastCameraX = event.clientX;
    lastCameraY = event.clientY;

    renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", event => {

    if (event.pointerId !== cameraPointer) return;

    const dx = event.clientX - lastCameraX;
    const dy = event.clientY - lastCameraY;

    lastCameraX = event.clientX;
    lastCameraY = event.clientY;

    yaw -= dx * cameraDragSpeed;

    pitch = THREE.MathUtils.clamp(
        pitch + dy * cameraDragSpeed,
        -0.15,
        0.75
    );
});

function stopCameraDrag(event) {

    if (event.pointerId === cameraPointer) {
        cameraPointer = null;
    }
}

renderer.domElement.addEventListener("pointerup", stopCameraDrag);
renderer.domElement.addEventListener("pointercancel", stopCameraDrag);

/* =========================================
   CAMERA COLLISION AND FOLLOW
========================================= */

function updateCamera(delta) {

    cameraTarget.set(
        player.position.x,
        player.position.y + 1.4,
        player.position.z
    );

    const horizontalDistance =
        cameraDistance * Math.cos(pitch);

    desiredCameraPosition.set(
        cameraTarget.x + Math.sin(yaw) * horizontalDistance,
        cameraTarget.y + cameraDistance * Math.sin(pitch),
        cameraTarget.z + Math.cos(yaw) * horizontalDistance
    );

    cameraDirection
        .subVectors(desiredCameraPosition, cameraTarget);

    const distance = cameraDirection.length();

    cameraDirection.normalize();

    cameraRaycaster.set(cameraTarget, cameraDirection);
    cameraRaycaster.far = distance;

    const hits = cameraRaycaster.intersectObjects(
        cameraObstacles,
        false
    );

    let allowedDistance = distance;

    if (hits.length > 0) {
        allowedDistance = Math.max(0.6, hits[0].distance - 0.3);
    }

    const targetPosition = cameraTarget.clone()
        .addScaledVector(cameraDirection, allowedDistance);

    camera.position.lerp(
        targetPosition,
        1 - Math.exp(-10 * delta)
    );

    camera.lookAt(cameraTarget);
}

/* =========================================
   MOVEMENT AND ANIMATION
========================================= */

const clock = new THREE.Clock();

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const direction = new THREE.Vector3();

let walkCycle = 0;

function updatePlayer(delta) {

    let inputX = moveX;
    let inputY = moveY;

    const magnitude = Math.hypot(inputX, inputY);

    if (magnitude > 1) {
        inputX /= magnitude;
        inputY /= magnitude;
    }

    forward.set(
        Math.sin(yaw),
        0,
        -Math.cos(yaw)
    );

    right.set(
        Math.cos(yaw),
        0,
        Math.sin(yaw)
    );

    direction.set(0, 0, 0);

    direction.addScaledVector(right, inputX);
    direction.addScaledVector(forward, inputY);

    const moving = direction.lengthSq() > 0.001;

    if (moving) {

        direction.normalize();

        const speed = running ? 6.5 : 3.2;

        movePlayer(
            direction.x * speed * delta,
            direction.z * speed * delta
        );

        const targetRotation = Math.atan2(
            direction.x,
            direction.z
        );

        let rotationDifference =
            targetRotation - player.rotation.y;

        rotationDifference = Math.atan2(
            Math.sin(rotationDifference),
            Math.cos(rotationDifference)
        );

        player.rotation.y +=
            rotationDifference * Math.min(1, delta * 12);

        walkCycle += delta * (running ? 13 : 8);

        const swing = Math.sin(walkCycle) * 0.5;

        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        leftArm.rotation.x = -swing * 0.8;
        rightArm.rotation.x = swing * 0.8;

    } else {

        leftLeg.rotation.x *= 0.8;
        rightLeg.rotation.x *= 0.8;

        leftArm.rotation.x *= 0.8;
        rightArm.rotation.x *= 0.8;
    }
}

/* =========================================
   RESIZE
========================================= */

window.addEventListener("resize", () => {

    camera.aspect =
        window.innerWidth / window.innerHeight;

    camera.updateProjectionMatrix();

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio, 1.5)
    );
});

/* =========================================
   MAIN LOOP
========================================= */

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    updatePlayer(delta);
    updateCamera(delta);

    renderer.render(scene, camera);
}

/* =========================================
   START GAME
========================================= */

updateCamera(0.016);

if (loadingScreen) {
    loadingScreen.style.display = "none";
}

animate();

console.log("PRISON ESCAPE: PROTOTYPE 01 READY");
