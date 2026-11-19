/* ==========================================
   PRISON ESCAPE
   FINAL BUILD — PART 1 OF 5
   WORLD, PRISON LAYOUT AND GATES
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
        loading.style.visibility = "visible";
    }
}

try {
    if (!window.THREE) throw new Error("Three.js failed to load.");

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x30343a);
    scene.fog = new THREE.Fog(0x30343a, 48, 100);

    const camera = new THREE.PerspectiveCamera(
        65, window.innerWidth / window.innerHeight, 0.1, 200
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // ======================================
    // MATERIALS AND LIGHTS
    // ======================================

    const concrete = new THREE.MeshStandardMaterial({
        color: 0x77736b, roughness: 0.96
    });
    const darkConcrete = new THREE.MeshStandardMaterial({
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
    const gateMetal = new THREE.MeshStandardMaterial({
        color: 0x493d32, metalness: 0.6, roughness: 0.7
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

    const lockGold = new THREE.MeshStandardMaterial({
        color: 0xb58a36, metalness: 0.8, roughness: 0.32
    });
    const lockSteel = new THREE.MeshStandardMaterial({
        color: 0x777c80, metalness: 0.85, roughness: 0.3
    });

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

    // ======================================
    // WORLD AND COLLISION OBSTACLES
    // ======================================

    const obstacles = [];

    function addObstacle(x, z, halfW, halfD) {
        obstacles.push({ x, z, halfW, halfD });
    }

    function box(w, h, d, x, y, z, material, solid = true) {
        const mesh = new THREE.Mesh(
            new THREE.BoxGeometry(w, h, d), material
        );
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        if (solid) addObstacle(x, z, w / 2, d / 2);
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
            const r = Math.max(rt, rb);
            addObstacle(x, z, r, r);
        }
        return mesh;
    }

    box(48, 0.5, 58, 0, -0.25, 0, floorMat, false);

    const WALL_H = 8;

    box(48, WALL_H, 1, 0, WALL_H / 2, -28, concrete);
    box(48, WALL_H, 1, 0, WALL_H / 2, 29, concrete);
    box(1, WALL_H, 58, -24, WALL_H / 2, 0, concrete);
    box(1, WALL_H, 58, 24, WALL_H / 2, 0, concrete);

    // ======================================
    // PADLOCK BUILDER
    // ======================================

    function createPadlock(x, y, z, rotationY = 0, parent = scene) {
        const group = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.32, 0.13),
            lockGold
        );
        group.add(body);

        const shackle = new THREE.Mesh(
            new THREE.TorusGeometry(0.09, 0.025, 8, 16, Math.PI),
            lockSteel
        );
        shackle.position.y = 0.20;
        shackle.rotation.z = Math.PI;
        group.add(shackle);

        group.position.set(x, y, z);
        group.rotation.y = rotationY;

        group.traverse(object => {
            if (object.isMesh) {
                object.castShadow = true;
                object.receiveShadow = true;
            }
        });

        parent.add(group);
        return group;
    }

    // ======================================
    // PRISON LAYOUT
    //
    // Two cells on the left.
    // Two cells on the right.
    // A solid divider separates each pair.
    // All four entrances face the corridor.
    // ======================================

    const CELL_H = 5.2;
    const CELL_SIDE_X = 10.5;
    const CELL_BACK_X = 20.5;
    const SIDE_CELL_Z = [-7, 7];
    const SIDE_CELL_LENGTH = 14;

    // Outer walls of the four side cells.
    box(0.45, CELL_H, 42, -CELL_BACK_X, CELL_H / 2, 0, concrete);
    box(0.45, CELL_H, 42, CELL_BACK_X, CELL_H / 2, 0, concrete);

    // Solid dividers between each pair of cells.
    box(10, CELL_H, 0.45, -15.5, CELL_H / 2, 0, concrete);
    box(10, CELL_H, 0.45, 15.5, CELL_H / 2, 0, concrete);

    // Rear walls for the upper and lower cells.
    box(10, CELL_H, 0.45, -15.5, CELL_H / 2, -14, concrete);
    box(10, CELL_H, 0.45, -15.5, CELL_H / 2, 14, concrete);
    box(10, CELL_H, 0.45, 15.5, CELL_H / 2, -14, concrete);
    box(10, CELL_H, 0.45, 15.5, CELL_H / 2, 14, concrete);

    // Your own front cell.
    box(20, CELL_H, 0.45, 0, CELL_H / 2, -26, concrete);
    box(0.45, CELL_H, 10, -10, CELL_H / 2, -21, concrete);
    box(0.45, CELL_H, 10, 10, CELL_H / 2, -21, concrete);

    // ======================================
    // CELL GATE BUILDER
    // ======================================

    const sideCellGates = [];

    function createSideCellGate(x, centerZ, doorGap = 2.2) {
        const gate = new THREE.Group();

        for (
            let z = -doorGap / 2 + 0.14;
            z <= doorGap / 2 - 0.10;
            z += 0.32
        ) {
            const bar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.055, 0.055, 5, 12),
                gateMetal
            );
            bar.position.set(0, 2.5, z);
            bar.castShadow = true;
            gate.add(bar);
        }

        const top = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.16, doorGap),
            gateMetal
        );
        top.position.y = 5.05;
        gate.add(top);

        const bottom = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.16, doorGap),
            gateMetal
        );
        bottom.position.y = 0.25;
        gate.add(bottom);

        gate.position.set(x, 0, centerZ);
        scene.add(gate);

        const lock = createPadlock(
            x < 0 ? 0.18 : -0.18,
            1.35, 0,
            x < 0 ? Math.PI / 2 : -Math.PI / 2,
            gate
        );

        // Fixed bars on either side of the doorway.
        for (let offset = -SIDE_CELL_LENGTH / 2; offset <= SIDE_CELL_LENGTH / 2; offset += 0.38) {
            if (Math.abs(offset) < doorGap / 2 + 0.18) continue;

            cylinder(
                0.055, 0.055, 5,
                x, 2.5, centerZ + offset, metal, true
            );
        }

        box(0.2, 0.18, SIDE_CELL_LENGTH, x, 5.05, centerZ, metal, false);
        box(0.2, 0.18, SIDE_CELL_LENGTH, x, 0.25, centerZ, metal, false);

        sideCellGates.push({
            x,
            centerZ,
            doorGap,
            gate,
            lock,
            unlocked: false,
            opening: false,
            openAmount: 0
        });
    }

    // Left two gates, right two gates.
    createSideCellGate(-CELL_SIDE_X, SIDE_CELL_Z[0]);
    createSideCellGate(-CELL_SIDE_X, SIDE_CELL_Z[1]);
    createSideCellGate(CELL_SIDE_X, SIDE_CELL_Z[0]);
    createSideCellGate(CELL_SIDE_X, SIDE_CELL_Z[1]);

    // ======================================
    // YOUR CELL FRONT GATE
    // ======================================

    const mainCellDoor = new THREE.Group();

    for (let x = -1.05; x <= 1.05; x += 0.35) {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 5, 12),
            gateMetal
        );
        bar.position.set(x, 2.5, 0);
        mainCellDoor.add(bar);
    }

    const mainTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.16, 0.18),
        gateMetal
    );
    mainTop.position.y = 5.05;
    mainCellDoor.add(mainTop);

    const mainBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.16, 0.18),
        gateMetal
    );
    mainBottom.position.y = 0.25;
    mainCellDoor.add(mainBottom);

    mainCellDoor.position.set(0, 0, -16);
    scene.add(mainCellDoor);

    const lockGroup = createPadlock(
        0.88, 1.35, -0.13, 0, mainCellDoor
    );

    // Fixed front bars.
    for (let x = -10; x <= 10; x += 0.36) {
        if (Math.abs(x) < 1.35) continue;
        cylinder(0.055, 0.055, 5, x, 2.5, -16, metal, true);
    }

    box(20, 0.18, 0.2, 0, 5.05, -16, metal, false);
    box(20, 0.18, 0.2, 0, 0.25, -16, metal, false);

    // ======================================
    // CELL FURNITURE
    // ======================================

    function createBed(x, z) {
        box(2.5, 0.25, 1.15, x, 0.78, z, bedMat);
        box(2.35, 0.22, 1.05, x, 1.02, z, mattressMat);

        for (const side of [-1, 1]) {
            box(0.12, 0.75, 0.12,
                x + side * 1.05, 0.38, z, metal);
        }
    }

    function createToilet(x, z) {
        cylinder(0.34, 0.4, 0.38, x, 0.28, z, toiletMat);
        box(0.62, 0.48, 0.55, x, 0.55, z + 0.2, toiletMat);
        box(0.68, 0.08, 0.7, x, 0.83, z, toiletMat);
    }

    function furnishCell(cx, cz, flip = 1) {
        createBed(cx + flip * 2.2, cz - 2.5);
        createToilet(cx - flip * 2.5, cz + 3.5);
        box(1.2, 0.12, 0.45, cx, 1.65, cz + 4, rustyMetal);
    }

    furnishCell(-15.5, -7, 1);
    furnishCell(-15.5, 7, 1);
    furnishCell(15.5, -7, -1);
    furnishCell(15.5, 7, -1);

    createBed(-3.2, -22);
    createToilet(4.2, -24);
    box(1.5, 0.12, 0.45, 0, 1.65, -25, rustyMetal);

    // ======================================
    // MAIN PRISON EXIT GATE
    // ======================================

    const exitGate = new THREE.Group();

    for (let x = -4; x <= 4; x += 0.55) {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.075, 0.075, 5.8, 12),
            metal
        );
        bar.position.set(x, 2.9, 0);
        exitGate.add(bar);
    }

    const exitTop = new THREE.Mesh(
        new THREE.BoxGeometry(9, 0.18, 0.2), rustyMetal
    );
    exitTop.position.y = 5.7;
    exitGate.add(exitTop);

    const exitBottom = new THREE.Mesh(
        new THREE.BoxGeometry(9, 0.18, 0.2), rustyMetal
    );
    exitBottom.position.y = 0.3;
    exitGate.add(exitBottom);

    exitGate.position.set(0, 0, 26);
    scene.add(exitGate);

    const exitLock = createPadlock(4.25, 1.35, -0.18, 0, exitGate);

    // ======================================
    // WALL LIGHTS
    // ======================================

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

    addWallLight(-21, -7);
    addWallLight(21, -7);
    addWallLight(-21, 7);
    addWallLight(21, 7);
    addWallLight(0, -26);
    addWallLight(0, 20);

    // ======================================
    // END OF PART 1
    // PASTE PART 2 DIRECTLY BELOW
    // ======================================
    // ======================================
    // CHARACTER MATERIALS AND HELPERS
    // ======================================

    function charMat(color, roughness = 0.88) {
        return new THREE.MeshStandardMaterial({ color, roughness });
    }

    function characterMesh(parent, geometry, material, x, y, z) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, y, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        parent.add(mesh);
        return mesh;
    }

    // ======================================
    // HUMANOID CHARACTER BUILDER
    // ======================================

    function createHumanoid(config) {
        const group = new THREE.Group();

        const uniform = charMat(config.uniform);
        const pants = charMat(config.pants || config.uniform);
        const skin = charMat(config.skin);
        const hair = charMat(config.hair || 0x25201e);
        const beard = charMat(config.beard || 0x25201e);
        const shoes = charMat(config.shoes || 0x252525);
        const white = charMat(0xf0eee7);
        const dark = charMat(0x171719);

        characterMesh(group, new THREE.BoxGeometry(0.78, 0.88, 0.43),
            uniform, 0, 1.47, 0);

        const chest = characterMesh(
            group, new THREE.SphereGeometry(0.39, 18, 14),
            uniform, 0, 1.65, 0
        );
        chest.scale.set(1, 0.85, 0.62);

        characterMesh(group, new THREE.BoxGeometry(0.62, 0.25, 0.38),
            pants, 0, 0.98, 0);

        characterMesh(group, new THREE.CylinderGeometry(0.105, 0.13, 0.2, 12),
            skin, 0, 1.99, 0);

        const head = characterMesh(
            group, new THREE.SphereGeometry(0.29, 20, 16),
            skin, 0, 2.25, 0
        );
        head.scale.set(config.headWidth || 1, 1, 0.92);

        for (const side of [-1, 1]) {
            characterMesh(group, new THREE.SphereGeometry(0.075, 10, 8),
                skin, side * 0.285, 2.24, 0);

            characterMesh(group, new THREE.BoxGeometry(0.105, 0.025, 0.035),
                hair, side * 0.105, 2.355, -0.258);

            characterMesh(group, new THREE.SphereGeometry(0.035, 8, 8),
                dark, side * 0.105, 2.29, -0.265);
        }

        if (!config.cap) {
            const hairTop = characterMesh(
                group, new THREE.SphereGeometry(0.30, 18, 12),
                hair, 0, 2.43, 0.015
            );
            hairTop.scale.set(1, 0.48, 0.95);
        }

        characterMesh(group, new THREE.SphereGeometry(0.065, 10, 8),
            skin, 0, 2.20, -0.29);

        characterMesh(group, new THREE.BoxGeometry(0.09, 0.018, 0.025),
            dark, 0, 2.105, -0.27);

        if (config.beardStyle && config.beardStyle !== "none") {
            const beardMesh = characterMesh(
                group, new THREE.SphereGeometry(0.20, 16, 12),
                beard, 0, 2.04, -0.13
            );
            beardMesh.scale.set(
                1.05,
                config.beardStyle === "long" ? 1.35 : 0.75,
                0.85
            );

            for (const side of [-1, 1]) {
                characterMesh(group, new THREE.SphereGeometry(0.105, 10, 8),
                    beard, side * 0.105, 2.12, -0.235);
            }
        }

        if (config.mustache) {
            for (const side of [-1, 1]) {
                const moustache = characterMesh(
                    group, new THREE.SphereGeometry(0.09, 10, 8),
                    beard, side * 0.07, 2.14, -0.29
                );
                moustache.scale.set(1.2, 0.45, 0.5);
            }
        }

        if (config.cap) {
            const capMat = charMat(0xe87520);

            characterMesh(group, new THREE.CylinderGeometry(0.29, 0.32, 0.17, 18),
                capMat, 0, 2.50, 0);

            const crown = characterMesh(
                group, new THREE.SphereGeometry(0.29, 18, 12),
                capMat, 0, 2.54, 0.025
            );
            crown.scale.y = 0.43;

            characterMesh(group, new THREE.BoxGeometry(0.42, 0.045, 0.22),
                capMat, 0, 2.49, -0.22);
        }

        // Prison number on the player's uniform.
        if (config.prisonNumber) {
            const numberCanvas = document.createElement("canvas");
            numberCanvas.width = 512;
            numberCanvas.height = 128;

            const ctx = numberCanvas.getContext("2d");
            ctx.fillStyle = "#211a15";
            ctx.font = "bold 76px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(config.prisonNumber, 256, 65);

            const texture = new THREE.CanvasTexture(numberCanvas);
            texture.colorSpace = THREE.SRGBColorSpace;

            const numberMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });

            const number = characterMesh(
                group, new THREE.PlaneGeometry(0.42, 0.105),
                numberMaterial, 0.19, 1.68, -0.235
            );
            number.rotation.y = Math.PI;
        }

        // Arms.
        const arms = [];

        for (const side of [-1, 1]) {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.43, 1.83, 0);
            group.add(shoulder);

            characterMesh(shoulder,
                new THREE.CylinderGeometry(0.13, 0.105, 0.34, 12),
                uniform, 0, -0.17, 0);

            const elbow = new THREE.Group();
            elbow.position.y = -0.34;
            shoulder.add(elbow);

            characterMesh(elbow,
                new THREE.CylinderGeometry(0.085, 0.105, 0.40, 12),
                skin, 0, -0.20, 0);

            characterMesh(elbow, new THREE.SphereGeometry(0.09, 10, 8),
                skin, 0, -0.43, -0.015);

            shoulder.userData.elbow = elbow;
            arms.push(shoulder);
        }

        // Legs.
        const legs = [];

        for (const side of [-1, 1]) {
            const hip = new THREE.Group();
            hip.position.set(side * 0.20, 0.99, 0);
            group.add(hip);

            characterMesh(hip,
                new THREE.CylinderGeometry(0.16, 0.13, 0.55, 12),
                pants, 0, -0.28, 0);

            const lowerLeg = new THREE.Group();
            lowerLeg.position.y = -0.55;
            hip.add(lowerLeg);

            characterMesh(lowerLeg,
                new THREE.CylinderGeometry(0.115, 0.105, 0.48, 12),
                pants, 0, -0.24, 0);

            characterMesh(lowerLeg,
                new THREE.BoxGeometry(0.27, 0.15, 0.40),
                shoes, 0, -0.51, -0.09);

            legs.push(hip);
        }

        return { group, legs, arms };
    }

    // ======================================
    // PLAYER
    // ======================================

    const playerCharacter = createHumanoid({
        uniform: 0xe87520,
        pants: 0xe87520,
        skin: 0x81563f,
        hair: 0x45413d,
        beard: 0xc6c5c0,
        beardStyle: "long",
        mustache: true,
        shoes: 0xf1eee8,
        cap: true,
        prisonNumber: "425679",
        headWidth: 1.02
    });

    const player = playerCharacter.group;
    const legs = playerCharacter.legs;
    const playerArms = playerCharacter.arms;

    player.position.set(0, 0, -21.5);
    scene.add(player);

    // ======================================
    // FOUR OTHER PRISONERS
    // ======================================

    const prisonerDesigns = [
        {
            skin: 0xa96f4e, hair: 0x25201d, beard: 0x292321,
            beardStyle: "short", mustache: true
        },
        {
            skin: 0xd09a72, hair: 0x171719, beard: 0x171719,
            beardStyle: "short", mustache: true
        },
        {
            skin: 0xd09a72, hair: 0x171719, beard: 0x171719,
            beardStyle: "long", mustache: true
        },
        {
            skin: 0x80563f, hair: 0x171717, beard: 0x4b413b,
            beardStyle: "short", mustache: false
        }
    ];

    const prisonerPositions = [
        [-15.5, -7, Math.PI / 2],
        [-15.5, 7, Math.PI / 2],
        [15.5, -7, -Math.PI / 2],
        [15.5, 7, -Math.PI / 2]
    ];

    const otherPrisoners = [];

    prisonerPositions.forEach((position, index) => {
        const character = createHumanoid({
            ...prisonerDesigns[index],
            uniform: 0xd98243,
            pants: 0xc9763a,
            shoes: 0x292522
        });

        character.group.position.set(position[0], 0, position[1]);
        character.group.rotation.y = position[2];
        scene.add(character.group);
        otherPrisoners.push(character);
    });

    // ======================================
    // PRISONER STATES
    // ======================================

    const prisonerStates = otherPrisoners.map((character, index) => ({
        character,
        index,
        leftSide: index < 2,
        centerZ: prisonerPositions[index][1],
        freed: false,
        escaped: false,
        followStage: "locked",
        walkTime: Math.random() * 5,
        wanderTimer: 0,
        targetX: prisonerPositions[index][0],
        targetZ: prisonerPositions[index][1],
        gate: sideCellGates[index]
    }));

    // ======================================
    // GUARD
    // ======================================

    const guardCharacter = createHumanoid({
        uniform: 0x26364b,
        pants: 0x202d40,
        skin: 0xb98260,
        hair: 0x25201e,
        beardStyle: "none",
        shoes: 0x15191e
    });

    const guard = guardCharacter.group;
    const guardLegs = guardCharacter.legs;
    const guardArms = guardCharacter.arms;

    guard.position.set(0, 0, 5);
    scene.add(guard);

    const guardHatMaterial = charMat(0x17263a);

    characterMesh(guard,
        new THREE.CylinderGeometry(0.31, 0.33, 0.17, 18),
        guardHatMaterial, 0, 2.50, 0);

    characterMesh(guard,
        new THREE.BoxGeometry(0.40, 0.045, 0.22),
        guardHatMaterial, 0, 2.48, -0.22);

    const beltMat = charMat(0x17191c);

    characterMesh(guard,
        new THREE.BoxGeometry(0.69, 0.11, 0.42),
        beltMat, 0, 1.04, 0);

    characterMesh(guard,
        new THREE.BoxGeometry(0.12, 0.09, 0.035),
        charMat(0xb8a36b), 0, 1.04, -0.22);

    // ======================================
    // KEY HANGING FROM GUARD'S BELT
    // ======================================

    const guardKey = new THREE.Group();

    const keyMaterial = new THREE.MeshStandardMaterial({
        color: 0xffc83d,
        metalness: 0.85,
        roughness: 0.25
    });

    const keyRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.105, 0.025, 8, 16),
        keyMaterial
    );
    keyRing.position.y = 0.12;
    guardKey.add(keyRing);

    const keyShaft = new THREE.Mesh(
        new THREE.BoxGeometry(0.045, 0.27, 0.045),
        keyMaterial
    );
    keyShaft.position.y = -0.06;
    guardKey.add(keyShaft);

    const keyTooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.045, 0.045),
        keyMaterial
    );
    keyTooth.position.set(0.04, -0.16, 0);
    guardKey.add(keyTooth);

    guardKey.position.set(0.43, 1.05, -0.25);
    guard.add(guardKey);

    const keyLoop = new THREE.Mesh(
        new THREE.TorusGeometry(0.10, 0.025, 8, 16),
        beltMat
    );
    keyLoop.position.set(0.43, 1.17, -0.23);
    guard.add(keyLoop);

    // ======================================
    // END OF PART 2
    // PASTE PART 3 DIRECTLY BELOW
    // ======================================
    // ======================================
    // GAME STATES AND MOVEMENT SETTINGS
    // ======================================

    const playerRadius = 0.38;
    const guardRadius = 0.43;
    const prisonerRadius = 0.34;

    const walkSpeed = 3.5;

    let hasKey = false;
    let mainDoorOpen = false;
    let doorOpening = false;
    let doorOpenAmount = 0;

    let exitGateOpen = false;
    let exitGateOpening = false;
    let exitGateOpenAmount = 0;

    let escaped = false;

    let guardState = "patrol";
    let guardStateTimer = 0;
    let guardDirection = 1;
    let guardLookingAway = false;
    let guardWalkTime = 0;

    const guardSpeed = 1.15;
    const guardMinZ = -13.5;
    const guardMaxZ = 20;

    let moveX = 0;
    let moveY = 0;

    const keys = {};
    const clock = new THREE.Clock();

    // ======================================
    // COLLISION WITH STATIC OBSTACLES
    // ======================================

    function collidesWithObstacle(x, z, radius = playerRadius) {
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

            if (dx * dx + dz * dz < radius * radius) {
                return true;
            }
        }

        return false;
    }

    // ======================================
    // CLOSED CELL GATE COLLISION
    // ======================================

    function crossesClosedSideGate(oldX, newX, z) {
        for (const gate of sideCellGates) {
            if (gate.unlocked) continue;

            const crossed =
                (oldX < gate.x && newX >= gate.x) ||
                (oldX > gate.x && newX <= gate.x);

            if (
                crossed &&
                Math.abs(z - gate.centerZ) <
                gate.doorGap / 2 + 0.12
            ) {
                return true;
            }
        }

        return false;
    }

    function crossesMainCellDoor(oldZ, newZ, x) {
        return (
            !mainDoorOpen &&
            Math.abs(x) < 1.35 &&
            (
                (oldZ < -16 && newZ >= -16) ||
                (oldZ > -16 && newZ <= -16)
            )
        );
    }

    function crossesExitDoor(oldZ, newZ, x) {
        return (
            !exitGateOpen &&
            Math.abs(x) < 4.5 &&
            (
                (oldZ < 26 && newZ >= 26) ||
                (oldZ > 26 && newZ <= 26)
            )
        );
    }

    // ======================================
    // DYNAMIC CHARACTER COLLISION
    // ======================================

    function getDynamicCharacters() {
        const list = [
            {
                group: player,
                radius: playerRadius,
                type: "player"
            },
            {
                group: guard,
                radius: guardRadius,
                type: "guard"
            }
        ];

        prisonerStates.forEach(state => {
            if (state.escaped) return;

            list.push({
                group: state.character.group,
                radius: prisonerRadius,
                type: "prisoner",
                state
            });
        });

        return list;
    }

    function isCharacterBlocked(x, z, radius, ignoredGroup = null) {
        const characters = getDynamicCharacters();

        for (const item of characters) {
            if (item.group === ignoredGroup) continue;

            const dx = x - item.group.position.x;
            const dz = z - item.group.position.z;
            const minimum = radius + item.radius;

            if (dx * dx + dz * dz < minimum * minimum) {
                return true;
            }
        }

        return false;
    }

    // Resolve small overlaps after movement.
    // Characters are pushed apart instead of passing through.
    function resolveCharacterCollisions() {
        const characters = getDynamicCharacters();

        for (let pass = 0; pass < 3; pass++) {
            for (let i = 0; i < characters.length; i++) {
                for (let j = i + 1; j < characters.length; j++) {
                    const a = characters[i];
                    const b = characters[j];

                    // Locked prisoners remain inside their cells.
                    if (
                        a.type === "prisoner" &&
                        !a.state.freed
                    ) continue;

                    if (
                        b.type === "prisoner" &&
                        !b.state.freed
                    ) continue;

                    const dx = b.group.position.x - a.group.position.x;
                    const dz = b.group.position.z - a.group.position.z;
                    const distance = Math.hypot(dx, dz);
                    const minimum = a.radius + b.radius;

                    if (distance >= minimum) continue;

                    let nx = 1;
                    let nz = 0;

                    if (distance > 0.0001) {
                        nx = dx / distance;
                        nz = dz / distance;
                    }

                    const overlap = minimum - distance + 0.002;

                    // Both characters share the correction.
                    a.group.position.x -= nx * overlap * 0.5;
                    a.group.position.z -= nz * overlap * 0.5;
                    b.group.position.x += nx * overlap * 0.5;
                    b.group.position.z += nz * overlap * 0.5;
                }
            }
        }

        // Keep the player inside the world.
        player.position.x = THREE.MathUtils.clamp(
            player.position.x, -23, 23
        );
        player.position.z = THREE.MathUtils.clamp(
            player.position.z, -27, 28
        );
    }

    // ======================================
    // SAFE CHARACTER MOVEMENT
    // ======================================

    function moveCharacter(group, dx, dz, radius, options = {}) {
        const oldX = group.position.x;
        const oldZ = group.position.z;

        const nextX = oldX + dx;

        const blockedX =
            collidesWithObstacle(nextX, oldZ, radius) ||
            crossesClosedSideGate(oldX, nextX, oldZ) ||
            crossesMainCellDoor(oldZ, oldZ, nextX) ||
            crossesExitDoor(oldZ, oldZ, nextX) ||
            isCharacterBlocked(nextX, oldZ, radius, group);

        if (!blockedX) {
            group.position.x = nextX;
        }

        const currentX = group.position.x;
        const nextZ = oldZ + dz;

        const blockedZ =
            collidesWithObstacle(currentX, nextZ, radius) ||
            crossesMainCellDoor(oldZ, nextZ, currentX) ||
            crossesExitDoor(oldZ, nextZ, currentX) ||
            isCharacterBlocked(currentX, nextZ, radius, group);

        if (!blockedZ) {
            group.position.z = nextZ;
        }

        return Math.hypot(
            group.position.x - oldX,
            group.position.z - oldZ
        );
    }

    // ======================================
    // CHARACTER WALK ANIMATION
    // ======================================

    function animateCharacter(character, time, speed = 5) {
        const swing = Math.sin(time * speed) * 0.32;

        character.legs[0].rotation.x = swing;
        character.legs[1].rotation.x = -swing;
        character.arms[0].rotation.x = -swing * 0.65;
        character.arms[1].rotation.x = swing * 0.65;
    }

    function stopCharacter(character) {
        character.legs.forEach(leg => {
            leg.rotation.x = 0;
        });

        character.arms.forEach(arm => {
            arm.rotation.x = 0;
            arm.rotation.z = 0;
            arm.userData.elbow.rotation.x = 0;
        });

        character.group.position.y = 0;
    }

    // ======================================
    // GUARD PATROL ANIMATION
    // ======================================

    function updateGuard(delta) {
        if (guardState === "patrol") {
            const direction = guardDirection;
            const nextZ = guard.position.z +
                direction * guardSpeed * delta;

            const distanceToPlayer = Math.hypot(
                guard.position.x - player.position.x,
                nextZ - player.position.z
            );

            if (
                distanceToPlayer >
                guardRadius + playerRadius + 0.02
            ) {
                guard.position.z = nextZ;
            }

            guard.rotation.y = direction > 0 ? Math.PI : 0;

            guardWalkTime += delta;
            animateCharacter(guardCharacter, guardWalkTime, 5);

            if (guardDirection > 0 && guard.position.z >= guardMaxZ) {
                guard.position.z = guardMaxZ;
                guardDirection = -1;
            }

            if (guardDirection < 0 && guard.position.z <= guardMinZ) {
                guard.position.z = guardMinZ;
                guardState = "watch";
                guardStateTimer = 3.2;
                guardLookingAway = false;
                guard.rotation.y = 0;
                stopCharacter(guardCharacter);
            }
        } else if (guardState === "watch") {
            guardLookingAway = false;
            guard.rotation.y = 0;
            stopCharacter(guardCharacter);

            guardStateTimer -= delta;

            if (guardStateTimer <= 0) {
                guardState = "lookAway";
                guardStateTimer = 4.5;
                guardLookingAway = true;
                guard.rotation.y = Math.PI;
            }
        } else if (guardState === "lookAway") {
            guardLookingAway = true;
            guard.rotation.y = Math.PI;
            stopCharacter(guardCharacter);

            guardStateTimer -= delta;

            if (guardStateTimer <= 0) {
                guardState = "patrol";
                guardDirection = 1;
                guardLookingAway = false;
            }
        }
    }

    // ======================================
    // PRISONER WANDERING BEFORE RELEASE
    // ======================================

    function updateLockedPrisoner(state, delta) {
        const group = state.character.group;

        state.wanderTimer -= delta;

        if (state.wanderTimer <= 0) {
            state.targetX = THREE.MathUtils.randFloat(
                state.leftSide ? -19.1 : 11.1,
                state.leftSide ? -11.1 : 19.1
            );

            state.targetZ = THREE.MathUtils.randFloat(
                state.centerZ - 5.4,
                state.centerZ + 5.4
            );

            state.wanderTimer = 3 + Math.random() * 4;
        }

        const dx = state.targetX - group.position.x;
        const dz = state.targetZ - group.position.z;
        const distance = Math.hypot(dx, dz);

        if (distance < 0.2) {
            stopCharacter(state.character);
            return;
        }

        const step = Math.min(0.48 * delta, distance);
        const moved = moveCharacter(
            group,
            dx / distance * step,
            dz / distance * step,
            prisonerRadius
        );

        if (moved > 0.001) {
            group.rotation.y = Math.atan2(-dx, -dz);
            state.walkTime += delta;
            animateCharacter(state.character, state.walkTime, 5);
        } else {
            stopCharacter(state.character);
        }
    }

    // ======================================
    // FOLLOWER MOVEMENT
    // ======================================

    function moveFollowerToward(state, targetX, targetZ, delta, speed) {
        const group = state.character.group;

        const dx = targetX - group.position.x;
        const dz = targetZ - group.position.z;
        const distance = Math.hypot(dx, dz);

        if (distance < 0.15) {
            stopCharacter(state.character);
            return false;
        }

        const step = Math.min(speed * delta, distance);
        const moved = moveCharacter(
            group,
            dx / distance * step,
            dz / distance * step,
            prisonerRadius
        );

        if (moved > 0.001) {
            group.rotation.y = Math.atan2(-dx, -dz);
            state.walkTime += delta;
            animateCharacter(state.character, state.walkTime, 5.5);
            return true;
        }

        stopCharacter(state.character);
        return false;
    }

    // ======================================
    // FOLLOWER ESCAPE STAGES
    // ======================================

    function updateFollowingPrisoner(state, delta) {
        const group = state.character.group;

        if (state.escaped) {
            stopCharacter(state.character);
            return;
        }

        const insideX = state.leftSide ? -11.5 : 11.5;
        const outsideX = state.leftSide ? -9.0 : 9.0;

        // Stage 1: approach their own gate from inside.
        if (state.followStage === "toGate") {
            moveFollowerToward(
                state, insideX, state.centerZ, delta, 1.55
            );

            if (
                Math.abs(group.position.x - insideX) < 0.35 &&
                Math.abs(group.position.z - state.centerZ) < 0.5
            ) {
                state.followStage = "throughGate";
            }
            return;
        }

        // Stage 2: pass through their own opened gate.
        if (state.followStage === "throughGate") {
            moveFollowerToward(
                state, outsideX, state.centerZ, delta, 1.7
            );

            if (Math.abs(group.position.x - outsideX) < 0.45) {
                state.followStage = "follow";
            }
            return;
        }

        
// Stage 3: follow behind the player and make sure
// every released prisoner passes through the exit.

if (state.followStage === "follow") {
    const row = Math.floor(state.index / 2);
    const side = state.index % 2 === 0 ? -1 : 1;

    const behind = 1.6 + row * 1.0;
    const lateral = side * 0.85;

    let targetX =
        player.position.x +
        Math.sin(player.rotation.y) * behind +
        Math.cos(player.rotation.y) * lateral;

    let targetZ =
        player.position.z +
        Math.cos(player.rotation.y) * behind -
        Math.sin(player.rotation.y) * lateral;

    const escapeLine = 27.2;

    // Once the player escapes, bring every follower
    // completely through the main prison gate.
    if (exitGateOpen && player.position.z >= escapeLine) {
        targetX = THREE.MathUtils.clamp(
            targetX, -3.2, 3.2
        );

        targetZ = Math.max(
            targetZ, escapeLine + 0.5
        );
    }

    const distance = Math.hypot(
        targetX - group.position.x,
        targetZ - group.position.z
    );

    if (distance > 0.12) {
        moveFollowerToward(
            state, targetX, targetZ, delta, 2.4
        );
    } else {
        stopCharacter(state.character);
        group.rotation.y = player.rotation.y;
    }

    // Register this prisoner as escaped.
    if (exitGateOpen && group.position.z >= escapeLine) {
        state.escaped = true;
        stopCharacter(state.character);
    }
    }
       
    // ======================================
    // UPDATE ALL FOUR PRISONERS
    // ======================================

    function updatePrisoners(delta) {
        for (const state of prisonerStates) {
            if (state.escaped) continue;

            if (state.freed) {
                updateFollowingPrisoner(state, delta);
            } else {
                updateLockedPrisoner(state, delta);
            }
        }
    }

    // ======================================
    // END OF PART 3
    // PASTE PART 4 DIRECTLY BELOW
    // ======================================
    // ======================================
    // MOBILE CONTROLS
    // ======================================

    const joystick = document.getElementById("joystick");
    const thumb = document.getElementById("joystick-thumb");
    const fistButton = document.getElementById("fist-button");
    const actionButton = document.getElementById("action-button");

    if (!joystick || !thumb || !fistButton || !actionButton) {
        throw new Error("Game controls are missing.");
    }

    fistButton.setAttribute("aria-label", "Punch");

    let joystickPointer = null;

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
        if (event.pointerId === joystickPointer) resetJoystick();
    }

    joystick.addEventListener("pointerup", releaseJoystick);
    joystick.addEventListener("pointercancel", releaseJoystick);
    joystick.addEventListener("lostpointercapture", releaseJoystick);

    // ======================================
    // KEYBOARD CONTROLS
    // ======================================

    window.addEventListener("keydown", event => {
        keys[event.key.toLowerCase()] = true;
    });

    window.addEventListener("keyup", event => {
        keys[event.key.toLowerCase()] = false;
    });

    // ======================================
    // PLAYER MOVEMENT
    // ======================================

    let animationTime = 0;
    let punchAnimation = 0;
    let grabAnimation = 0;

    const PUNCH_DURATION = 0.62;
    const GRAB_DURATION = 0.75;

    function smoothStep(edge0, edge1, value) {
        const t = THREE.MathUtils.clamp(
            (value - edge0) / (edge1 - edge0), 0, 1
        );
        return t * t * (3 - 2 * t);
    }

    function movePlayer(dx, dz) {
        if (escaped) return;

        moveCharacter(player, dx, dz, playerRadius);
    }

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

        const moving = length > 0.08 && !escaped;
        let walkSwing = 0;

        if (moving) {
            const forwardX = -Math.sin(cameraYaw);
            const forwardZ = -Math.cos(cameraYaw);

            const rightX = Math.cos(cameraYaw);
            const rightZ = -Math.sin(cameraYaw);

            const dx = rightX * x + forwardX * (-y);
            const dz = rightZ * x + forwardZ * (-y);

            movePlayer(
                dx * walkSpeed * delta,
                dz * walkSpeed * delta
            );

            player.rotation.y = Math.atan2(-dx, -dz);

            animationTime += delta * 7.2;
            walkSwing = Math.sin(animationTime) * 0.34;

            legs[0].rotation.x = walkSwing;
            legs[1].rotation.x = -walkSwing;

            player.position.y =
                Math.abs(Math.sin(animationTime * 2)) * 0.012;
        } else {
            legs[0].rotation.x = 0;
            legs[1].rotation.x = 0;
            player.position.y = 0;
        }

        playerArms[0].rotation.x = -walkSwing * 0.55;
        playerArms[1].rotation.x = walkSwing * 0.55;
        playerArms[0].rotation.z = 0;
        playerArms[1].rotation.z = 0;

        playerArms[0].userData.elbow.rotation.x = 0;
        playerArms[1].userData.elbow.rotation.x = 0;

        // Punch animation.
        if (punchAnimation > 0) {
            punchAnimation = Math.max(0, punchAnimation - delta);

            const progress = 1 - punchAnimation / PUNCH_DURATION;
            const windUp = 1 - smoothStep(0, 0.25, progress);

            const extension =
                smoothStep(0.20, 0.53, progress) *
                (1 - smoothStep(0.58, 1, progress));

            const recovery = smoothStep(0.58, 1, progress);

            const arm = playerArms[1];
            const elbow = arm.userData.elbow;

            arm.rotation.x =
                walkSwing * 0.15 -
                windUp * 0.32 +
                extension * 1.35 -
                recovery * 0.12;

            arm.rotation.z = -0.18 * extension;
            elbow.rotation.x = -0.55 * extension + 0.12 * windUp;
        }

        // Reach animation for stealing the key.
        if (grabAnimation > 0) {
            grabAnimation = Math.max(0, grabAnimation - delta);

            const progress = 1 - grabAnimation / GRAB_DURATION;
            const reach = Math.sin(progress * Math.PI);

            playerArms[1].rotation.x = 1.15 * reach;
            playerArms[1].rotation.z = -0.12 * reach;
            playerArms[1].userData.elbow.rotation.x = -0.25 * reach;
        }
    }

    // ======================================
    // PUNCH BUTTON
    // ======================================

    function performPunch() {
        if (escaped || punchAnimation > 0 || grabAnimation > 0) return;
        punchAnimation = PUNCH_DURATION;
    }

    fistButton.addEventListener("pointerdown", event => {
        event.preventDefault();
        event.stopPropagation();
        performPunch();
    });

    // ======================================
    // INTERACTION DISTANCES
    // ======================================

    function distanceToGuard() {
        return Math.hypot(
            player.position.x - guard.position.x,
            player.position.z - guard.position.z
        );
    }

    function nearMainDoor() {
        return (
            Math.abs(player.position.x) < 2.1 &&
            Math.abs(player.position.z + 17.2) < 1.8
        );
    }

    function nearSideCellGate(gate) {
        return (
            Math.abs(player.position.x - gate.x) < 1.9 &&
            Math.abs(player.position.z - gate.centerZ) < 2.0
        );
    }

    function nearExitGate() {
        return (
            Math.abs(player.position.x) < 4.5 &&
            Math.abs(player.position.z - 24.7) < 1.6
        );
    }

    // ======================================
    // REUSABLE KEY: UNLOCK SIDE CELL
    // ======================================

    function unlockSideCell(gate) {
        if (!hasKey || gate.unlocked) return false;

        gate.unlocked = true;
        gate.opening = true;
        gate.openAmount = 0;
        gate.lock.visible = false;

        const state = prisonerStates.find(
            item => item.gate === gate
        );

        if (state) {
            state.freed = true;
            state.followStage = "toGate";
            state.wanderTimer = 0;
        }

        return true;
    }

    // ======================================
    // INTERACTION PROMPT
    // ======================================

    let interactionMode = null;
    let targetSideGate = null;

    function updateInteractionPrompt() {
        interactionMode = null;
        targetSideGate = null;

        if (escaped) {
            actionButton.hidden = true;
            return;
        }

        // Steal the key while the guard looks away.
        if (
            !hasKey &&
            guardLookingAway &&
            distanceToGuard() < 6.5
        ) {
            interactionMode = "grab";
            actionButton.textContent = "GRAB KEY";
            actionButton.hidden = false;
            return;
        }

        if (hasKey) {
            // Unlock your own cell.
            if (!mainDoorOpen && nearMainDoor()) {
                interactionMode = "unlockMainCell";
                actionButton.textContent = "UNLOCK CELL";
                actionButton.hidden = false;
                return;
            }

            // Unlock any of the four prisoner cells.
            for (const gate of sideCellGates) {
                if (!gate.unlocked && nearSideCellGate(gate)) {
                    targetSideGate = gate;
                    interactionMode = "unlockSideCell";
                    actionButton.textContent = "UNLOCK CELL";
                    actionButton.hidden = false;
                    return;
                }
            }

            // Unlock the main prison exit.
            if (
                mainDoorOpen &&
                !exitGateOpen &&
                nearExitGate()
            ) {
                interactionMode = "unlockExit";
                actionButton.textContent = "OPEN MAIN GATE";
                actionButton.hidden = false;
                return;
            }
        }

        actionButton.hidden = true;
    }

    // ======================================
    // PERFORM INTERACTION
    // ======================================

    function performInteraction() {
        if (escaped) return;

        if (interactionMode === "grab") {
            if (
                hasKey ||
                !guardLookingAway ||
                distanceToGuard() >= 6.5
            ) return;

            hasKey = true;
            guardKey.visible = false;
            grabAnimation = GRAB_DURATION;

            actionButton.hidden = true;
            interactionMode = null;
            return;
        }

        if (interactionMode === "unlockMainCell") {
            if (!hasKey || mainDoorOpen || !nearMainDoor()) return;

            mainDoorOpen = true;
            doorOpening = true;
            doorOpenAmount = 0;
            lockGroup.visible = false;

            actionButton.hidden = true;
            interactionMode = null;
            return;
        }

        if (interactionMode === "unlockSideCell") {
            if (!hasKey || !targetSideGate) return;

            if (nearSideCellGate(targetSideGate)) {
                unlockSideCell(targetSideGate);
            }

            actionButton.hidden = true;
            interactionMode = null;
            targetSideGate = null;
            return;
        }

        if (interactionMode === "unlockExit") {
            if (
                !hasKey ||
                !mainDoorOpen ||
                exitGateOpen ||
                !nearExitGate()
            ) return;

            exitGateOpen = true;
            exitGateOpening = true;
            exitGateOpenAmount = 0;
            exitLock.visible = false;

            actionButton.hidden = true;
            interactionMode = null;
        }
    }

    actionButton.addEventListener("click", performInteraction);

    // ======================================
    // DOOR ANIMATIONS
    // ======================================

    function updateCellDoor(delta) {
        if (!doorOpening) return;

        doorOpenAmount = Math.min(
            doorOpenAmount + delta * 1.5, 1
        );

        mainCellDoor.position.x = doorOpenAmount * 2.8;

        if (doorOpenAmount >= 1) doorOpening = false;
    }

    function updateSideCellGates(delta) {
        for (const gate of sideCellGates) {
            if (!gate.opening) continue;

            gate.openAmount = Math.min(
                gate.openAmount + delta * 1.5, 1
            );

            const direction = gate.x < 0 ? -1 : 1;

            gate.gate.position.x =
                gate.x + direction * gate.openAmount * 2.8;

            if (gate.openAmount >= 1) {
                gate.opening = false;
            }
        }
    }

    function updateExitGate(delta) {
        if (!exitGateOpening) return;

        exitGateOpenAmount = Math.min(
            exitGateOpenAmount + delta * 1.15, 1
        );

        exitGate.position.x = exitGateOpenAmount * 5.5;

        if (exitGateOpenAmount >= 1) {
            exitGateOpening = false;
        }
    }

    // ======================================
    // THIRD-PERSON CAMERA
    // ======================================

    let cameraYaw = 0;
    let cameraPitch = 0.22;

    let cameraDragging = false;
    let cameraPointer = null;
    let previousX = 0;
    let previousY = 0;

    renderer.domElement.addEventListener("pointerdown", event => {
        if (escaped) return;

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
    renderer.domElement.addEventListener("lostpointercapture", stopCamera);

    function updateCamera() {
        const target = new THREE.Vector3(
            player.position.x,
            1.55,
            player.position.z
        );

        const distance = 8.5;

        camera.position.set(
            target.x + Math.sin(cameraYaw) *
                distance * Math.cos(cameraPitch),

            target.y + 1.2 +
                Math.sin(cameraPitch) * distance,

            target.z + Math.cos(cameraYaw) *
                distance * Math.cos(cameraPitch)
        );

        camera.lookAt(target);
    }

    // ======================================
    // END OF PART 4
    // PASTE PART 5 DIRECTLY BELOW
    // ======================================
    // ======================================
    // VICTORY SCREEN
    // ======================================

    const victoryScreen = document.createElement("div");
    victoryScreen.id = "victory-screen";

    const confettiCanvas = document.createElement("canvas");
    confettiCanvas.id = "confetti-canvas";

    const victoryContent = document.createElement("div");
    victoryContent.className = "victory-content";

    const victoryTitle = document.createElement("div");
    victoryTitle.id = "victory-title";
    victoryTitle.textContent = "ESCAPE SUCCESSFULLY!";

    const victorySubtitle = document.createElement("div");
    victorySubtitle.id = "victory-subtitle";
    victorySubtitle.textContent = "NOW WE ALL ARE FREE.";

    const playAgainButton = document.createElement("button");
    playAgainButton.id = "play-again-button";
    playAgainButton.type = "button";
    playAgainButton.textContent = "▶ PLAY AGAIN";

    victoryContent.appendChild(victoryTitle);
    victoryContent.appendChild(victorySubtitle);
    victoryContent.appendChild(playAgainButton);

    victoryScreen.appendChild(confettiCanvas);
    victoryScreen.appendChild(victoryContent);
    document.body.appendChild(victoryScreen);

    // ======================================
    // PLAY AGAIN
    // ======================================

    playAgainButton.addEventListener("click", () => {
        window.location.reload();
    });

    // ======================================
    // CONFETTI EFFECT
    // ======================================

    const confettiContext = confettiCanvas.getContext("2d");
    let confettiParticles = [];
    let confettiAnimationId = null;

    function resizeConfetti() {
        const ratio = Math.min(window.devicePixelRatio || 1, 2);

        confettiCanvas.width =
            Math.floor(window.innerWidth * ratio);

        confettiCanvas.height =
            Math.floor(window.innerHeight * ratio);

        confettiCanvas.style.width = window.innerWidth + "px";
        confettiCanvas.style.height = window.innerHeight + "px";

        confettiContext.setTransform(
            ratio, 0, 0, ratio, 0, 0
        );
    }

    function createConfetti() {
        const colors = [
            "#f3c46c",
            "#ff4e50",
            "#42d392",
            "#4da6ff",
            "#ffffff",
            "#d66efd",
            "#ffd700"
        ];

        confettiParticles = [];

        for (let i = 0; i < 180; i++) {
            confettiParticles.push({
                x: Math.random() * window.innerWidth,
                y: -Math.random() * window.innerHeight,
                size: 4 + Math.random() * 6,
                speedY: 2 + Math.random() * 4,
                speedX: (Math.random() - 0.5) * 2.5,
                rotation: Math.random() * Math.PI,
                rotationSpeed: (Math.random() - 0.5) * 0.15,
                color: colors[
                    Math.floor(Math.random() * colors.length)
                ]
            });
        }
    }

    function animateConfetti() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        confettiContext.clearRect(0, 0, width, height);

        for (const particle of confettiParticles) {
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.rotation += particle.rotationSpeed;

            if (particle.y > height + 20) {
                particle.y = -15;
                particle.x = Math.random() * width;
            }

            if (particle.x < -20) particle.x = width + 20;
            if (particle.x > width + 20) particle.x = -20;

            confettiContext.save();
            confettiContext.translate(particle.x, particle.y);
            confettiContext.rotate(particle.rotation);
            confettiContext.fillStyle = particle.color;

            confettiContext.fillRect(
                -particle.size / 2,
                -particle.size / 2,
                particle.size,
                particle.size * 1.7
            );

            confettiContext.restore();
        }

        confettiAnimationId = requestAnimationFrame(animateConfetti);
    }

    function showVictory() {
        if (escaped) return;

        escaped = true;

        actionButton.hidden = true;
        interactionMode = null;
        cameraDragging = false;

        resetJoystick();

        victoryScreen.classList.add("show");

        resizeConfetti();
        createConfetti();

        if (confettiAnimationId !== null) {
            cancelAnimationFrame(confettiAnimationId);
        }

        animateConfetti();
    }

    // ======================================
    // ESCAPE COMPLETION
    // ======================================

    
function checkEscapeCompletion() {
    if (escaped || !exitGateOpen) return;

    const escapeLine = 27.2;

    // Check whether the player has passed through the main gate.
    const playerEscaped = player.position.z >= escapeLine;

    // Check all four prisoners using their actual positions.
    const allPrisonersEscaped =
        prisonerStates.length === 4 &&
        prisonerStates.every((state) => {
            if (!state.freed || !state.character || !state.character.group) {
                return false;
            }

            const prisonerZ = state.character.group.position.z;

            // Automatically update the escaped status.
            if (prisonerZ >= escapeLine) {
                state.escaped = true;
            }

            return state.escaped;
        });

    // Everyone must be outside the prison.
    if (!playerEscaped || !allPrisonersEscaped) return;

    // Prevent the victory screen from appearing more than once.
    escaped = true;

    // Create the victory screen.
    const victory = document.createElement("div");
    victory.id = "victory-screen";

    Object.assign(victory.style, {
        position: "fixed",
        inset: "0",
        zIndex: "99999",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "rgba(0, 0, 0, 0.88)",
        color: "#ffffff",
        textAlign: "center",
        padding: "24px",
        fontFamily: "Arial, sans-serif"
    });

    const title = document.createElement("h1");
    title.textContent = "ESCAPE SUCCESSFULLY!";
    Object.assign(title.style, {
        color: "#f5b942",
        fontSize: "clamp(28px, 7vw, 48px)",
        marginBottom: "18px"
    });

    const message = document.createElement("p");
    message.textContent = "NOW WE ALL ARE FREE.";
    Object.assign(message.style, {
        fontSize: "clamp(18px, 4vw, 25px)",
        marginBottom: "35px"
    });

    const playAgain = document.createElement("button");
    playAgain.textContent = "▶ PLAY AGAIN";

    Object.assign(playAgain.style, {
        padding: "16px 32px",
        border: "none",
        borderRadius: "10px",
        background: "#d4a017",
        color: "#17120a",
        fontSize: "18px",
        fontWeight: "bold",
        cursor: "pointer"
    });

    playAgain.addEventListener("click", () => {
        window.location.reload();
    });

    victory.appendChild(title);
    victory.appendChild(message);
    victory.appendChild(playAgain);

    document.body.appendChild(victory);

    console.log("PRISON ESCAPE: ALL FIVE CHARACTERS ESCAPED!");
       }
   
    // ======================================
    // RESET INPUT WHEN APP LOSES FOCUS
    // ======================================

    function resetControls() {
        resetJoystick();

        cameraDragging = false;
        cameraPointer = null;

        for (const key in keys) {
            keys[key] = false;
        }
    }


    // ======================================
    // ESCAPE COMPLETION
    // ======================================

    function checkEscapeCompletion() {
        // Do nothing if the game has already ended
        // or the main prison gate is still closed.
        if (escaped || !exitGateOpen) return;

        const escapeLine = 27.2;

        // Check whether the player has escaped.
        const playerEscaped =
            player.position.z >= escapeLine;

        // Check whether all four prisoners have escaped.
        const allPrisonersEscaped =
            prisonerStates.length === 4 &&
            prisonerStates.every((state) => {
                if (
                    !state.freed ||
                    !state.character ||
                    !state.character.group
                ) {
                    return false;
                }

                const prisonerZ =
                    state.character.group.position.z;

                // Mark the prisoner as escaped
                // only after passing through the main gate.
                if (prisonerZ >= escapeLine) {
                    state.escaped = true;
                }

                return state.escaped;
            });

        // Show victory only when the player
        // and all four freed prisoners are outside.
        if (!playerEscaped || !allPrisonersEscaped) {
            return;
        }

        console.log(
            "PRISON ESCAPE: ALL FIVE CHARACTERS ESCAPED!"
        );

        // Display the existing victory screen.
        // This includes the victory message,
        // confetti and Play Again button.
        showVictory();
    }
       
    // ======================================
    // MAIN GAME LOOP
    // ======================================

    function animate() {
        requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.05);

        if (!escaped) {
            updatePlayer(delta);
            updatePrisoners(delta);
            updateGuard(delta);

            // Resolve physical contact between characters.
            resolveCharacterCollisions();

            updateInteractionPrompt();

            updateCellDoor(delta);
            updateSideCellGates(delta);
            updateExitGate(delta);

            checkEscapeCompletion();
        }

        updateCamera();
        renderer.render(scene, camera);
    }

    // ======================================
    // START GAME
    // ======================================

    resizeConfetti();
    updateCamera();
    renderer.render(scene, camera);
    animate();

    if (loading) {
        loading.classList.add("hidden");

        setTimeout(() => {
            loading.style.display = "none";
        }, 600);
    }

    console.log("PRISON ESCAPE — FINAL FIVE-PART BUILD LOADED");

} catch (error) {
    showError(error.message);
}
