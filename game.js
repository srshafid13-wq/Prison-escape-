
import * as THREE from "three";

/* =========================================
   PRISON ESCAPE
   MILESTONE 01 - PLAYER FOUNDATION
========================================= */

const container = document.getElementById("game-container");
const loadingScreen = document.getElementById("loading-screen");

if (!container) {
    throw new Error("Game container was not found.");
}

/* =========================================
   SCENE AND CAMERA
========================================= */

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x89949a);
scene.fog = new THREE.Fog(0x89949a, 22, 65);

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

container.appendChild(renderer.domElement);

/* =========================================
   LIGHTING
========================================= */

const ambientLight = new THREE.HemisphereLight(
    0xe2e8ed,
    0x49443b,
    2
);
scene.add(ambientLight);

const sunlight = new THREE.DirectionalLight(0xffe2b5, 2.1);
sunlight.position.set(-12, 20, 10);
sunlight.castShadow = true;
sunlight.shadow.mapSize.set(1024, 1024);
sunlight.shadow.camera.left = -25;
sunlight.shadow.camera.right = 25;
sunlight.shadow.camera.top = 25;
sunlight.shadow.camera.bottom = -25;
scene.add(sunlight);

/* =========================================
   MATERIALS
========================================= */

const materials = {
    floor: new THREE.MeshStandardMaterial({
        color: 0x77736a,
        roughness: 0.95
    }),

    wall: new THREE.MeshStandardMaterial({
        color: 0x99948a,
        roughness: 0.95
    }),

    darkWall: new THREE.MeshStandardMaterial({
        color: 0x555653,
        roughness: 0.9
    }),

    metal: new THREE.MeshStandardMaterial({
        color: 0x44494b,
        metalness: 0.7,
        roughness: 0.45
    }),

    shirt: new THREE.MeshStandardMaterial({
        color: 0xb87935,
        roughness: 0.85
    }),

    pants: new THREE.MeshStandardMaterial({
        color: 0x343c43,
        roughness: 0.9
    }),

    skin: new THREE.MeshStandardMaterial({
        color: 0xb98765,
        roughness: 0.85
    })
};

/* =========================================
   WORLD
========================================= */

const worldSize = 30;
const wallHeight = 5;

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(worldSize, worldSize),
    materials.floor
);

floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

/* =========================================
   COLLISION DATA
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
        mesh: mesh
    });

    return mesh;
}

/* =========================================
   OUTER PRISON WALLS
========================================= */

addSolidBox(
    0, wallHeight / 2, -worldSize / 2,
    worldSize, wallHeight, 0.7,
    materials.wall
);

addSolidBox(
    0, wallHeight / 2, worldSize / 2,
    worldSize, wallHeight, 0.7,
    materials.wall
);

addSolidBox(
    -worldSize / 2, wallHeight / 2, 0,
    0.7, wallHeight, worldSize,
    materials.wall
);

addSolidBox(
    worldSize / 2, wallHeight / 2, 0,
    0.7, wallHeight, worldSize,
    materials.wall
);

/* =========================================
   TEST OBSTACLES
========================================= */

addSolidBox(
    -5, 0.65, -3,
    4, 1.3, 1,
    materials.darkWall
);

addSolidBox(
    5, 0.65, -6,
    4, 1.3, 1,
    materials.darkWall
);

addSolidBox(
    -6, 1, 5,
    2, 2, 2,
    materials.wall
);

addSolidBox(
    5, 1, 5,
    3, 2, 0.4,
    materials.metal
);

/* =========================================
   METAL BAR FENCE
========================================= */

function createBarFence(centerX, z, count, spacing) {

    for (let i = 0; i < count; i++) {

        const x =
            centerX +
            (i - (count - 1) / 2) * spacing;

        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.055,
                0.055,
                3,
                8
            ),
            materials.metal
        );

        bar.position.set(x, 1.5, z);
        bar.castShadow = true;

        scene.add(bar);
    }

    addSolidBox(
        centerX,
        1.5,
        z,
        count * spacing,
        3,
        0.18,
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false
        })
    );
}

createBarFence(0, -9, 17, 0.55);

/* =========================================
   PLAYER MODEL
========================================= */

const player = new THREE.Group();
scene.add(player);

const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.85, 0.38),
    materials.shirt
);
body.position.y = 1.15;
body.castShadow = true;
player.add(body);

const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.23, 12, 10),
    materials.skin
);
head.position.y = 1.78;
head.castShadow = true;
player.add(head);

