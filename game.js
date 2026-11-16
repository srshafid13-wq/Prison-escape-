
/* =====================================
   PRISON ESCAPE
   BRICK 2.5
   CHARACTER + COLLISION + RUN FIX
===================================== */

"use strict";

const container = document.getElementById("game-container");
const loading = document.getElementById("loading-screen");
const loadingText = document.querySelector(".loading-text");

function showError(message) {
    console.error(message);

    if (loading) {
        loading.style.display = "flex";
        loading.style.opacity = "1";

        if (loadingText) {
            loadingText.textContent = "GAME ERROR: " + message;
        }
    }
}

try {

    if (!window.THREE) {
        throw new Error("Three.js failed to load.");
    }

    if (!container) {
        throw new Error("Game container not found.");
    }

    // =================================
    // SCENE
    // =================================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x91a1ad);
    scene.fog = new THREE.Fog(0x91a1ad, 55, 130);

    // =================================
    // CAMERA
    // =================================

    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        300
    );

    // =================================
    // RENDERER
    // =================================

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    container.appendChild(renderer.domElement);

    // =================================
    // MATERIALS
    // =================================

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

    const benchMaterial = new THREE.MeshStandardMaterial({
        color: 0x514235,
        roughness: 0.9
    });

    // =================================
    // LIGHTING
    // =================================

    scene.add(
        new THREE.HemisphereLight(
            0xdce8ff,
            0x565044,
            2
        )
    );

    const sunlight = new THREE.DirectionalLight(
        0xffe4bc,
        3
    );

    sunlight.position.set(-25, 40, 20);
    sunlight.castShadow = true;

    sunlight.shadow.mapSize.set(1024, 1024);

    sunlight.shadow.camera.left = -50;
    sunlight.shadow.camera.right = 50;
    sunlight.shadow.camera.top = 50;
    sunlight.shadow.camera.bottom = -50;

    scene.add(sunlight);

    // =================================
    // OBJECT CREATOR
    // =================================

    function createBox(
        width,
        height,
        depth,
        x,
        y,
        z,
        material
    ) {

        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(
                width,
                height,
                depth
            ),
            material
        );

        mesh.position.set(x, y, z);

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        return mesh;
    }

    function createSphere(
        radius,
        x,
        y,
        z,
        material,
        segments = 16
    ) {

        const mesh = new THREE.Mesh(
            new THREE.SphereGeometry(
                radius,
                segments,
                segments
            ),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;

        return mesh;
    }

    // =================================
    // GROUND
    // =================================

    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;

    scene.add(ground);

    // =================================
    // PRISON WALLS
    // =================================

    createBox(60, 13, 2, 0, 6.5, -30, concrete);
    createBox(2, 13, 60, -30, 6.5, 0, concrete);
    createBox(2, 13, 60, 30, 6.5, 0, concrete);

    // FRONT WALL

    createBox(22, 13, 2, -19, 6.5, 30, concrete);
    createBox(22, 13, 2, 19, 6.5, 30, concrete);

    // =================================
    // GATE
    // =================================

    createBox(
        16, 3, 3,
        0, 13.5, 30,
        darkConcrete
    );

    createBox(
        12, 10, 0.5,
        0, 5, 30,
        metal
    );

    for (let x = -5.5; x <= 5.5; x += 1.1) {

        createBox(
            0.12, 10, 0.15,
            x, 5, 29.65,
            metal
        );
    }

    for (let y = 1; y <= 9; y += 2) {

        createBox(
            12, 0.12, 0.15,
            0, y, 29.65,
            metal
        );
    }

    // =================================
    // WALL TOP DETAILS
    // =================================

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

    // =================================
    // WATCHTOWERS
    // =================================

    function createTower(x, z) {

        createBox(5, 1, 5, x, 14, z, darkConcrete);
        createBox(4, 6, 4, x, 17.5, z, concrete);
        createBox(6, 0.5, 6, x, 21, z, darkConcrete);
        createBox(6, 1, 6, x, 24, z, darkConcrete);

        const supports = [
            [-1.8, -1.8],
            [1.8, -1.8],
            [-1.8, 1.8],
            [1.8, 1.8]
        ];

        supports.forEach(([sx, sz]) => {

            createBox(
                0.7, 8, 0.7,
                x + sx, 10, z + sz,
                darkConcrete
            );
        });
    }

    createTower(-25, -25);
    createTower(25, -25);
    createTower(-25, 25);
    createTower(25, 25);

    // =================================
    // COLLISION OBJECT REGISTRY
    // =================================

    const obstacles = [];

    function addObstacle(x, z, halfWidth, halfDepth) {

        obstacles.push({
            x: x,
            z: z,
            halfWidth: halfWidth,
            halfDepth: halfDepth
        });
    }

    // =================================
    // BENCHES
    // =================================

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

        // Collision area around the complete bench.
        addObstacle(x, z, 2.25, 0.75);
    }

    createBench(-12, -5);
    createBench(12, -5);

    // =================================
    // COURTYARD BLOCKS
    // =================================

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

    addObstacle(-13, 12, 1.75, 1.25);
    addObstacle(13, 12, 1.75, 1.25);

    // =================================
    // BRICK 2.5 - PRISONER CHARACTER
    // =================================

    const prisoner = new THREE.Group();

    const orangeMaterial = new THREE.MeshStandardMaterial({
        color: 0xf07820,
        roughness: 0.85
    });

    const orangeDark = new THREE.MeshStandardMaterial({
        color: 0xc95c16,
        roughness: 0.9
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xb77b56,
        roughness: 0.9
    });

    const hairMaterial = new THREE.MeshStandardMaterial({
        color: 0x28201b,
        roughness: 1
    });

    const shoeMaterial = new THREE.MeshStandardMaterial({
        color: 0x17191b,
        roughness: 0.85
    });

    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x17110e
    });

    const whiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8ded0
    });

    // BODY

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 1.05, 0.5),
        orangeMaterial
    );

    torso.position.y = 1.55;
    torso.castShadow = true;

    prisoner.add(torso);

    // SHOULDERS

    const shoulders = new THREE.Mesh(
        new THREE.BoxGeometry(1.12, 0.32, 0.52),
        orangeMaterial
    );

    shoulders.position.y = 2.0;
    shoulders.castShadow = true;

    prisoner.add(shoulders);

    // WAIST

    const waist = new THREE.Mesh(
        new THREE.BoxGeometry(0.82, 0.25, 0.48),
        orangeDark
    );

    waist.position.y = 1.0;

    prisoner.add(waist);

    // SHIRT COLLAR

    const collar = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.12, 0.08),
        whiteMaterial
    );

    collar.position.set(0, 2.06, -0.27);

    prisoner.add(collar);

    // FRONT POCKET

    const pocket = new THREE.Mesh(
        new THREE.BoxGeometry(0.23, 0.22, 0.035),
        orangeDark
    );

    pocket.position.set(0.24, 1.72, -0.27);

    prisoner.add(pocket);

    // HEAD

    const head = new THREE.Group();

    head.position.set(0, 2.42, 0);

    prisoner.add(head);

    const face = createSphere(
        0.36,
        0, 0, 0,
        skinMaterial,
        24
    );

    head.add(face);

    // EARS

    for (const side of [-1, 1]) {

        const ear = createSphere(
            0.09,
            side * 0.34,
            0,
            0,
            skinMaterial
        );

        head.add(ear);
    }

    // HAIR

    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.365,
            20,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.48
        ),
        hairMaterial
    );

    hair.position.y = 0.08;

    head.add(hair);

    // EYES

    for (const side of [-1, 1]) {

        const eye = createSphere(
            0.035,
            side * 0.13,
            0.035,
            -0.325,
            eyeMaterial,
            10
        );

        head.add(eye);
    }

    // EYEBROWS

    for (const side of [-1, 1]) {

        const eyebrow = new THREE.Mesh(
            new THREE.BoxGeometry(0.11, 0.035, 0.035),
            hairMaterial
        );

        eyebrow.position.set(
            side * 0.13,
            0.105,
            -0.34
        );

        head.add(eyebrow);
    }

    // NOSE

    const nose = new THREE.Mesh(
        new THREE.SphereGeometry(0.065, 12, 12),
        skinMaterial
    );

    nose.scale.set(0.7, 1, 0.8);
    nose.position.set(0, -0.005, -0.355);

    head.add(nose);

    // MOUSTACHE

    for (const side of [-1, 1]) {

        const moustache = new THREE.Mesh(
            new THREE.SphereGeometry(0.085, 12, 10),
            hairMaterial
        );

        moustache.scale.set(1.1, 0.45, 0.5);

        moustache.position.set(
            side * 0.065,
            -0.105,
            -0.34
        );

        head.add(moustache);
    }

    // BEARD

    const beard = new THREE.Mesh(
        new THREE.SphereGeometry(0.22, 16, 12),
        hairMaterial
    );

    beard.scale.set(1, 0.55, 0.65);
    beard.position.set(0, -0.24, -0.23);

    head.add(beard);

    // CAP

    const cap = new THREE.Mesh(
        new THREE.SphereGeometry(
            0.39,
            20,
            12,
            0,
            Math.PI * 2,
            0,
            Math.PI * 0.42
        ),
        orangeDark
    );

    cap.scale.y = 0.65;
    cap.position.y = 0.27;

    head.add(cap);

    const capBrim = new THREE.Mesh(
        new THREE.BoxGeometry(0.65, 0.06, 0.25),
        orangeDark
    );

    capBrim.position.set(0, 0.2, -0.32);

    head.add(capBrim);

    // ARMS

    const armPivots = [];

    for (const side of [-1, 1]) {

        const armPivot = new THREE.Group();

        armPivot.position.set(
            side * 0.56,
            1.95,
            0
        );

        prisoner.add(armPivot);

        const sleeve = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.16,
                0.14,
                0.68,
                12
            ),
            orangeMaterial
        );

        sleeve.position.y = -0.35;
        sleeve.rotation.z = side * -0.08;
        sleeve.castShadow = true;

        armPivot.add(sleeve);

        const forearm = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.13,
                0.12,
                0.3,
                12
            ),
            orangeMaterial
        );

        forearm.position.y = -0.76;

        armPivot.add(forearm);

        const hand = new THREE.Mesh(
            new THREE.SphereGeometry(0.12, 12, 10),
            skinMaterial
        );

        hand.position.y = -0.96;

        armPivot.add(hand);

        armPivots.push(armPivot);
    }

    // LEGS AND SHOES

    const legPivots = [];

    for (const side of [-1, 1]) {

        const legPivot = new THREE.Group();

        legPivot.position.set(
            side * 0.23,
            0.98,
            0
        );

        prisoner.add(legPivot);

        const trousers = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.34,
                0.83,
                0.39
            ),
            orangeMaterial
        );

        trousers.position.y = -0.4;
        trousers.castShadow = true;

        legPivot.add(trousers);

        const shoe = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.38,
                0.2,
                0.55
            ),
            shoeMaterial
        );

        shoe.position.set(0, -0.84, -0.08);
        shoe.castShadow = true;

        legPivot.add(shoe);

        const sole = new THREE.Mesh(
            new THREE.BoxGeometry(
                0.39,
                0.055,
                0.56
            ),
            shoeMaterial
        );

        sole.position.set(0, -0.94, -0.08);

        legPivot.add(sole);

        legPivots.push(legPivot);
    }

    // CHARACTER START POSITION

    prisoner.position.set(0, 0, 12);

    scene.add(prisoner);

    // =================================
    // PLAYER MOVEMENT SETTINGS
    // =================================

    let moveX = 0;
    let moveY = 0;

    let runningTouch = false;
    let runningPointer = null;

    const keys = {};

    const walkSpeed = 4.5;
    const runSpeed = 7.5;

    const playerRadius = 0.43;

    let cameraYaw = 0;
    let cameraPitch = 0.25;

    const cameraDistance = 8;

    const clock = new THREE.Clock();

    // =================================
    // CAMERA FOLLOW
    // =================================

    function updateCamera() {

        const target = new THREE.Vector3(
            prisoner.position.x,
            1.8,
            prisoner.position.z
        );

        const horizontalDistance =
            Math.cos(cameraPitch) * cameraDistance;

        camera.position.set(
            target.x +
                Math.sin(cameraYaw) * horizontalDistance,

            target.y +
                Math.sin(cameraPitch) * cameraDistance + 1,

            target.z +
                Math.cos(cameraYaw) * horizontalDistance
        );

        camera.lookAt(target);
    }

    updateCamera();

    // =================================
    // JOYSTICK
    // =================================

    const joystick = document.getElementById("joystick");
    const thumb = document.getElementById("joystick-thumb");

    if (!joystick || !thumb) {
        throw new Error("Joystick elements missing from index.html.");
    }

    let joystickPointer = null;

    const joystickRadius = 34;

    function updateJoystick(event) {

        const rect = joystick.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = event.clientX - centerX;
        let dy = event.clientY - centerY;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );

        if (distance > joystickRadius) {

            dx = dx / distance * joystickRadius;
            dy = dy / distance * joystickRadius;
        }

        moveX = dx / joystickRadius;
        moveY = dy / joystickRadius;

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

        if (joystick.setPointerCapture) {
            joystick.setPointerCapture(event.pointerId);
        }

        updateJoystick(event);
    });

    joystick.addEventListener("pointermove", event => {

        if (event.pointerId !== joystickPointer) return;

        updateJoystick(event);
    });

    function releaseJoystick(event) {

        if (event.pointerId === joystickPointer) {
            resetJoystick();
        }
    }

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);
    joystick.addEventListener("lostpointercapture", releaseJoystick);

    // =================================
    // RUN BUTTON - REPAIRED
    // =================================

    const runButton = document.getElementById("run-button");

    if (!runButton) {
        throw new Error("RUN button missing from index.html.");
    }

    function startRunning(event) {

        event.preventDefault();
        event.stopPropagation();

        if (runningPointer !== null) return;

        runningPointer = event.pointerId;
        runningTouch = true;

        runButton.classList.add("running");

        if (runButton.setPointerCapture) {
            runButton.setPointerCapture(event.pointerId);
        }
    }

    function stopRunning(event) {

        if (
            event &&
            runningPointer !== null &&
            event.pointerId !== runningPointer
        ) {
            return;
        }

        runningTouch = false;
        runningPointer = null;

        runButton.classList.remove("running");
    }

    runButton.addEventListener("pointerdown", startRunning);

    runButton.addEventListener("pointerup", stopRunning);
    runButton.addEventListener("pointercancel", stopRunning);
    runButton.addEventListener("lostpointercapture", stopRunning);

    window.addEventListener("blur", () => {
        stopRunning();
    });

    document.addEventListener("visibilitychange", () => {

        if (document.hidden) {
            stopRunning();
            resetJoystick();
        }
    });

    // =================================
    // CAMERA DRAG
    // =================================

    let draggingCamera = false;
    let previousX = 0;
    let previousY = 0;
    let cameraPointer = null;

    renderer.domElement.addEventListener("pointerdown", event => {

        draggingCamera = true;
        cameraPointer = event.pointerId;

        previousX = event.clientX;
        previousY = event.clientY;

        if (renderer.domElement.setPointerCapture) {
            renderer.domElement.setPointerCapture(event.pointerId);
        }
    });

    renderer.domElement.addEventListener("pointermove", event => {

        if (
            !draggingCamera ||
            event.pointerId !== cameraPointer
        ) {
            return;
        }

        const dx = event.clientX - previousX;
        const dy = event.clientY - previousY;

        cameraYaw -= dx * 0.005;
        cameraPitch += dy * 0.004;

        cameraPitch = Math.max(
            -0.1,
            Math.min(0.8, cameraPitch)
        );

        previousX = event.clientX;
        previousY = event.clientY;
    });

    function stopCameraDrag(event) {

        if (event.pointerId === cameraPointer) {

            draggingCamera = false;
            cameraPointer = null;
        }
    }

    renderer.domElement.addEventListener(
        "pointerup",
        stopCameraDrag
    );

    renderer.domElement.addEventListener(
        "pointercancel",
        stopCameraDrag
    );

    // =================================
    // KEYBOARD
    // =================================

    window.addEventListener("keydown", event => {

        const key = event.key.toLowerCase();

        keys[key] = true;

        if (
            key === "arrowup" ||
            key === "arrowdown" ||
            key === "arrowleft" ||
            key === "arrowright" ||
            key === " "
        ) {
            event.preventDefault();
        }
    });

    window.addEventListener("keyup", event => {

        keys[event.key.toLowerCase()] = false;
    });

    // =================================
    // COLLISION DETECTION
    // =================================

    function collidesWithObstacle(x, z) {

        for (const obstacle of obstacles) {

            const closestX = Math.max(
                obstacle.x - obstacle.halfWidth,
                Math.min(
                    x,
                    obstacle.x + obstacle.halfWidth
                )
            );

            const closestZ = Math.max(
                obstacle.z - obstacle.halfDepth,
                Math.min(
                    z,
                    obstacle.z + obstacle.halfDepth
                )
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

    // Separate X and Z checks allow sliding around obstacles.

    function movePlayer(dx, dz) {

        const currentX = prisoner.position.x;
        const currentZ = prisoner.position.z;

        let nextX = currentX + dx;

        nextX = Math.max(
            -28,
            Math.min(28, nextX)
        );

        if (!collidesWithObstacle(nextX, currentZ)) {
            prisoner.position.x = nextX;
        }

        let nextZ = currentZ + dz;

        nextZ = Math.max(
            -28,
            Math.min(27, nextZ)
        );

        if (!collidesWithObstacle(
            prisoner.position.x,
            nextZ
        )) {
            prisoner.position.z = nextZ;
        }
    }

    // =================================
    // GET MOVEMENT INPUT
    // =================================

    function getMovement() {

        let x = moveX;
        let y = moveY;

        if (keys["w"] || keys["arrowup"]) y = -1;
        if (keys["s"] || keys["arrowdown"]) y = 1;

        if (keys["a"] || keys["arrowleft"]) x = -1;
        if (keys["d"] || keys["arrowright"]) x = 1;

        return {
            x: x,
            y: y
        };
    }

    // =================================
    // CHARACTER ANIMATION
    // =================================

    let walkTime = 0;

    function updatePlayer(delta) {

        const movement = getMovement();

        let x = movement.x;
        let y = movement.y;

        const magnitude = Math.sqrt(
            x * x + y * y
        );

        if (magnitude > 1) {

            x /= magnitude;
            y /= magnitude;
        }

        const moving = magnitude > 0.08;

        const running =
            runningTouch || keys["shift"] === true;

        if (moving) {

            const forwardX = -Math.sin(cameraYaw);
            const forwardZ = -Math.cos(cameraYaw);

            const rightX = Math.cos(cameraYaw);
            const rightZ = -Math.sin(cameraYaw);

            const directionX =
                rightX * x + forwardX * (-y);

            const directionZ =
                rightZ * x + forwardZ * (-y);

            const speed = running
                ? runSpeed
                : walkSpeed;

            movePlayer(
                directionX * speed * delta,
                directionZ * speed * delta
            );

            // Face movement direction.

            prisoner.rotation.y = Math.atan2(
                -directionX,
                -directionZ
            );

            // Walking and running animation.

            walkTime += delta * (running ? 13 : 8);

            const swing = Math.sin(walkTime);

            legPivots[0].rotation.x = swing * 0.55;
            legPivots[1].rotation.x = -swing * 0.55;

            armPivots[0].rotation.x = -swing * 0.4;
            armPivots[1].rotation.x = swing * 0.4;

        } else {

            // Return limbs to standing position.

            legPivots.forEach(leg => {
                leg.rotation.x = 0;
            });

            armPivots.forEach(arm => {
                arm.rotation.x = 0;
            });
        }

        // Small body movement while walking.

        if (moving) {
            prisoner.position.y = Math.abs(
                Math.sin(walkTime * 2)
            ) * 0.035;
        } else {
            prisoner.position.y = 0;
        }
    }

    // =================================
    // RESIZE
    // =================================

    window.addEventListener("resize", () => {

        camera.aspect =
            window.innerWidth / window.innerHeight;

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    });

    // =================================
    // GAME LOOP
    // =================================

    function animate() {

        requestAnimationFrame(animate);

        const delta = Math.min(
            clock.getDelta(),
            0.05
        );

        updatePlayer(delta);
        updateCamera();

        renderer.render(scene, camera);
    }

    // =================================
    // START GAME
    // =================================

    renderer.render(scene, camera);

    animate();

    if (loading) {
        loading.style.display = "none";
    }

    console.log("PRISON ESCAPE BRICK 2.5 READY");

} catch (error) {

    showError(error.message);
    console.error(error);
              }
      
