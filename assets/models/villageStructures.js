import * as THREE from 'three';

// Pastel-colored low-poly assets for village structures

export function createHut() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(4, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0xF2D6B3, flatShading: true })
    );
    base.castShadow = true; base.receiveShadow = true; group.add(base);
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(3, 2, 4),
        new THREE.MeshStandardMaterial({ color: 0xC9A36B, flatShading: true })
    );
    roof.position.y = 2.5; roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);
    return group;
}

export function createFarmRow() {
    const row = new THREE.Mesh(
        new THREE.BoxGeometry(8, 0.2, 2),
        new THREE.MeshStandardMaterial({ color: 0xC9E4B4, flatShading: true })
    );
    row.receiveShadow = true;
    return row;
}

export function createLordHouse() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(8, 5, 8),
        new THREE.MeshStandardMaterial({ color: 0xF5E0C3, flatShading: true })
    );
    base.castShadow = true; base.receiveShadow = true; group.add(base);
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(6, 3, 4),
        new THREE.MeshStandardMaterial({ color: 0xC58B8B, flatShading: true })
    );
    roof.position.y = 4; roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);
    return group;
}

export function createChurch() {
    const group = new THREE.Group();
    const base = new THREE.Mesh(
        new THREE.BoxGeometry(6, 4, 10),
        new THREE.MeshStandardMaterial({ color: 0xE3E3F7, flatShading: true })
    );
    base.castShadow = true; base.receiveShadow = true; group.add(base);
    const roof = new THREE.Mesh(
        new THREE.ConeGeometry(5, 4, 4),
        new THREE.MeshStandardMaterial({ color: 0xA3C9F5, flatShading: true })
    );
    roof.position.set(0, 4, 0); roof.rotation.y = Math.PI / 4; roof.castShadow = true; group.add(roof);
    const steeple = new THREE.Mesh(
        new THREE.BoxGeometry(1, 3, 1),
        new THREE.MeshStandardMaterial({ color: 0xE3E3F7, flatShading: true })
    );
    steeple.position.set(0, 6, 0); steeple.castShadow = true; steeple.receiveShadow = true; group.add(steeple);
    const crossMat = new THREE.MeshStandardMaterial({ color: 0xC58B8B, flatShading: true });
    const cross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.5, 0.2), crossMat);
    cross.position.set(0, 7.5, 0); group.add(cross);
    const crossBar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.2, 0.2), crossMat);
    crossBar.position.set(0, 7.2, 0); group.add(crossBar);
    return group;
}

