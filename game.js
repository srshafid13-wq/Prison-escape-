
/* =====================================
   PRISON ESCAPE
   BRICK 2 - THIRD PERSON MOVEMENT
===================================== */

"use strict";

const container = document.getElementById("game-container");
const loading = document.getElementById("loading-screen");
const loadingText = document.querySelector(".loading-text");

function showError(message) {
    console.error(message);
    loading.style.display = "flex";
    loading.style.opacity = "1";
    loadingText.textContent = "GAME ERROR: " + message;
}

try {

    if (!window.THREE) {
        throw new Error("Three.js failed to load.");
    }

    // SCENE
    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x91a1ad);
    scene.fog = new THREE.Fog(0x91a1ad, 55, 130);

    // CAMERA
    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        300
    );

    // RENDERER
    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
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

    // OBJECT CREATOR
    function createBox(
        width, height, depth,
        x, y, z, material
    ) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(width, height, depth),
            material
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;

        scene.add(mesh);

        return mesh;
    }

    // GROUND
    const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(100, 100),
        groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // PRISON WALLS
    const wallHeight = 13;

    createBox(60, 13, 2, 0, 6.5, -30, concrete);
    createBox(2, 13, 60, -30, 6.5, 0, concrete);
    createBox(2, 13, 60, 30, 6.5, 0, concrete);

    // FRONT WALL
    createBox(22, 13, 2, -19, 6.5, 30, concrete);
    createBox(22, 13, 2, 19, 6.5, 30, concrete);

    // GATE
    createBox(16, 3, 3, 0, 13.5, 30, darkConcrete);

    createBox(12, 10, 0.5, 0, 5, 30, metal);

    for (let x = -5.5; x <= 5.5; x += 1.1) {
        createBox(0.12, 10, 0.15, x, 5, 29.65, metal);
    }

    for (let y = 1; y <= 9; y += 2) {
        createBox(12, 0.12, 0.15, 0, y, 29.65, metal);
    }

    // WALL TOP DETAILS
    for (let x = -28; x <= 28; x += 3) {
        createBox(0.3, 1.2, 0.3, x, 13.6, -30, darkConcrete);
        createBox(0.3, 1.2, 0.3, x, 13.6, 30, darkConcrete);
    }

    // WATCHTOWERS
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

    // BENCHES
    const benchMaterial = new THREE.MeshStandardMaterial({
        color: 0x514235,
        roughness: 0.9
    });

    function createBench(x, z) {

        createBox(4, 0.25, 1, x, 0.8, z, benchMaterial);

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

    // COURTYARD BLOCKS
    createBox(3, 0.6, 2, -13, 0.3, 12, darkConcrete);
    createBox(3, 0.6, 2, 13, 0.3, 12, darkConcrete);

    // PRISONER
    const prisoner = new THREE.Group();

    const prisonerMaterial = new THREE.MeshStandardMaterial({
        color: 0xe47725,
        roughness: 0.85
    });

    const skinMaterial = new THREE.MeshStandardMaterial({
        color: 0xb77b56,
        roughness: 0.9
    });

    const body = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.55, 1.1, 4, 8),
        prisonerMaterial
    );

    body.position.y = 1.5;
    body.castShadow = true;
    prisoner.add(body);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.38, 16, 16),
        skinMaterial
    );

    head.position.y = 2.65;
    head.castShadow = true;
    prisoner.add(head);

    const legs = [];

    for (const x of [-0.25, 0.25]) {

        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.3, 0.8, 0.35),
            prisonerMaterial
        );

        leg.position.set(x, 0.4, 0);
        leg.castShadow = true;

        prisoner.add(leg);
        legs.push(leg);
    }

    prisoner.position.set(0, 0, 12);
    scene.add(prisoner);

    // =================================
    // BRICK 2 - PLAYER MOVEMENT
    // =================================

    let moveX = 0;
    let moveY = 0;

    let running = false;

    let cameraYaw = 0;
    let cameraPitch = 0.25;

    const walkSpeed = 4.5;
    const runSpeed = 7.5;

    const clock = new THREE.Clock();

    // CAMERA SETTINGS
    const cameraDistance = 8;

    function updateCamera() {

        const target = new THREE.Vector3(
            prisoner.position.x,
            2,
            prisoner.position.z
        );

        const horizontalDistance =
            Math.cos(cameraPitch) * cameraDistance;

        camera.position.set(
            target.x + Math.sin(cameraYaw) * horizontalDistance,
            target.y + Math.sin(cameraPitch) * cameraDistance + 1,
            target.z + Math.cos(cameraYaw) * horizontalDistance
        );

        camera.lookAt(target);
    }

    updateCamera();

    // JOYSTICK
    const joystick = document.getElementById("joystick");
    const thumb = document.getElementById("joystick-thumb");

    let joystickPointer = null;

    const joystickRadius = 34;

    function updateJoystick(event) {

        const rect = joystick.getBoundingClientRect();

        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        let dx = event.clientX - centerX;
        let dy = event.clientY - centerY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > joystickRadius) {
            dx = dx / distance * joystickRadius;
            dy = dy / distance * joystickRadius;
        }

        moveX = dx / joystickRadius;
        moveY = dy / joystickRadius;

        thumb.style.left =
            `calc(50% + ${dx}px)`;

        thumb.style.top =
            `calc(50% + ${dy}px)`;
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

        if (event.pointerId !== joystickPointer) return;

        updateJoystick(event);
    });

    joystick.addEventListener("pointerup", event => {

        if (event.pointerId === joystickPointer) {
            resetJoystick();
        }
    });

    joystick.addEventListener("pointercancel", event => {

        if (event.pointerId === joystickPointer) {
            resetJoystick();
        }
    });

    // RUN BUTTON
    const runButton = document.getElementById("run-button");

    runButton.addEventListener("pointerdown", event => {

        event.preventDefault();

        running = true;
        runButton.classList.add("running");

        runButton.setPointerCapture(event.pointerId);
    });

    function stopRunning() {

        running = false;
        runButton.classList.remove("running");
    }

    runButton.addEventListener("pointerup", stopRunning);
    runButton.addEventListener("pointercancel", stopRunning);

    // CAMERA DRAG
    let draggingCamera = false;
    let previousX = 0;
    let previousY = 0;
    let cameraPointer = null;

    renderer.domElement.addEventListener("pointerdown", event => {

        draggingCamera = true;
        cameraPointer = event.pointerId;

        previousX = event.clientX;
        previousY = event.clientY;

        renderer.domElement.setPointerCapture(event.pointerId);
    });

    renderer.domElement.addEventListener("pointermove", event => {

        if (!draggingCamera ||
            event.pointerId !== cameraPointer) return;

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

    // KEYBOARD SUPPORT
    const keys = {};

    window.addEventListener("keydown", event => {
        keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", event => {
        keys[event.key.toLowerCase()] = false;
    });

    function getMovement() {

        let x = moveX;
        let y = moveY;

        if (keys["w"] || keys["arrowup"]) y = -1;
        if (keys["s"] || keys["arrowdown"]) y = 1;
        if (keys["a"] || keys["arrowleft"]) x = -1;
        if (keys["d"] || keys["arrowright"]) x = 1;

        if (keys["shift"]) running = true;

        return { x, y };
    }

    // COLLISION BOUNDARIES
    function movePlayer(dx, dz) {

        let nextX = prisoner.position.x + dx;
        let nextZ = prisoner.position.z + dz;

        // Prison side walls
        nextX = Math.max(-28, Math.min(28, nextX));

        // Front and back walls
        nextZ = Math.max(-28, Math.min(27, nextZ));

        // Prevent walking through the gate
        if (nextZ > 26.5 && Math.abs(nextX) < 7) {
            nextZ = 26.5;
        }

        prisoner.position.x = nextX;
        prisoner.position.z = nextZ;
    }

    // PLAYER ANIMATION
    let walkTime = 0;

    function updatePlayer(delta) {

        const movement = getMovement();

        let x = movement.x;
        let y = movement.y;

        const magnitude = Math.sqrt(x * x + y * y);

        if (magnitude > 1) {
            x /= magnitude;
            y /= magnitude;
        }

        if (magnitude > 0.08) {

            const forwardX = -Math.sin(cameraYaw);
            const forwardZ = -Math.cos(cameraYaw);

            const rightX = Math.cos(cameraYaw);
            const rightZ = -Math.sin(cameraYaw);

            const directionX =
                rightX * x + forwardX * (-y);

            const directionZ =
                rightZ * x + forwardZ * (-y);

            const speed = running ? runSpeed : walkSpeed;

            movePlayer(
                directionX * speed * delta,
                directionZ * speed * delta
            );

            prisoner.rotation.y = Math.atan2(
                -directionX,
                -directionZ
            );

            walkTime += delta * (running ? 12 : 7);

            legs[0].rotation.x =
                Math.sin(walkTime) * 0.5;

            legs[1].rotation.x =
                -Math.sin(walkTime) * 0.5;

        } else {

            legs.forEach(leg => {
                leg.rotation.x = 0;
            });
        }

        // Reset keyboard running state
        if (keys["shift"] === true) {
            running = true;
        } else if (joystickPointer === null &&
                   !runButton.matches(":active")) {
            running = false;
            runButton.classList.remove("running");
        }
    }

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

        const delta = Math.min(clock.getDelta(), 0.05);

        updatePlayer(delta);
        updateCamera();

        renderer.render(scene, camera);
    }

    // START
    renderer.render(scene, camera);
    animate();

    loading.style.display = "none";

    console.log("PRISON ESCAPE BRICK 2 READY");

} catch (error) {

    showError(error.message);
    console.error(error);
      }
