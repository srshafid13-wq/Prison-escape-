/* ==========================================
   PRISON ESCAPE
   THIRD-PERSON STEALTH GAME
   CORRECTED BUILD — PART 1 OF 5
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
    if (!container) throw new Error("Game container not found.");

    // ==========================================
    // SCENE
    // ==========================================

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

    // ==========================================
    // MATERIALS
    // ==========================================

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
    const gateMetal = new THREE.MeshStandardMaterial({
        color: 0x493d32, metalness: 0.6, roughness: 0.7
    });

    // ==========================================
    // LIGHTING
    // ==========================================

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

    // ==========================================
    // WORLD AND COLLISIONS
    // ==========================================

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
            addObstacle(x, z, Math.max(rt, rb), Math.max(rt, rb));
        }
        return mesh;
    }

    // ==========================================
    // FLOOR AND OUTER WALLS
    // ==========================================

    box(48, 0.5, 58, 0, -0.25, 0, floorMat, false);

    const WALL_H = 8;

    box(48, WALL_H, 1, 0, WALL_H / 2, -28, concrete);
    box(48, WALL_H, 1, 0, WALL_H / 2, 29, concrete);
    box(1, WALL_H, 58, -24, WALL_H / 2, 0, concrete);
    box(1, WALL_H, 58, 24, WALL_H / 2, 0, concrete);

    for (let x = -22; x <= 22; x += 2) {
        box(0.12, 0.9, 0.12, x, 8.45, -28, oldConcrete, false);
        box(0.12, 0.9, 0.12, x, 8.45, 29, oldConcrete, false);
    }

    // ==========================================
    // FIVE-CELL PRISON LAYOUT
    // ==========================================

    const CELL_BACK_X = 20.5;
    const CELL_H = 5.2;

    function cellSideWall(x, z, length, height = CELL_H) {
        box(0.45, height, length, x, height / 2, z, concrete);
    }

    function cellBackWall(x, z, length, height = CELL_H) {
        box(length, height, 0.45, x, height / 2, z, concrete);
    }

    cellSideWall(-CELL_BACK_X, -9, 34);
    cellBackWall(-15.5, -22.5, 10);
    cellBackWall(-15.5, -12.5, 10);
    cellBackWall(-15.5, -5.5, 10);
    cellBackWall(-15.5, 4.5, 10);

    cellSideWall(CELL_BACK_X, -9, 34);
    cellBackWall(15.5, -22.5, 10);
    cellBackWall(15.5, -12.5, 10);
    cellBackWall(15.5, -5.5, 10);
    cellBackWall(15.5, 4.5, 10);

    cellBackWall(0, -26, 20);
    cellSideWall(-10, -21, 10);
    cellSideWall(10, -21, 10);

    // ==========================================
    // PADLOCK BUILDER
    // ==========================================

    const lockGold = new THREE.MeshStandardMaterial({
        color: 0xb58a36, metalness: 0.8, roughness: 0.32
    });
    const lockSteel = new THREE.MeshStandardMaterial({
        color: 0x777c80, metalness: 0.85, roughness: 0.3
    });

    function createPadlock(x, y, z, rotationY = 0, parent = scene) {
        const group = new THREE.Group();

        const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.25, 0.32, 0.13), lockGold
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

    // ==========================================
    // SIDE CELL GATES
    // All four gates use the same key.
    // No permanent invisible gate obstacles.
    // ==========================================

    const sideCellGates = [];

    function createBarsOnX(x, centerZ, width, doorGap = 1.6) {
        const spacing = 0.34;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;

            // Fixed bars are now physically solid.
            cylinder(
                0.055, 0.055, 5.0,
                x, 2.5, centerZ + offset, metal, true
            );
        }

        box(0.2, 0.18, width, x, 5.05, centerZ, metal, false);
        box(0.2, 0.18, width, x, 0.25, centerZ, metal, false);

        box(0.25, 5.2, 0.22,
            x, 2.6, centerZ - doorGap / 2, rustyMetal, false);
        box(0.25, 5.2, 0.22,
            x, 2.6, centerZ + doorGap / 2, rustyMetal, false);

        const gate = new THREE.Group();

        for (
            let offset = -doorGap / 2 + 0.16;
            offset <= doorGap / 2 - 0.12;
            offset += 0.32
        ) {
            const bar = new THREE.Mesh(
                new THREE.CylinderGeometry(0.055, 0.055, 5.0, 12),
                gateMetal
            );
            bar.position.set(0, 2.5, offset);
            bar.castShadow = true;
            gate.add(bar);
        }

        const topRail = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.16, doorGap), gateMetal
        );
        topRail.position.set(0, 5.05, 0);
        gate.add(topRail);

        const bottomRail = new THREE.Mesh(
            new THREE.BoxGeometry(0.18, 0.16, doorGap), gateMetal
        );
        bottomRail.position.set(0, 0.25, 0);
        gate.add(bottomRail);

        gate.position.set(x, 0, centerZ);
        scene.add(gate);

        const lock = createPadlock(
            x < 0 ? 0.18 : -0.18,
            1.35, 0,
            x < 0 ? Math.PI / 2 : -Math.PI / 2,
            gate
        );

        sideCellGates.push({
            gate,
            lock,
            x,
            centerZ,
            doorGap,
            unlocked: false,
            opening: false,
            openAmount: 0
        });
    }

    // ==========================================
    // PLAYER CELL FRONT BARS
    // ==========================================

    function createBarsOnZ(centerX, z, width, doorGap = 2.4) {
        const spacing = 0.36;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;

            // Fixed bars now block the player.
            cylinder(
                0.055, 0.055, 5.0,
                centerX + offset, 2.5, z, metal, true
            );
        }

        box(width, 0.18, 0.2, centerX, 5.05, z, metal, false);
        box(width, 0.18, 0.2, centerX, 0.25, z, metal, false);

        box(0.22, 5.2, 0.25,
            centerX - doorGap / 2, 2.6, z, rustyMetal, false);
        box(0.22, 5.2, 0.25,
            centerX + doorGap / 2, 2.6, z, rustyMetal, false);
    }

    // Four other prisoner cells.
    createBarsOnX(-10.5, -17.5, 10);
    createBarsOnX(-10.5, -0.5, 10);
    createBarsOnX(10.5, -17.5, 10);
    createBarsOnX(10.5, -0.5, 10);

    // Player cell barred front.
    createBarsOnZ(0, -16, 20, 2.4);

    // ==========================================
    // PLAYER CELL SLIDING GATE
    // ==========================================

    const mainCellDoor = new THREE.Group();

    for (let x = -1.05; x <= 1.05; x += 0.35) {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 5.0, 12),
            gateMetal
        );
        bar.position.set(x, 2.5, 0);
        bar.castShadow = true;
        mainCellDoor.add(bar);
    }

    const playerGateTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.16, 0.18), gateMetal
    );
    playerGateTop.position.y = 5.05;
    mainCellDoor.add(playerGateTop);

    const playerGateBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.16, 0.18), gateMetal
    );
    playerGateBottom.position.y = 0.25;
    mainCellDoor.add(playerGateBottom);

    mainCellDoor.position.set(0, 0, -16);
    scene.add(mainCellDoor);

    const lockGroup = createPadlock(
        0.88, 1.35, -0.13, 0, mainCellDoor
    );

    // ==========================================
    // CELL FURNITURE
    // ==========================================

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

    // ==========================================
    // CHARACTER HELPERS
    // ==========================================

    function makeCharacterMaterial(color, roughness = 0.88) {
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

    // ==========================================
    // HUMANOID BUILDER
    // Character faces local -Z.
    // ==========================================

    function createHumanoid(config) {
        const person = new THREE.Group();

        const uniform = makeCharacterMaterial(config.uniform);
        const pants = makeCharacterMaterial(config.pants || config.uniform);
        const skin = makeCharacterMaterial(config.skin);
        const hair = makeCharacterMaterial(config.hair || 0x292321);
        const beardMat = makeCharacterMaterial(config.beard || 0x292321);
        const shoes = makeCharacterMaterial(config.shoes || 0x252525);
        const dark = makeCharacterMaterial(0x171719);
        const white = makeCharacterMaterial(0xf0eee7);
        const details = makeCharacterMaterial(0xb5a77c, 0.5);

        characterMesh(person, new THREE.BoxGeometry(0.78, 0.88, 0.43),
            uniform, 0, 1.47, 0);

        const chest = characterMesh(person, new THREE.SphereGeometry(0.39, 20, 16),
            uniform, 0, 1.65, 0);
        chest.scale.set(1, 0.85, 0.62);

        characterMesh(person, new THREE.BoxGeometry(0.62, 0.25, 0.38),
            pants, 0, 0.98, 0);

        characterMesh(person, new THREE.CylinderGeometry(0.105, 0.13, 0.2, 12),
            skin, 0, 1.99, 0);

        if (config.undershirt) {
            characterMesh(person, new THREE.BoxGeometry(0.28, 0.16, 0.08),
                white, 0, 1.94, -0.19);
        }

        const head = characterMesh(person, new THREE.SphereGeometry(0.29, 24, 20),
            skin, 0, 2.25, 0);

        head.scale.set(
            config.headWidth || 1,
            config.headHeight || 1,
            config.headDepth || 0.92
        );

        for (const side of [-1, 1]) {
            const ear = characterMesh(person, new THREE.SphereGeometry(0.075, 12, 10),
                skin, side * 0.285, 2.24, 0);
            ear.scale.set(0.65, 1, 0.65);
        }

        if (config.hairStyle !== "bald" && !config.cap) {
            const hairTop = characterMesh(person, new THREE.SphereGeometry(0.30, 20, 14),
                hair, 0, 2.43, 0.015);
            hairTop.scale.set(1, 0.48, 0.95);

            if (config.hairStyle === "long") {
                for (const side of [-1, 1]) {
                    characterMesh(person, new THREE.SphereGeometry(0.12, 12, 10),
                        hair, side * 0.22, 2.28, 0.02);
                }
            }

            if (config.hairStyle === "curly") {
                for (let i = 0; i < 7; i++) {
                    const angle = (i / 7) * Math.PI * 2;
                    characterMesh(person, new THREE.SphereGeometry(0.105, 10, 8),
                        hair, Math.cos(angle) * 0.23, 2.43,
                        Math.sin(angle) * 0.20);
                }
            }
        }

        for (const side of [-1, 1]) {
            const brow = characterMesh(person, new THREE.BoxGeometry(0.105, 0.025, 0.035),
                hair, side * 0.105, 2.355, -0.258);
            brow.rotation.z = side * -0.08;

            characterMesh(person, new THREE.SphereGeometry(0.035, 10, 8),
                dark, side * 0.105, 2.29, -0.265);
        }

        characterMesh(person, new THREE.SphereGeometry(0.065, 12, 10),
            skin, 0, 2.20, -0.29);

        characterMesh(person, new THREE.BoxGeometry(0.09, 0.018, 0.025),
            dark, 0, 2.105, -0.27);

        if (config.beardStyle && config.beardStyle !== "none") {
            const beard = characterMesh(person, new THREE.SphereGeometry(0.20, 18, 14),
                beardMat, 0, 2.04, -0.13);

            beard.scale.set(
                1.05,
                config.beardStyle === "long" ? 1.35 : 0.75,
                0.85
            );

            for (const side of [-1, 1]) {
                characterMesh(person, new THREE.SphereGeometry(0.105, 12, 10),
                    beardMat, side * 0.105, 2.12, -0.235);
            }
        }

        if (config.mustache) {
            for (const side of [-1, 1]) {
                const mustache = characterMesh(person,
                    new THREE.SphereGeometry(0.09, 12, 10),
                    beardMat, side * 0.07, 2.14, -0.29);
                mustache.scale.set(1.2, 0.45, 0.5);
            }
        }

        if (config.cap) {
            const capMat = makeCharacterMaterial(0xe87520);

            characterMesh(person, new THREE.CylinderGeometry(0.29, 0.32, 0.17, 20),
                capMat, 0, 2.50, 0);

            const crown = characterMesh(person, new THREE.SphereGeometry(0.29, 20, 12),
                capMat, 0, 2.54, 0.025);
            crown.scale.y = 0.43;

            characterMesh(person, new THREE.BoxGeometry(0.42, 0.045, 0.22),
                capMat, 0, 2.49, -0.22);
        }

        characterMesh(person, new THREE.BoxGeometry(0.19, 0.22, 0.018),
            uniform, 0.22, 1.48, -0.222);

        for (let y = 1.25; y <= 1.85; y += 0.18) {
            characterMesh(person, new THREE.SphereGeometry(0.018, 8, 8),
                details, -0.015, y, -0.225);
        }

        if (config.prisonNumber) {
            const canvas = document.createElement("canvas");
            canvas.width = 512;
            canvas.height = 128;

            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, 512, 128);
            ctx.fillStyle = "#211a15";
            ctx.font = "bold 76px Arial";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(config.prisonNumber, 256, 65);

            const texture = new THREE.CanvasTexture(canvas);
            texture.colorSpace = THREE.SRGBColorSpace;

            const numberMaterial = new THREE.MeshBasicMaterial({
                map: texture,
                transparent: true,
                side: THREE.DoubleSide
            });

            const number = characterMesh(person, new THREE.PlaneGeometry(0.42, 0.105),
                numberMaterial, 0.19, 1.68, -0.235);
            number.rotation.y = Math.PI;
        }

        const arms = [];

        for (const side of [-1, 1]) {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.43, 1.83, 0);
            person.add(shoulder);

            characterMesh(shoulder, new THREE.CylinderGeometry(0.13, 0.105, 0.34, 12),
                uniform, 0, -0.17, 0);

            const elbow = new THREE.Group();
            elbow.position.y = -0.34;
            shoulder.add(elbow);

            characterMesh(elbow, new THREE.CylinderGeometry(0.085, 0.105, 0.40, 12),
                skin, 0, -0.20, 0);

            const hand = characterMesh(elbow, new THREE.SphereGeometry(0.09, 12, 10),
                skin, 0, -0.43, -0.015);

            shoulder.userData.elbow = elbow;
            shoulder.userData.hand = hand;
            arms.push(shoulder);
        }

        const legs = [];

        for (const side of [-1, 1]) {
            const hip = new THREE.Group();
            hip.position.set(side * 0.20, 0.99, 0);
            person.add(hip);

            characterMesh(hip, new THREE.CylinderGeometry(0.16, 0.13, 0.55, 12),
                pants, 0, -0.28, 0);

            const lowerLeg = new THREE.Group();
            lowerLeg.position.y = -0.55;
            hip.add(lowerLeg);

            characterMesh(lowerLeg, new THREE.CylinderGeometry(0.115, 0.105, 0.48, 12),
                pants, 0, -0.24, 0);

            const shoe = characterMesh(lowerLeg, new THREE.BoxGeometry(0.27, 0.15, 0.40),
                shoes, 0, -0.51, -0.075);
            shoe.position.z = -0.09;

            legs.push(hip);
        }

        return { group: person, legs, arms };
    }

    // ==========================================
    // END OF PART 1
    // PASTE PART 2 DIRECTLY BELOW
    // ===================
  // ==========================================
// FOUR OTHER PRISONERS
// ==========================================

const otherPrisoners = [];

const prisonerDesigns = [
    {
        skin: 0xa96f4e, hair: 0x25201d, beard: 0x292321,
        beardStyle: "short", mustache: true,
        hairStyle: "short", headWidth: 1.05
    },
    {
        skin: 0xd09a72, hair: 0x171719, beard: 0x171719,
        beardStyle: "short", mustache: true,
        hairStyle: "short", headWidth: 1.05
    },
    {
        skin: 0xd09a72, hair: 0x171719, beard: 0x171719,
        beardStyle: "long", mustache: true,
        hairStyle: "long", headWidth: 0.94
    },
    {
        skin: 0x80563f, hair: 0x171717, beard: 0x4b413b,
        beardStyle: "short", mustache: false,
        hairStyle: "bald", headWidth: 1.12
    }
];

const prisonerPositions = [
    [-15.5, -17.5, Math.PI / 2],
    [-15.5, -0.5, Math.PI / 2],
    [15.5, -17.5, -Math.PI / 2],
    [15.5, -0.5, -Math.PI / 2]
];

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

// ==========================================
// EXIT GATE
// ==========================================

const exitGate = new THREE.Group();

for (let x = -4; x <= 4; x += 0.55) {
    const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.075, 0.075, 5.8, 12),
        metal
    );
    bar.position.set(x, 2.9, 0);
    bar.castShadow = true;
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

box(9, 0.5, 0.7, 0, 6.1, 26.5, oldConcrete, false);

// ==========================================
// WALL LIGHTS
// ==========================================

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

// ==========================================
// MAIN PLAYER
// ==========================================

const playerCharacter = createHumanoid({
    uniform: 0xe87520,
    pants: 0xe87520,
    skin: 0x81563f,
    hair: 0x45413d,
    beard: 0xc6c5c0,
    beardStyle: "long",
    mustache: true,
    hairStyle: "short",
    shoes: 0xf1eee8,
    cap: true,
    undershirt: true,
    prisonNumber: "425679",
    headWidth: 1.02
});

const player = playerCharacter.group;
const legs = playerCharacter.legs;
const playerArms = playerCharacter.arms;

player.position.set(0, 0, -21.5);
scene.add(player);

// ==========================================
// GUARD CHARACTER
// ==========================================

const guardCharacter = createHumanoid({
    uniform: 0x26364b,
    pants: 0x202d40,
    skin: 0xb98260,
    hair: 0x25201e,
    beard: 0x25201e,
    beardStyle: "none",
    mustache: false,
    hairStyle: "short",
    shoes: 0x15191e,
    headWidth: 0.98
});

const guard = guardCharacter.group;
const guardLegs = guardCharacter.legs;
const guardArms = guardCharacter.arms;

const guardHatMaterial = makeCharacterMaterial(0x17263a);

characterMesh(guard, new THREE.CylinderGeometry(0.31, 0.33, 0.17, 20),
    guardHatMaterial, 0, 2.50, 0);

characterMesh(guard, new THREE.BoxGeometry(0.40, 0.045, 0.22),
    guardHatMaterial, 0, 2.48, -0.22);

const beltMat = makeCharacterMaterial(0x17191c, 0.55);

characterMesh(guard, new THREE.BoxGeometry(0.69, 0.11, 0.42),
    beltMat, 0, 1.04, 0);

characterMesh(guard, new THREE.BoxGeometry(0.12, 0.09, 0.035),
    makeCharacterMaterial(0xb8a36b, 0.4), 0, 1.04, -0.22);

characterMesh(guard, new THREE.BoxGeometry(0.14, 0.17, 0.025),
    makeCharacterMaterial(0xb5b6b4, 0.5), -0.25, 1.78, -0.225);

characterMesh(guard, new THREE.BoxGeometry(0.11, 0.19, 0.08),
    beltMat, -0.37, 1.23, 0);

const bootMaterial = makeCharacterMaterial(0x111418);

for (const side of [-1, 1]) {
    characterMesh(guard, new THREE.BoxGeometry(0.29, 0.12, 0.42),
        bootMaterial, side * 0.20, 0.045, -0.12);
}

// ==========================================
// KEY ON GUARD'S BELT
// ==========================================

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

guard.position.set(0, 0, 5);
scene.add(guard);

// ==========================================
// END OF PART 2
// PASTE PART 3 DIRECTLY BELOW
// ==========================================
  // ==========================================
// PRISONER AI AND FOLLOWER STATES
// ==========================================

const prisonerStates = otherPrisoners.map((character, index) => {
    const leftSide = index < 2;
    const centerZ = index % 2 === 0 ? -17.5 : -0.5;

    return {
        character,
        index,
        leftSide,
        centerZ,
        minX: leftSide ? -19.3 : 11.3,
        maxX: leftSide ? -11.3 : 19.3,
        minZ: centerZ - 4.1,
        maxZ: centerZ + 4.1,
        targetX: 0,
        targetZ: 0,
        mode: "wander",
        timer: Math.random() * 3 + 1,
        walkTime: Math.random() * 5,

        // Prisoner escape progression.
        freed: false,
        followStage: "locked",
        escaped: false,
        gate: sideCellGates[index]
    };
});

function choosePrisonerTarget(state) {
    const inwardX = state.leftSide ? -11.35 : 11.35;

    if (Math.random() < 0.42) {
        state.targetX = inwardX;
        state.targetZ = THREE.MathUtils.clamp(
            state.centerZ + (Math.random() - 0.5) * 2.2,
            state.minZ,
            state.maxZ
        );
        state.mode = "approach";
    } else {
        state.targetX = THREE.MathUtils.randFloat(
            state.minX + 0.6,
            state.maxX - 0.6
        );
        state.targetZ = THREE.MathUtils.randFloat(
            state.minZ + 0.6,
            state.maxZ - 0.6
        );
        state.mode = "wander";
    }

    state.timer = 4 + Math.random() * 4;
}

prisonerStates.forEach(choosePrisonerTarget);

function animatePrisonerWalk(state, delta, speed = 5) {
    const person = state.character;
    state.walkTime += delta * speed;

    const swing = Math.sin(state.walkTime) * 0.30;

    person.legs[0].rotation.x = swing;
    person.legs[1].rotation.x = -swing;
    person.arms[0].rotation.x = -swing * 0.65;
    person.arms[1].rotation.x = swing * 0.65;

    person.group.position.y = Math.abs(
        Math.sin(state.walkTime * 2)
    ) * 0.012;
}

function stopPrisonerAnimation(state) {
    const person = state.character;

    person.group.position.y = 0;
    person.legs[0].rotation.x = 0;
    person.legs[1].rotation.x = 0;
    person.arms[0].rotation.x = 0;
    person.arms[1].rotation.x = 0;
    person.arms[0].rotation.z = 0;
    person.arms[1].rotation.z = 0;
}

function updatePrisoners(delta) {
    for (const state of prisonerStates) {
        const group = state.character.group;

        if (state.freed) {
            updateFollowingPrisoner(state, delta);
            continue;
        }

        state.timer -= delta;

        const dx = state.targetX - group.position.x;
        const dz = state.targetZ - group.position.z;
        const distance = Math.hypot(dx, dz);

        if (distance > 0.16 && state.mode !== "bars") {
            const speed = state.mode === "approach" ? 0.75 : 0.48;
            const step = Math.min(speed * delta, distance);

            group.position.x += (dx / distance) * step;
            group.position.z += (dz / distance) * step;

            group.position.x = THREE.MathUtils.clamp(
                group.position.x, state.minX, state.maxX
            );
            group.position.z = THREE.MathUtils.clamp(
                group.position.z, state.minZ, state.maxZ
            );

            group.rotation.y = Math.atan2(-dx, -dz);
            animatePrisonerWalk(state, delta, 5);
        } else {
            stopPrisonerAnimation(state);

            if (state.mode === "approach" || state.mode === "wander") {
                state.mode = "bars";
                state.timer = 2.5 + Math.random() * 2.5;

                group.rotation.y = state.leftSide
                    ? -Math.PI / 2
                    : Math.PI / 2;
            }

            if (state.mode === "bars") {
                state.character.arms[0].rotation.x = -1.05;
                state.character.arms[1].rotation.x = -1.05;
                state.character.arms[0].rotation.z =
                    state.leftSide ? -0.12 : 0.12;
                state.character.arms[1].rotation.z =
                    state.leftSide ? -0.12 : 0.12;

                if (state.timer <= 0) {
                    state.character.arms[0].rotation.x = 0;
                    state.character.arms[1].rotation.x = 0;
                    state.character.arms[0].rotation.z = 0;
                    state.character.arms[1].rotation.z = 0;

                    choosePrisonerTarget(state);
                }
            }
        }
    }
}

// ==========================================
// GUARD PATROL AND LOOKING BEHAVIOUR
// ==========================================

let guardWalkTime = 0;
let guardState = "patrol";
let guardStateTimer = 0;
let guardDirection = 1;
let guardLookingAway = false;

const guardSpeed = 1.15;
const guardMinZ = -13.5;
const guardMaxZ = 20;
const guardRadius = 0.43;

function setGuardWalkingAnimation(delta) {
    guardWalkTime += delta * 5;

    const swing = Math.sin(guardWalkTime) * 0.36;

    guardLegs[0].rotation.x = swing;
    guardLegs[1].rotation.x = -swing;
    guardArms[0].rotation.x = -swing * 0.6;
    guardArms[1].rotation.x = swing * 0.6;
}

function updateGuard(delta) {
    if (guardState === "patrol") {
        const nextZ = guard.position.z +
            guardDirection * guardSpeed * delta;

        // Guard physically stops instead of walking through the player.
        const playerDistance = Math.hypot(
            guard.position.x - player.position.x,
            nextZ - player.position.z
        );

        if (playerDistance > guardRadius + playerRadius + 0.03) {
            guard.position.z = nextZ;
        }

        guard.rotation.y = guardDirection > 0 ? Math.PI : 0;
        setGuardWalkingAnimation(delta);

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
        }
    } else if (guardState === "watch") {
        guardLookingAway = false;
        guard.rotation.y = 0;

        guardLegs.forEach(leg => leg.rotation.x = 0);
        guardArms.forEach(arm => arm.rotation.x = 0);

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

        guardLegs.forEach(leg => leg.rotation.x = 0);
        guardArms.forEach(arm => arm.rotation.x = 0);

        guardStateTimer -= delta;

        if (guardStateTimer <= 0) {
            guardState = "patrol";
            guardDirection = 1;
            guardLookingAway = false;
        }
    }
}

// ==========================================
// PLAYER INPUT
// ==========================================

const joystick = document.getElementById("joystick");
const thumb = document.getElementById("joystick-thumb");
const fistButton = document.getElementById("fist-button");
const actionButton = document.getElementById("action-button");
const keyStatus = document.getElementById("key-status");

if (keyStatus) {
    keyStatus.hidden = true;
    keyStatus.style.display = "none";
}

if (!joystick || !thumb || !fistButton || !actionButton) {
    throw new Error("One or more game controls are missing.");
}

fistButton.textContent = "👊";
fistButton.setAttribute("aria-label", "Punch");
fistButton.setAttribute("title", "Punch");
fistButton.style.fontSize = "29px";
fistButton.style.lineHeight = "1";
fistButton.style.display = "flex";
fistButton.style.alignItems = "center";
fistButton.style.justifyContent = "center";

let moveX = 0;
let moveY = 0;
let joystickPointer = null;

const keys = {};
const walkSpeed = 3.5;
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
    if (event.pointerId === joystickPointer) resetJoystick();
}

joystick.addEventListener("pointerup", releaseJoystick);
joystick.addEventListener("pointercancel", releaseJoystick);
joystick.addEventListener("lostpointercapture", releaseJoystick);

// ==========================================
// KEYBOARD CONTROLS
// ==========================================

window.addEventListener("keydown", event => {
    keys[event.key.toLowerCase()] = true;
});

window.addEventListener("keyup", event => {
    keys[event.key.toLowerCase()] = false;
});

// ==========================================
// COLLISION HELPERS
// ==========================================

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

function collidesWithGuard(x, z) {
    const distance = Math.hypot(
        x - guard.position.x,
        z - guard.position.z
    );

    return distance < playerRadius + guardRadius;
}

// A closed side-cell gate blocks movement in either direction.
function crossesClosedSideGate(oldX, newX, z) {
    for (const gate of sideCellGates) {
        if (gate.unlocked) continue;

        const crossed =
            (oldX < gate.x && newX >= gate.x) ||
            (oldX > gate.x && newX <= gate.x);

        if (
            crossed &&
            Math.abs(z - gate.centerZ) < gate.doorGap / 2 + 0.05
        ) {
            return true;
        }
    }

    return false;
}

// ==========================================
// DOOR AND ESCAPE STATES
// ==========================================

let mainDoorOpen = false;
let doorOpening = false;
let doorOpenAmount = 0;

let exitGateOpen = false;
let exitGateOpening = false;
let exitGateOpenAmount = 0;

let escaped = false;

let hasKey = false;
let interactionMode = null;
let grabAnimation = 0;
let punchAnimation = 0;

const PUNCH_DURATION = 0.62;
const GRAB_DURATION = 0.75;

// ==========================================
// PLAYER MOVEMENT COLLISION
// ==========================================

function movePlayer(dx, dz) {
    if (escaped) return;

    const oldX = player.position.x;
    const oldZ = player.position.z;

    const nextX = THREE.MathUtils.clamp(oldX + dx, -23, 23);

    const blockedX =
        collidesWithObstacle(nextX, oldZ) ||
        collidesWithGuard(nextX, oldZ) ||
        crossesClosedSideGate(oldX, nextX, oldZ);

    if (!blockedX) {
        player.position.x = nextX;
    }

    const currentX = player.position.x;
    const nextZ = THREE.MathUtils.clamp(oldZ + dz, -27, 28);

    // Player cell gate blocks both directions until unlocked.
    const crossingMainDoor =
        !mainDoorOpen &&
        Math.abs(currentX) < 1.22 &&
        (
            (oldZ < -16 && nextZ >= -16) ||
            (oldZ > -16 && nextZ <= -16)
        );

    // Main prison exit blocks both directions until opened.
    const crossingExitGate =
        !exitGateOpen &&
        Math.abs(currentX) < 4.5 &&
        (
            (oldZ < 26 && nextZ >= 26) ||
            (oldZ > 26 && nextZ <= 26)
        );

    if (
        !crossingMainDoor &&
        !crossingExitGate &&
        !collidesWithObstacle(currentX, nextZ) &&
        !collidesWithGuard(currentX, nextZ)
    ) {
        player.position.z = nextZ;
    }
}

// ==========================================
// INTERACTION DISTANCES
// ==========================================

function distanceToGuard() {
    return player.position.distanceTo(guard.position);
}

function nearMainDoor() {
    return (
        Math.abs(player.position.x) < 2.1 &&
        Math.abs(player.position.z - (-17.2)) < 1.8
    );
}

function nearSideCellGate(gate) {
    return (
        Math.abs(player.position.x - gate.x) < 2.0 &&
        Math.abs(player.position.z - gate.centerZ) < 2.5
    );
}

function nearExitGate() {
    return (
        Math.abs(player.position.x) < 4.5 &&
        Math.abs(player.position.z - 24.7) < 1.6
    );
}

// ==========================================
// END OF PART 3
// PASTE PART 4 DIRECTLY BELOW
// ==========================================       
// ==========================================
// FOLLOWER MOVEMENT
// ==========================================

function moveFollowerToward(state, targetX, targetZ, delta, speed) {
    const group = state.character.group;
    const radius = 0.34;

    let dx = targetX - group.position.x;
    let dz = targetZ - group.position.z;
    let distance = Math.hypot(dx, dz);

    if (distance < 0.12) {
        stopPrisonerAnimation(state);
        return false;
    }

    const step = Math.min(speed * delta, distance);
    const moveX = (dx / distance) * step;
    const moveZ = (dz / distance) * step;

    const oldX = group.position.x;
    const oldZ = group.position.z;
    const nextX = oldX + moveX;

    if (
        !collidesWithObstacle(nextX, oldZ, radius) &&
        !crossesClosedSideGate(oldX, nextX, oldZ)
    ) {
        group.position.x = nextX;
    }

    const nextZ = oldZ + moveZ;

    const crossesMainDoor =
        !mainDoorOpen &&
        Math.abs(group.position.x) < 1.22 &&
        (
            (oldZ < -16 && nextZ >= -16) ||
            (oldZ > -16 && nextZ <= -16)
        );

    const crossesExit =
        !exitGateOpen &&
        Math.abs(group.position.x) < 4.5 &&
        (
            (oldZ < 26 && nextZ >= 26) ||
            (oldZ > 26 && nextZ <= 26)
        );

    if (
        !crossesMainDoor &&
        !crossesExit &&
        !collidesWithObstacle(group.position.x, nextZ, radius)
    ) {
        group.position.z = nextZ;
    }

    dx = group.position.x - oldX;
    dz = group.position.z - oldZ;

    if (Math.hypot(dx, dz) > 0.01) {
        group.rotation.y = Math.atan2(-dx, -dz);
        animatePrisonerWalk(state, delta, 5.5);
        return true;
    }

    stopPrisonerAnimation(state);
    return false;
}

// ==========================================
// FREED PRISONERS FOLLOW THE PLAYER
// ==========================================

function updateFollowingPrisoner(state, delta) {
    const group = state.character.group;
    const gate = state.gate;

    if (state.escaped) {
        stopPrisonerAnimation(state);
        return;
    }

    // Stage 1: move to the inside of their own open gate.
    if (state.followStage === "toGate") {
        const insideX = state.leftSide ? -11.25 : 11.25;

        moveFollowerToward(
            state, insideX, state.centerZ, delta, 1.65
        );

        if (
            Math.abs(group.position.x - insideX) < 0.32 &&
            Math.abs(group.position.z - state.centerZ) < 0.45
        ) {
            state.followStage = "throughGate";
        }

        return;
    }

    // Stage 2: walk through the opened cell entrance.
    if (state.followStage === "throughGate") {
        const outsideX = state.leftSide ? -8.8 : 8.8;

        moveFollowerToward(
            state, outsideX, state.centerZ, delta, 1.8
        );

        if (Math.abs(group.position.x - outsideX) < 0.45) {
            state.followStage = "follow";
        }

        return;
    }

    // Stage 3: stay behind the player and follow him.
    if (state.followStage === "follow") {
        const row = Math.floor(state.index / 2);
        const side = state.index % 2 === 0 ? -1 : 1;

        const behindDistance = 1.7 + row * 1.05;
        const sideDistance = side * 0.75;

        const targetX =
            player.position.x +
            Math.sin(player.rotation.y) * behindDistance +
            Math.cos(player.rotation.y) * sideDistance;

        const targetZ =
            player.position.z +
            Math.cos(player.rotation.y) * behindDistance -
            Math.sin(player.rotation.y) * sideDistance;

        const distance = Math.hypot(
            targetX - group.position.x,
            targetZ - group.position.z
        );

        if (distance > 1.05) {
            moveFollowerToward(
                state, targetX, targetZ, delta, 2.5
            );
        } else {
            stopPrisonerAnimation(state);
            group.rotation.y = player.rotation.y;
        }

        // A freed prisoner counts as escaped only after
        // physically passing through the main prison gate.
        if (group.position.z > 27.2) {
            state.escaped = true;
            stopPrisonerAnimation(state);
        }
    }
}

// ==========================================
// CELL GATE OPENING
// ==========================================

function unlockSideCell(gate) {
    if (!hasKey || gate.unlocked) return false;

    gate.unlocked = true;
    gate.opening = true;
    gate.openAmount = 0;
    gate.lock.visible = false;

    const prisonerState = prisonerStates.find(
        state => state.gate === gate
    );

    if (prisonerState) {
        prisonerState.freed = true;
        prisonerState.followStage = "toGate";
        prisonerState.mode = "following";
        prisonerState.timer = 0;
        prisonerState.character.group.position.y = 0;
    }

    return true;
}

function updateSideCellGates(delta) {
    for (const gate of sideCellGates) {
        if (!gate.opening) continue;

        gate.openAmount = Math.min(
            gate.openAmount + delta * 1.5,
            1
        );

        // Slide the gate away from its entrance.
        const direction = gate.x < 0 ? -1 : 1;
        gate.gate.position.x =
            gate.x + direction * gate.openAmount * 2.8;

        if (gate.openAmount >= 1) {
            gate.opening = false;
        }
    }
}

// ==========================================
// INTERACTION SYSTEM
// ==========================================

function updateInteractionPrompt() {
    interactionMode = null;

    if (escaped) {
        actionButton.hidden = true;
        return;
    }

    // Steal the key only when the guard looks away.
    if (!hasKey && guardLookingAway && distanceToGuard() < 6.5) {
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

        // Unlock any of the four other prisoners' cells.
        for (const gate of sideCellGates) {
            if (!gate.unlocked && nearSideCellGate(gate)) {
                interactionMode = "unlockSideCell";
                actionButton.textContent = "UNLOCK CELL";
                actionButton.hidden = false;
                return;
            }
        }

        // The prison's main exit is a separate gate.
        if (mainDoorOpen && !exitGateOpen && nearExitGate()) {
            interactionMode = "unlockExit";
            actionButton.textContent = "OPEN MAIN GATE";
            actionButton.hidden = false;
            return;
        }
    }

    actionButton.hidden = true;
}

function performInteraction() {
    if (escaped) return;

    if (interactionMode === "grab") {
        if (
            hasKey ||
            !guardLookingAway ||
            distanceToGuard() >= 6.5
        ) {
            return;
        }

        hasKey = true;
        guardKey.visible = false;
        grabAnimation = GRAB_DURATION;

        if (keyStatus) {
            keyStatus.hidden = true;
            keyStatus.style.display = "none";
        }

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
        if (!hasKey) return;

        const gate = sideCellGates.find(
            item => !item.unlocked && nearSideCellGate(item)
        );

        if (!gate) return;

        unlockSideCell(gate);

        actionButton.hidden = true;
        interactionMode = null;
        return;
    }

    if (interactionMode === "unlockExit") {
        if (
            !hasKey ||
            !mainDoorOpen ||
            exitGateOpen ||
            !nearExitGate()
        ) {
            return;
        }

        exitGateOpen = true;
        exitGateOpening = true;
        exitGateOpenAmount = 0;

        exitLock.visible = false;

        actionButton.hidden = true;
        interactionMode = null;
    }
}

actionButton.addEventListener("click", performInteraction);

// ==========================================
// FIST / PUNCH ACTION
// ==========================================

function performPunch() {
    if (escaped || punchAnimation > 0 || grabAnimation > 0) return;
    punchAnimation = PUNCH_DURATION;
}

fistButton.addEventListener("pointerdown", event => {
    event.preventDefault();
    event.stopPropagation();
    performPunch();
});

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

    cameraPitch = THREE.MathUtils.clamp(cameraPitch, -0.05, 0.75);

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

// ==========================================
// END OF PART 4
// PASTE PART 5 DIRECTLY BELOW
// ==========================================
// ==========================================
// PLAYER MOVEMENT AND ANIMATION
// ==========================================

let animationTime = 0;

function smoothStep(edge0, edge1, value) {
    const t = THREE.MathUtils.clamp(
        (value - edge0) / (edge1 - edge0), 0, 1
    );
    return t * t * (3 - 2 * t);
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

        player.position.y = Math.abs(
            Math.sin(animationTime * 2)
        ) * 0.012;
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

        const extension = smoothStep(0.20, 0.53, progress) *
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

    // Reach forward to take the guard's key.
    if (grabAnimation > 0) {
        grabAnimation = Math.max(0, grabAnimation - delta);

        const progress = 1 - grabAnimation / GRAB_DURATION;
        const reach = Math.sin(progress * Math.PI);

        playerArms[1].rotation.x = 1.15 * reach;
        playerArms[1].rotation.z = -0.12 * reach;
        playerArms[1].userData.elbow.rotation.x = -0.25 * reach;
    }
}

// ==========================================
// PLAYER CELL DOOR ANIMATION
// ==========================================

function updateCellDoor(delta) {
    if (!doorOpening) return;

    doorOpenAmount = Math.min(
        doorOpenAmount + delta * 1.5,
        1
    );

    mainCellDoor.position.x = doorOpenAmount * 2.8;

    if (doorOpenAmount >= 1) {
        doorOpening = false;
    }
}

// ==========================================
// MAIN EXIT GATE ANIMATION
// ==========================================

function updateExitGate(delta) {
    if (!exitGateOpening) return;

    exitGateOpenAmount = Math.min(
        exitGateOpenAmount + delta * 1.15,
        1
    );

    exitGate.position.x = exitGateOpenAmount * 5.5;

    if (exitGateOpenAmount >= 1) {
        exitGateOpening = false;
    }
}

// ==========================================
// ESCAPE COMPLETION OVERLAY
// ==========================================

const escapeOverlay = document.createElement("div");

escapeOverlay.style.cssText = `
    position: fixed;
    inset: 0;
    z-index: 15;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(0,0,0,0.82);
    color: white;
    text-align: center;
    font-family: Arial, sans-serif;
    pointer-events: none;
`;

const escapeTitle = document.createElement("div");
escapeTitle.textContent = "ESCAPE SUCCESSFUL";
escapeTitle.style.cssText = `
    font-size: clamp(26px, 7vw, 46px);
    font-weight: 900;
    letter-spacing: 3px;
    color: #f3c46c;
    margin-bottom: 14px;
`;

const escapeSubtitle = document.createElement("div");
escapeSubtitle.textContent = "You and your fellow prisoners made it out.";
escapeSubtitle.style.cssText = `
    font-size: 15px;
    color: #eeeeee;
    letter-spacing: 1px;
`;

escapeOverlay.appendChild(escapeTitle);
escapeOverlay.appendChild(escapeSubtitle);
document.body.appendChild(escapeOverlay);

// ==========================================
// ESCAPE COMPLETION CHECK
// Wait for every freed prisoner to escape.
// ==========================================

function checkEscapeCompletion() {
    if (escaped || !exitGateOpen || player.position.z < 27.2) {
        return;
    }

    const freedPrisoners = prisonerStates.filter(
        state => state.freed
    );

    const everyoneEscaped = freedPrisoners.every(
        state => state.escaped
    );

    if (!everyoneEscaped) return;

    escaped = true;
    actionButton.hidden = true;
    escapeOverlay.style.display = "flex";
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
        target.x +
            Math.sin(cameraYaw) *
            distance *
            Math.cos(cameraPitch),

        target.y +
            1.2 +
            Math.sin(cameraPitch) *
            distance,

        target.z +
            Math.cos(cameraYaw) *
            distance *
            Math.cos(cameraPitch)
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
    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );
});

// ==========================================
// RESET INPUT WHEN APP LOSES FOCUS
// ==========================================

function resetControls() {
    resetJoystick();

    cameraDragging = false;
    cameraPointer = null;

    for (const key in keys) {
        keys[key] = false;
    }
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
    updatePrisoners(delta);
    updateGuard(delta);
    updateInteractionPrompt();

    updateCellDoor(delta);
    updateSideCellGates(delta);
    updateExitGate(delta);

    checkEscapeCompletion();
    updateCamera();

    renderer.render(scene, camera);
}

// ==========================================
// START GAME
// ==========================================

updateCamera();
renderer.render(scene, camera);
animate();

if (loading) {
    loading.classList.add("hidden");

    setTimeout(() => {
        loading.style.display = "none";
    }, 600);
}

console.log("PRISON ESCAPE — FIVE-CELL ESCAPE BUILD LOADED");

} catch (error) {
    showError(error.message);
}
