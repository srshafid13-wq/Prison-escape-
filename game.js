/* ==========================================
   PRISON ESCAPE
   BRICK 1 — U-SHAPED PRISON ARCHITECTURE

   5 CELLS
   CELL 3 = PLAYER CELL
   THIRD-PERSON CAMERA
   MOBILE JOYSTICK + RUN
========================================== */

"use strict";

const container = document.getElementById("game-container");
const loading = document.getElementById("loading-screen");
const loadingText = document.querySelector(".loading-text");
// Always show intro when the page loads.
if (loading) {
    loading.style.display = "flex";
    loading.style.opacity = "1";
}

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
    if (!container) throw new Error("Game container missing.");

    // ==========================================
    // SCENE
    // ==========================================

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x25282b);
    scene.fog = new THREE.Fog(0x25282b, 35, 75);

    const camera = new THREE.PerspectiveCamera(
        65,
        window.innerWidth / window.innerHeight,
        0.1,
        150
    );

    const renderer = new THREE.WebGLRenderer({
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ==========================================
    // MATERIALS
    // ==========================================

    const concrete = new THREE.MeshStandardMaterial({
        color: 0x686762,
        roughness: 0.98
    });

    const floorMat = new THREE.MeshStandardMaterial({
        color: 0x55534e,
        roughness: 1
    });

    const darkConcrete = new THREE.MeshStandardMaterial({
        color: 0x343638,
        roughness: 1
    });

    const metal = new THREE.MeshStandardMaterial({
        color: 0x25292c,
        metalness: 0.75,
        roughness: 0.48
    });

    const rustyMetal = new THREE.MeshStandardMaterial({
        color: 0x59483b,
        metalness: 0.55,
        roughness: 0.8
    });

    const bedMat = new THREE.MeshStandardMaterial({
        color: 0x777b78,
        roughness: 0.9
    });

    const mattressMat = new THREE.MeshStandardMaterial({
        color: 0xaaa69a,
        roughness: 1
    });

    const toiletMat = new THREE.MeshStandardMaterial({
        color: 0xc5c4bb,
        roughness: 0.65
    });

    const orangeMat = new THREE.MeshStandardMaterial({
        color: 0xe87520,
        roughness: 0.9
    });

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0xb77d59,
        roughness: 0.9
    });

    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x191a1c,
        roughness: 0.9
    });

    const lightMat = new THREE.MeshStandardMaterial({
        color: 0xffd18a,
        emissive: 0xffa43b,
        emissiveIntensity: 1.3
    });

    // ==========================================
    // LIGHTING
    // ==========================================

    scene.add(new THREE.HemisphereLight(
        0xc4c9d0,
        0x292522,
        1.15
    ));

    const ceilingLight = new THREE.PointLight(
        0xffc078,
        95,
        38,
        2
    );

    ceilingLight.position.set(0, 8, 1);
    ceilingLight.castShadow = true;
    scene.add(ceilingLight);

    function addWallLight(x, z) {
        const lamp = new THREE.Mesh(
            new THREE.BoxGeometry(0.55, 0.35, 0.2),
            lightMat
        );

        lamp.position.set(x, 4.2, z);
        scene.add(lamp);

        const glow = new THREE.PointLight(0xffb866, 18, 13, 2);
        glow.position.set(x, 3.9, z);
        scene.add(glow);
    }

    // ==========================================
    // OBJECT HELPERS
    // ==========================================

    function box(w, h, d, x, y, z, mat, cast = true) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d),
            mat
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = cast;
        mesh.receiveShadow = true;
        scene.add(mesh);

        return mesh;
    }

    function cylinder(rt, rb, h, x, y, z, mat) {
        const mesh = new THREE.Mesh(
            new THREE.CylinderGeometry(rt, rb, h, 12),
            mat
        );

        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        scene.add(mesh);

        return mesh;
    }

    // ==========================================
    // FLOOR
    // ==========================================

    box(44, 0.5, 44, 0, -0.25, 0, floorMat, false);

    // Floor sections / subtle concrete panels.
    for (let x = -20; x <= 20; x += 5) {
        for (let z = -20; z <= 20; z += 5) {
            const line = box(
                0.035, 0.012, 5,
                x, 0.012, z,
                darkConcrete,
                false
            );
        }
    }

    // ==========================================
    // OUTER PRISON WALLS
    // ==========================================

    const WALL_H = 7;
    const WALL_T = 1;

    box(44, WALL_H, WALL_T, 0, WALL_H / 2, -22, concrete);
    box(44, WALL_H, WALL_T, 0, WALL_H / 2, 22, concrete);

    box(WALL_T, WALL_H, 44, -22, WALL_H / 2, 0, concrete);
    box(WALL_T, WALL_H, 44, 22, WALL_H / 2, 0, concrete);

    // ==========================================
    // CEILING BEAMS
    // ==========================================

    for (let z = -18; z <= 18; z += 9) {
        box(43, 0.35, 0.45, 0, 6.6, z, darkConcrete);
    }

    // ==========================================
    // CELL WALL HELPERS
    // ==========================================

    function wallX(x, z, length, height = 4.5) {
        box(0.45, height, length, x, height / 2, z, concrete);
    }

    function wallZ(x, z, length, height = 4.5) {
        box(length, height, 0.45, x, height / 2, z, concrete);
    }

    // ==========================================
    // U-SHAPED CELL BLOCK
    //
    // LEFT:  CELL 1 + CELL 2
    // BACK:  CELL 3 (LARGEST)
    // RIGHT: CELL 4 + CELL 5
    // ==========================================

    // LEFT SIDE — OUTER WALLS
    wallX(-17, -8, 25);
    wallZ(-17, -15.5, 10);
    wallZ(-17, -0.5, 10);

    // LEFT CELL DIVIDER
    wallZ(-17, -8, 10);

    // RIGHT SIDE — OUTER WALLS
    wallX(17, -8, 25);
    wallZ(17, -15.5, 10);
    wallZ(17, -0.5, 10);

    // RIGHT CELL DIVIDER
    wallZ(17, -8, 10);

    // BACK — LARGE CELL 3
    wallZ(0, -17, 32);
    wallX(0, -17, 10);

    // CELL 3 DIVIDING WALLS
    wallX(-5.8, -17, 10);
    wallX(5.8, -17, 10);

    // ==========================================
    // BARRED CELL FRONTS
    // ==========================================

    function createBarsOnX(x, z, width, doorGap = 1.5) {
        // Bars face the central corridor.
        const spacing = 0.35;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;

            cylinder(
                0.055, 0.055, 4.1,
                x, 2.05, z + offset,
                metal
            );
        }

        // Upper and lower horizontal rails.
        box(0.18, 0.16, width, x, 4.1, z, metal);
        box(0.18, 0.16, width, x, 0.35, z, metal);

        // Door frame.
        box(0.25, 4.2, 0.18, x, 2.1, z - doorGap / 2, rustyMetal);
        box(0.25, 4.2, 0.18, x, 2.1, z + doorGap / 2, rustyMetal);

        // Door bars.
        for (let dz = -doorGap / 2 + 0.15; dz < doorGap / 2; dz += 0.3) {
            cylinder(0.055, 0.055, 4.0, x, 2.0, z + dz, rustyMetal);
        }
    }

    function createBarsOnZ(x, z, width, doorGap = 2.0) {
        const spacing = 0.38;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;

            cylinder(
                0.055, 0.055, 4.1,
                x + offset, 2.05, z,
                metal
            );
        }

        box(width, 0.16, 0.18, x, 4.1, z, metal);
        box(width, 0.16, 0.18, x, 0.35, z, metal);

        box(0.18, 4.2, 0.25, x - doorGap / 2, 2.1, z, rustyMetal);
        box(0.18, 4.2, 0.25, x + doorGap / 2, 2.1, z, rustyMetal);

        for (let dx = -doorGap / 2 + 0.15; dx < doorGap / 2; dx += 0.3) {
            cylinder(0.055, 0.055, 4.0, x + dx, 2.0, z, rustyMetal);
        }
    }

    // Cell fronts.
    // Left cells face toward the right.
    createBarsOnX(-11.5, -8, 8);
    createBarsOnX(-11.5, 7, 8);

    // Right cells face toward the left.
    createBarsOnX(11.5, -8, 8);
    createBarsOnX(11.5, 7, 8);

    // Large central Cell 3 faces the courtyard.
    createBarsOnZ(0, -11.5, 11, 2.4);

    // ==========================================
    // CELL INTERIOR FURNITURE
    // ==========================================

    function createBed(x, z) {
        box(2.6, 0.25, 1.1, x, 0.8, z, metal);
        box(2.45, 0.25, 1.0, x, 1.05, z, mattressMat);

        for (const side of [-1, 1]) {
            box(0.12, 0.8, 0.12, x + side * 1.05, 0.4, z, metal);
        }
    }

    function createToilet(x, z) {
        cylinder(0.38, 0.4, 0.35, x, 0.3, z, toiletMat);
        box(0.65, 0.45, 0.55, x, 0.65, z + 0.25, toiletMat);
        box(0.7, 0.08, 0.7, x, 0.9, z, toiletMat);
    }

    function createCellInterior(cx, cz, bedX, bedZ) {
        createBed(cx + bedX, cz + bedZ);
        createToilet(cx - bedX * 0.7, cz - bedZ * 0.7);

        // Small wall-mounted shelf.
        box(1.2, 0.12, 0.45, cx, 1.7, cz - 3.5, rustyMetal);
    }

    // Left side cells.
    createCellInterior(-17, -8, -1.5, -2);
    createCellInterior(-17, 7, -1.5, -2);

    // Right side cells.
    createCellInterior(17, -8, 1.5, -2);
    createCellInterior(17, 7, 1.5, -2);

    // Large central cell.
    createBed(-2.8, -16);
    createToilet(4.1, -19.0);
    box(1.5, 0.12, 0.5, 0, 1.7, -20, rustyMetal);

    // ==========================================
    // PRISONERS IN THE FOUR OTHER CELLS
    // ==========================================

    function createPrisoner(x, z, rotation = 0) {
        const person = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.75, 1.15, 0.42),
            orangeMat
        );
        body.position.y = 1.25;
        person.add(body);

        const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.3, 16, 12),
            skinMat
        );
        head.position.y = 2.05;
        person.add(head);

        const legs = new THREE.Mesh(
            new THREE.BoxGeometry(0.65, 0.75, 0.38),
            orangeMat
        );
        legs.position.y = 0.38;
        person.add(legs);

        person.position.set(x, 0, z);
        person.rotation.y = rotation;
        scene.add(person);
        return person;
    }

    createPrisoner(-17, -10, Math.PI / 2);
    createPrisoner(-17, 5, Math.PI / 2);
    createPrisoner(17, -10, -Math.PI / 2);
    createPrisoner(17, 5, -Math.PI / 2);

    // ==========================================
    // MAIN PRISON EXIT GATE
    // ==========================================

    box(8, 0.5, 0.6, 0, 6.4, 21.3, darkConcrete);

    for (let x = -3.5; x <= 3.5; x += 0.55) {
        cylinder(0.08, 0.08, 5.5, x, 2.75, 21, metal);
    }

    box(8, 0.18, 0.2, 0, 5.5, 21, rustyMetal);
    box(8, 0.18, 0.2, 0, 0.3, 21, rustyMetal);

    // ==========================================
    // WALL LIGHTS
    // ==========================================

    addWallLight(-17, -16);
    addWallLight(-17, 0);
    addWallLight(17, -16);
    addWallLight(17, 0);
    addWallLight(0, -20);
    addWallLight(0, 12);

    // ==========================================
    // PLAYER CHARACTER
    // ==========================================

    const player = new THREE.Group();

    const torso = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 1.05, 0.48),
        orangeMat
    );
    torso.position.y = 1.45;
    player.add(torso);

    const head = new THREE.Mesh(
        new THREE.SphereGeometry(0.34, 20, 16),
        skinMat
    );
    head.position.y = 2.25;
    player.add(head);

    const hair = new THREE.Mesh(
        new THREE.SphereGeometry(0.35, 16, 12),
        blackMat
    );
    hair.scale.y = 0.5;
    hair.position.y = 2.42;
    player.add(hair);

    const beard = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 14, 10),
        blackMat
    );
    beard.scale.y = 0.65;
    beard.position.set(0, 2.03, -0.16);
    player.add(beard);

    const legs = [];

    for (const side of [-1, 1]) {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.85, 0.38),
            orangeMat
        );

        leg.position.set(side * 0.22, 0.48, 0);
        player.add(leg);
        legs.push(leg);

        const shoe = new THREE.Mesh(
            new THREE.BoxGeometry(0.38, 0.18, 0.5),
            blackMat
        );

        shoe.position.set(side * 0.22, 0.05, -0.08);
        player.add(shoe);
    }

    player.position.set(0, 0, -16);
    scene.add(player);

    // ==========================================
    // PLAYER MOVEMENT
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
    const runSpeed = 6.0;
    const clock = new THREE.Clock();

    // Cell 3 movement boundary.
    // The player stays inside Cell 3 in this architecture brick.
    const cellBounds = {
        minX: -5.2,
        maxX: 5.2,
        minZ: -21.0,
        maxZ: -12.0
    };

    // ==========================================
    // JOYSTICK
    // ==========================================

    function updateJoystick(event) {
        const rect = joystick.getBoundingClientRect();

        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        let dx = event.clientX - cx;
        let dy = event.clientY - cy;

        const radius = 34;
        const distance = Math.sqrt(dx * dx + dy * dy);

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
    // CAMERA DRAG
    // ==========================================

    let cameraYaw = 0;
    let cameraPitch = 0.12;
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

        cameraPitch = Math.max(-0.1, Math.min(0.65, cameraPitch));

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
    // KEYBOARD
    // ==========================================

    window.addEventListener("keydown", event => {
        keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", event => {
        keys[event.key.toLowerCase()] = false;
    });

    // ==========================================
    // PLAYER UPDATE
    // ==========================================

    let animationTime = 0;

    function updatePlayer(delta) {
        let x = moveX;
        let y = moveY;

        if (keys["a"] || keys["arrowleft"]) x = -1;
        if (keys["d"] || keys["arrowright"]) x = 1;
        if (keys["w"] || keys["arrowup"]) y = -1;
        if (keys["s"] || keys["arrowdown"]) y = 1;

        const length = Math.sqrt(x * x + y * y);

        if (length > 1) {
            x /= length;
            y /= length;
        }

        const moving = length > 0.08;

        if (moving) {
            const forwardX = -Math.sin(cameraYaw);
            const forwardZ = -Math.cos(cameraYaw);

            const rightX = Math.cos(cameraYaw);
            const rightZ = -Math.sin(cameraYaw);

            const dx = rightX * x + forwardX * (-y);
            const dz = rightZ * x + forwardZ * (-y);

            const speed = (running || keys["shift"]) ? runSpeed : walkSpeed;

            player.position.x += dx * speed * delta;
            player.position.z += dz * speed * delta;

            player.position.x = THREE.MathUtils.clamp(
                player.position.x,
                cellBounds.minX,
                cellBounds.maxX
            );

            player.position.z = THREE.MathUtils.clamp(
                player.position.z,
                cellBounds.minZ,
                cellBounds.maxZ
            );

            player.rotation.y = Math.atan2(-dx, -dz);

            animationTime += delta * (running ? 12 : 8);

legs[0].rotation.x = Math.sin(animationTime) * 0.4;
            legs[1].rotation.x = -Math.sin(animationTime) * 0.4;
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

        const distance = 5.2;

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

    window.addEventListener("blur", () => {
        running = false;
        runningPointer = null;
        runButton.classList.remove("running");
        resetJoystick();
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            running = false;
            runningPointer = null;
            runButton.classList.remove("running");
            resetJoystick();
        }
    });

    // ==========================================
    // GAME LOOP
    // ==========================================

    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.05);

        updatePlayer(delta);
        updateCamera();

        renderer.render(scene, camera);
    }

    updateCamera();
    renderer.render(scene, camera);
    animate();

    if (loading) loading.style.display = "none";

    console.log("PRISON ESCAPE — BRICK 1 READY");

} catch (error) {
    showError(error.message);
}
