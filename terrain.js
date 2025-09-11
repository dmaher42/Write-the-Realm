import * as THREE from 'three';

function createTexture(color) {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
}

export function generateTerrain(scene) {
    const textures = {
        land: createTexture('#3a5f0b'),
        river: createTexture('#1e90ff'),
        path: createTexture('#8b4513')
    };

    const tileSize = 10;
    const spacing = tileSize / Math.sqrt(2);
    const layout = [
        ['land','land','land','land','land','land','land','land'],
        ['land','river','river','river','river','river','land','land'],
        ['land','land','land','land','land','land','land','land'],
        ['land','land','path','path','path','land','land','land'],
        ['land','land','path','path','path','land','land','land'],
        ['land','land','land','land','land','land','land','land'],
        ['land','land','land','land','land','land','land','land'],
        ['land','land','land','land','land','land','land','land']
    ];

    const materials = {
        land: new THREE.MeshStandardMaterial({ map: textures.land }),
        river: new THREE.MeshStandardMaterial({ map: textures.river }),
        path: new THREE.MeshStandardMaterial({ map: textures.path })
    };

    const geometry = new THREE.PlaneGeometry(tileSize, tileSize);
    const terrain = new THREE.Group();

    for (let r = 0; r < layout.length; r++) {
        for (let c = 0; c < layout[r].length; c++) {
            const type = layout[r][c];
            const mat = materials[type] || materials.land;
            const tile = new THREE.Mesh(geometry, mat);
            tile.rotation.x = -Math.PI / 2;
            tile.rotation.y = Math.PI / 4;
            const x = (c - r) * spacing;
            const z = (c + r) * spacing;
            tile.position.set(x, 0, z);
            tile.receiveShadow = true;
            terrain.add(tile);
        }
    }

    scene.add(terrain);
}
