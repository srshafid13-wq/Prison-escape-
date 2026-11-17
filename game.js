
/* ==========================================
   PRISON ESCAPE
   NEW PRISON LAYOUT — PART 1
   Five cells + central guard corridor
========================================== */

"use strict";

const container = document.getElementById("game-container");
const loading = document.getElementById("loading-screen");
const loadingText = document.querySelector(".loading-text");

function showError(message) {
    console.error(message);
    if (loadingText) loadingText.textContent = "GAME ERROR: " + message;
    if (loading) {
        loading.style.display = "flex";
        loading.style.opacity = "1";
    }
}

try {
    if (!window.THREE) throw new Error("Three.js failed to load.");
    if (!container) throw new Error("Game container not found.");

    // SCENE
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x30343a);
    scene.fog = new THREE.Fog(0x30343a, 45, 100);

    const camera = new THREE.PerspectiveCamera(
        65, window.innerWidth / window.innerHeight, 0.1, 200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // MATERIALS
    const concrete = new THREE.MeshStandardMaterial({
        color: 0x77736b, roughness: 0.96
    });
    const oldConcrete = new THREE.MeshStandardMaterial({
        color: 0x514f4a, roughness: 1
    });
    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x55534e, roughness: 1
    });
    const metal = new THREE.MeshStandardMaterial({
        color: 0x34383b, metalness: 0.65, roughness: 0.65
    });
    const rustyMetal = new THREE.MeshStandardMaterial({
        color: 0x684b38, metalness: 0.45, roughness: 0.85
    });
    const bedMat = new THREE.MeshStandardMaterial({
        color: 0x777b79, roughness: 0.9
    });
    const mattressMat = new THREE.MeshStandardMaterial({
        color: 0xb5ad9e, roughness: 1
    });
    const toiletMat = new THREE.MeshStandardMaterial({
        color: 0xd0cec5, roughness: 0.65
    });
    const orangeMat = new THREE.MeshStandardMaterial({
        color: 0xe87520, roughness: 0.9
    });
    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xb77d59, roughness: 0.9
    });
    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x191a1c, roughness: 0.9
    });

    // LIGHTING
    scene.add(new THREE.HemisphereLight(0xcbd5df, 0x292522, 1.5));

    const mainLight = new THREE.DirectionalLight(0xffd7a5, 2.1);
    mainLight.position.set(-15, 25, 12);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.set(2048, 2048);
    mainLight.shadow.camera.left = -35;
    mainLight.shadow.camera.right = 35;
    mainLight.shadow.camera.top = 35;
    mainLight.shadow.camera.bottom = -35;
    scene.add(mainLight);

    const ceilingLight = new THREE.PointLight(0xffb86b, 65, 42, 2);
    ceilingLight.position.set(0, 6, 1);
    scene.add(ceilingLight);

    // WORLD OBJECTS AND COLLISION REGISTRY
    const obstacles = [];

    function box(w, h, d, x, y, z, material, solid = true) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d), material
        );
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        if (solid) {
            obstacles.push({
                x, z,
                halfW: w / 2,
                halfD: d / 2
            });
        }
        return mesh;
    }

    function cylinder(rt, rb, h, x, y, z, material, solid = true) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(rt, rb, h, 12), material
        );
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        if (solid) {
            obstacles.push({
                x, z,
                halfW: Math.max(rt, rb),
                halfD: Math.max(rt, rb)
            });
        }
        return mesh;
    }

    // FLOOR
    box(48, 0.5, 58, 0, -0.25, 0, floorMat, false);

    // OUTER WALLS
    const WALL_H = 8;
    box(48, WALL_H, 1, 0, WALL_H / 2, -28, concrete);
    box(48, WALL_H, 1, 0, WALL_H / 2, 29, concrete);
    box(1, WALL_H, 58, -24, WALL_H / 2, 0, concrete);
    box(1, WALL_H, 58, 24, WALL_H / 2, 0, concrete);

    // UPPER WALL DETAILS
    for (let x = -22; x <= 22; x += 2) {
        box(0.12, 0.9, 0.12, x, 8.45, -28, oldConcrete, false);
        box(0.12, 0.9, 0.12, x, 8.45, 29, oldConcrete, false);
    }

    // CELL LAYOUT
    // Two cells on the left, two on the right.
    // One large player cell at the back.
    // All cell doors face the central corridor.

    const CELL_FRONT_X = 10.5;
    const CELL_BACK_X = 20.5;
    const CELL_W = 10;
    const CELL_H = 5.2;

    function cellSideWall(x, z, length, height = CELL_H) {
        box(0.45, height, length, x, height / 2, z, concrete);
    }

    function cellBackWall(x, z, length, height = CELL_H) {
        box(length, height, 0.45, x, height / 2, z, concrete);
    }

    // LEFT CELL BLOCK
    cellSideWall(-CELL_BACK_X, -9, 34);
    cellBackWall(-15.5, -26, 10);
    cellBackWall(-15.5, 8, 10);
    cellBackWall(-15.5, -9, 10);

    // RIGHT CELL BLOCK
    cellSideWall(CELL_BACK_X, -9, 34);
    cellBackWall(15.5, -26, 10);
    cellBackWall(15.5, 8, 10);
    cellBackWall(15.5, -9, 10);

    // LARGE PLAYER CELL AT BACK
    cellBackWall(0, -26, 20);
    cellSideWall(-10, -21, 10);
    cellSideWall(10, -21, 10);

    // CELL BAR FRONTS
    function createBarsOnX(x, centerZ, width, doorGap = 1.6) {
        const spacing = 0.34;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;
            cylinder(0.055, 0.055, 4.8, x, 2.4, centerZ + offset, metal);
        }

        box(0.2, 0.18, width, x, 4.9, centerZ, metal);
        box(0.2, 0.18, width, x, 0.3, centerZ, metal);

        box(0.25, 4.9, 0.22, x, 2.45, centerZ - doorGap / 2, rustyMetal);
        box(0.25, 4.9, 0.22, x, 2.45, centerZ + doorGap / 2, rustyMetal);

        for (let offset = -doorGap / 2 + 0.15; offset < doorGap / 2; offset += 0.3) {
            cylinder(0.055, 0.055, 4.7, x, 2.35, centerZ + offset, rustyMetal);
        }
    }

    function createBarsOnZ(centerX, z, width, doorGap = 2.2) {
        const spacing = 0.36;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;
            cylinder(0.055, 0.055, 4.8, centerX + offset, 2.4, z, metal);
        }

        box(width, 0.18, 0.2, centerX, 4.9, z, metal);
        box(width, 0.18, 0.2, centerX, 0.3, z, metal);

        box(0.22, 4.9, 0.25, centerX - doorGap / 2, 2.45, z, rustyMetal);
        box(0.22, 4.9, 0.25, centerX + doorGap / 2, 2.45, z, rustyMetal);

        for (let offset = -doorGap / 2 + 0.15; offset < doorGap / 2; offset += 0.3) {
            cylinder(0.055, 0.055, 4.7, centerX + offset, 2.35, z, rustyMetal);
        }
    }

    // Left cells face right into the corridor.
    createBarsOnX(-10.5, -17.5, 10);
    createBarsOnX(-10.5, -0.5, 10);

    // Right cells face left into the corridor.
    createBarsOnX(10.5, -17.5, 10);
    createBarsOnX(10.5, -0.5, 10);

    // Large player cell faces toward the corridor.
    createBarsOnZ(0, -16, 19, 2.4);

    // CELL FURNITURE
    function createBed(x, z) {
        box(2.5, 0.25, 1.15, x, 0.78, z, bedMat);
        box(2.35, 0.22, 1.05, x, 1.02, z, mattressMat);

        for (const side of [-1, 1]) {
            box(0.12, 0.75, 0.12, x + side * 1.05, 0.38, z, metal);
        }
    }

    function createToilet(x, z) {
        cylinder(0.34, 0.4, 0.38, x, 0.28, z, toiletMat);
        box(0.62, 0.48, 0.55, x, 0.55, z + 0.2, toiletMat);
        box(0.68, 0.08, 0.7, x, 0.83, z, toiletMat);
    }

    function furnishCell(cx, cz, flip = 1) {
        createBed(cx + flip * 2.2, cz - 2.5);
        createToilet(cx - flip * 2.5, cz - 4.0);
        box(1.2, 0.12, 0.45, cx, 1.65, cz - 4.5, rustyMetal);
    }

    furnishCell(-15.5, -17.5, 1);
    furnishCell(-15.5, -0.5, 1);
    furnishCell(15.5, -17.5, -1);
    furnishCell(15.5, -0.5, -1);

    createBed(-3.2, -22);
    createToilet(4.2, -24);
    box(1.5, 0.12, 0.45, 0, 1.65, -25, rustyMetal);

    // OTHER FOUR PRISONERS
    function createOtherPrisoner(x, z, rotation) {
        const person = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.72, 1.1, 0.42), orangeMat
        );
        body.position.y = 1.35;
        person.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.29, 16, 12), skinMat
        );
        head.position.y = 2.08;
        person.add(head);

        const legs = new THREE.Mesh(
            new THREE.BoxGeometry(0.62, 0.72, 0.38), orangeMat
        );
        legs.position.y = 0.42;
        person.add(legs);

        person.position.set(x, 0, z);
        person.rotation.y = rotation;
        scene.add(person);
    }

    createOtherPrisoner(-15.5, -18, Math.PI / 2);
    createOtherPrisoner(-15.5, -1, Math.PI / 2);
    createOtherPrisoner(15.5, -18, -Math.PI / 2);
    createOtherPrisoner(15.5, -1, -Math.PI / 2);

    // EXIT GATE AT THE END OF THE CORRIDOR
    box(9, 0.5, 0.7, 0, 6.1, 26.5, oldConcrete);

    for (let x = -4; x <= 4; x += 0.55) {
        cylinder(0.075, 0.075, 5.8, x, 2.9, 26, metal);
    }

    box(9, 0.18, 0.2, 0, 5.7, 26, rustyMetal);
    box(9, 0.18, 0.2, 0, 0.3, 26, rustyMetal);

    // WALL LIGHTS
    function addWallLight(x, z) {
        const lampMat = new THREE.MeshStandardMaterial({
            color: 0xffd18a,
            emissive: 0xffa43b,
            emissiveIntensity: 1.1
        });

        box(0.5, 0.3, 0.18, x, 4.1, z, lampMat, false);

        const glow = new THREE.PointLight(0xffb866, 13, 12, 2);
        glow.position.set(x, 3.8, z);
        scene.add(glow);
    }

    addWallLight(-21, -17);
    addWallLight(21, -17);
    addWallLight(-21, 0);
    addWallLight(21, 0);
    addWallLight(0, -26);
    addWallLight(0, 20);

    // PLAYER CHARACTER
    const player = new THREE.Group();

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 1.05, 0.48), orangeMat
    );
    torso.position.y = 1.45;
    torso.castShadow = true;
    player.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.33, 20, 16), skinMat
    );
    head.position.y = 2.22;
    player.add(head);

    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 12), blackMat
    );
    hair.scale.y = 0.48;
    hair.position.y = 2.4;
    player.add(hair);

    const beard = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 14, 10), blackMat
    );
    beard.scale.y = 0.65;
    beard.position.set(0, 2.02, -0.15);
    player.add(beard);

    const cap = new THREE.Mesh(
        new THREE.SphereGeometry(0.36, 18, 12), orangeMat
    );
    cap.scale.y = 0.48;
    cap.position.y = 2.52;
    player.add(cap);

    const legs = [];
    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.82, 0.38), orangeMat
        );
        leg.position.set(side * 0.22, 0.48, 0);
        player.add(leg);
        legs.push(leg);

        const shoe = new THREE.Mesh(
            new THREE.BoxGeometry(0.37, 0.18, 0.5), blackMat
        );
        shoe.position.set(side * 0.22, 0.05, -0.08);
        player.add(shoe);
    }

    // Start inside the large cell.
    player.position.set(0, 0, -21.5);
    scene.add(player);
  
    // ==========================================
    // GUARD CHARACTER
    // ==========================================

    const guard = new THREE.Group();

    const guardUniform = new THREE.MeshStandardMaterial({
        color: 0x343f4d,
        roughness: 0.85
    });

    const guardSkin = new THREE.MeshStandardMaterial({
        color: 0xb98260,
        roughness: 0.9
    });

    const guardBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 1.15, 0.48),
        guardUniform
    );
    guardBody.position.y = 1.45;
    guard.add(guardBody);

    const guardHead = new THREE.Mesh(
        new THREE.SphereGeometry(0.32, 18, 14),
        guardSkin
    );
    guardHead.position.y = 2.25;
    guard.add(guardHead);

    const guardHat = new THREE.Mesh(
        new THREE.CylinderGeometry(0.35, 0.35, 0.16, 18),
        guardUniform
    );
    guardHat.position.y = 2.55;
    guard.add(guardHat);

    const guardLegs = [];

    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.85, 0.38),
            guardUniform
        );
        leg.position.set(side * 0.22, 0.48, 0);
        guard.add(leg);
        guardLegs.push(leg);

        const shoe = new THREE.Mesh(
            new THREE.BoxGeometry(0.36, 0.18, 0.48),
            blackMat
        );
        shoe.position.set(side * 0.22, 0.05, -0.06);
        guard.add(shoe);
    }

    guard.position.set(0, 0, 5);
    scene.add(guard);

    // ==========================================
    // GUARD PATROL
    // ==========================================

    let guardDirection = 1;
    let guardWalkTime = 0;
    const guardSpeed = 1.15;
    const guardMinZ = -8;
    const guardMaxZ = 20;

    function updateGuard(delta) {
        guard.position.z += guardDirection * guardSpeed * delta;

        if (guard.position.z >= guardMaxZ) {
            guard.position.z = guardMaxZ;
            guardDirection = -1;
        }

        if (guard.position.z <= guardMinZ) {
            guard.position.z = guardMinZ;
            guardDirection = 1;
        }

        guard.rotation.y = guardDirection > 0 ? Math.PI : 0;

        guardWalkTime += delta * 5;

        guardLegs[0].rotation.x = Math.sin(guardWalkTime) * 0.3;
        guardLegs[1].rotation.x = -Math.sin(guardWalkTime) * 0.3;
    }

    // ==========================================
    // PLAYER INPUT
    // ==========================================

    const joystick = document.getElementById("joystick");
    const thumb = document.getElementById("joystick-thumb");
    const runButton = document.getElementById("run-button");

    if (!joystick || !thumb || !runButton) {
        throw new Error("Mobile controls are missing.");
    }

    let moveX = 0;
    let moveY = 0;
    let joystickPointer = null;
    let running = false;
    let runningPointer = null;

    const keys = {};
    const walkSpeed = 3.5;
    const runSpeed = 6;
    const playerRadius = 0.38;
    const clock = new THREE.Clock();

    // ==========================================
    // JOYSTICK
    // ==========================================

    function updateJoystick(event) {
        const rect = joystick.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = event.clientX - centerX;
        let dy = event.clientY - centerY;

        const radius = 34;
        const distance = Math.hypot(dx, dy);

        if (distance > radius) {
            dx = dx / distance * radius;
            dy = dy / distance * radius;
        }

        moveX = dx / radius;
        moveY = dy / radius;

        thumb.style.left = `calc(50% + ${dx}px)`;
        thumb.style.top = `calc(50% + ${dy}px)`;
    }

    function resetJoystick() {
        moveX = 0;
        moveY = 0;
        joystickPointer = null;

        thumb.style.left = "50%";
        thumb.style.top = "50%";
    }

    joystick.addEventListener("pointerdown", event => {
        event.preventDefault();

        if (joystickPointer !== null) return;

        joystickPointer = event.pointerId;
        joystick.setPointerCapture(event.pointerId);
        updateJoystick(event);
    });

    joystick.addEventListener("pointermove", event => {
        if (event.pointerId === joystickPointer) {
            updateJoystick(event);
        }
    });

    function releaseJoystick(event) {
        if (event.pointerId === joystickPointer) {
            resetJoystick();
        }
    }

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);
    joystick.addEventListener("lostpointercapture", releaseJoystick);

    // ==========================================
    // RUN BUTTON
    // ==========================================

    runButton.addEventListener("pointerdown", event => {
        event.preventDefault();

        if (runningPointer !== null) return;

        runningPointer = event.pointerId;
        running = true;
        runButton.classList.add("running");
        runButton.setPointerCapture(event.pointerId);
    });

    function stopRunning(event) {
        if (
            event &&
            runningPointer !== null &&
            event.pointerId !== runningPointer
        ) return;

        runningPointer = null;
        running = false;
        runButton.classList.remove("running");
    }

    runButton.addEventListener("pointerup", stopRunning);
    runButton.addEventListener("pointercancel", stopRunning);
    runButton.addEventListener("lostpointercapture", stopRunning);

    // ==========================================
    // KEYBOARD
    // ==========================================

    window.addEventListener("keydown", event => {
        keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", event => {
        keys[event.key.toLowerCase()] = false;
    });

    // ==========================================
    // COLLISION
    // ==========================================

    function collidesWithObstacle(x, z) {
        for (const obstacle of obstacles) {
            const closestX = THREE.MathUtils.clamp(
                x,
                obstacle.x - obstacle.halfW,
                obstacle.x + obstacle.halfW
            );

            const closestZ = THREE.MathUtils.clamp(
                z,
                obstacle.z - obstacle.halfD,
                obstacle.z + obstacle.halfD
            );

            const dx = x - closestX;
            const dz = z - closestZ;

            if (
                dx * dx + dz * dz <
                playerRadius * playerRadius
            ) {
                return true;
            }
        }

        return false;
    }

    function movePlayer(dx, dz) {
        const nextX = THREE.MathUtils.clamp(
            player.position.x + dx,
            -23,
            23
        );

        if (!collidesWithObstacle(nextX, player.position.z)) {
            player.position.x = nextX;
        }

        const nextZ = THREE.MathUtils.clamp(
            player.position.z + dz,
            -27,
            28
        );

        if (!collidesWithObstacle(player.position.x, nextZ)) {
            player.position.z = nextZ;
        }
    }

    // ==========================================
    // CAMERA DRAG
    // ==========================================

    let cameraYaw = 0;
    let cameraPitch = 0.22;
    let cameraDragging = false;
    let cameraPointer = null;
    let previousX = 0;
    let previousY = 0;

    renderer.domElement.addEventListener("pointerdown", event => {
        cameraDragging = true;
        cameraPointer = event.pointerId;

        previousX = event.clientX;
        previousY = event.clientY;

        renderer.domElement.setPointerCapture(event.pointerId);
    });

    renderer.domElement.addEventListener("pointermove", event => {
        if (!cameraDragging || event.pointerId !== cameraPointer) return;

        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;

        cameraYaw -= dx * 0.005;
        cameraPitch += dy * 0.003;

        cameraPitch = THREE.MathUtils.clamp(
            cameraPitch, -0.05, 0.75
        );

        previousX = event.clientX;
        previousY = event.clientY;
    });

    function stopCamera(event) {
        if (event.pointerId === cameraPointer) {
            cameraDragging = false;
            cameraPointer = null;
        }
    }

    renderer.domElement.addEventListener("pointerup", stopCamera);
    renderer.domElement.addEventListener("pointercancel", stopCamera);

    // ==========================================
    // PLAYER MOVEMENT AND ANIMATION
    // ==========================================

    let animationTime = 0;

    function updatePlayer(delta) {
        let x = moveX;
        let y = moveY;

        if (keys["a"] || keys["arrowleft"]) x = -1;
        if (keys["d"] || keys["arrowright"]) x = 1;
        if (keys["w"] || keys["arrowup"]) y = -1;
        if (keys["s"] || keys["arrowdown"]) y = 1;

        const length = Math.hypot(x, y);

        if (length > 1) {
            x /= length;
            y /= length;
        }

        const moving = length > 0.08;
        const isRunning = running || keys["shift"] === true;

        if (moving) {
            const forwardX = -Math.sin(cameraYaw);
            const forwardZ = -Math.cos(cameraYaw);

            const rightX = Math.cos(cameraYaw);
            const rightZ = -Math.sin(cameraYaw);

            const dx = rightX * x + forwardX * (-y);
            const dz = rightZ * x + forwardZ * (-y);

            const speed = isRunning ? runSpeed : walkSpeed;

            movePlayer(
                dx * speed * delta,
                dz * speed * delta
            );

            player.rotation.y = Math.atan2(-dx, -dz);

            animationTime += delta * (isRunning ? 12 : 8);

            const swing = Math.sin(animationTime) * 0.42;
            legs[0].rotation.x = swing;
            legs[1].rotation.x = -swing;
        } else {
            legs[0].rotation.x = 0;
            legs[1].rotation.x = 0;
        }
    }

    // ==========================================
    // THIRD-PERSON CAMERA
    // ==========================================

    function updateCamera() {
        const target = new THREE.Vector3(
            player.position.x,
            1.55,
            player.position.z
        );

        const distance = 8.5;

        camera.position.set(
            target.x + Math.sin(cameraYaw) * distance * Math.cos(cameraPitch),
            target.y + 1.2 + Math.sin(cameraPitch) * distance,
            target.z + Math.cos(cameraYaw) * distance * Math.cos(cameraPitch)
        );

        camera.lookAt(target);
    }

    // ==========================================
    // RESIZE
    // ==========================================

    window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // ==========================================
    // RESET INPUT WHEN APP LOSES FOCUS
    // ==========================================

    function resetControls() {
        running = false;
        runningPointer = null;
        runButton.classList.remove("running");
        resetJoystick();
    }

    window.addEventListener("blur", resetControls);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) resetControls();
    });

    // ==========================================
    // GAME LOOP
    // ==========================================

    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.05);

        updatePlayer(delta);
        updateGuard(delta);
        updateCamera();

        renderer.render(scene, camera);
    }

    // START
    updateCamera();
    renderer.render(scene, camera);
    animate();

    if (loading) loading.style.display = "none";

    console.log("PRISON ESCAPE — FIVE CELL LAYOUT LOADED");

} catch (error) {
    showError(error.message);
    }
          
