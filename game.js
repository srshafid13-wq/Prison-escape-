/* ==========================================
   PRISON ESCAPE
   CHARACTER UPGRADE
   Five prisoners + one security guard
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

    const orangeMat = new THREE.MeshStandardMaterial({
        color: 0xe87520, roughness: 0.9
    });

    const skinMat = new THREE.MeshStandardMaterial({
        color: 0x81563f, roughness: 0.9
    });

    const blackMat = new THREE.MeshStandardMaterial({
        color: 0x191a1c, roughness: 0.9
    });

    const whiteMat = new THREE.MeshStandardMaterial({
        color: 0xf0eee8, roughness: 0.85
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
    // WORLD OBJECTS AND COLLISION REGISTRY
    // ==========================================

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

    // LARGE PLAYER CELL
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

        for (let offset = -doorGap / 2 + 0.15; offset < doorGap / 2; offset += 0.3) {
            cylinder(
                0.055, 0.055, 4.7,
                x, 2.35, centerZ + offset, rustyMetal
            );
        }
    }

    function createBarsOnZ(centerX, z, width, doorGap = 2.2) {
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

        for (let offset = -doorGap / 2 + 0.15; offset < doorGap / 2; offset += 0.3) {
            cylinder(
                0.055, 0.055, 4.7,
                centerX + offset, 2.35, z, rustyMetal
            );
        }
    }

    createBarsOnX(-10.5, -17.5, 10);
    createBarsOnX(-10.5, -0.5, 10);
    createBarsOnX(10.5, -17.5, 10);
    createBarsOnX(10.5, -0.5, 10);
    createBarsOnZ(0, -16, 19, 2.4);

    // ==========================================
    // CELL FURNITURE
    // ==========================================

    function createBed(x, z) {
        box(2.5, 0.25, 1.15, x, 0.78, z, bedMat);
        box(2.35, 0.22, 1.05, x, 1.02, z, mattressMat);

        for (const side of [-1, 1]) {
            box(
                0.12, 0.75, 0.12,
                x + side * 1.05, 0.38, z, metal
            );
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
    // CHARACTER MATERIAL AND MESH HELPERS
    // ==========================================

    function makeCharacterMaterial(color, roughness = 0.88) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness
        });
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
    // HUMANOID CHARACTER BUILDER
    // Front direction is local -Z.
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
        const metalDetails = makeCharacterMaterial(0xb5a77c, 0.5);

        // BODY
        characterMesh(
            person,
            new THREE.BoxGeometry(0.78, 0.88, 0.43),
            uniform, 0, 1.47, 0
        );

        // Rounded chest
        const chest = characterMesh(
            person,
            new THREE.SphereGeometry(0.39, 20, 16),
            uniform, 0, 1.65, 0
        );
        chest.scale.set(1, 0.85, 0.62);

        // WAIST
        characterMesh(
            person,
            new THREE.BoxGeometry(0.62, 0.25, 0.38),
            pants, 0, 0.98, 0
        );

        // NECK
        characterMesh(
            person,
            new THREE.CylinderGeometry(0.105, 0.13, 0.2, 12),
            skin, 0, 1.99, 0
        );

        // WHITE UNDERSHIRT COLLAR
        if (config.undershirt) {
            characterMesh(
                person,
                new THREE.BoxGeometry(0.28, 0.16, 0.08),
                white, 0, 1.94, -0.19
            );
        }

        // HEAD
        const head = characterMesh(
            person,
            new THREE.SphereGeometry(0.29, 24, 20),
            skin, 0, 2.25, 0
        );

        head.scale.set(
            config.headWidth || 1,
            config.headHeight || 1,
            config.headDepth || 0.92
        );

        // EARS
        for (const side of [-1, 1]) {
            const ear = characterMesh(
                person,
                new THREE.SphereGeometry(0.075, 12, 10),
                skin, side * 0.285, 2.24, 0
            );

            ear.scale.set(0.65, 1, 0.65);
        }

        // HAIR
        if (config.hairStyle !== "bald" && !config.cap) {
            const hairTop = characterMesh(
                person,
                new THREE.SphereGeometry(0.30, 20, 14),
                hair, 0, 2.43, 0.015
            );

            hairTop.scale.set(1, 0.48, 0.95);

            if (config.hairStyle === "long") {
                for (const side of [-1, 1]) {
                    characterMesh(
                        person,
                        new THREE.SphereGeometry(0.12, 12, 10),
                        hair, side * 0.22, 2.28, 0.02
                    );
                }
            }

            if (config.hairStyle === "curly") {
                for (let i = 0; i < 7; i++) {
                    const angle = (i / 7) * Math.PI * 2;

                    characterMesh(
                        person,
                        new THREE.SphereGeometry(0.105, 10, 8),
                        hair,
                        Math.cos(angle) * 0.23,
                        2.43,
                        Math.sin(angle) * 0.20
                    );
                }
            }
        }

        // EYEBROWS AND EYES
        for (const side of [-1, 1]) {
            const brow = characterMesh(
                person,
                new THREE.BoxGeometry(0.105, 0.025, 0.035),
                hair, side * 0.105, 2.355, -0.258
            );

            brow.rotation.z = side * -0.08;

            characterMesh(
                person,
                new THREE.SphereGeometry(0.035, 10, 8),
                dark, side * 0.105, 2.29, -0.265
            );
        }

        // NOSE
        characterMesh(
            person,
            new THREE.SphereGeometry(0.065, 12, 10),
            skin, 0, 2.20, -0.29
        );

        // MOUTH
        characterMesh(
            person,
            new THREE.BoxGeometry(0.09, 0.018, 0.025),
            dark, 0, 2.105, -0.27
        );

        // FACIAL HAIR
        if (config.beardStyle && config.beardStyle !== "none") {
            const beard = characterMesh(
                person,
                new THREE.SphereGeometry(0.20, 18, 14),
                beardMat, 0, 2.04, -0.13
            );

            beard.scale.set(
                config.beardStyle === "long" ? 1.05 : 1,
                config.beardStyle === "long" ? 1.35 : 0.75,
                0.85
            );

            for (const side of [-1, 1]) {
                characterMesh(
                    person,
                    new THREE.SphereGeometry(0.105, 12, 10),
                    beardMat, side * 0.105, 2.12, -0.235
                );
            }
        }

        // MUSTACHE
        if (config.mustache) {
            for (const side of [-1, 1]) {
                const mustache = characterMesh(
                    person,
                    new THREE.SphereGeometry(0.09, 12, 10),
                    beardMat, side * 0.07, 2.14, -0.29
                );

                mustache.scale.set(1.2, 0.45, 0.5);
            }
        }

        // PRISONER CAP
        if (config.cap) {
            const capMat = makeCharacterMaterial(0xe87520);

            characterMesh(
                person,
                new THREE.CylinderGeometry(0.29, 0.32, 0.17, 20),
                capMat, 0, 2.50, 0
            );

            const crown = characterMesh(
                person,
                new THREE.SphereGeometry(0.29, 20, 12),
                capMat, 0, 2.54, 0.025
            );

            crown.scale.y = 0.43;

            characterMesh(
                person,
                new THREE.BoxGeometry(0.42, 0.045, 0.22),
                capMat, 0, 2.49, -0.22
            );
        }

        // SHIRT POCKET
        characterMesh(
            person,
            new THREE.BoxGeometry(0.19, 0.22, 0.018),
            uniform, 0.22, 1.48, -0.222
        );

        // SHIRT BUTTONS
        for (let y = 1.25; y <= 1.85; y += 0.18) {
            characterMesh(
                person,
                new THREE.SphereGeometry(0.018, 8, 8),
                metalDetails, -0.015, y, -0.225
            );
        }

        // PRISONER NUMBER
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

            const number = characterMesh(
                person,
                new THREE.PlaneGeometry(0.42, 0.105),
                numberMaterial, 0.19, 1.68, -0.235
            );

            number.rotation.y = Math.PI;
        }

        // SLEEVE AND ARM JOINTS
        const arms = [];

        for (const side of [-1, 1]) {
            const shoulder = new THREE.Group();
            shoulder.position.set(side * 0.43, 1.83, 0);
            person.add(shoulder);

            characterMesh(
                shoulder,
                new THREE.CylinderGeometry(0.13, 0.105, 0.34, 12),
                uniform, 0, -0.17, 0
            );

            const elbow = new THREE.Group();
            elbow.position.y = -0.34;
            shoulder.add(elbow);

            characterMesh(
                elbow,
                new THREE.CylinderGeometry(0.085, 0.105, 0.40, 12),
                skin, 0, -0.20, 0
            );

            characterMesh(
                elbow,
                new THREE.SphereGeometry(0.09, 12, 10),
                skin, 0, -0.43, 0
            );

            arms.push(shoulder);
        }

        // SEPARATE LEGS
        const legs = [];

        for (const side of [-1, 1]) {
            const hip = new THREE.Group();
            hip.position.set(side * 0.20, 0.99, 0);
            person.add(hip);

            characterMesh(
                hip,
                new THREE.CylinderGeometry(0.16, 0.13, 0.55, 12),
                pants, 0, -0.28, 0
            );

            const lowerLeg = new THREE.Group();
            lowerLeg.position.y = -0.55;
            hip.add(lowerLeg);

            characterMesh(
                lowerLeg,
                new THREE.CylinderGeometry(0.115, 0.105, 0.48, 12),
                pants, 0, -0.24, 0
            );

            // SHOES
            const shoe = characterMesh(
                lowerLeg,
                new THREE.BoxGeometry(0.27, 0.15, 0.40),
                shoes, 0, -0.51, -0.075
            );

            shoe.position.z = -0.09;

            legs.push(hip);
        }

        return {
            group: person,
            legs,
            arms
        };
}
      // ==========================================
    // FOUR OTHER PRISONERS
    // Different appearances and body builds
    // ==========================================

    const otherPrisoners = [];

    const prisonerDesigns = [
        {
            skin: 0xa96f4e,
            hair: 0x25201d,
            beard: 0x292321,
            beardStyle: "short",
            mustache: true,
            hairStyle: "short",
            headWidth: 1.05
        },
        {
            skin: 0xd09a72,
            hair: 0x171719,
            beard: 0x171719,
            beardStyle: "short",
            mustache: true,
            hairStyle: "short",
            headWidth: 1.05
        },
        {
            skin: 0xd09a72,
            hair: 0x171719,
            beard: 0x171719,
            beardStyle: "long",
            mustache: true,
            hairStyle: "long",
            headWidth: 0.94
        },
        {
            skin: 0x80563f,
            hair: 0x171717,
            beard: 0x4b413b,
            beardStyle: "short",
            mustache: false,
            hairStyle: "bald",
            headWidth: 1.12
        },
        {
            skin: 0xb98061,
            hair: 0x554337,
            beard: 0x554337,
            beardStyle: "none",
            mustache: false,
            hairStyle: "curly",
            headWidth: 0.96
        }
    ];

    const prisonerPositions = [
        [-15.5, -18, Math.PI / 2],
        [-15.5, -1, Math.PI / 2],
        [15.5, -18, -Math.PI / 2],
        [15.5, -1, -Math.PI / 2]
    ];

    prisonerPositions.forEach((position, index) => {
        const character = createHumanoid({
            ...prisonerDesigns[index],
            uniform: 0xd98243,
            pants: 0xc9763a,
            shoes: 0x292522
        });

        character.group.position.set(
            position[0], 0, position[1]
        );

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
    // MAIN PLAYABLE PRISONER
    // Older prisoner — number 425679
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
    // Navy security uniform, cap and equipment
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

    // Guard cap
    characterMesh(
        guard,
        new THREE.CylinderGeometry(0.31, 0.33, 0.17, 20),
        guardHatMaterial, 0, 2.50, 0
    );

    characterMesh(
        guard,
        new THREE.BoxGeometry(0.40, 0.045, 0.22),
        guardHatMaterial, 0, 2.48, -0.22
    );

    // Security belt
    const beltMat = makeCharacterMaterial(0x17191c, 0.55);

    characterMesh(
        guard,
        new THREE.BoxGeometry(0.69, 0.11, 0.42),
        beltMat, 0, 1.04, 0
    );

    // Belt buckle
    characterMesh(
        guard,
        new THREE.BoxGeometry(0.12, 0.09, 0.035),
        makeCharacterMaterial(0xb8a36b, 0.4),
        0, 1.04, -0.22
    );

    // Shoulder badge
    characterMesh(
        guard,
        new THREE.BoxGeometry(0.14, 0.17, 0.025),
        makeCharacterMaterial(0xb5b6b4, 0.5),
        -0.25, 1.78, -0.225
    );

    // Radio
    characterMesh(
        guard,
        new THREE.BoxGeometry(0.11, 0.19, 0.08),
        beltMat, -0.37, 1.23, 0
    );

    // Guard boots
    const bootMaterial = makeCharacterMaterial(0x111418);

    for (const side of [-1, 1]) {
        characterMesh(
            guard,
            new THREE.BoxGeometry(0.29, 0.12, 0.42),
            bootMaterial, side * 0.20, 0.045, -0.12
        );
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

        const swing = Math.sin(guardWalkTime) * 0.42;

        guardLegs[0].rotation.x = swing;
        guardLegs[1].rotation.x = -swing;

        guardArms[0].rotation.x = -swing * 0.65;
        guardArms[1].rotation.x = swing * 0.65;
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
        if (
            !cameraDragging ||
            event.pointerId !== cameraPointer
        ) return;

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

            const swing = Math.sin(animationTime) *
                (isRunning ? 0.65 : 0.42);

            // Legs
            legs[0].rotation.x = swing;
            legs[1].rotation.x = -swing;

            // Arms swing opposite to legs
            playerArms[0].rotation.x = -swing * 0.75;
            playerArms[1].rotation.x = swing * 0.75;

            // Slight body movement while walking
            player.position.y = Math.abs(Math.sin(animationTime * 2)) *
                (isRunning ? 0.045 : 0.02);

        } else {
            // Idle pose
            legs[0].rotation.x = 0;
            legs[1].rotation.x = 0;

            playerArms[0].rotation.x = 0;
            playerArms[1].rotation.x = 0;

            player.position.y = 0;
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

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 1.5)
        );
    });

    // ==========================================
    // RESET INPUT WHEN APP LOSES FOCUS
    // ==========================================

    function resetControls() {
        running = false;
        runningPointer = null;

        runButton.classList.remove("running");
        resetJoystick();

        cameraDragging = false;
        cameraPointer = null;

        for (const key in keys) {
            keys[key] = false;
        }
    }

    window.addEventListener("blur", resetControls);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            resetControls();
        }
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

    // ==========================================
    // START GAME
    // ==========================================

    updateCamera();

    renderer.render(scene, camera);
    animate();

    if (loading) {
        loading.style.display = "none";
    }

    console.log(
        "PRISON ESCAPE — CHARACTER UPGRADE LOADED"
    );

} catch (error) {
    showError(error.message);
              }
      
