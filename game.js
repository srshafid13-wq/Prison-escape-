/* ==========================================
   PRISON ESCAPE
   THIRD-PERSON STEALTH GAME
   PART 1 OF 2
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
    // CELL LAYOUT
    // ==========================================

    const CELL_BACK_X = 20.5;
    const CELL_H = 5.2;

    function cellSideWall(x, z, length, height = CELL_H) {
        box(0.45, height, length, x, height / 2, z, concrete);
    }

    function cellBackWall(x, z, length, height = CELL_H) {
        box(length, height, 0.45, x, height / 2, z, concrete);
    }

    // LEFT CELLS
    cellSideWall(-CELL_BACK_X, -9, 34);
    cellBackWall(-15.5, -26, 10);
    cellBackWall(-15.5, 8, 10);
    cellBackWall(-15.5, -9, 10);

    // RIGHT CELLS
    cellSideWall(CELL_BACK_X, -9, 34);
    cellBackWall(15.5, -26, 10);
    cellBackWall(15.5, 8, 10);
    cellBackWall(15.5, -9, 10);

    // PLAYER CELL
    cellBackWall(0, -26, 20);
    cellSideWall(-10, -21, 10);
    cellSideWall(10, -21, 10);

    // ==========================================
    // CELL BARS
    // ==========================================

    function createBarsOnX(x, centerZ, width, doorGap = 1.6) {
        const spacing = 0.34;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;

            cylinder(
                0.055, 0.055, 4.8,
                x, 2.4, centerZ + offset, metal
            );
        }

        box(0.2, 0.18, width, x, 4.9, centerZ, metal);
        box(0.2, 0.18, width, x, 0.3, centerZ, metal);

        box(0.25, 4.9, 0.22, x, 2.45, centerZ - doorGap / 2, rustyMetal);
        box(0.25, 4.9, 0.22, x, 2.45, centerZ + doorGap / 2, rustyMetal);

        // Locked vertical bars across each side-cell doorway.
        for (let offset = -doorGap / 2 + 0.15; offset < doorGap / 2; offset += 0.3) {
            cylinder(
                0.055, 0.055, 4.7,
                x, 2.35, centerZ + offset, rustyMetal
            );
        }
    }

    function createBarsOnZ(centerX, z, width, doorGap = 2.4) {
        const spacing = 0.36;

        for (let offset = -width / 2; offset <= width / 2; offset += spacing) {
            if (Math.abs(offset) < doorGap / 2) continue;

            cylinder(
                0.055, 0.055, 4.8,
                centerX + offset, 2.4, z, metal
            );
        }

        box(width, 0.18, 0.2, centerX, 4.9, z, metal);
        box(width, 0.18, 0.2, centerX, 0.3, z, metal);

        box(0.22, 4.9, 0.25, centerX - doorGap / 2, 2.45, z, rustyMetal);
        box(0.22, 4.9, 0.25, centerX + doorGap / 2, 2.45, z, rustyMetal);
    }

    createBarsOnX(-10.5, -17.5, 10);
    createBarsOnX(-10.5, -0.5, 10);
    createBarsOnX(10.5, -17.5, 10);
    createBarsOnX(10.5, -0.5, 10);
    createBarsOnZ(0, -16, 19, 2.4);

    // ==========================================
    // PLAYER CELL SLIDING GATE
    // ==========================================

    const mainCellDoor = new THREE.Group();
    const gateMetal = new THREE.MeshStandardMaterial({
        color: 0x493d32,
        metalness: 0.6,
        roughness: 0.7
    });

    for (let x = -1.05; x <= 1.05; x += 0.35) {
        const bar = new THREE.Mesh(
            new THREE.CylinderGeometry(0.055, 0.055, 4.7, 12),
            gateMetal
        );

        bar.position.set(x, 2.35, 0);
        bar.castShadow = true;
        mainCellDoor.add(bar);
    }

    const gateTop = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.16, 0.18), gateMetal
    );
    gateTop.position.y = 4.85;
    mainCellDoor.add(gateTop);

    const gateBottom = new THREE.Mesh(
        new THREE.BoxGeometry(2.35, 0.16, 0.18), gateMetal
    );
    gateBottom.position.y = 0.25;
    mainCellDoor.add(gateBottom);

    mainCellDoor.position.set(0, 0, -16);
    scene.add(mainCellDoor);

    const lockGroup = new THREE.Group();
    const lockBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.32, 0.13),
        new THREE.MeshStandardMaterial({
            color: 0xb58a36,
            metalness: 0.75,
            roughness: 0.35
        })
    );
    lockBody.position.set(0.88, 1.35, -0.12);
    lockGroup.add(lockBody);

    const lockRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.09, 0.025, 8, 16, Math.PI),
        lockBody.material
    );
    lockRing.position.set(0.88, 1.55, -0.12);
    lockRing.rotation.z = Math.PI;
    lockGroup.add(lockRing);

    mainCellDoor.add(lockGroup);

    // ==========================================
    // CELL FURNITURE
    // ==========================================

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

            characterMesh(elbow, new THREE.SphereGeometry(0.09, 12, 10),
                skin, 0, -0.43, 0);

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


box(9, 0.5, 0.7, 0, 6.1, 26.5, oldConcrete);

    for (let x = -4; x <= 4; x += 0.55) {
        cylinder(0.075, 0.075, 5.8, x, 2.9, 26, metal);
    }

    box(9, 0.18, 0.2, 0, 5.7, 26, rustyMetal);
    box(9, 0.18, 0.2, 0, 0.3, 26, rustyMetal);

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

    // KEY ATTACHED TO GUARD'S BELT
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

    guardKey.position.set(0.43, 1.12, -0.25);
    guard.add(guardKey);

    guard.position.set(0, 0, 5);
    scene.add(guard);

    // ==========================================
    // END OF PART 1
    // PART 2 CONTINUES BELOW
    // ==========================================

    // ==========================================
    // PRISONER AI
    // Prisoners wander inside their own cells
    // and sometimes approach the bars.
    // ==========================================

    const prisonerStates = otherPrisoners.map((character, index) => {
        const leftSide = index < 2;
        const centerZ = index % 2 === 0 ? -17.5 : -0.5;

        return {
            character,
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
            walkTime: Math.random() * 5
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

    function updatePrisoners(delta) {
        for (const state of prisonerStates) {
            const person = state.character;
            const group = person.group;

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

                state.walkTime += delta * 5;

                const swing = Math.sin(state.walkTime) * 0.34;

                person.legs[0].rotation.x = swing;
                person.legs[1].rotation.x = -swing;
                person.arms[0].rotation.x = -swing * 0.7;
                person.arms[1].rotation.x = swing * 0.7;

                group.position.y = Math.abs(
                    Math.sin(state.walkTime * 2)
                ) * 0.018;
            } else {
                group.position.y = 0;
                person.legs[0].rotation.x = 0;
                person.legs[1].rotation.x = 0;

                if (state.mode === "approach" || state.mode === "wander") {
                    state.mode = "bars";
                    state.timer = 2.5 + Math.random() * 2.5;

                    group.rotation.y = state.leftSide
                        ? -Math.PI / 2
                        : Math.PI / 2;
                }

                if (state.mode === "bars") {
                    person.arms[0].rotation.x = -1.05;
                    person.arms[1].rotation.x = -1.05;
                    person.arms[0].rotation.z = state.leftSide ? -0.12 : 0.12;
                    person.arms[1].rotation.z = state.leftSide ? -0.12 : 0.12;

                    if (state.timer <= 0) {
                        person.arms[0].rotation.x = 0;
                        person.arms[1].rotation.x = 0;
                        person.arms[0].rotation.z = 0;
                        person.arms[1].rotation.z = 0;

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

    function setGuardWalkingAnimation(delta) {
        guardWalkTime += delta * 5;

        const swing = Math.sin(guardWalkTime) * 0.42;

        guardLegs[0].rotation.x = swing;
        guardLegs[1].rotation.x = -swing;

        guardArms[0].rotation.x = -swing * 0.65;
        guardArms[1].rotation.x = swing * 0.65;
    }

    function updateGuard(delta) {
        if (guardState === "patrol") {
            guard.position.z += guardDirection * guardSpeed * delta;

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
        }

        else if (guardState === "watch") {
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
        }

        else if (guardState === "lookAway") {
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

    if (!joystick || !thumb || !fistButton || !actionButton || !keyStatus) {
        throw new Error("One or more game controls are missing.");
    }

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
        if (event.pointerId === joystickPointer) {
            resetJoystick();
        }
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

            if (dx * dx + dz * dz < playerRadius * playerRadius) {
                return true;
            }
        }

        return false;
    }

    let mainDoorOpen = false;
    let doorOpening = false;
    let doorOpenAmount = 0;

    function movePlayer(dx, dz) {
        const nextX = THREE.MathUtils.clamp(
            player.position.x + dx, -23, 23
        );

        if (!collidesWithObstacle(nextX, player.position.z)) {
            player.position.x = nextX;
        }

        const nextZ = THREE.MathUtils.clamp(
            player.position.z + dz, -27, 28
        );

        // Keep the cell entrance blocked until it is unlocked.
        const crossingMainDoor =
            !mainDoorOpen &&
            Math.abs(player.position.x) < 1.35 &&
            player.position.z < -16 &&
            nextZ >= -16;

        if (
            !crossingMainDoor &&
            !collidesWithObstacle(player.position.x, nextZ)
        ) {
            player.position.z = nextZ;
        }
    }

    // ==========================================
    // KEY AND INTERACTION SYSTEM
    // ==========================================

    let hasKey = false;
    let interactionMode = null;
    let grabAnimation = 0;
    let punchAnimation = 0;

    function distanceToGuard() {
        return player.position.distanceTo(guard.position);
    }

    function nearMainDoor() {
        return (
            Math.abs(player.position.x) < 2.1 &&
            Math.abs(player.position.z - (-17.2)) < 1.8
        );
    }

    function updateInteractionPrompt() {
        interactionMode = null;

        if (!hasKey && guardLookingAway && distanceToGuard() < 6.5) {
            interactionMode = "grab";
            actionButton.textContent = "GRAB KEY";
            actionButton.hidden = false;
            return;
        }

        if (hasKey && !mainDoorOpen && nearMainDoor()) {
            interactionMode = "unlock";
            actionButton.textContent = "UNLOCK CELL";
            actionButton.hidden = false;
            return;
        }

        actionButton.hidden = true;
    }

    function performInteraction() {
        if (interactionMode === "grab") {
            if (hasKey || !guardLookingAway || distanceToGuard() >= 6.5) {
                return;
            }

            hasKey = true;
            guardKey.visible = false;
            grabAnimation = 0.75;

            keyStatus.textContent = "KEY: ACQUIRED";
            keyStatus.style.borderColor = "#e3b94f";
            keyStatus.style.color = "#ffd27a";

            actionButton.hidden = true;
            interactionMode = null;
            return;
        }

        if (interactionMode === "unlock") {
            if (!hasKey || mainDoorOpen || !nearMainDoor()) return;

            mainDoorOpen = true;
            doorOpening = true;
            doorOpenAmount = 0;

            lockGroup.visible = false;
            keyStatus.textContent = "CELL: UNLOCKED";
            keyStatus.style.color = "#8be09a";

            actionButton.hidden = true;
            interactionMode = null;
        }
    }

    actionButton.addEventListener("click", performInteraction);

    // ==========================================
    // FIST / PUNCH
    // ==========================================

    function performPunch() {
        if (punchAnimation > 0) return;
        punchAnimation = 0.42;
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

            animationTime += delta * 8;

            const swing = Math.sin(animationTime) * 0.42;

            legs[0].rotation.x = swing;
            legs[1].rotation.x = -swing;

            playerArms[0].rotation.x = -swing * 0.75;
            playerArms[1].rotation.x = swing * 0.75;

            player.position.y = Math.abs(
                Math.sin(animationTime * 2)
            ) * 0.02;
        } else {
            legs[0].rotation.x = 0;
            legs[1].rotation.x = 0;

            playerArms[0].rotation.x = 0;
            playerArms[1].rotation.x = 0;

            player.position.y = 0;
        }

        // Punch animation has priority over the normal arm swing.
        if (punchAnimation > 0) {
            punchAnimation = Math.max(0, punchAnimation - delta);

            const progress = 1 - punchAnimation / 0.42;
            const punch = Math.sin(progress * Math.PI);

            playerArms[1].rotation.x = -1.65 * punch;
            playerArms[1].rotation.z = -0.25 * punch;
        } else {
            playerArms[1].rotation.z = 0;
        }

        // Key-grab reach animation.
        if (grabAnimation > 0) {
            grabAnimation = Math.max(0, grabAnimation - delta);

            const progress = 1 - grabAnimation / 0.75;
            const reach = Math.sin(progress * Math.PI);

            playerArms[1].rotation.x = -1.35 * reach;
            playerArms[1].rotation.z = -0.2 * reach;
        }
    }

    // ==========================================
    // PLAYER CELL DOOR ANIMATION
    // ==========================================

    function updateCellDoor(delta) {
        if (!doorOpening) return;

        doorOpenAmount = Math.min(doorOpenAmount + delta * 1.5, 1);

        // Slide the gate sideways out of the doorway.
        mainCellDoor.position.x = doorOpenAmount * 2.8;

        if (doorOpenAmount >= 1) {
            doorOpening = false;
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
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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

    console.log("PRISON ESCAPE — STEALTH GAME LOADED");

} catch (error) {
    showError(error.message);
}
    
