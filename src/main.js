import * as THREE from 'three';
import { animate } from './animate.js';
import vertexShaderSource from './shaders/vertexShader.glsl?raw';
import fragmentShaderSource from './shaders/fragmentShader.glsl?raw';
import underlogoVertexShaderSource from './shaders/underlogoVertexShader.glsl?raw';
import underlogoFragmentShaderSource from './shaders/underlogoFragmentShader.glsl?raw';
import './style.css';

const textureLoader = new THREE.TextureLoader();
const logoFiles = [
    '/BENOW.png',
    '/BENOWBURGER.png',
    '/BENOWICE.png',
    '/BENOWPARROT.png',
    '/BENOWPUMPKIN.png',
    '/BENOWSUSHI.png'
];

// Charge une texture de manière asynchrone
function loadTexture(path) {
    return new Promise((resolve, reject) => {
        textureLoader.load(path, resolve, undefined, reject);
    });
}

async function createLogo(logoPath) {
    let scene, camera, renderer, logo, raycaster, underlogoShape;

    // Créer un conteneur pour le logo et son nom
    const logoItem = document.createElement('div');
    logoItem.className = 'logo-item';

    // Ajouter le conteneur à l'élément principal
    document.getElementById('app').appendChild(logoItem);

    async function init() {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
        camera.position.z = 5;

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(1000, 1000);
        logoItem.appendChild(renderer.domElement); // Ajouter le renderer au conteneur

        raycaster = new THREE.Raycaster();

        try {
            const [logoTexture, holoTexture] = await Promise.all([
                loadTexture(logoPath),
                loadTexture('/Holo.jpg')
            ]);

            const material = new THREE.ShaderMaterial({
                vertexShader: vertexShaderSource,
                fragmentShader: fragmentShaderSource,
                uniforms: {
                    logoTexture: { value: logoTexture },
                    holoTexture: { value: holoTexture },
                    time: { value: 0 },
                    rotationX: { value: 0 },
                    rotationY: { value: 0 },
                    mousePosition: { value: new THREE.Vector2(0, 0) },
                    unrollProgress: { value: 0 },
                    borderColor: { value: new THREE.Color(0xffffff) },
                    borderThickness: { value: 0.01 },
                    underlogoColor: { value: new THREE.Color(0x000000) }
                },
                transparent: true,
                side: THREE.DoubleSide
            });

            const geometry = new THREE.PlaneGeometry(2, 2, 32, 32);
            logo = new THREE.Mesh(geometry, material);
            logo.isMouseOver = false;
            logo.targetRotationX = 0;
            logo.targetRotationY = 0;
            scene.add(logo);

            const underlogoGeometry = new THREE.PlaneGeometry(2.1, 2.1, 32, 32);
            const underlogoMaterial = new THREE.ShaderMaterial({
                uniforms: {
                    color: { value: new THREE.Color(0x000000) },
                    borderColor: { value: new THREE.Color(0xffffff) },
                    borderThickness: { value: 0.05 },
                    depth: { value: 0.3 }
                },
                vertexShader: underlogoVertexShaderSource,
                fragmentShader: underlogoFragmentShaderSource,
                transparent: true
            });
            underlogoShape = new THREE.Mesh(underlogoGeometry, underlogoMaterial);
            underlogoShape.position.z = -0.01;
            scene.add(underlogoShape);

            // Créer et ajouter le nom du logo en dessous
            const logoName = document.createElement('div');
            logoName.className = 'logo-name';
            logoName.innerText = logoPath.split('/').pop().split('.')[0]; // Nom du fichier sans l'extension
            logoItem.appendChild(logoName); // Ajouter le nom au conteneur du logo

            // Vérifier que tous les éléments sont définis avant de les retourner
            if (logo && renderer && scene && camera && underlogoShape) {
                logo.visible = true; // Rendre le logo visible dès le départ
                underlogoShape.visible = true; // Rendre l'underlogo visible
                return { logo, underlogoShape, renderer, scene, camera };
            } else {
                console.error("Un ou plusieurs éléments nécessaires à l'animation ne sont pas définis.");
                return null;
            }
        } catch (error) {
            console.error("Erreur lors du chargement des textures:", error);
            return null;
        }
    }

    return await init();
}

async function initAllLogos() {
    const logos = [];
    const underlogos = [];
    const renderers = [];
    const scenes = [];
    const cameras = [];

    // Créer les logos et les sous-logos, puis les ajouter aux tableaux
    for (const logoPath of logoFiles) {
        const logoElements = await createLogo(logoPath);
        if (logoElements) {
            logos.push(logoElements.logo);
            underlogos.push(logoElements.underlogoShape);
            renderers.push(logoElements.renderer);
            scenes.push(logoElements.scene);
            cameras.push(logoElements.camera);
            console.log(`Logo créé: ${logoPath}`);
        }
    }

    // Appelle animate avec tous les logos et sous-logos
    animate(logos, renderers, scenes, cameras, underlogos);
}

// Initialisation des logos
initAllLogos().then(() => {
    console.log("Tous les logos ont été créés");
}).catch(error => {
    console.error("Erreur lors de l'initialisation des logos:", error);
});

// Redimensionnement de la fenêtre
window.addEventListener('resize', () => {
    const containers = document.querySelectorAll('.logo-item');
    containers.forEach(container => {
        const renderer = container.querySelector('canvas');
        if (renderer) {
            renderer.style.width = '100%';
            renderer.style.height = 'auto';
        }
    });
});