const leftLeg = new THREE.Mesh(
    new THREE.BoxGeometry(0.24, 0.75, 0.28),
    materials.pants
);
leftLeg.position.set(-0.18, 0.38, 0);
leftLeg.castShadow = true;
player.add(leftLeg);

const rightLeg = leftLeg.clone();
rightLeg.position.x = 0.18;
player.add(rightLeg);

const leftArm = new THREE.Mesh(
    new THREE.BoxGeometry(0.2, 0.72, 0.23),
    materials.skin
);
leftArm.position.set(-0.43, 1.12, 0);
player.add(leftArm);

const rightArm = leftArm.clone();
rightArm.position.x = 0.43;
player.add(rightArm);

player.position.set(0, 0, 10);

const PLAYER_RADIUS = 0.38;

/* =========================================
   PLAYER COLLISION
========================================= */

function isBlocked(x, z) {

    for (const obstacle of obstacles) {

        const closestX = THREE.MathUtils.clamp(
            x,
            obstacle.minX,
            obstacle.maxX
        );

        const closestZ = THREE.MathUtils.clamp(
            z,
            obstacle.minZ,
            obstacle.maxZ
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
const cameraButton = document.getElementById("camera-button");

let moveX = 0;
let moveY = 0;
let running = false;

let joystickPointer = null;
let runPointer = null;
let cameraPointer = null;

const joystickLimit = 36;

/* =========================================
   JOYSTICK INPUT
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
    moveY = dy / joystickLimit;

    joystickKnob.style.transform =
        `translate(${dx}px, ${dy}px)`;
}

function releaseJoystick() {

    moveX = 0;
    moveY = 0;

    joystickPointer = null;

    joystickKnob.style.transform = "translate(0px, 0px)";
}

joystickArea.addEventListener("pointerdown", event => {

    if (joystickPointer !== null) return;

    event.preventDefault();

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
   RUN BUTTON - INDEPENDENT POINTER
========================================= */

function stopRunning(event) {

    if (event.pointerId !== runPointer) return;

    running = false;
    runPointer = null;
}

runButton.addEventListener("pointerdown", event => {

    event.preventDefault();

    if (runPointer !== null) return;

    runPointer = event.pointerId;
    running = true;

    runButton.setPointerCapture(event.pointerId);
});

runButton.addEventListener("pointerup", stopRunning);

runButton.addEventListener("pointercancel", stopRunning);

runButton.addEventListener("lostpointercapture", event => {

    if (event.pointerId === runPointer) {
        running = false;
        runPointer = null;
    }
});

// Fallback: stop only when the RUN finger is released.
window.addEventListener("pointerup", stopRunning);
window.addEventListener("pointercancel", stopRunning);

window.addEventListener("blur", () => {

    running = false;
    runPointer = null;
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

const cameraObstacles = obstacles.map(item => item.mesh);

const cameraDragSpeed = 0.006;
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
   CAMERA RESET
========================================= */

cameraButton.addEventListener("click", () => {

    yaw = 0;
    pitch = 0.18;
});

/* =========================================
   CAMERA COLLISION
========================================= */

function updateCamera() {

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

    const direction = new THREE.Vector3()
        .subVectors(desiredCameraPosition, cameraTarget);

    const distance = direction.length();

    direction.normalize();

    cameraRaycaster.set(cameraTarget, direction);
    cameraRaycaster.far = distance;

    const hits = cameraRaycaster.intersectObjects(
        cameraObstacles,
        false
    );

    let allowedDistance = distance;

    if (hits.length > 0) {
        allowedDistance = Math.max(
            0.6,
            hits[0].distance - 0.3
        );
    }

    const finalCameraPosition = cameraTarget.clone()
        .addScaledVector(direction, allowedDistance);

    camera.position.copy(finalCameraPosition);
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

    // FIX: Screen coordinates have positive Y downward.
    // Negative joystick Y means forward movement.
    direction.addScaledVector(forward, -inputY);

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

        player.rotation.y += rotationDifference *
            Math.min(1, delta * 12);

        walkCycle += delta * (running ? 13 : 8);

        const swing = Math.sin(walkCycle) * 0.5;

        leftLeg.rotation.x = swing;
        rightLeg.rotation.x = -swing;

        leftArm.rotation.x = -swing * 0.6;
        rightArm.rotation.x = swing * 0.6;

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
   MAIN GAME LOOP
========================================= */

function animate() {

    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    updatePlayer(delta);
    updateCamera();

    renderer.render(scene, camera);
}

/* =========================================
   START GAME
========================================= */

updateCamera();

if (loadingScreen) {
    loadingScreen.style.display = "none";
}

animate();

console.log("PRISON ESCAPE: PROTOTYPE 01 READY");
  
